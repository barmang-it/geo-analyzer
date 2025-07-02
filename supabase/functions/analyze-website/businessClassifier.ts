
interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  domain: string;
}

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
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
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

For companies like Akamai (CDN/edge computing/security), use:
- Industry: "Technology"
- Market: "Cloud Infrastructure"
- Domain: "Cybersecurity & Performance"

For conglomerates with diverse holdings, identify their main business areas.

Return JSON only:
{
  "industry": "Technology OR Healthcare OR Finance OR Retail OR Energy OR Automotive OR Food & Beverage OR Conglomerate OR Other",
  "market": "Cloud Infrastructure OR B2B SaaS OR E-commerce OR Consumer OR Enterprise OR Cybersecurity OR Multi-Industry OR Other", 
  "geography": "Global OR US OR EU OR Asia OR Other",
  "domain": "Cybersecurity & Performance OR Performance & CDN OR Software Solutions OR Consumer Electronics OR Financial Services OR Healthcare OR E-commerce OR Professional Services OR Diversified Conglomerate OR Other"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
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
            content: 'You are a business classification expert. Analyze the provided website content to accurately classify businesses. Focus on what the company actually does based on their website content, not just their name. For technology companies like Akamai (CDN/security/edge computing), classify as Technology industry with Cloud Infrastructure market and Cybersecurity & Performance domain. Respond only with valid JSON.'
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
      throw new Error(`OpenAI API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid OpenAI response')
    }
    
    const result = JSON.parse(data.choices[0].message.content)
    
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
    return performFallbackClassification(businessName, websiteUrl, websiteContent);
  }
}

function performFallbackClassification(
  businessName: string, 
  websiteUrl: string, 
  websiteContent?: WebsiteContent
): BusinessClassification {
  const text = `${businessName} ${websiteUrl}`.toLowerCase();
  
  // Combine website content for analysis
  let contentText = '';
  if (websiteContent) {
    contentText = `${websiteContent.title} ${websiteContent.description} ${websiteContent.content}`.toLowerCase();
  }
  
  const fullText = `${text} ${contentText}`;
  
  // Enhanced Akamai detection
  if (fullText.includes('akamai') || 
      (fullText.includes('cdn') && fullText.includes('security')) ||
      (fullText.includes('edge') && fullText.includes('computing') && fullText.includes('performance'))) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      domain: 'Cybersecurity & Performance'
    }
  }
  
  // CloudFlare and similar CDN providers
  if (fullText.includes('cloudflare') || fullText.includes('cloud flare') ||
      (fullText.includes('content delivery') && fullText.includes('network'))) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      domain: 'Cybersecurity & Performance'
    }
  }
  
  // Enhanced security/performance detection
  if (fullText.includes('cybersecurity') || fullText.includes('ddos protection') ||
      fullText.includes('web application firewall') || fullText.includes('bot management') ||
      fullText.includes('web performance') || fullText.includes('page speed') ||
      fullText.includes('content optimization')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      domain: 'Cybersecurity & Performance'
    }
  }
  
  // Conglomerate detection
  const conglomerateKeywords = ['holdings', 'group', 'corporation', 'industries', 'conglomerate', 'diversified'];
  if (conglomerateKeywords.some(keyword => fullText.includes(keyword))) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      domain: 'Diversified Conglomerate'
    }
  }
  
  // Technology companies
  if (fullText.includes('software') || fullText.includes('saas') || fullText.includes('platform') ||
      fullText.includes('api') || fullText.includes('cloud') || fullText.includes('developer') ||
      fullText.includes('automation') || fullText.includes('integration')) {
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US',
      domain: 'Software Solutions'
    }
  }
  
  // Food & Beverage
  if (fullText.includes('food') || fullText.includes('beverage') || fullText.includes('restaurant') ||
      fullText.includes('drink') || fullText.includes('snack') || fullText.includes('nutrition')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'US',
      domain: 'Consumer Products'
    }
  }
  
  // Healthcare
  if (fullText.includes('health') || fullText.includes('medical') || fullText.includes('pharma') ||
      fullText.includes('clinic') || fullText.includes('hospital') || fullText.includes('wellness')) {
    return {
      industry: 'Healthcare',
      market: 'Digital Health',
      geography: 'US',
      domain: 'Healthcare'
    }
  }
  
  // Financial Services
  if (fullText.includes('bank') || fullText.includes('finance') || fullText.includes('payment') ||
      fullText.includes('fintech') || fullText.includes('investment') || fullText.includes('insurance')) {
    return {
      industry: 'Financial Services',
      market: 'Banking & Fintech',
      geography: 'US',
      domain: 'Financial Services'
    }
  }
  
  // E-commerce/Retail
  if (fullText.includes('shop') || fullText.includes('store') || fullText.includes('retail') ||
      fullText.includes('ecommerce') || fullText.includes('marketplace') || fullText.includes('buy')) {
    return {
      industry: 'Retail',
      market: 'E-commerce',
      geography: 'US',
      domain: 'E-commerce'
    }
  }
  
  // Default fallback
  return {
    industry: 'Technology',
    market: 'B2B SaaS',
    geography: 'US',
    domain: 'Software Solutions'
  }
}
