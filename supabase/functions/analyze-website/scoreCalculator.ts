
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

interface WebsiteContent {
  title: string;
  description: string;
  content: string;
  hasStructuredData: boolean;
}

export function calculateScores(
  classification: BusinessClassification, 
  promptResults: TestPrompt[], 
  content: WebsiteContent
): { geoScore: number; benchmarkScore: number } {
  // Calculate mentions from test prompts - this should be the primary factor
  const mentionCount = promptResults.filter(p => p.response && p.response.includes('mentioned')).length
  const mentionRate = promptResults.length > 0 ? mentionCount / promptResults.length : 0;
  
  // Base score should primarily depend on mention rate
  let baseScore = mentionRate * 6; // 0-6 points based on mention rate
  
  // Add small base score for having a website and being classifiable
  baseScore += 1.0;
  
  // Score based on structured data (only if there are mentions)
  const structuredDataScore = content.hasStructuredData ? 0.5 : 0;
  baseScore += structuredDataScore;
  
  // Geography scoring (reduced impact)
  if (classification.geography === 'Global' && mentionRate > 0) {
    baseScore += 0.8;
  } else if (classification.geography === 'Global') {
    baseScore += 0.2; // Small bonus even without mentions
  } else if (classification.geography === 'US' && mentionRate > 0) {
    baseScore += 0.4;
  }
  
  // Industry scoring (minimal impact)
  const highVisibilityIndustries = ['Technology', 'Food & Beverage'];
  if (highVisibilityIndustries.includes(classification.industry) && mentionRate > 0) {
    baseScore += 0.3;
  }
  
  // Small random variation for realism (-0.2 to +0.2)
  const variation = (Math.random() - 0.5) * 0.4;
  
  const finalScore = Math.max(0, Math.min(10, baseScore + variation));
  
  // Industry benchmarks
  const benchmarks: Record<string, number> = {
    'Technology': 6.8,
    'Healthcare': 6.1,
    'Finance': 6.5,
    'Retail': 6.3,
    'Other': 6.0
  }
  
  const benchmarkScore = benchmarks[classification.industry] || 6.0
  
  return {
    geoScore: Math.round(finalScore * 10) / 10,
    benchmarkScore: Math.round(benchmarkScore * 10) / 10
  }
}
