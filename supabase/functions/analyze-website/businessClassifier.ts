
import { performIntelligentClassification } from './classifiers/intelligentClassifier.ts';
import { BusinessClassification } from './types.ts';

interface WebsiteContent {
  title: string;
  description: string;
  content: string;
  hasStructuredData: boolean;
}

export async function classifyBusinessWithLLM(
  businessName: string, 
  websiteUrl: string,
  websiteContent?: WebsiteContent
): Promise<BusinessClassification> {
  console.log('Starting intelligent classification for:', businessName);
  
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    console.log('No OpenAI key, using intelligent classification');
    return performIntelligentClassification(businessName, websiteUrl, websiteContent);
  }
  
  // Build comprehensive context from website content
  let contextInfo = `Business: ${businessName}\nWebsite: ${websiteUrl}`;
  
  if (websiteContent) {
    contextInfo += `\n\nWebsite Content Analysis:`;
    if (websiteContent.title) {
      contextInfo += `\nPage Title: ${websiteContent.title}`;
    }
    if (websiteContent.description) {
      contextInfo += `\nMeta Description: ${websiteContent.description}`;
    }
    if (websiteContent.content) {
      // Use first 800 characters of content for context
      contextInfo += `\nWebsite Content: ${websiteContent.content.substring(0, 800)}`;
    }
    if (websiteContent.hasStructuredData) {
      contextInfo += `\nHas Structured Data: Yes (JSON-LD/Schema.org markup detected)`;
    }
  }

  const prompt = `Analyze this business using the provided website content and classify it dynamically and granularly:

${contextInfo}

Based on the actual website content above, classify this business with maximum granularity. Pay special attention to:
- What services/products they actually offer (from website content)
- Industry-specific terminology and technical capabilities
- Their precise target market and customer base
- Geographic presence and service areas
- Business model and revenue streams
- Specific niches within broader industries

GEOGRAPHY CLASSIFICATION - BE VERY GRANULAR:
- For LOCAL businesses: Include city, state/province, and country (e.g., "Toronto, Ontario, Canada" or "Austin, Texas, USA")
- For REGIONAL businesses: Include region and country (e.g., "Western Canada", "Northeast USA", "Southern Europe")
- For NATIONAL businesses: Include the specific country (e.g., "United States", "Germany", "Australia")
- For GLOBAL businesses: Look for indicators like international offices, worldwide operations, stock exchanges, multiple country operations
- Use website content evidence: addresses, "serving X region", "offices in", "available in countries"

DOMAIN CLASSIFICATION - BE HIGHLY SPECIFIC:
- Don't use generic terms - be as specific as possible based on website content
- Examples: "Cybersecurity Software" not "Software", "Dental Services" not "Healthcare", "Electric Vehicle Charging" not "Energy"
- Focus on the primary value proposition and core business offering
- Use industry-specific terminology found on their website

INDUSTRY CLASSIFICATION - DYNAMIC AND SPECIFIC:
- Create precise industry classifications based on actual business activities
- Don't limit to predefined categories - create new ones as needed
- Examples: "Artificial Intelligence & Machine Learning", "Quantum Computing", "Sustainable Energy Storage", "Digital Health Platforms"

CLASSIFICATION INSTRUCTIONS:
1. Analyze the website content to understand the exact business model and offerings
2. Create precise, specific classifications - avoid generic terms
3. Use the business's own terminology and positioning when possible
4. For geography, be as specific as the evidence allows
5. Base everything on concrete evidence from the website content

Return JSON only with dynamic, granular classifications:
{
  "industry": "[Create specific industry based on actual business - no predefined limits]",
  "market": "[Specific target market and customer segment based on website content]", 
  "geography": "[Granular geographic classification: City, State/Province, Country OR Regional OR National OR Global based on evidence]",
  "category": "[Business size/type based on evidence: startup, SMB, enterprise, public company, etc.]",
  "domain": "[Highly specific domain/specialization based on core offerings and website terminology]"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    console.log('Making OpenAI API call for classification...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a business classification expert specializing in dynamic, granular analysis. Create precise, specific classifications based entirely on website content evidence. For geography, be as granular as possible - include city/state/province for local businesses, regions for regional businesses, specific countries for national businesses, and "Global" only when there is clear evidence of international operations. For domains and industries, use the specific terminology found on the website rather than generic categories. Always prioritize precision and specificity over broad generalizations. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 300
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status}`);
      throw new Error(`OpenAI API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('OpenAI API response received');
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid OpenAI response')
    }
    
    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const result = JSON.parse(content);
    console.log('LLM Classification result:', result);
    
    return {
      industry: result.industry || 'Business Services',
      market: result.market || 'Professional Services',
      geography: result.geography || 'Not Specified',
      category: result.category || 'Small to Medium Business',
      domain: result.domain || 'General Business Services'
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LLM classification error:', error)
    
    // Use intelligent classification as fallback
    console.log('Using intelligent classification due to LLM error');
    return performIntelligentClassification(businessName, websiteUrl, websiteContent);
  }
}
