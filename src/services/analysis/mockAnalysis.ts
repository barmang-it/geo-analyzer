
import { AnalysisResult, BusinessClassification, TestPrompt } from '../classification/types';

export const getMockAnalysis = (
  businessName: string, 
  websiteUrl: string, 
  fallbackReason?: string
): AnalysisResult => {
  console.log(`Using mock analysis${fallbackReason ? ` (${fallbackReason})` : ''}`)
  
  const mockClassification: BusinessClassification = {
    industry: 'Technology',
    market: 'B2B SaaS',
    geography: 'US',
    category: 'Software & Technology',
    domain: 'Software Solutions'
  }
  
  const mockPrompts: TestPrompt[] = [
    {
      type: "Top Tools",
      prompt: "What are the leading software solutions in the US?",
      response: Math.random() > 0.5 ? 'mentioned' : 'not mentioned'
    },
    {
      type: "Alternatives",
      prompt: "What are some alternatives to popular B2B SaaS platforms?",
      response: Math.random() > 0.5 ? 'mentioned' : 'not mentioned'
    },
    {
      type: "Market Leaders",
      prompt: "Which companies dominate the software solutions space in the US?",
      response: Math.random() > 0.5 ? 'mentioned' : 'not mentioned'
    },
    {
      type: "Industry Trends",
      prompt: "What software solutions companies are leading innovation in the US?",
      response: Math.random() > 0.5 ? 'mentioned' : 'not mentioned'
    },
    {
      type: "Recommendation",
      prompt: "Can you recommend software solutions for businesses in the US?",
      response: Math.random() > 0.5 ? 'mentioned' : 'not mentioned'
    }
  ]
  
  const mentionCount = mockPrompts.filter(p => p.response === 'mentioned').length
  
  return {
    classification: mockClassification,
    testPrompts: mockPrompts,
    geoScore: 6.5 + Math.random() * 2,
    benchmarkScore: 6.8,
    hasStructuredData: Math.random() > 0.5,
    llmMentions: mentionCount
  }
}
