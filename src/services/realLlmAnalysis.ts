
import { UsageTracker } from './usageTracking';
import { getMockAnalysis } from './analysis/mockAnalysis';
import { generateDynamicStrengthsAndGaps, generateDynamicRecommendations } from './analysis/dynamicAnalysis';
import { supabase } from '@/integrations/supabase/client';

// Re-export types for backward compatibility
export type { AnalysisResult, BusinessClassification, TestPrompt } from './classification/types';
export { generateDynamicStrengthsAndGaps, generateDynamicRecommendations };

const validateInput = (businessName: string, websiteUrl: string): boolean => {
  // Basic input validation
  if (!businessName?.trim() || businessName.trim().length < 2) {
    return false;
  }
  
  if (!websiteUrl?.trim()) {
    return false;
  }
  
  // Basic URL validation
  try {
    const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>'"]/g, '');
};

export const analyzeWebsite = async (
  businessName: string, 
  websiteUrl: string
): Promise<import('./classification/types').AnalysisResult> => {
  const usageTracker = UsageTracker.getInstance();
  const clientIP = 'anonymous'; // In production, this would be the user's IP
  
  console.log('Starting cost-protected website analysis...', { 
    businessName: sanitizeInput(businessName), 
    websiteUrl: sanitizeInput(websiteUrl)
  });
  
  // Input validation
  if (!validateInput(businessName, websiteUrl)) {
    console.log('Invalid input parameters, falling back to mock analysis');
    return await getMockAnalysis(businessName, websiteUrl, 'Invalid input parameters');
  }
  
  // Check rate limits
  const rateLimitInfo = usageTracker.checkRateLimit(clientIP);
  if (!rateLimitInfo.allowed) {
    console.log('Rate limit exceeded, falling back to mock analysis');
    return await getMockAnalysis(businessName, websiteUrl, 'Rate limit exceeded');
  }
  
  // Check budget limits
  if (!usageTracker.checkBudgetLimit()) {
    console.log('Daily budget exceeded, falling back to mock analysis');
    return await getMockAnalysis(businessName, websiteUrl, 'Daily budget exceeded');
  }
  
  // Attempt real analysis using Supabase function
  try {
    console.log('Attempting real LLM analysis...')
    
    const { data, error } = await supabase.functions.invoke('analyze-website', {
      body: {
        businessName: sanitizeInput(businessName),
        websiteUrl: sanitizeInput(websiteUrl)
      }
    });
    
    if (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from analysis');
    }
    
    // Ensure consistent mention counting in returned data
    if (data.testPrompts) {
      const actualMentions = data.testPrompts.filter((prompt: any) => {
        if (!prompt.response) return false;
        const response = prompt.response.toLowerCase();
        return response.includes('mentioned') || 
               response.includes('found') || 
               response === 'mentioned' ||
               response.includes('mention');
      }).length;
      
      // Update strengths and gaps with consistent mention counting
      data.strengths = generateDynamicStrengthsAndGaps(
        data.classification,
        data.testPrompts,
        data.geoScore,
        data.hasStructuredData
      ).strengths;
      
      data.gaps = generateDynamicStrengthsAndGaps(
        data.classification,
        data.testPrompts,
        data.geoScore,
        data.hasStructuredData
      ).gaps;
      
      data.recommendations = generateDynamicRecommendations(
        data.classification,
        data.testPrompts,
        data.geoScore,
        data.hasStructuredData
      );
    }
    
    // Record successful scan
    usageTracker.recordScan(clientIP);
    
    console.log('Real analysis complete:', data);
    return data;
    
  } catch (error) {
    console.error('Real analysis failed, falling back to mock:', error);
    return await getMockAnalysis(businessName, websiteUrl, 'API failure fallback');
  }
}
