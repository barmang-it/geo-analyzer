
import { TestPrompt } from '../types.ts';

export function generateCybersecurityPrompts(
  geography: string,
  market: string,
  domain: string,
  industry: string
): TestPrompt[] {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

  return [
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
}

export function generateCDNPrompts(
  geography: string,
  market: string,
  domain: string,
  industry: string
): TestPrompt[] {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

  return [
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
}
