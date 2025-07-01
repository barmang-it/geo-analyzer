
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
  
  const prompt = `Classify this business with enhanced conglomerate detection:
Business: ${businessName}
Website: ${websiteUrl}

Identify if this is a conglomerate operating across multiple industries. Look for keywords like "holdings", "group", "industries", "diversified", or major conglomerates like Reliance Industries, Berkshire Hathaway, Samsung Group, Tata Group, Siemens, GE.

Return JSON only:
{
  "industry": "Conglomerate OR Technology OR Healthcare OR Finance OR Retail OR Energy OR Automotive OR Food & Beverage OR Other",
  "market": "Multi-Industry OR B2B SaaS OR E-commerce OR Consumer OR Enterprise OR Cybersecurity OR Cloud Infrastructure OR Other", 
  "geography": "Global OR US OR EU OR Asia OR Other",
  "domain": "Diversified Conglomerate OR Investment Conglomerate OR Industrial Conglomerate OR Technology Conglomerate OR Business Conglomerate OR Cybersecurity & Performance OR Performance & CDN OR Software Solutions OR Consumer Electronics OR Financial Services OR Healthcare OR E-commerce OR Professional Services OR Other"
}

For conglomerates, use specific category descriptions like "Energy, Petrochemicals, Retail & Telecom" for Reliance or "Electronics, Heavy Industries & Financial Services" for Samsung.`

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
            content: 'You are a business classifier specializing in identifying conglomerates and diversified business groups. Focus on detecting multi-industry operations and cross-sector presence. Respond only with valid JSON. Be fast and decisive about conglomerate classification.'
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
      market: result.market || 'B2B SaaS',
      geography: result.geography || 'US',
      domain: result.domain || 'Software Solutions'
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LLM classification error:', error)
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US',
      domain: 'Software Solutions'
    }
  }
}
