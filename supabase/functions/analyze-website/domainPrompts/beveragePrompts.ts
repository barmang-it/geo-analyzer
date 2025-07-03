
import { TestPrompt } from '../types.ts';

export function generateBeveragePrompts(
  geography: string,
  market: string
): TestPrompt[] {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

  return [
    {
      type: "Global Beverage Leaders",
      prompt: `What are the top 5 global soft drink and beverage companies ${geoText}?`
    },
    {
      type: "Market Share Leaders",
      prompt: `Which soft drink and beverage brands have the largest market share ${geoTextAlt}?`
    },
    {
      type: "Brand Recognition",
      prompt: `List the most recognizable soft drink and beverage brands in the world.`
    },
    {
      type: "Competition Analysis",
      prompt: `Who are the main competitors in the global soft drink and beverage industry?`
    },
    {
      type: "Consumer Preferences",
      prompt: `What are the most popular soft drink and beverage brands among consumers ${geoText}?`
    },
    {
      type: "Industry Giants",
      prompt: `Which companies dominate the ${market.toLowerCase()} sector for soft drinks and beverages ${geoTextAlt}?`
    },
    {
      type: "Brand Portfolio",
      prompt: `What are the leading global beverage companies and their flagship products?`
    }
  ];
}
