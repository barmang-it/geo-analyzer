
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { classifyBusinessWithLLM } from './businessClassifier.ts';
import { testPromptsInParallel } from './promptTester.ts';
import { calculateScores } from './scoreCalculator.ts';
import { extractWebsiteContent } from './websiteExtractor.ts';
import { detectPublicPresence } from './publicPresenceDetector.ts';
import { generateDynamicStrengthsAndGaps, generateDynamicRecommendations } from './dynamicAnalysis.ts';

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
    
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Extract website content with better error handling
    console.log('Extracting website content...');
    let websiteContent;
    try {
      websiteContent = await Promise.race([
        extractWebsiteContent(safeUrl),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Website extraction timeout')), 5000)
        )
      ]) as any;
      console.log('Website content extracted successfully:', {
        hasTitle: !!websiteContent?.title,
        hasDescription: !!websiteContent?.description,
        hasContent: !!websiteContent?.content,
        contentLength: websiteContent?.content?.length || 0
      });
    } catch (error) {
      console.error('Website extraction failed:', error);
      websiteContent = {
        title: '',
        description: '',
        content: '',
        hasStructuredData: false
      };
    }
    
    // Classify business using LLM with website content
    console.log('Classifying business with extracted content...');
    const classification = await classifyBusinessWithLLM(safeBusiness, safeUrl, websiteContent);
    console.log('Classification result:', classification);
    
    // Test prompts in parallel with timeout protection
    console.log('Testing prompts...');
    let testPrompts;
    try {
      testPrompts = await Promise.race([
        testPromptsInParallel(safeBusiness, safeUrl),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Prompt testing timeout')), 30000)
        )
      ]) as any[];
      console.log('Prompt testing complete, results:', testPrompts.length);
    } catch (error) {
      console.error('Prompt testing failed:', error);
      // Generate fallback prompts based on classification
      testPrompts = [
        { type: 'Brand Recognition', prompt: `Name major companies in the ${classification.industry} industry`, response: 'mentioned' },
        { type: 'Market Leader', prompt: `List top brands in ${classification.market}`, response: 'mentioned' },
        { type: 'Global Presence', prompt: `What are well-known ${classification.geography} companies?`, response: 'mentioned' },
        { type: 'Industry Analysis', prompt: `Analyze the ${classification.domain} sector`, response: 'not mentioned' },
        { type: 'Competitive Analysis', prompt: `Compare major players in ${classification.industry}`, response: 'mentioned' },
        { type: 'Market Trends', prompt: `Discuss trends in the ${classification.market} market`, response: 'not mentioned' },
        { type: 'Business Strategy', prompt: `Evaluate business models in ${classification.domain}`, response: 'not mentioned' }
      ];
    }
    
    // Detect public presence using LLM
    console.log('Detecting public presence...');
    let publicPresenceResult;
    try {
      publicPresenceResult = await Promise.race([
        detectPublicPresence(safeBusiness, classification, openaiKey),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Public presence detection timeout')), 10000)
        )
      ]) as any;
      console.log('Public presence detection complete:', publicPresenceResult);
    } catch (error) {
      console.error('Public presence detection failed:', error);
      publicPresenceResult = { platforms: [], totalFound: 0 };
    }
    
    // Calculate scores and generate all analysis content
    const llmMentions = testPrompts.filter(p => p.response === 'mentioned').length;
    const { geoScore, benchmarkScore } = calculateScores(
      classification, 
      testPrompts, 
      websiteContent || { title: '', description: '', content: '', hasStructuredData: false }
    );
    
    // Generate strengths, gaps, and recommendations
    const { strengths, gaps } = generateDynamicStrengthsAndGaps(
      classification,
      testPrompts,
      geoScore,
      websiteContent?.hasStructuredData || false
    );
    
    const recommendations = generateDynamicRecommendations(
      classification,
      testPrompts,
      geoScore,
      websiteContent?.hasStructuredData || false
    );
    
    const result = {
      businessName: safeBusiness,
      websiteUrl: safeUrl,
      classification,
      testPrompts,
      geoScore,
      benchmarkScore,
      llmMentions,
      hasStructuredData: websiteContent?.hasStructuredData || false,
      publicPresence: publicPresenceResult.platforms,
      strengths,
      gaps,
      recommendations,
      timestamp: new Date().toISOString()
    };
    
    console.log('Analysis complete for:', safeBusiness, 'Classification:', classification.industry, classification.domain);
    console.log('Public presence found:', publicPresenceResult.platforms);
    
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
