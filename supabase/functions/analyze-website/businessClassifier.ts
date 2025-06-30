
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
  
  const prompt = `Classify this business quickly with enhanced domain detection:
Business: ${businessName}
Website: ${websiteUrl}

Return JSON only:
{
  "industry": "Technology|Healthcare|Finance|Retail|Other",
  "market": "B2B SaaS|E-commerce|Consumer|Enterprise|Cybersecurity|Cloud Infrastructure|Other", 
  "geography": "Global|US|EU|Other",
  "domain": "Cybersecurity & Performance|Performance & CDN|Software Solutions|Consumer Electronics|Financial Services|Healthcare|E-commerce|Professional Services|Other"
}`

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
            content: 'You are a business classifier. Focus on detecting specific domains like cybersecurity, CDN, performance optimization. Respond only with valid JSON. Be fast and decisive.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 150
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
