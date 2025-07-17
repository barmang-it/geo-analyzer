
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
1. Analyze the actual business content and services offered
2. Don't rely solely on company names - analyze what they actually do
3. For conglomerates, identify their main business areas
4. Technology companies should be properly subcategorized (enterprise software, consumer electronics, cloud infrastructure, etc.)
5. RETAIL vs E-COMMERCE: Traditional retailers (brick-and-mortar stores, physical presence) should be "Retail" with "Retail & Consumer" market, while online-only businesses should be "E-commerce"

Return JSON only:
{
  "industry": "Enterprise Software OR Financial Technology OR Digital Healthcare OR Consumer Electronics OR Automotive Technology OR Food & Beverage OR Energy & Utilities OR E-commerce OR Professional Services OR Media & Entertainment OR Cybersecurity OR Cloud Infrastructure OR AI & Machine Learning OR Other",
  "market": "Enterprise Resource Planning OR Customer Relationship Management OR Digital Banking OR Investment Management OR Telemedicine OR Medical Devices OR Consumer Electronics OR Electric Vehicles OR CPG Beverages OR Energy Trading OR Online Retail OR B2B Marketplace OR Digital Marketing OR Cybersecurity Solutions OR Cloud Services OR Developer Tools OR Other", 
  "geography": "Global OR North America OR Europe OR Asia Pacific OR Latin America OR Africa OR Other",
  "category": "Fortune 500 OR Public Company OR Unicorn Startup OR Mid-Market OR Small Business OR Government OR Non-Profit OR Other",
  "domain": "Accounting Software OR CRM Platforms OR Trading Platforms OR Digital Health OR Mobile Devices OR Automotive Software OR Beverage Brands OR Renewable Energy OR Marketplace Platforms OR SaaS Tools OR Security Solutions OR Cloud Infrastructure OR AI Platforms OR Other"
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
