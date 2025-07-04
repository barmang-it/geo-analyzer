
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
    
    // More strict matching - require word boundaries for short names
    if (variation.length <= 4) {
      const wordBoundaryMatch = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(content);
      if (wordBoundaryMatch) {
        matchedVariation = variation;
        console.log(`Found exact word boundary match: "${variation}" in response`);
        return true;
      }
    } else {
      // For longer names, allow partial matches but still prefer word boundaries
      const wordBoundaryMatch = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(content);
      const partialMatch = content.includes(variation);
      
      if (wordBoundaryMatch) {
        matchedVariation = variation;
        console.log(`Found word boundary match: "${variation}" in response`);
        return true;
      } else if (partialMatch) {
        matchedVariation = variation;
        console.log(`Found partial match: "${variation}" in response`);
        return true;
      }
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
