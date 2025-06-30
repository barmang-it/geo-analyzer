
import { UsageTracker } from './usageTracking';
import { getMockAnalysis } from './analysis/mockAnalysis';
import { generateDynamicStrengthsAndGaps, generateDynamicRecommendations } from './analysis/dynamicAnalysis';

// Re-export types for backward compatibility
export type { AnalysisResult, BusinessClassification, TestPrompt } from './classification/types';
export { generateDynamicStrengthsAndGaps, generateDynamicRecommendations };

export const analyzeWebsite = async (
  businessName: string, 
  websiteUrl: string
): Promise<import('./classification/types').AnalysisResult> => {
  const usageTracker = UsageTracker.getInstance();
  const clientIP = 'anonymous'; // In production, this would be the user's IP
  
  console.log('Starting cost-protected website analysis...', { businessName, websiteUrl });
  
  // Check rate limits
  const rateLimitInfo = usageTracker.checkRateLimit(clientIP);
  if (!rateLimitInfo.allowed) {
    console.log('Rate limit exceeded, falling back to mock analysis');
    return getMockAnalysis(businessName, websiteUrl, 'Rate limit exceeded');
  }
  
  // Check budget limits
  if (!usageTracker.checkBudgetLimit()) {
    console.log('Daily budget exceeded, falling back to mock analysis');
    return getMockAnalysis(businessName, websiteUrl, 'Daily budget exceeded');
  }
  
  // Attempt real analysis
  const supabaseUrl = "https://cxeyudjaehsmtmqnzklk.supabase.co"
  const functionUrl = `${supabaseUrl}/functions/v1/analyze-website`
  
  try {
    console.log('Attempting real LLM analysis...')
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZXl1ZGphZWhzbXRtcW56a2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDA1OTUsImV4cCI6MjA2NjYxNjU5NX0.kH-nWJME9-UYvINUvPcO9DyWjVu9gVZQgc3ZxyNyPWY`
      },
      body: JSON.stringify({
        businessName,
        websiteUrl
      })
    })
    
    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Record successful scan
    usageTracker.recordScan(clientIP);
    
    console.log('Real analysis complete:', result)
    return result
    
  } catch (error) {
    console.error('Real analysis failed, falling back to mock:', error)
    return getMockAnalysis(businessName, websiteUrl, 'API failure fallback')
  }
}
