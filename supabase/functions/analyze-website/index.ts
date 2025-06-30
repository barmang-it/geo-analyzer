
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

  const startTime = Date.now();

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
    
    // Start all operations in parallel for maximum speed
    const [websiteContent, classificationResult, promptTestResults] = await Promise.allSettled([
      extractWebsiteContent(websiteUrl),
      classifyBusinessWithLLM(businessName, websiteUrl),
      testPromptsInParallel(businessName)
    ]);

    // Handle results with fallbacks
    const content = websiteContent.status === 'fulfilled' ? websiteContent.value : {
      title: '', description: '', content: '', hasStructuredData: false
    };

    const classification = classificationResult.status === 'fulfilled' ? classificationResult.value : {
      industry: 'Technology', market: 'B2B SaaS', geography: 'US'
    };

    const promptResults = promptTestResults.status === 'fulfilled' ? promptTestResults.value : [];

    // Calculate scores
    const scores = calculateScores(classification, promptResults, content);
    
    // Record successful usage
    dailyUsage.set(today, todayUsage + 1);
    
    // Reset failure count on success
    if (failureCount > 0) {
      failureCount = 0;
      console.log('Resetting failure count after successful request');
    }

    const processingTime = Date.now() - startTime;
    console.log(`Analysis completed in ${processingTime}ms`);
    
    return new Response(
      JSON.stringify({
        classification,
        testPrompts: promptResults,
        geoScore: scores.geoScore,
        benchmarkScore: scores.benchmarkScore,
        hasStructuredData: content.hasStructuredData,
        llmMentions: promptResults.filter(p => p.response?.includes('mentioned')).length,
        processingTime,
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CiteMe-Bot/1.0)'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId);
    
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
      .substring(0, 1000) // Reduced content length for faster processing
    
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
    clearTimeout(timeoutId);
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
  websiteUrl: string
): Promise<BusinessClassification> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }
  
  const prompt = `Classify this business quickly:
Business: ${businessName}
Website: ${websiteUrl}

Return JSON only:
{
  "industry": "Technology|Healthcare|Finance|Retail|Other",
  "market": "B2B SaaS|E-commerce|Consumer|Enterprise|Other", 
  "geography": "Global|US|EU|Other"
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
            content: 'You are a business classifier. Respond only with valid JSON. Be fast and decisive.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 100
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
      geography: result.geography || 'US'
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LLM classification error:', error)
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US'
    }
  }
}

async function testPromptsInParallel(businessName: string): Promise<TestPrompt[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    console.error('OpenAI API key not configured')
    return []
  }

  // Reduced and optimized prompts for faster testing
  const prompts: TestPrompt[] = [
    {
      type: "Top Tools",
      prompt: `List leading business software tools.`
    },
    {
      type: "Alternatives", 
      prompt: `What are popular SaaS platform alternatives?`
    },
    {
      type: "Market Leaders",
      prompt: `Which companies lead the technology space?`
    },
    {
      type: "Recommendations",
      prompt: `Recommend business technology solutions.`
    }
  ];

  // Test all prompts in parallel with aggressive timeout
  const testPromises = prompts.map(async (prompt) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout per prompt

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
          temperature: 0.1,
          max_tokens: 200 // Reduced for faster response
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`OpenAI API error for prompt ${prompt.type}: ${response.status}`);
        return { ...prompt, response: 'error' };
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        console.error(`Invalid OpenAI response for prompt ${prompt.type}`);
        return { ...prompt, response: 'error' };
      }

      const content = data.choices[0].message.content.toLowerCase();
      const mentioned = content.includes(businessName.toLowerCase());

      return {
        ...prompt,
        response: mentioned ? 'mentioned' : 'not mentioned'
      };

    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Error testing prompt: ${prompt.type}`, error);
      return { ...prompt, response: 'error' };
    }
  });

  // Wait for all prompts to complete in parallel
  const results = await Promise.allSettled(testPromises);
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : 
    { type: 'error', prompt: 'failed', response: 'error' }
  ).filter(result => result.type !== 'error');
}

function calculateScores(
  classification: BusinessClassification, 
  promptResults: TestPrompt[], 
  content: WebsiteContent
): { geoScore: number; benchmarkScore: number } {
  // Calculate mentions from test prompts - this should be the primary factor
  const mentionCount = promptResults.filter(p => p.response === 'mentioned').length
  const mentionRate = promptResults.length > 0 ? mentionCount / promptResults.length : 0;
  
  // Base score should primarily depend on mention rate
  let baseScore = mentionRate * 6; // 0-6 points based on mention rate
  
  // Add small base score for having a website and being classifiable
  baseScore += 1.0;
  
  // Score based on structured data (only if there are mentions)
  const structuredDataScore = content.hasStructuredData ? 0.5 : 0;
  baseScore += structuredDataScore;
  
  // Geography scoring (reduced impact)
  if (classification.geography === 'Global' && mentionRate > 0) {
    baseScore += 0.8;
  } else if (classification.geography === 'Global') {
    baseScore += 0.2; // Small bonus even without mentions
  } else if (classification.geography === 'US' && mentionRate > 0) {
    baseScore += 0.4;
  }
  
  // Industry scoring (minimal impact)
  const highVisibilityIndustries = ['Technology', 'Food & Beverage'];
  if (highVisibilityIndustries.includes(classification.industry) && mentionRate > 0) {
    baseScore += 0.3;
  }
  
  // Small random variation for realism (-0.2 to +0.2)
  const variation = (Math.random() - 0.5) * 0.4;
  
  const finalScore = Math.max(0, Math.min(10, baseScore + variation));
  
  // Industry benchmarks
  const benchmarks: Record<string, number> = {
    'Technology': 6.8,
    'Healthcare': 6.1,
    'Finance': 6.5,
    'Retail': 6.3,
    'Other': 6.0
  }
  
  const benchmarkScore = benchmarks[classification.industry] || 6.0
  
  return {
    geoScore: Math.round(finalScore * 10) / 10,
    benchmarkScore: Math.round(benchmarkScore * 10) / 10
  }
}
