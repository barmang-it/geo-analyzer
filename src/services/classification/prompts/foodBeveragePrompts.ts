
import { TestPrompt } from '../types';

export const generateFoodBeveragePrompts = (
  geography: string,
  market: string,
  category: string,
  industry: string
): TestPrompt[] => {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

  // Determine if this is retail-focused based on market classification
  const isRetailFocused = market.toLowerCase().includes('consumer') || 
                         market.toLowerCase().includes('retail') ||
                         market.toLowerCase().includes('packaged goods');

  if (isRetailFocused) {
    return [
      {
        type: "Retail Leaders",
        prompt: `What are the largest retail companies and consumer brands ${geoText}?`
      },
      {
        type: "Consumer Brands",
        prompt: `Which consumer packaged goods companies dominate the market ${geoText}?`
      },
      {
        type: "Market Share",
        prompt: `What retail chains have the biggest market share ${geoTextAlt}?`
      },
      {
        type: "Shopping Destinations",
        prompt: `Where do consumers prefer to shop for everyday goods ${geoText}?`
      },
      {
        type: "Supply Chain",
        prompt: `Which companies have the most efficient retail supply chains ${geoTextAlt}?`
      },
      {
        type: "Innovation Leaders",
        prompt: `What retail companies are leading innovation in consumer experience ${geoText}?`
      },
      {
        type: "Value Retailers",
        prompt: `Which retailers offer the best value for consumer products ${geoText}?`
      }
    ];
  }

  // Default food & beverage prompts for non-retail companies
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
