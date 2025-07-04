
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { classifyBusinessWithLLM } from './businessClassifier.ts';
import { testPromptsInParallel } from './promptTester.ts';
import { calculateGeoScore } from './scoreCalculator.ts';
import { extractWebsiteContent } from './websiteExtractor.ts';

// Input validation
const validateInput = (businessName: string, websiteUrl: string): boolean => {
  if (!businessName?.trim() || businessName.trim().length < 2 || businessName.trim().length > 100) {
    return false;
  }
  
  if (!websiteUrl?.trim() || websiteUrl.trim().length > 500) {
    return false;
  }
  
  try {
    const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>'"]/g, '').substring(0, 200);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, websiteUrl } = await req.json();
    
    console.log(`Analysis request: ${businessName} - ${websiteUrl}`);
    
    // Input validation
    if (!validateInput(businessName, websiteUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Sanitize inputs
    const safeBusiness = sanitizeInput(businessName);
    const safeUrl = sanitizeInput(websiteUrl);
    
    // Extract website content
    console.log('Extracting website content...');
    const websiteContent = await extractWebsiteContent(safeUrl);
    console.log('Website content extracted:', websiteContent ? 'Success' : 'Failed');
    
    // Classify business using LLM
    console.log('Classifying business...');
    const classification = await classifyBusinessWithLLM(safeBusiness, safeUrl, websiteContent);
    console.log('Classification complete:', classification);
    
    // Test prompts in parallel with timeout protection
    console.log('Testing prompts...');
    const testPrompts = await Promise.race([
      testPromptsInParallel(safeBusiness, safeUrl),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Prompt testing timeout')), 45000)
      )
    ]) as any[];
    
    console.log('Prompt testing complete');
    
    // Calculate scores
    const llmMentions = testPrompts.filter(p => p.response === 'mentioned').length;
    const geoScore = calculateGeoScore(
      classification, 
      testPrompts, 
      websiteContent?.hasStructuredData || false
    );
    
    const benchmarkScore = Math.max(30, Math.min(95, 
      Math.round((geoScore * 0.7) + (llmMentions * 8) + Math.random() * 10)
    ));
    
    const result = {
      businessName: safeBusiness,
      websiteUrl: safeUrl,
      classification,
      testPrompts,
      geoScore,
      benchmarkScore,
      llmMentions,
      hasStructuredData: websiteContent?.hasStructuredData || false,
      timestamp: new Date().toISOString()
    };
    
    console.log('Analysis complete for:', safeBusiness);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Sanitize error message for security
    const safeErrorMessage = error.message?.includes('timeout') ? 
      'Analysis timeout - please try again' : 
      'Analysis failed - please try again later';
    
    return new Response(
      JSON.stringify({ error: safeErrorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
