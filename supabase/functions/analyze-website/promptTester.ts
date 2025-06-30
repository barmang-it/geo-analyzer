
import { classifyBusinessWithLLM } from './businessClassifier.ts';

interface TestPrompt {
  type: string;
  prompt: string;
  response?: string;
}

interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  domain: string;
}

export async function testPromptsInParallel(businessName: string, websiteUrl: string): Promise<TestPrompt[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    console.error('OpenAI API key not configured')
    return []
  }

  // Get classification to generate domain-specific prompts
  const classification = await classifyBusinessWithLLM(businessName, websiteUrl);
  
  // Generate domain-specific prompts
  let prompts: TestPrompt[] = [];
  
  if (classification.domain === 'Cybersecurity & Performance' || classification.domain === 'Cybersecurity') {
    prompts = [
      {
        type: "Security Tools",
        prompt: `What are the top cybersecurity platforms for DDoS protection?`
      },
      {
        type: "CDN Solutions", 
        prompt: `Which CDN providers offer the best performance optimization?`
      },
      {
        type: "Edge Computing",
        prompt: `What are leading edge computing platforms for web performance?`
      },
      {
        type: "Web Security",
        prompt: `Which companies provide comprehensive web application security?`
      }
    ];
  } else if (classification.domain === 'Performance & CDN') {
    prompts = [
      {
        type: "CDN Providers",
        prompt: `What are the leading content delivery network providers?`
      },
      {
        type: "Performance Tools",
        prompt: `Which platforms offer the best website performance optimization?`
      },
      {
        type: "Edge Solutions",
        prompt: `What are the top edge computing solutions for businesses?`
      }
    ];
  } else {
    // Generic but still domain-aware prompts
    prompts = [
      {
        type: "Top Tools",
        prompt: `List leading ${classification.domain.toLowerCase()} solutions.`
      },
      {
        type: "Alternatives", 
        prompt: `What are popular ${classification.market.toLowerCase()} alternatives?`
      },
      {
        type: "Market Leaders",
        prompt: `Which companies lead the ${classification.domain.toLowerCase()} space?`
      },
      {
        type: "Recommendations",
        prompt: `Recommend ${classification.domain.toLowerCase()} solutions for businesses.`
      }
    ];
  }

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
