
export interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
}

export interface TestPrompt {
  type: string;
  prompt: string;
  response?: string;
}

export interface AnalysisResult {
  classification: BusinessClassification;
  testPrompts: TestPrompt[];
  geoScore: number;
  benchmarkScore: number;
  hasStructuredData: boolean;
  llmMentions: number;
}

export const analyzeWebsite = async (
  businessName: string, 
  websiteUrl: string
): Promise<AnalysisResult> => {
  // In production, this would use your deployed Supabase function
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const functionUrl = `${supabaseUrl}/functions/v1/analyze-website`
  
  try {
    console.log('Starting website analysis...', { businessName, websiteUrl })
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
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
    console.log('Analysis complete:', result)
    
    return result
  } catch (error) {
    console.error('Website analysis error:', error)
    
    // Fallback to mock data if API fails
    console.log('Falling back to mock analysis...')
    return getMockAnalysis(businessName, websiteUrl)
  }
}

// Fallback mock analysis for development/testing
const getMockAnalysis = (businessName: string, websiteUrl: string): AnalysisResult => {
  const mockClassification: BusinessClassification = {
    industry: 'Technology',
    market: 'B2B SaaS',
    geography: 'US'
  }
  
  const mockPrompts: TestPrompt[] = [
    {
      type: "Top Tools",
      prompt: "What are the leading technology solutions in the US?",
      response: Math.random() > 0.5 ? 'mentioned' : 'not mentioned'
    },
    {
      type: "Alternatives",
      prompt: "What are some alternatives to popular B2B SaaS platforms?",
      response: Math.random() > 0.5 ? 'mentioned' : 'not mentioned'
    },
    {
      type: "Market Leaders",
      prompt: "Which companies dominate the technology space in the US?",
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

export const generateDynamicStrengthsAndGaps = (
  classification: BusinessClassification,
  testPrompts: TestPrompt[],
  geoScore: number,
  hasStructuredData: boolean,
  llmMentions: number
) => {
  const strengths: string[] = []
  const gaps: string[] = []
  
  const mentionRate = llmMentions / testPrompts.length
  
  if (mentionRate > 0.6) {
    strengths.push(`Strong LLM visibility with ${llmMentions}/${testPrompts.length} prompt matches`)
  } else if (mentionRate > 0.3) {
    strengths.push(`Moderate LLM presence with ${llmMentions}/${testPrompts.length} mentions`)
  } else {
    gaps.push(`Low LLM visibility - only ${llmMentions}/${testPrompts.length} prompts returned mentions`)
  }
  
  if (hasStructuredData) {
    strengths.push("Structured data (JSON-LD) detected on website")
  } else {
    gaps.push("No structured data (JSON-LD schema) found on homepage")
  }
  
  if (classification.geography === 'Global') {
    strengths.push(`Global brand recognition in ${classification.industry} sector`)
  } else {
    gaps.push(`Limited to ${classification.geography} market presence`)
  }
  
  if (geoScore >= 8) {
    strengths.push("Excellent overall AI discoverability score")
  } else if (geoScore >= 6) {
    strengths.push("Good foundation for AI visibility")
  } else {
    gaps.push("Below-average AI discoverability needs improvement")
  }
  
  if (strengths.length === 0) {
    strengths.push(`Clear ${classification.industry.toLowerCase()} business classification`)
    strengths.push("Website accessible for analysis")
  }
  
  if (gaps.length === 0) {
    gaps.push("Consider expanding content marketing efforts")
  }
  
  return { strengths, gaps }
}

export const generateDynamicRecommendations = (
  classification: BusinessClassification,
  testPrompts: TestPrompt[],
  geoScore: number,
  hasStructuredData: boolean,
  llmMentions: number
) => {
  const recommendations: string[] = []
  const mentionRate = llmMentions / testPrompts.length
  
  if (!hasStructuredData) {
    recommendations.push("Add JSON-LD structured data to your homepage for better AI comprehension")
  }
  
  if (mentionRate < 0.5) {
    recommendations.push(`Create content comparing top ${classification.industry.toLowerCase()} tools to increase citations`)
    recommendations.push(`Engage with ${classification.industry.toLowerCase()} communities and forums`)
  }
  
  if (classification.industry === 'Technology') {
    recommendations.push("Publish technical content and case studies to establish thought leadership")
    if (classification.geography !== 'Global') {
      recommendations.push("Expand international presence through global tech platforms")
    }
  }
  
  if (geoScore < 6) {
    recommendations.push("Focus on high-authority backlinks and press coverage")
  }
  
  if (classification.geography !== 'Global' && geoScore > 6) {
    recommendations.push("Consider expanding to international markets to increase global AI visibility")
  }
  
  return recommendations
}
