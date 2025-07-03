
import { TestPrompt } from '../types';

export const generateBeveragePrompts = (
  geography: string,
  market: string,
  category: string,
  domain: string
): TestPrompt[] => {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

  return [
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
  ];
};
