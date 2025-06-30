
import { BusinessClassification, TestPrompt } from './types';
import { getMentionProbability } from './scoreCalculator';

export const generateTestPrompts = (
  classification: BusinessClassification, 
  businessName: string
): TestPrompt[] => {
  const { industry, market, geography, category, domain } = classification;
  
  // Generate domain-specific prompts based on the business domain
  const prompts: TestPrompt[] = [];
  
  if (domain === 'Cybersecurity & Performance' || domain === 'Cybersecurity') {
    prompts.push(
      {
        type: "Security Tools",
        prompt: `What are the top cybersecurity platforms for protecting against DDoS attacks ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "CDN Solutions",
        prompt: `Which content delivery networks provide the best performance optimization ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Edge Computing",
        prompt: `What are the leading edge computing platforms for web performance ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Web Security",
        prompt: `Which companies provide comprehensive web application security solutions ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Performance Solutions",
        prompt: `What are the best website performance and acceleration services available ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      }
    );
  } else if (domain === 'Performance & CDN') {
    prompts.push(
      {
        type: "CDN Providers",
        prompt: `What are the leading content delivery network providers ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Performance Tools",
        prompt: `Which platforms offer the best website performance optimization ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Edge Solutions",
        prompt: `What are the top edge computing solutions for businesses ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      }
    );
  } else if (industry === 'Technology') {
    prompts.push(
      {
        type: "Top Tools",
        prompt: `What are the leading ${domain.toLowerCase()} solutions ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Alternatives",
        prompt: `What are some alternatives to popular ${market.toLowerCase()} platforms?`
      },
      {
        type: "Market Leaders",
        prompt: `Which companies dominate the ${category.toLowerCase()} space ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Industry Trends",
        prompt: `What ${domain.toLowerCase()} companies are leading innovation ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Use Case Match",
        prompt: `Which platforms help businesses with ${market.toLowerCase()} needs ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      }
    );
  } else if (industry === 'Food & Beverage') {
    prompts.push(
      {
        type: "Top Brands",
        prompt: `What are the most popular beverage brands ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Alternatives",
        prompt: `What are some alternatives to Coca-Cola for ${market.toLowerCase()} companies?`
      },
      {
        type: "Market Leaders",
        prompt: `Which companies dominate the ${category.toLowerCase()} market ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Industry Trends",
        prompt: `What ${industry.toLowerCase()} brands are trending ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Comparison",
        prompt: `Compare the leading ${category.toLowerCase()} brands available ${geography === 'Global' ? 'worldwide' : `in ${geography}`}.`
      }
    );
  } else {
    // Generic prompts for other industries, but still domain-specific
    prompts.push(
      {
        type: "Top Tools",
        prompt: `What are the best ${domain.toLowerCase()} tools for businesses ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Alternatives",
        prompt: `What are some alternatives to popular ${market.toLowerCase()} solutions?`
      },
      {
        type: "Use Case Match",
        prompt: `Which platforms help ${industry.toLowerCase()} companies manage their operations ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Trends",
        prompt: `What ${category.toLowerCase()} tools are gaining traction ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Feature Targeted",
        prompt: `What tools provide automation features for ${market.toLowerCase()} companies?`
      }
    );
  }
  
  // Add recommendation and comparison prompts
  prompts.push(
    {
      type: "Recommendation",
      prompt: `Can you recommend ${domain.toLowerCase()} solutions for businesses ${geography === 'Global' ? 'operating globally' : `in ${geography}`}?`
    },
    {
      type: "Comparison",
      prompt: `Compare the leading ${category.toLowerCase()} solutions available ${geography === 'Global' ? 'worldwide' : `in ${geography}`}.`
    }
  );
  
  // Simulate responses with realistic mention probability
  const mentionProbability = getMentionProbability(businessName, classification);
  
  return prompts.map(prompt => ({
    ...prompt,
    response: Math.random() < mentionProbability ? 
      `Analyzed for ${businessName} - Mentioned` : 
      `Analyzed for ${businessName} - Not mentioned`
  }));
};
