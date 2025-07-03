
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
  
  // Generate comprehensive prompts based on all classification dimensions
  const prompts = generateDomainSpecificPrompts(classification, businessName);

  // Test all 7 prompts in parallel with aggressive optimization
  const testPromises = prompts.map(async (prompt) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

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
          temperature: 0,
          max_tokens: 150,
          top_p: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`OpenAI API error for prompt ${prompt.type}: ${response.status} ${response.statusText}`);
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
      if (error.name === 'AbortError') {
        console.error(`Timeout for prompt: ${prompt.type}`);
      } else {
        console.error(`Error testing prompt: ${prompt.type}`, error.message);
      }
      return { ...prompt, response: 'error' };
    }
  });

  // Wait for all prompts to complete
  const results = await Promise.allSettled(testPromises);
  
  return results.map((result, index) => 
    result.status === 'fulfilled' ? result.value : 
    { type: prompts[index].type, prompt: prompts[index].prompt, response: 'error' }
  );
}

function generateDomainSpecificPrompts(classification: BusinessClassification, businessName: string): TestPrompt[] {
  const { industry, market, geography, domain } = classification;
  
  // Create geography text for consistent use
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  let prompts: TestPrompt[] = [];
  
  // Industry + Market + Geography + Domain specific prompts
  if (industry === 'Conglomerate') {
    prompts = [
      {
        type: "Multi-Industry Leaders",
        prompt: `Which ${market.toLowerCase()} conglomerates operate across multiple business sectors ${geoText}?`
      },
      {
        type: "Diversified Holdings",
        prompt: `What are the leading ${industry.toLowerCase()} companies with ${market.toLowerCase()} interests ${geoText}?`
      },
      {
        type: "Market Expansion",
        prompt: `Which ${domain.toLowerCase()} companies successfully expanded their ${market.toLowerCase()} operations ${geoTextAlt}?`
      },
      {
        type: "Geographic Presence",
        prompt: `What ${industry.toLowerCase()} groups have the strongest ${market.toLowerCase()} presence ${geoText}?`
      },
      {
        type: "Industry Leadership",
        prompt: `Which companies dominate multiple industries within ${market.toLowerCase()} markets ${geoText}?`
      },
      {
        type: "Strategic Diversification",
        prompt: `What are the most successful ${domain.toLowerCase()} strategies for ${market.toLowerCase()} expansion ${geoText}?`
      },
      {
        type: "Market Comparison",
        prompt: `Compare leading ${industry.toLowerCase()} companies operating in ${market.toLowerCase()} sectors ${geoTextAlt}.`
      }
    ];
  } else if (domain === 'Cybersecurity & Performance' || domain === 'Cybersecurity') {
    prompts = [
      {
        type: "Security Solutions",
        prompt: `What are the top ${domain.toLowerCase()} platforms serving ${market.toLowerCase()} companies ${geoText}?`
      },
      {
        type: "Performance Tools",
        prompt: `Which ${industry.toLowerCase()} companies provide the best security and performance solutions ${geoText}?`
      },
      {
        type: "Market Leaders",
        prompt: `What are the leading ${market.toLowerCase()} focused ${domain.toLowerCase()} providers ${geoTextAlt}?`
      },
      {
        type: "Industry Solutions",
        prompt: `Which platforms offer comprehensive cybersecurity for ${market.toLowerCase()} businesses ${geoText}?`
      },
      {
        type: "Geographic Coverage",
        prompt: `What ${domain.toLowerCase()} companies have the strongest ${market.toLowerCase()} presence ${geoText}?`
      },
      {
        type: "Technology Integration",
        prompt: `Which ${industry.toLowerCase()} solutions integrate best with ${market.toLowerCase()} infrastructure ${geoTextAlt}?`
      },
      {
        type: "Enterprise Focus",
        prompt: `What are the most reliable security and performance solutions for ${market.toLowerCase()} enterprises ${geoText}?`
      }
    ];
  } else if (domain === 'Performance & CDN') {
    prompts = [
      {
        type: "CDN Providers",
        prompt: `What are the leading ${domain.toLowerCase()} providers serving ${market.toLowerCase()} companies ${geoText}?`
      },
      {
        type: "Performance Solutions",
        prompt: `Which ${industry.toLowerCase()} platforms offer the best web performance optimization ${geoTextAlt}?`
      },
      {
        type: "Market Focus",
        prompt: `What are the top ${market.toLowerCase()} focused ${domain.toLowerCase()} solutions ${geoText}?`
      },
      {
        type: "Technology Stack",
        prompt: `Which companies provide comprehensive content delivery for ${market.toLowerCase()} businesses ${geoText}?`
      },
      {
        type: "Global Infrastructure",
        prompt: `What ${domain.toLowerCase()} providers have the largest network infrastructure ${geoText}?`
      },
      {
        type: "Industry Specialization",
        prompt: `Which ${industry.toLowerCase()} solutions are optimized for ${market.toLowerCase()} use cases ${geoTextAlt}?`
      },
      {
        type: "Performance Monitoring",
        prompt: `What are the leading web performance monitoring tools for ${market.toLowerCase()} companies ${geoText}?`
      }
    ];
  } else if (industry === 'Food & Beverage') {
    prompts = [
      {
        type: "Brand Leaders",
        prompt: `What are the most popular beverage brands in ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Market Alternatives",
        prompt: `What are some alternatives to leading beverage brands for ${market.toLowerCase()} companies ${geoText}?`
      },
      {
        type: "Industry Trends",
        prompt: `Which ${industry.toLowerCase()} brands are trending in ${market.toLowerCase()} ${geoTextAlt}?`
      },
      {
        type: "Geographic Presence",
        prompt: `What beverage companies have the strongest presence in ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Premium Segment",
        prompt: `Which premium beverage brands are gaining market share in ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Health-Conscious",
        prompt: `What are the most popular health-conscious beverage brands in ${market.toLowerCase()} ${geoTextAlt}?`
      },
      {
        type: "Market Comparison",
        prompt: `Compare the leading beverage brands available in ${market.toLowerCase()} ${geoText}.`
      }
    ];
  } else {
    // Generic prompts using all classification dimensions
    prompts = [
      {
        type: "Industry Leaders",
        prompt: `What are the best ${domain.toLowerCase()} tools for ${industry.toLowerCase()} companies in ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Market Solutions",
        prompt: `Which platforms help ${industry.toLowerCase()} companies with ${market.toLowerCase()} operations ${geoText}?`
      },
      {
        type: "Technology Tools",
        prompt: `What ${domain.toLowerCase()} solutions are gaining traction in ${market.toLowerCase()} ${geoTextAlt}?`
      },
      {
        type: "Domain Expertise",
        prompt: `Which ${domain.toLowerCase()} providers specialize in ${industry.toLowerCase()} and ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Geographic Focus",
        prompt: `What are the leading ${domain.toLowerCase()} solutions for ${industry.toLowerCase()} businesses ${geoText}?`
      },
      {
        type: "Best Practices",
        prompt: `Which ${domain.toLowerCase()} solutions follow ${industry.toLowerCase()} best practices for ${market.toLowerCase()} ${geoTextAlt}?`
      },
      {
        type: "Cost Effectiveness",
        prompt: `What are the most cost-effective ${domain.toLowerCase()} solutions for ${industry.toLowerCase()} companies in ${market.toLowerCase()} ${geoText}?`
      }
    ];
  }
  
  return prompts.slice(0, 7); // Ensure exactly 7 prompts
}
