
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Circuit breaker state
let circuitBreakerOpen = false;
let failureCount = 0;
let lastFailureTime = 0;
const FAILURE_THRESHOLD = 5;
const CIRCUIT_RESET_TIME = 5 * 60 * 1000; // 5 minutes

// Usage tracking
const dailyUsage = new Map<string, number>();

interface AnalyzeRequest {
  businessName: string;
  websiteUrl: string;
}

interface WebsiteContent {
  title: string;
  description: string;
  content: string;
  hasStructuredData: boolean;
}

interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
}

interface TestPrompt {
  type: string;
  prompt: string;
  response?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check circuit breaker
    if (circuitBreakerOpen) {
      const timeSinceLastFailure = Date.now() - lastFailureTime;
      if (timeSinceLastFailure < CIRCUIT_RESET_TIME) {
        console.log('Circuit breaker open, rejecting request');
        return new Response(
          JSON.stringify({ 
            error: 'Service temporarily unavailable due to high failure rate',
            fallbackToMock: true 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 503,
          },
        )
      } else {
        // Reset circuit breaker
        circuitBreakerOpen = false;
        failureCount = 0;
      }
    }

    // Check daily usage limits
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = dailyUsage.get(today) || 0;
    const DAILY_LIMIT = 1000; // Max 1000 scans per day
    
    if (todayUsage >= DAILY_LIMIT) {
      console.log('Daily usage limit exceeded');
      return new Response(
        JSON.stringify({ 
          error: 'Daily usage limit exceeded',
          fallbackToMock: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        },
      )
    }

    const { businessName, websiteUrl }: AnalyzeRequest = await req.json()
    
    console.log(`Processing analysis for ${businessName} (${websiteUrl}) - Usage: ${todayUsage + 1}/${DAILY_LIMIT}`)
    
    // Step 1: Extract website content
    const websiteContent = await extractWebsiteContent(websiteUrl)
    
    // Step 2: Classify business using OpenAI
    const classification = await classifyBusinessWithLLM(businessName, websiteUrl, websiteContent)
    
    // Step 3: Generate test prompts
    const testPrompts = generateTestPrompts(classification, businessName)
    
    // Step 4: Test prompts against LLMs
    const promptResults = await testPromptsAgainstLLMs(testPrompts, businessName)
    
    // Step 5: Calculate scores
    const scores = calculateScores(classification, promptResults, websiteContent)
    
    // Record successful usage
    dailyUsage.set(today, todayUsage + 1);
    
    // Reset failure count on success
    if (failureCount > 0) {
      failureCount = 0;
      console.log('Resetting failure count after successful request');
    }
    
    return new Response(
      JSON.stringify({
        classification,
        testPrompts: promptResults,
        geoScore: scores.geoScore,
        benchmarkScore: scores.benchmarkScore,
        hasStructuredData: websiteContent.hasStructuredData,
        llmMentions: promptResults.filter(p => p.response?.includes('mentioned')).length,
        usageInfo: {
          dailyUsage: todayUsage + 1,
          dailyLimit: DAILY_LIMIT,
          costEstimate: (todayUsage + 1) * 0.0006
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Analysis error:', error)
    
    // Update circuit breaker
    failureCount++;
    lastFailureTime = Date.now();
    
    if (failureCount >= FAILURE_THRESHOLD) {
      circuitBreakerOpen = true;
      console.log(`Circuit breaker opened after ${failureCount} failures`);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallbackToMock: true,
        circuitBreakerTriggered: circuitBreakerOpen
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function extractWebsiteContent(url: string): Promise<WebsiteContent> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CiteMe-Bot/1.0)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''
    
    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const description = descMatch ? descMatch[1].trim() : ''
    
    // Extract main content (simplified)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    const bodyContent = bodyMatch ? bodyMatch[1] : html
    const textContent = bodyContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000) // Limit content length
    
    // Check for structured data
    const hasStructuredData = html.includes('application/ld+json') || 
                              html.includes('schema.org') ||
                              html.includes('microdata')
    
    return {
      title,
      description,
      content: textContent,
      hasStructuredData
    }
  } catch (error) {
    console.error('Website extraction error:', error)
    return {
      title: '',
      description: '',
      content: '',
      hasStructuredData: false
    }
  }
}

async function classifyBusinessWithLLM(
  businessName: string, 
  websiteUrl: string, 
  content: WebsiteContent
): Promise<BusinessClassification> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }
  
  const prompt = `Analyze this business and classify it:
Business Name: ${businessName}
Website: ${websiteUrl}
Title: ${content.title}
Description: ${content.description}
Content Preview: ${content.content.substring(0, 500)}

Classify this business into:
1. Industry (e.g., Technology, Healthcare, Finance, Retail, etc.)
2. Market (e.g., B2B SaaS, E-commerce, Consumer Electronics, etc.)
3. Geography (Global, US, EU, or specific region)

Respond in JSON format:
{
  "industry": "...",
  "market": "...",
  "geography": "..."
}`

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
            content: 'You are a business classification expert. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      }),
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response format:', data)
      throw new Error('Invalid response from OpenAI API')
    }
    
    const result = JSON.parse(data.choices[0].message.content)
    
    return {
      industry: result.industry || 'Business Services',
      market: result.market || 'Professional Services',
      geography: result.geography || 'US'
    }
  } catch (error) {
    console.error('LLM classification error:', error)
    // Fallback to basic classification
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US'
    }
  }
}

function generateTestPrompts(classification: BusinessClassification, businessName: string): TestPrompt[] {
  const { industry, market, geography } = classification
  
  return [
    {
      type: "Top Tools",
      prompt: `What are the leading ${industry.toLowerCase()} solutions ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
    },
    {
      type: "Alternatives",
      prompt: `What are some alternatives to popular ${market.toLowerCase()} platforms?`
    },
    {
      type: "Market Leaders",
      prompt: `Which companies dominate the ${industry.toLowerCase()} space ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
    },
    {
      type: "Industry Trends",
      prompt: `What ${industry.toLowerCase()} companies are leading innovation?`
    },
    {
      type: "Recommendation",
      prompt: `Can you recommend ${industry.toLowerCase()} solutions for businesses?`
    },
    {
      type: "Comparison",
      prompt: `Compare the leading ${market.toLowerCase()} solutions available.`
    },
    {
      type: "Use Case Match",
      prompt: `Which platforms help businesses with ${market.toLowerCase()} needs?`
    }
  ]
}

async function testPromptsAgainstLLMs(prompts: TestPrompt[], businessName: string): Promise<TestPrompt[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }
  
  const results: TestPrompt[] = []
  
  for (const prompt of prompts) {
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
              role: 'user',
              content: prompt.prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
      })
      
      if (!response.ok) {
        console.error(`OpenAI API error for prompt ${prompt.type}: ${response.status} ${response.statusText}`)
        results.push({
          ...prompt,
          response: 'error'
        })
        continue
      }
      
      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error(`Invalid OpenAI response format for prompt ${prompt.type}:`, data)
        results.push({
          ...prompt,
          response: 'error'
        })
        continue
      }
      
      const content = data.choices[0].message.content.toLowerCase()
      
      // Check if business name is mentioned in response
      const mentioned = content.includes(businessName.toLowerCase())
      
      results.push({
        ...prompt,
        response: mentioned ? 'mentioned' : 'not mentioned'
      })
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`Error testing prompt: ${prompt.type}`, error)
      results.push({
        ...prompt,
        response: 'error'
      })
    }
  }
  
  return results
}

function calculateScores(
  classification: BusinessClassification, 
  promptResults: TestPrompt[], 
  content: WebsiteContent
): { geoScore: number; benchmarkScore: number } {
  let baseScore = 5.0
  
  // Score based on mentions
  const mentionCount = promptResults.filter(p => p.response === 'mentioned').length
  const mentionScore = (mentionCount / promptResults.length) * 3 // Max 3 points
  
  // Score based on structured data
  const structuredDataScore = content.hasStructuredData ? 1 : 0
  
  // Score based on geography
  const geoScore = classification.geography === 'Global' ? 1 : 0.5
  
  const finalScore = Math.min(10, baseScore + mentionScore + structuredDataScore + geoScore)
  
  // Industry benchmarks
  const benchmarks: Record<string, number> = {
    'Technology': 6.8,
    'Healthcare': 6.1,
    'Finance': 6.5,
    'Retail': 6.3,
    'Food & Beverage': 7.2
  }
  
  const benchmarkScore = benchmarks[classification.industry] || 6.0
  
  return {
    geoScore: Math.round(finalScore * 10) / 10,
    benchmarkScore: Math.round(benchmarkScore * 10) / 10
  }
}
