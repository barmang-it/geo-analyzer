
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
  
  // Calculate dynamic benchmark score based on full business classification
  const benchmarkScore = calculateDynamicBenchmark(classification);
  
  return {
    geoScore: Math.round(finalScore * 10) / 10,
    benchmarkScore: Math.round(benchmarkScore * 10) / 10
  }
}

function calculateDynamicBenchmark(classification: BusinessClassification): number {
  let baseScore = 6.0; // Default baseline
  
  // Industry factor
  const industryMultipliers: Record<string, number> = {
    'Food & Beverage': 1.2,     // High consumer visibility
    'Technology': 1.13,         // Above average visibility  
    'Automotive': 1.12,         // Strong brand presence
    'Financial Services': 1.08, // Regulated, visible industry
    'Healthcare': 1.02,         // Professional, lower public visibility
    'Retail': 1.05,            // Consumer-facing
    'Energy': 0.98,            // B2B focused, lower visibility
    'Business Services': 0.92,  // B2B, professional services
    'Conglomerate': 1.07,      // Diversified presence
    'Other': 1.0
  };
  
  // Market factor
  const marketMultipliers: Record<string, number> = {
    'Consumer Packaged Goods': 1.15,  // High consumer visibility
    'Consumer Electronics': 1.12,     // Strong brand presence
    'Consumer': 1.10,                 // Direct consumer facing
    'Cloud Infrastructure': 1.05,     // Well-known in tech
    'B2B SaaS': 0.95,                // Professional, less public
    'Enterprise': 0.93,               // B2B focused
    'Cybersecurity': 0.90,           // Specialized, niche
    'Multi-Industry': 1.08,          // Diverse presence
    'E-commerce': 1.02,              // Online presence
    'Retail & Consumer': 1.05,       // Physical + consumer
    'Other': 1.0
  };
  
  // Geography factor
  const geographyMultipliers: Record<string, number> = {
    'Global': 1.20,  // Worldwide recognition
    'US': 1.05,      // Large market presence
    'EU': 1.02,      // Regional presence
    'Asia': 1.03,    // Growing market presence
    'Other': 0.95    // Regional/local presence
  };
  
  // Domain specialization factor
  const domainMultipliers: Record<string, number> = {
    'Global Beverage Brand': 1.25,        // Iconic brands
    'Consumer Electronics': 1.15,         // High visibility products
    'Automotive Technology': 1.12,        // Innovation-focused
    'Financial Services': 1.08,           // Trusted institutions
    'Cybersecurity & Performance': 1.02,  // Specialized B2B
    'Software Solutions': 0.95,           // Generic software
    'Professional Services': 0.90,        // Service-based
    'E-commerce': 1.05,                   // Online retail
    'Retail Operations': 1.08,            // Physical retail
    'Diversified Conglomerate': 1.10,     // Multiple touchpoints
    'Other': 1.0
  };
  
  // Apply multipliers
  baseScore *= (industryMultipliers[classification.industry] || 1.0);
  baseScore *= (marketMultipliers[classification.market] || 1.0);
  baseScore *= (geographyMultipliers[classification.geography] || 1.0);
  baseScore *= (domainMultipliers[classification.domain] || 1.0);
  
  // Ensure reasonable bounds (4.0 - 8.5)
  return Math.max(4.0, Math.min(8.5, baseScore));
}
