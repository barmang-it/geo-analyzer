
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
  
  // Generate domain-specific prompts - now 7 prompts total
  let prompts: TestPrompt[] = [];
  
  // Conglomerate-specific prompts with multi-industry focus
  if (classification.industry === 'Conglomerate') {
    const geographyText = classification.geography === 'Global' ? 'worldwide' : `in ${classification.geography}`;
    
    prompts = [
      {
        type: "Multi-Industry Leaders",
        prompt: `Which companies operate across multiple business sectors ${geographyText}?`
      },
      {
        type: "Diversified Holdings", 
        prompt: `What are the leading diversified business groups ${geographyText}?`
      },
      {
        type: "Conglomerate Comparison",
        prompt: `Compare major conglomerates operating in ${classification.market.toLowerCase()} markets ${geographyText}.`
      },
      {
        type: "Cross-Sector Operations",
        prompt: `Which ${classification.domain.toLowerCase()} companies have the broadest business portfolio ${geographyText}?`
      },
      {
        type: "Industry Diversification",
        prompt: `What companies successfully diversified across multiple industries ${geographyText}?`
      },
      {
        type: "Market Expansion",
        prompt: `Which business groups expanded from one industry to dominate multiple sectors ${geographyText}?`
      },
      {
        type: "Investment Strategy",
        prompt: `What are the most successful investment strategies for ${classification.market.toLowerCase()} expansion ${geographyText}?`
      }
    ];
  } else if (classification.domain === 'Cybersecurity & Performance' || classification.domain === 'Cybersecurity') {
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
      },
      {
        type: "Performance Solutions",
        prompt: `What are the best website performance and acceleration services?`
      },
      {
        type: "DDoS Protection",
        prompt: `Which platforms offer the most reliable DDoS protection and mitigation?`
      },
      {
        type: "WAF Solutions",
        prompt: `What are the leading web application firewall solutions for enterprise security?`
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
      },
      {
        type: "Caching Solutions",
        prompt: `Which companies provide the most effective web caching services?`
      },
      {
        type: "Load Balancing",
        prompt: `What are the best load balancing and traffic management solutions?`
      },
      {
        type: "Global Network",
        prompt: `Which providers have the largest global network infrastructure?`
      },
      {
        type: "Performance Monitoring",
        prompt: `What are the leading web performance monitoring tools?`
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
      },
      {
        type: "Enterprise Solutions",
        prompt: `What are the best enterprise-grade ${classification.domain.toLowerCase()} solutions?`
      },
      {
        type: "Integration",
        prompt: `Which ${classification.domain.toLowerCase()} solutions integrate well with existing systems?`
      },
      {
        type: "Cost Effective",
        prompt: `What are the most cost-effective ${classification.domain.toLowerCase()} solutions?`
      }
    ];
  }

  // Test all 7 prompts in parallel with more aggressive optimization
  const testPromises = prompts.map(async (prompt) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced to 2s timeout

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
          max_tokens: 150, // Further reduced for faster response
          top_p: 0.1 // More focused responses
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

  // Wait for all 7 prompts to complete in parallel with faster timeout
  const results = await Promise.allSettled(testPromises);
  
  return results.map((result, index) => 
    result.status === 'fulfilled' ? result.value : 
    { type: prompts[index].type, prompt: prompts[index].prompt, response: 'error' }
  );
}
