
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { extractWebsiteContent } from './websiteExtractor.ts'
import { classifyBusinessWithLLM } from './businessClassifier.ts'
import { testPromptsInParallel } from './promptTester.ts'
import { calculateScores } from './scoreCalculator.ts'

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();

  try {
    console.log('=== Starting analysis request ===');
    
    // Check OpenAI API key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }

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
        console.log('Circuit breaker reset');
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
    
    console.log(`Processing analysis for "${businessName}" (${websiteUrl}) - Usage: ${todayUsage + 1}/${DAILY_LIMIT}`);
    
    // Start all operations in parallel for maximum speed
    console.log('Starting parallel operations...');
    const [websiteContentResult, classificationResult, promptTestResults] = await Promise.allSettled([
      extractWebsiteContent(websiteUrl),
      classifyBusinessWithLLM(businessName, websiteUrl),
      testPromptsInParallel(businessName, websiteUrl)
    ]);
    
    console.log('All parallel operations completed');
    
    // Handle results with fallbacks
    const websiteContent = websiteContentResult.status === 'fulfilled' ? websiteContentResult.value : {
      title: '', description: '', content: '', hasStructuredData: false
    };
    
    const classification = classificationResult.status === 'fulfilled' ? classificationResult.value : {
      industry: 'Technology', market: 'B2B SaaS', geography: 'US', domain: 'Software Solutions'
    };

    const promptResults = promptTestResults.status === 'fulfilled' ? promptTestResults.value : [];

    console.log(`Prompt test results: ${promptResults.length} prompts tested`);
    promptResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.type}: ${result.response}`);
    });

    // Calculate scores
    const scores = calculateScores(classification, promptResults, websiteContent);
    
    // Count mentions
    const llmMentions = promptResults.filter(p => p.response === 'mentioned').length;
    console.log(`Total LLM mentions found: ${llmMentions}/${promptResults.length}`);
    
    // Record successful usage
    dailyUsage.set(today, todayUsage + 1);
    
    // Reset failure count on success
    if (failureCount > 0) {
      failureCount = 0;
      console.log('Resetting failure count after successful request');
    }

    const processingTime = Date.now() - startTime;
    console.log(`Analysis completed successfully in ${processingTime}ms`);
    
    const result = {
      classification,
      testPrompts: promptResults,
      geoScore: scores.geoScore,
      benchmarkScore: scores.benchmarkScore,
      hasStructuredData: websiteContent.hasStructuredData,
      llmMentions,
      processingTime,
      usageInfo: {
        dailyUsage: todayUsage + 1,
        dailyLimit: DAILY_LIMIT,
        costEstimate: (todayUsage + 1) * 0.0006
      }
    };
    
    console.log('=== Analysis complete ===');
    
    return new Response(
      JSON.stringify(result),
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
