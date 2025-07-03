
export interface MentionDetectionResult {
  mentioned: boolean;
  variations: string[];
  matchedVariation?: string;
}

export function detectBusinessMention(
  businessName: string,
  responseContent: string
): MentionDetectionResult {
  const content = responseContent.toLowerCase();
  const businessNameLower = businessName.toLowerCase();
  
  console.log(`Checking mentions for: "${businessName}" in response: "${responseContent.substring(0, 200)}..."`);
  
  // Create variations of the business name to check
  const nameVariations = [
    businessNameLower,
    businessNameLower.replace(/[^\w\s]/g, ''), // Remove punctuation
    businessNameLower.replace(/[-_\s]+/g, ' '), // Normalize spaces
    businessNameLower.replace(/[-_\s]+/g, ''), // Remove all separators
  ];
  
  // Special brand variations for major companies
  const brandVariations = [];
  if (businessNameLower.includes('coca-cola') || businessNameLower.includes('coca cola')) {
    brandVariations.push('coke', 'coca-cola', 'coca cola', 'cocacola', 'the coca-cola company');
  }
  if (businessNameLower.includes('pepsi')) {
    brandVariations.push('pepsi', 'pepsico', 'pepsi-cola', 'pepsi cola');
  }
  if (businessNameLower.includes('akamai')) {
    brandVariations.push('akamai', 'akamai technologies');
  }
  
  const allVariations = [...new Set([...nameVariations, ...brandVariations])];
  
  // Check if any variation is mentioned in the response
  let matchedVariation: string | undefined;
  const mentioned = allVariations.some(variation => {
    if (variation.length < 2) return false; // Skip very short variations
    
    // Check for exact match or word boundary match
    const exactMatch = content.includes(variation);
    const wordBoundaryMatch = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(content);
    
    if (exactMatch || wordBoundaryMatch) {
      matchedVariation = variation;
      console.log(`Found match: "${variation}" in response`);
      return true;
    }
    return false;
  });
  
  console.log(`Mention detection result: ${mentioned ? 'FOUND' : 'NOT FOUND'}${matchedVariation ? ` (matched: "${matchedVariation}")` : ''}`);
  
  return {
    mentioned,
    variations: allVariations,
    matchedVariation
  };
}
