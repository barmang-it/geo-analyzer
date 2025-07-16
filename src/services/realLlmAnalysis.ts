
import { UsageTracker } from './usageTracking';
import { getMockAnalysis } from './analysis/mockAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { validateInput, sanitizeInput } from '@/utils/security';

// Re-export types for backward compatibility
export type { AnalysisResult, BusinessClassification, TestPrompt } from './classification/types';

// Input validation and sanitization now handled by shared utils

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
    
    // Backend now handles all analysis generation, no need for frontend processing
    
    // Record successful scan
    usageTracker.recordScan(clientIP);
    
    console.log('Real analysis complete:', data);
    return data;
    
  } catch (error) {
    console.error('Real analysis failed, falling back to mock:', error);
    return await getMockAnalysis(businessName, websiteUrl, 'API failure fallback');
  }
}
