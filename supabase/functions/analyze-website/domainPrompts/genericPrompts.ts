
import { TestPrompt } from '../types.ts';

export function generateGenericPrompts(
  geography: string,
  market: string,
  domain: string,
  industry: string
): TestPrompt[] {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

  return [
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
