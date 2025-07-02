
interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  domain: string;
}

export async function classifyBusinessWithLLM(
  businessName: string, 
  websiteUrl: string
): Promise<BusinessClassification> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }
  
  const prompt = `Classify this business with enhanced detection for cloud infrastructure and security companies:
Business: ${businessName}
Website: ${websiteUrl}

Focus on identifying:
- CDN (Content Delivery Network) providers like Akamai, CloudFlare
- Cloud security and performance companies
- Multi-industry conglomerates
- Technology companies with specific specializations

Return JSON only:
{
  "industry": "Conglomerate OR Technology OR Healthcare OR Finance OR Retail OR Energy OR Automotive OR Food & Beverage OR Other",
  "market": "Multi-Industry OR Cloud Infrastructure OR B2B SaaS OR E-commerce OR Consumer OR Enterprise OR Cybersecurity OR Other", 
  "geography": "Global OR US OR EU OR Asia OR Other",
  "domain": "Diversified Conglomerate OR Investment Conglomerate OR Industrial Conglomerate OR Technology Conglomerate OR Business Conglomerate OR Cybersecurity & Performance OR Performance & CDN OR Software Solutions OR Consumer Electronics OR Financial Services OR Healthcare OR E-commerce OR Professional Services OR Other"
}

For companies like Akamai, use:
- Industry: "Technology"
- Market: "Cloud Infrastructure" 
- Domain: "Cybersecurity & Performance"

For conglomerates, use specific descriptions like "Energy, Petrochemicals, Retail & Telecom" for category.`

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

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
            content: 'You are a business classifier specializing in technology companies, cloud infrastructure, CDN providers, and conglomerates. Akamai should be classified as Technology industry, Cloud Infrastructure market, and Cybersecurity & Performance domain. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 200
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
      market: result.market || 'Cloud Infrastructure',
      geography: result.geography || 'Global',
      domain: result.domain || 'Cybersecurity & Performance'
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LLM classification error:', error)
    
    // Enhanced fallback for known companies
    const text = `${businessName} ${websiteUrl}`.toLowerCase();
    
    if (text.includes('akamai')) {
      return {
        industry: 'Technology',
        market: 'Cloud Infrastructure',
        geography: 'Global',
        domain: 'Cybersecurity & Performance'
      }
    }
    
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US',
      domain: 'Software Solutions'
    }
  }
}
