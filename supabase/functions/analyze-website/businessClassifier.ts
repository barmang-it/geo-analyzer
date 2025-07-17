
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

  const prompt = `Analyze this business using the provided website content and classify it accurately:

${contextInfo}

Based on the actual website content above, classify this business. Pay special attention to:
- What services/products they actually offer (from website content)
- Industry-specific terminology in their content
- Their target market and geography
- Technical capabilities mentioned
- Global presence indicators (international offices, worldwide operations, stock exchanges, etc.)

CRITICAL GEOGRAPHY CLASSIFICATION:
- Look for indicators of global presence: "international", "worldwide", "global", "offices in multiple countries", "publicly traded", "fortune 500", "nasdaq", "nyse", stock exchanges
- Major corporations with international presence should be classified as "Global"
- Only classify as "US" if the business is clearly US-only with no international presence
- Consider domain extensions (.com doesn't automatically mean US-only)
- Look for subsidiary offices, international operations, or global customer base

INDUSTRY CLASSIFICATION RULES:
1. Analyze the PRIMARY business model and core products/services offered
2. Focus on what the company ACTUALLY sells or provides as their main revenue source
3. Don't classify based on distribution channel alone - focus on the core business
4. For convenience stores, food retailers, beverage companies: classify as "Food & Beverage" regardless of having physical locations
5. "Retail" should be for general merchandise retailers, department stores, clothing retailers
6. Technology companies should be properly subcategorized (enterprise software, consumer electronics, cloud infrastructure, etc.)
7. E-COMMERCE vs RETAIL: Online-only businesses should be "E-commerce", but focus on what they sell, not just the channel

Return JSON only:
{
  "industry": "CDN & Edge Computing OR Enterprise Software OR Database & Analytics OR Developer Tools OR Financial Technology OR Digital Healthcare OR Consumer Electronics OR Automotive Technology OR Food & Beverage OR Energy & Utilities OR E-commerce OR Cybersecurity OR Cloud Infrastructure OR Network Infrastructure OR AI & Machine Learning OR Other",
  "market": "Content Delivery OR Edge Security OR Web Performance OR Media Delivery OR SaaS Tools OR Data Warehousing OR Business Intelligence OR Database Management OR API Management OR Development Platforms OR Digital Banking OR Trading Platforms OR Payment Processing OR Telemedicine OR Medical Devices OR Mobile Devices OR Computing Hardware OR Beverage Products OR Energy Trading OR Marketplace Platforms OR Online Retail OR Cybersecurity Solutions OR Cloud Services OR Network Services OR Other", 
  "geography": "Global OR North America OR Europe OR Asia Pacific OR Latin America OR Africa OR Other",
  "category": "Fortune 500 OR Public Company OR Unicorn Startup OR Mid-Market OR Small Business OR Government OR Non-Profit OR Other",
  "domain": "CDN Services OR Edge Security OR Performance Optimization OR Media CDN OR SaaS Tools OR Data Solutions OR BI Platforms OR API Platforms OR Developer Tools OR Fintech Solutions OR Trading Platforms OR Digital Banking OR Telemedicine Platforms OR Medical Devices OR Mobile Devices OR Computing Hardware OR Beverage Brands OR Energy Solutions OR Marketplace Platforms OR E-commerce Platforms OR Security Solutions OR Cloud Infrastructure OR Network Services OR Other"
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a business classification expert. Analyze the provided website content to accurately classify businesses. Focus on what the company actually does based on their website content, not just their name. Pay special attention to geography - look for global presence indicators like international offices, worldwide operations, stock exchanges, subsidiaries. Major corporations should be classified as "Global" if they have international presence. Only classify as "US" if clearly US-only. Respond only with valid JSON.'
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
    
    const result = JSON.parse(data.choices[0].message.content)
    console.log('LLM Classification result:', result);
    
    return {
      industry: result.industry || 'Enterprise Software',
      market: result.market || 'SaaS Tools',
      geography: result.geography || 'North America',
      category: result.category || 'Mid-Market',
      domain: result.domain || 'SaaS Tools'
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LLM classification error:', error)
    
    // Use intelligent classification as fallback
    console.log('Using intelligent classification due to LLM error');
    return performIntelligentClassification(businessName, websiteUrl, websiteContent);
  }
}
