
import { performFallbackClassification } from './classifiers/fallbackClassifier.ts';
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
  console.log('Starting LLM classification for:', businessName);
  
  // Check for major brands first before LLM call
  const businessNameLower = businessName.toLowerCase();
  const urlLower = websiteUrl.toLowerCase();
  
  // PRIORITY: Major beverage brands - check immediately
  if (businessNameLower.includes('coca-cola') || businessNameLower.includes('coca cola') || 
      businessNameLower === 'coke' || urlLower.includes('coca-cola')) {
    console.log('Detected Coca-Cola brand, returning beverage classification');
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      domain: 'Global Beverage Brand'
    };
  }
  
  if (businessNameLower.includes('pepsi') || businessNameLower.includes('pepsico') || 
      urlLower.includes('pepsi')) {
    console.log('Detected Pepsi brand, returning beverage classification');
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      domain: 'Global Beverage Brand'
    };
  }
  
  if (businessNameLower.includes('dr pepper') || businessNameLower.includes('sprite') || 
      businessNameLower.includes('fanta') || businessNameLower.includes('mountain dew')) {
    console.log('Detected major beverage brand, returning beverage classification');
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      domain: 'Global Beverage Brand'
    };
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    console.log('No OpenAI key, using fallback classification');
    return performFallbackClassification(businessName, websiteUrl, websiteContent);
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

CRITICAL CLASSIFICATION RULES:
1. For major global beverage brands like Coca-Cola, Pepsi, Dr Pepper, Sprite, Fanta, use:
   - Industry: "Food & Beverage"
   - Market: "Consumer Packaged Goods" 
   - Domain: "Global Beverage Brand"

2. For CDN/edge computing/security companies like Akamai, use:
   - Industry: "Technology"
   - Market: "Cloud Infrastructure"
   - Domain: "Cybersecurity & Performance"

3. For conglomerates with diverse holdings, identify their main business areas.

4. NEVER classify beverage companies as Technology unless they are explicitly tech companies.

Return JSON only:
{
  "industry": "Technology OR Healthcare OR Finance OR Retail OR Energy OR Automotive OR Food & Beverage OR Conglomerate OR Other",
  "market": "Cloud Infrastructure OR B2B SaaS OR E-commerce OR Consumer OR Enterprise OR Cybersecurity OR Multi-Industry OR Consumer Packaged Goods OR Other", 
  "geography": "Global OR US OR EU OR Asia OR Other",
  "domain": "Cybersecurity & Performance OR Performance & CDN OR Software Solutions OR Consumer Electronics OR Financial Services OR Healthcare OR E-commerce OR Professional Services OR Diversified Conglomerate OR Global Beverage Brand OR Other"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout

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
            content: 'You are a business classification expert. Analyze the provided website content to accurately classify businesses. Focus on what the company actually does based on their website content, not just their name. CRITICAL: For major beverage brands like Coca-Cola, Pepsi, Dr Pepper, Sprite, Fanta classify as Food & Beverage industry with Consumer Packaged Goods market and Global Beverage Brand domain. NEVER classify beverage companies as Technology. For technology companies like Akamai (CDN/security/edge computing), classify as Technology industry with Cloud Infrastructure market and Cybersecurity & Performance domain. Respond only with valid JSON.'
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
      industry: result.industry || 'Technology',
      market: result.market || 'B2B SaaS',
      geography: result.geography || 'US',
      domain: result.domain || 'Software Solutions'
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LLM classification error:', error)
    
    // Enhanced fallback using website content
    console.log('Using fallback classification due to LLM error');
    return performFallbackClassification(businessName, websiteUrl, websiteContent);
  }
}
