
import { TestPrompt } from '../types.ts';

export function generateConglomeratePrompts(
  geography: string,
  market: string,
  domain: string,
  industry: string
): TestPrompt[] {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

  return [
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
}
