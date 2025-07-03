
import { TestPrompt } from '../types';

export const generateFoodBeveragePrompts = (
  geography: string,
  market: string,
  category: string,
  industry: string
): TestPrompt[] => {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

  return [
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
  ];
};
