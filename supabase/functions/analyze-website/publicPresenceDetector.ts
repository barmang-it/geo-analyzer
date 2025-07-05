
import { callOpenAI } from './utils/openaiClient.ts';
import { detectBusinessMention } from './utils/mentionDetector.ts';
import { BusinessClassification } from './types.ts';

export interface PublicPresenceResult {
  platforms: string[];
  totalFound: number;
}

export async function detectPublicPresence(
  businessName: string,
  classification: BusinessClassification,
  openaiKey: string
): Promise<PublicPresenceResult> {
  console.log(`Detecting public presence for: ${businessName}`);
  
  const industrySpecificSources = getIndustrySpecificSources(classification);
  
  const prompt = `You are a research assistant helping to identify where a business has public presence or mentions. 

Business: ${businessName}
Industry: ${classification.industry}
Market: ${classification.market}
Geography: ${classification.geography}

Search for and identify if this business is mentioned in any of these types of sources:
- Wikipedia or other encyclopedic sources
- Industry trade publications and magazines
- Major news outlets and press coverage
- Professional industry directories
- Academic publications or research papers
- Government databases or regulatory filings
- Industry association member lists
- Technology databases (if applicable)
- Financial databases or investor relations
- Social media verification (LinkedIn company page, verified Twitter/X, etc.)

Please respond with ONLY a JSON array of specific sources where this business has verified presence or mentions. Include only real, verifiable sources. Use specific names like "Wikipedia", "TechCrunch", "Forbes", "LinkedIn", "Bloomberg", etc.

Example format: ["Wikipedia", "TechCrunch", "Forbes Technology Council", "LinkedIn", "SEC Filings"]

If no verifiable sources are found, return an empty array: []`;

  try {
    const responseContent = await callOpenAI(prompt, openaiKey, 15000); // 15 second timeout
    
    if (!responseContent) {
      console.log('No response from public presence detection');
      return { platforms: [], totalFound: 0 };
    }

    console.log(`Public presence detection response: ${responseContent}`);
    
    // Try to parse JSON response
    let platforms: string[] = [];
    try {
      // Clean the response to extract JSON
      const cleanedResponse = responseContent.trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');
      
      platforms = JSON.parse(cleanedResponse);
      
      // Validate it's an array of strings
      if (!Array.isArray(platforms)) {
        console.error('Response is not an array:', platforms);
        platforms = [];
      }
      
      // Filter out invalid entries and limit to reasonable number
      platforms = platforms
        .filter(platform => typeof platform === 'string' && platform.trim().length > 0)
        .slice(0, 10); // Limit to 10 platforms max
        
    } catch (parseError) {
      console.error('Failed to parse public presence JSON:', parseError);
      // Fallback: try to extract platform names from text
      platforms = extractPlatformNames(responseContent);
    }

    console.log(`Found ${platforms.length} public presence platforms:`, platforms);
    
    return {
      platforms,
      totalFound: platforms.length
    };
    
  } catch (error) {
    console.error('Error detecting public presence:', error);
    return { platforms: [], totalFound: 0 };
  }
}

function getIndustrySpecificSources(classification: BusinessClassification): string[] {
  const { industry, market } = classification;
  
  let sources: string[] = [
    'Wikipedia',
    'LinkedIn',
    'Bloomberg',
    'Reuters',
    'Associated Press'
  ];
  
  if (industry === 'Technology') {
    sources.push('TechCrunch', 'Wired', 'Ars Technica', 'The Verge', 'IEEE');
  }
  
  if (industry === 'Food & Beverage') {
    sources.push('Food & Wine', 'Beverage Industry', 'Food Business Magazine');
  }
  
  if (market === 'B2B SaaS') {
    sources.push('SaaS Magazine', 'Software Advice', 'G2', 'Capterra');
  }
  
  if (industry === 'Conglomerate') {
    sources.push('Fortune', 'Harvard Business Review', 'Wall Street Journal');
  }
  
  return sources;
}

function extractPlatformNames(text: string): string[] {
  const commonPlatforms = [
    'Wikipedia', 'LinkedIn', 'Bloomberg', 'Reuters', 'TechCrunch', 
    'Forbes', 'Fortune', 'Wall Street Journal', 'Financial Times',
    'The Verge', 'Wired', 'Harvard Business Review', 'SEC', 'NASDAQ'
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  commonPlatforms.forEach(platform => {
    if (lowerText.includes(platform.toLowerCase())) {
      found.push(platform);
    }
  });
  
  return found.slice(0, 5); // Limit fallback to 5 platforms
}
