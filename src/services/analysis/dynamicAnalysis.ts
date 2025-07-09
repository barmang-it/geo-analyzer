
import { BusinessClassification, TestPrompt } from '../classification/types';

export const generateDynamicStrengthsAndGaps = (
  classification: BusinessClassification,
  testPrompts: TestPrompt[],
  geoScore: number,
  hasStructuredData: boolean,
  llmMentions?: number // Make this optional since we'll calculate it
) => {
  const strengths: string[] = []
  const gaps: string[] = []
  
  // Calculate mentions consistently - check for various mention indicators
  const actualMentions = testPrompts.filter(prompt => {
    if (!prompt.response) return false;
    const response = prompt.response.toLowerCase();
    return response.includes('mentioned') || 
           response.includes('found') || 
           response === 'mentioned' ||
           response.includes('mention');
  }).length;
  
  const mentionRate = testPrompts.length > 0 ? actualMentions / testPrompts.length : 0;
  
  // AI Visibility Assessment
  if (mentionRate > 0.6) {
    strengths.push(`Strong LLM visibility with ${actualMentions}/${testPrompts.length} prompt matches`);
  } else if (mentionRate > 0.3) {
    strengths.push(`Moderate LLM presence with ${actualMentions}/${testPrompts.length} mentions`);
  } else {
    gaps.push(`Low LLM visibility - only ${actualMentions}/${testPrompts.length} prompts returned mentions`);
  }
  
  // Technical Implementation
  if (hasStructuredData) {
    strengths.push("Structured data (JSON-LD) detected on website");
  } else {
    gaps.push("No structured data (JSON-LD schema) found on homepage");
  }
  
  // Geographic Reach Assessment
  if (classification.geography === 'Global') {
    strengths.push(`Global brand recognition in ${classification.industry} sector`);
  } else if (classification.geography !== 'Global' && geoScore < 6) {
    gaps.push(`Limited to ${classification.geography} market presence`);
  }
  
  // Overall Score Assessment (avoid redundancy with specific issues)
  if (geoScore >= 8 && mentionRate > 0.5) {
    strengths.push("Excellent overall AI discoverability score");
  } else if (geoScore >= 6 && mentionRate > 0.3) {
    strengths.push("Good foundation for AI visibility");
  } else if (geoScore < 6 && mentionRate <= 0.3) {
    // Only add this if we haven't already mentioned low LLM visibility
    if (actualMentions > 0) {
      gaps.push("Below-average AI discoverability needs improvement");
    }
  }
  
  // Ensure minimum content
  if (strengths.length === 0) {
    strengths.push(`Clear ${classification.industry.toLowerCase()} business classification`);
    strengths.push("Website accessible for analysis");
  }
  
  if (gaps.length === 0) {
    gaps.push("Consider expanding content marketing efforts");
  }
  
  return { strengths, gaps }
}

export const generateDynamicRecommendations = (
  classification: BusinessClassification,
  testPrompts: TestPrompt[],
  geoScore: number,
  hasStructuredData: boolean,
  llmMentions?: number // Make this optional since we'll calculate it
) => {
  const recommendations: string[] = []
  
  // Calculate mentions consistently
  const actualMentions = testPrompts.filter(prompt => {
    if (!prompt.response) return false;
    const response = prompt.response.toLowerCase();
    return response.includes('mentioned') || 
           response.includes('found') || 
           response === 'mentioned' ||
           response.includes('mention');
  }).length;
  
  const mentionRate = testPrompts.length > 0 ? actualMentions / testPrompts.length : 0;
  
  // Technical improvements
  if (!hasStructuredData) {
    recommendations.push("Add JSON-LD structured data to your homepage for better AI comprehension");
  }
  
  // Content strategy based on mention rate
  if (mentionRate < 0.5) {
    recommendations.push(`Create content comparing top ${classification.domain.toLowerCase()} solutions to increase citations`);
    recommendations.push(`Engage with ${classification.industry.toLowerCase()} communities and forums`);
  }
  
  // Industry-specific recommendations
  if (classification.industry === 'Technology') {
    recommendations.push("Publish technical content and case studies to establish thought leadership");
  } else if (classification.industry === 'Food & Beverage') {
    if (classification.market.toLowerCase().includes('consumer') || classification.market.toLowerCase().includes('retail')) {
      recommendations.push("Increase brand visibility through consumer review platforms and social media");
    } else {
      recommendations.push("Partner with industry publications to increase brand mentions");
    }
  } else if (classification.industry === 'Healthcare') {
    recommendations.push("Create educational content to establish expertise and increase citations");
  } else {
    recommendations.push(`Develop thought leadership content specific to ${classification.industry.toLowerCase()}`);
  }
  
  // Geographic expansion (avoid redundancy)
  if (classification.geography !== 'Global' && geoScore > 6 && mentionRate > 0.3) {
    recommendations.push("Consider expanding to international markets to increase global AI visibility");
  } else if (geoScore < 6) {
    recommendations.push("Focus on high-authority backlinks and press coverage");
  }
  
  return recommendations;
}
