
import { BusinessClassification, TestPrompt } from './types';
import { getMentionProbability } from './scoreCalculator';

export const generateTestPrompts = (
  classification: BusinessClassification, 
  businessName: string
): TestPrompt[] => {
  const { industry, market, geography, category, domain } = classification;
  
  // Create geography text for consistent use
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  // Generate comprehensive prompts based on all classification dimensions
  const prompts: TestPrompt[] = [];
  
  // Special handling for major global beverage brands
  if (industry === 'Food & Beverage' && domain === 'Global Beverage Brand') {
    prompts.push(
      {
        type: "Global Beverage Leaders",
        prompt: `What are the top 5 global soft drink and beverage companies ${geoText}?`
      },
      {
        type: "Market Share Leaders",
        prompt: `Which ${category.toLowerCase()} brands have the largest market share ${geoTextAlt}?`
      },
      {
        type: "Brand Recognition",
        prompt: `List the most recognizable ${category.toLowerCase()} brands in the world.`
      },
      {
        type: "Competition Analysis",
        prompt: `Who are the main competitors in the global ${category.toLowerCase()} industry?`
      },
      {
        type: "Consumer Preferences",
        prompt: `What are the most popular ${category.toLowerCase()} brands among consumers ${geoText}?`
      },
      {
        type: "Industry Giants",
        prompt: `Which companies dominate the ${market.toLowerCase()} sector for ${category.toLowerCase()} ${geoTextAlt}?`
      },
      {
        type: "Brand Portfolio",
        prompt: `What are the leading ${domain.toLowerCase()} companies and their flagship products?`
      }
    );
  } else if (industry === 'Conglomerate') {
    prompts.push(
      {
        type: "Multi-Industry Leaders",
        prompt: `Which ${market.toLowerCase()} conglomerates operate across ${category.toLowerCase()} sectors ${geoText}?`
      },
      {
        type: "Diversified Holdings",
        prompt: `What are the leading ${industry.toLowerCase()} companies with ${market.toLowerCase()} interests in ${category.toLowerCase()} ${geoText}?`
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
        prompt: `Which companies dominate the ${category.toLowerCase()} space within ${market.toLowerCase()} markets ${geoText}?`
      },
      {
        type: "Strategic Diversification",
        prompt: `What are the most successful ${domain.toLowerCase()} strategies for ${market.toLowerCase()} expansion ${geoText}?`
      },
      {
        type: "Market Comparison",
        prompt: `Compare leading ${industry.toLowerCase()} companies operating in ${market.toLowerCase()} sectors ${geoTextAlt}.`
      }
    );
  } else if (industry === 'Technology') {
    if (domain === 'Cybersecurity & Performance' || domain === 'Cybersecurity') {
      prompts.push(
        {
          type: "Security Solutions",
          prompt: `What are the top ${domain.toLowerCase()} platforms serving ${market.toLowerCase()} companies ${geoText}?`
        },
        {
          type: "Performance Tools",
          prompt: `Which ${industry.toLowerCase()} companies provide the best ${category.toLowerCase()} solutions ${geoText}?`
        },
        {
          type: "Market Leaders",
          prompt: `What are the leading ${market.toLowerCase()} focused ${domain.toLowerCase()} providers ${geoTextAlt}?`
        },
        {
          type: "Industry Solutions",
          prompt: `Which platforms offer comprehensive ${category.toLowerCase()} for ${market.toLowerCase()} businesses ${geoText}?`
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
          prompt: `What are the most reliable ${category.toLowerCase()} solutions for ${market.toLowerCase()} enterprises ${geoText}?`
        }
      );
    } else if (domain === 'Performance & CDN') {
      prompts.push(
        {
          type: "CDN Providers",
          prompt: `What are the leading ${domain.toLowerCase()} providers serving ${market.toLowerCase()} companies ${geoText}?`
        },
        {
          type: "Performance Solutions",
          prompt: `Which ${industry.toLowerCase()} platforms offer the best ${category.toLowerCase()} ${geoTextAlt}?`
        },
        {
          type: "Market Focus",
          prompt: `What are the top ${market.toLowerCase()} focused ${domain.toLowerCase()} solutions ${geoText}?`
        },
        {
          type: "Technology Stack",
          prompt: `Which companies provide comprehensive ${category.toLowerCase()} for ${market.toLowerCase()} businesses ${geoText}?`
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
          prompt: `What are the leading ${category.toLowerCase()} monitoring tools for ${market.toLowerCase()} companies ${geoText}?`
        }
      );
    } else {
      // Generic technology prompts
      prompts.push(
        {
          type: "Technology Leaders",
          prompt: `What are the leading ${domain.toLowerCase()} solutions for ${market.toLowerCase()} companies ${geoText}?`
        },
        {
          type: "Market Solutions",
          prompt: `Which ${industry.toLowerCase()} platforms dominate the ${market.toLowerCase()} space ${geoTextAlt}?`
        },
        {
          type: "Industry Tools",
          prompt: `What ${category.toLowerCase()} tools are most popular among ${market.toLowerCase()} businesses ${geoText}?`
        },
        {
          type: "Innovation Leaders",
          prompt: `Which ${domain.toLowerCase()} companies are leading innovation in ${market.toLowerCase()} ${geoTextAlt}?`
        },
        {
          type: "Enterprise Solutions",
          prompt: `What are the best ${category.toLowerCase()} solutions for ${market.toLowerCase()} enterprises ${geoText}?`
        },
        {
          type: "Market Alternatives",
          prompt: `What are some alternatives to popular ${market.toLowerCase()} platforms in ${domain.toLowerCase()} ${geoText}?`
        },
        {
          type: "Startup Tools",
          prompt: `Which ${domain.toLowerCase()} tools are most popular among ${market.toLowerCase()} startups ${geoTextAlt}?`
        }
      );
    }
  } else if (industry === 'Food & Beverage') {
    prompts.push(
      {
        type: "Brand Leaders",
        prompt: `What are the most popular ${category.toLowerCase()} brands in ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Market Alternatives",
        prompt: `What are some alternatives to leading ${category.toLowerCase()} brands for ${market.toLowerCase()} companies ${geoText}?`
      },
      {
        type: "Industry Trends",
        prompt: `Which ${industry.toLowerCase()} brands are trending in ${market.toLowerCase()} ${geoTextAlt}?`
      },
      {
        type: "Geographic Presence",
        prompt: `What ${category.toLowerCase()} companies have the strongest presence in ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Premium Segment",
        prompt: `Which premium ${category.toLowerCase()} brands are gaining market share in ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Health-Conscious",
        prompt: `What are the most popular health-conscious ${category.toLowerCase()} brands in ${market.toLowerCase()} ${geoTextAlt}?`
      },
      {
        type: "Market Comparison",
        prompt: `Compare the leading ${category.toLowerCase()} brands available in ${market.toLowerCase()} ${geoText}.`
      }
    );
  } else {
    // Generic industry prompts using all dimensions
    prompts.push(
      {
        type: "Industry Leaders",
        prompt: `What are the best ${domain.toLowerCase()} tools for ${industry.toLowerCase()} companies in ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Market Solutions",
        prompt: `Which platforms help ${industry.toLowerCase()} companies with ${market.toLowerCase()} operations ${geoText}?`
      },
      {
        type: "Category Tools",
        prompt: `What ${category.toLowerCase()} solutions are gaining traction in ${market.toLowerCase()} ${geoTextAlt}?`
      },
      {
        type: "Domain Expertise",
        prompt: `Which ${domain.toLowerCase()} providers specialize in ${industry.toLowerCase()} and ${market.toLowerCase()} ${geoText}?`
      },
      {
        type: "Geographic Focus",
        prompt: `What are the leading ${category.toLowerCase()} solutions for ${industry.toLowerCase()} businesses ${geoText}?`
      },
      {
        type: "Best Practices",
        prompt: `Which ${domain.toLowerCase()} solutions follow ${industry.toLowerCase()} best practices for ${market.toLowerCase()} ${geoTextAlt}?`
      },
      {
        type: "Cost Effectiveness",
        prompt: `What are the most cost-effective ${category.toLowerCase()} solutions for ${industry.toLowerCase()} companies in ${market.toLowerCase()} ${geoText}?`
      }
    );
  }
  
  // Ensure exactly 7 prompts
  const finalPrompts = prompts.slice(0, 7);
  
  // Simulate responses with realistic mention probability
  const mentionProbability = getMentionProbability(businessName, classification);
  
  return finalPrompts.map(prompt => ({
    ...prompt,
    response: Math.random() < mentionProbability ? 
      `Analyzed for ${businessName} - Mentioned` : 
      `Analyzed for ${businessName} - Not mentioned`
  }));
};

