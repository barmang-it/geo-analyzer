
import { TestPrompt } from '../types';

export const generateTechnologyPrompts = (
  geography: string,
  market: string,
  category: string,
  domain: string,
  industry: string
): TestPrompt[] => {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

  if (domain === 'Cybersecurity & Performance' || domain === 'Cybersecurity') {
    return generateCybersecurityPrompts(geography, market, category, domain, industry, geoText, geoTextAlt);
  } else if (domain === 'Performance & CDN') {
    return generateCDNPrompts(geography, market, category, domain, industry, geoText, geoTextAlt);
  } else {
    return generateGenericTechPrompts(geography, market, category, domain, industry, geoText, geoTextAlt);
  }
};

const generateCybersecurityPrompts = (
  geography: string,
  market: string,
  category: string,
  domain: string,
  industry: string,
  geoText: string,
  geoTextAlt: string
): TestPrompt[] => [
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
];

const generateCDNPrompts = (
  geography: string,
  market: string,
  category: string,
  domain: string,
  industry: string,
  geoText: string,
  geoTextAlt: string
): TestPrompt[] => [
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
];

const generateGenericTechPrompts = (
  geography: string,
  market: string,
  category: string,
  domain: string,
  industry: string,
  geoText: string,
  geoTextAlt: string
): TestPrompt[] => [
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
];
