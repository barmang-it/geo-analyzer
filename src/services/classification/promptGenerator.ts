
import { BusinessClassification, TestPrompt } from './types';
import { getMentionProbability } from './scoreCalculator';
import { generateBeveragePrompts } from './prompts/beveragePrompts';
import { generateConglomeratePrompts } from './prompts/conglomeratePrompts';
import { generateTechnologyPrompts } from './prompts/technologyPrompts';
import { generateFoodBeveragePrompts } from './prompts/foodBeveragePrompts';
import { generateGenericPrompts } from './prompts/genericPrompts';

export const generateTestPrompts = (
  classification: BusinessClassification, 
  businessName: string
): TestPrompt[] => {
  const { industry, market, geography, category, domain } = classification;
  
  let prompts: TestPrompt[] = [];
  
  // Route to appropriate prompt generator based on industry and domain
  if (industry === 'Food & Beverage' && domain === 'Global Beverage Brand') {
    prompts = generateBeveragePrompts(geography, market, category, domain);
  } else if (industry === 'Conglomerate') {
    prompts = generateConglomeratePrompts(geography, market, category, domain, industry);
  } else if (industry === 'Technology') {
    prompts = generateTechnologyPrompts(geography, market, category, domain, industry);
  } else if (industry === 'Food & Beverage') {
    prompts = generateFoodBeveragePrompts(geography, market, category, industry);
  } else {
    prompts = generateGenericPrompts(geography, market, category, domain, industry);
  }
  
  // Ensure exactly 7 prompts
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
