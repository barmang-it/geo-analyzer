
import { BusinessClassification, TestPrompt } from './types';
import { getMentionProbability } from './scoreCalculator';

export const generateTestPrompts = (
  classification: BusinessClassification, 
  businessName: string
): TestPrompt[] => {
  const { industry, market, geography, category, domain } = classification;
  
  // Generate domain-specific prompts based on the business domain
  const prompts: TestPrompt[] = [];
  
  // Conglomerate-specific prompts with multi-industry focus
  if (industry === 'Conglomerate') {
    const geographyText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
    
    prompts.push(
      {
        type: "Multi-Industry Leaders",
        prompt: `Which companies operate across ${category.toLowerCase()} sectors ${geographyText}?`
      },
      {
        type: "Diversified Holdings",
        prompt: `What are the leading diversified business groups with interests in ${category.toLowerCase()} ${geographyText}?`
      },
      {
        type: "Conglomerate Comparison",
        prompt: `Compare major conglomerates operating in ${market.toLowerCase()} markets ${geographyText}.`
      },
      {
        type: "Cross-Sector Operations",
        prompt: `Which ${domain.toLowerCase()} companies have the broadest business portfolio ${geographyText}?`
      },
      {
        type: "Industry Diversification",
        prompt: `What companies successfully diversified across ${category.toLowerCase()} industries ${geographyText}?`
      },
      {
        type: "Market Expansion",
        prompt: `Which business groups expanded from one industry to dominate ${category.toLowerCase()} ${geographyText}?`
      },
      {
        type: "Investment Strategy",
        prompt: `What are the most successful ${domain.toLowerCase()} strategies for ${market.toLowerCase()} expansion ${geographyText}?`
      }
    );
  } else if (domain === 'Cybersecurity & Performance' || domain === 'Cybersecurity') {
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
      },
      {
        type: "DDoS Protection",
        prompt: `Which platforms offer the most reliable DDoS protection and mitigation ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "WAF Solutions",
        prompt: `What are the leading web application firewall solutions for enterprise security ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
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
      },
      {
        type: "Caching Solutions",
        prompt: `Which companies provide the most effective web caching and acceleration services ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Load Balancing",
        prompt: `What are the best load balancing and traffic management solutions ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Global Network",
        prompt: `Which providers have the largest global network infrastructure for content delivery ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Performance Monitoring",
        prompt: `What are the leading web performance monitoring and optimization tools ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
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
      },
      {
        type: "Enterprise Solutions",
        prompt: `What are the best enterprise-grade ${domain.toLowerCase()} solutions ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Startup Tools",
        prompt: `Which ${domain.toLowerCase()} tools are most popular among startups ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
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
      },
      {
        type: "Health-Conscious",
        prompt: `What are the most popular health-conscious ${category.toLowerCase()} brands ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Premium Brands",
        prompt: `Which premium ${category.toLowerCase()} brands are gaining market share ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
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
      },
      {
        type: "Best Practices",
        prompt: `Which ${domain.toLowerCase()} solutions follow industry best practices ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Cost Effective",
        prompt: `What are the most cost-effective ${domain.toLowerCase()} solutions for small businesses ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      }
    );
  }
  
  // Ensure we always have exactly 7 prompts
  if (prompts.length < 7) {
    // Add generic prompts to reach 7
    const additionalPrompts = [
      {
        type: "Recommendation",
        prompt: `Can you recommend ${domain.toLowerCase()} solutions for businesses ${geography === 'Global' ? 'operating globally' : `in ${geography}`}?`
      },
      {
        type: "Comparison",
        prompt: `Compare the leading ${category.toLowerCase()} solutions available ${geography === 'Global' ? 'worldwide' : `in ${geography}`}.`
      },
      {
        type: "Integration",
        prompt: `Which ${domain.toLowerCase()} solutions integrate well with existing business systems ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      }
    ];
    
    // Add additional prompts until we reach 7
    for (let i = 0; i < additionalPrompts.length && prompts.length < 7; i++) {
      prompts.push(additionalPrompts[i]);
    }
  }
  
  // Trim to exactly 7 prompts if we have more
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
