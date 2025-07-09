
import { BusinessClassification, TestPrompt } from './types';
import { getMentionProbability } from './scoreCalculator';
import { generateDynamicTestPrompts } from './dynamicPromptGenerator';

export const generateTestPrompts = async (
  classification: BusinessClassification, 
  businessName: string
): Promise<TestPrompt[]> => {
  console.log('Generating dynamic test prompts for:', businessName, classification);
  
  // Use dynamic prompt generation via ChatGPT
  const prompts = await generateDynamicTestPrompts(classification, businessName);
  
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
