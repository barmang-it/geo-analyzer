
export interface MentionDetectionResult {
  mentioned: boolean;
  variations: string[];
}

export function detectBusinessMention(
  businessName: string,
  responseContent: string
): MentionDetectionResult {
  const content = responseContent.toLowerCase();
  const businessNameLower = businessName.toLowerCase();
  
  // Create variations of the business name to check
  const nameVariations = [
    businessNameLower,
    businessNameLower.replace('-', ' '),
    businessNameLower.replace(' ', '-'),
    businessNameLower.replace(/[^a-z0-9]/g, ''), // Remove all special characters
  ];
  
  // Special brand variations for major companies
  const brandVariations = [];
  if (businessNameLower.includes('coca-cola') || businessNameLower.includes('coca cola')) {
    brandVariations.push('coke', 'coca-cola', 'coca cola', 'cocacola');
  }
  if (businessNameLower.includes('pepsi')) {
    brandVariations.push('pepsi', 'pepsico', 'pepsi-cola');
  }
  if (businessNameLower.includes('akamai')) {
    brandVariations.push('akamai', 'akamai technologies');
  }
  
  const allVariations = [...nameVariations, ...brandVariations];
  
  // Check if any variation is mentioned in the response
  const mentioned = allVariations.some(variation => {
    if (variation.length < 3) return false; // Skip very short variations
    return content.includes(variation);
  });
  
  return {
    mentioned,
    variations: allVariations
  };
}
