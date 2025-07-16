interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  domain: string;
}

interface TestPrompt {
  type: string;
  prompt: string;
  response?: string;
}

export const generateDynamicStrengthsAndGaps = (
  classification: BusinessClassification,
  testPrompts: TestPrompt[],
  geoScore: number,
  hasStructuredData: boolean
): { strengths: string[]; gaps: string[] } => {
  const strengths: string[] = []
  const gaps: string[] = []
  
  // Calculate mentions correctly - backend returns "not mentioned" when not found
  const actualMentions = testPrompts.filter(prompt => {
    if (!prompt.response) return false;
    const response = prompt.response.toLowerCase();
    // A mention is found if response contains "mentioned" but NOT "not mentioned"
    return response.includes('mentioned') && !response.includes('not mentioned');
  }).length;
  
  const mentionRate = testPrompts.length > 0 ? actualMentions / testPrompts.length : 0;
  
  // Score-based strengths and gaps
  if (geoScore >= 7) {
    strengths.push(`Strong online presence with ${geoScore}/10 visibility score`);
  } else if (geoScore >= 5) {
    strengths.push(`Moderate online presence with ${geoScore}/10 visibility score`);
  } else {
    gaps.push(`Limited online presence with only ${geoScore}/10 visibility score`);
  }
  
  // Mention-based analysis
  if (mentionRate >= 0.6) {
    strengths.push(`Strong brand recognition with ${Math.round(mentionRate * 100)}% mention rate`);
  } else if (mentionRate >= 0.3) {
    strengths.push(`Moderate brand recognition with ${Math.round(mentionRate * 100)}% mention rate`);
  } else {
    gaps.push(`Limited brand recognition with only ${Math.round(mentionRate * 100)}% mention rate`);
  }
  
  // Industry-specific strengths
  if (classification.industry === 'Technology' && mentionRate > 0.4) {
    strengths.push('Strong presence in the competitive technology sector');
  } else if (classification.industry === 'Food & Beverage' && mentionRate > 0.5) {
    strengths.push('Good consumer brand recognition in food & beverage');
  }
  
  // Geography-specific analysis
  if (classification.geography === 'Global' && mentionRate > 0.5) {
    strengths.push('Strong international brand presence');
  } else if (classification.geography === 'Global' && mentionRate < 0.3) {
    gaps.push('Limited visibility despite global market positioning');
  }
  
  // Market-specific insights
  if (classification.market === 'Consumer' && mentionRate > 0.4) {
    strengths.push('Good consumer market recognition');
  } else if (classification.market === 'B2B' && mentionRate < 0.3) {
    gaps.push('Limited public visibility in B2B market (expected but could improve)');
  }
  
  // Technical infrastructure
  if (hasStructuredData) {
    strengths.push('Well-optimized website with structured data');
  } else {
    gaps.push('Missing structured data optimization for search engines');
  }
  
  // Ensure we have at least one strength and one gap
  if (strengths.length === 0) {
    strengths.push('Functional website with basic information');
  }
  if (gaps.length === 0) {
    gaps.push('Opportunity to enhance digital marketing presence');
  }
  
  return { strengths, gaps }
}

export const generateDynamicRecommendations = (
  classification: BusinessClassification,
  testPrompts: TestPrompt[],
  geoScore: number,
  hasStructuredData: boolean
): string[] => {
  const recommendations: string[] = []
  
  // Calculate mentions correctly - backend returns "not mentioned" when not found
  const actualMentions = testPrompts.filter(prompt => {
    if (!prompt.response) return false;
    const response = prompt.response.toLowerCase();
    // A mention is found if response contains "mentioned" but NOT "not mentioned"
    return response.includes('mentioned') && !response.includes('not mentioned');
  }).length;
  
  const mentionRate = testPrompts.length > 0 ? actualMentions / testPrompts.length : 0;
  
  // Score-based recommendations
  if (geoScore < 5) {
    recommendations.push('Invest in SEO and content marketing to improve online visibility');
    recommendations.push('Create high-quality, industry-relevant content to build authority');
  } else if (geoScore < 7) {
    recommendations.push('Optimize existing content for better search engine rankings');
  }
  
  // Mention-based recommendations
  if (mentionRate < 0.3) {
    recommendations.push('Develop thought leadership content to increase brand mentions');
    recommendations.push('Engage in industry forums and professional networks');
  } else if (mentionRate < 0.6) {
    recommendations.push('Leverage existing brand recognition with targeted PR campaigns');
  }
  
  // Industry-specific recommendations
  if (classification.industry === 'Technology') {
    recommendations.push('Showcase technical innovation through case studies and white papers');
    if (mentionRate < 0.4) {
      recommendations.push('Participate in tech conferences and industry publications');
    }
  } else if (classification.industry === 'Food & Beverage') {
    recommendations.push('Implement social media marketing focused on consumer engagement');
    if (mentionRate < 0.5) {
      recommendations.push('Partner with food bloggers and influencers');
    }
  }
  
  // Geography-specific recommendations
  if (classification.geography === 'Global') {
    if (mentionRate < 0.4) {
      recommendations.push('Develop region-specific marketing strategies');
      recommendations.push('Create localized content for different markets');
    } else {
      recommendations.push('Leverage global presence for cross-market opportunities');
    }
  } else if (classification.geography === 'US') {
    recommendations.push('Focus on US market penetration strategies');
  }
  
  // Market-specific recommendations
  if (classification.market === 'Consumer') {
    recommendations.push('Implement customer review and testimonial programs');
    if (mentionRate < 0.4) {
      recommendations.push('Develop influencer marketing partnerships');
    }
  } else if (classification.market === 'B2B') {
    recommendations.push('Create detailed product documentation and case studies');
    recommendations.push('Develop strategic partnerships with industry leaders');
  }
  
  // Technical recommendations
  if (!hasStructuredData) {
    recommendations.push('Implement structured data markup for better search visibility');
  }
  
  // Always include these foundational recommendations
  recommendations.push('Monitor online reputation and brand mentions regularly');
  recommendations.push('Develop a comprehensive digital marketing strategy');
  
  // Remove duplicates and limit to most relevant
  const uniqueRecommendations = [...new Set(recommendations)];
  return uniqueRecommendations.slice(0, 8);
}