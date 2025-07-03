
import { classifyBusinessWithLLM } from './businessClassifier.ts';
import { callOpenAI } from './utils/openaiClient.ts';
import { detectBusinessMention } from './utils/mentionDetector.ts';
import { generateBeveragePrompts } from './domainPrompts/beveragePrompts.ts';
import { generateConglomeratePrompts } from './domainPrompts/conglomeratePrompts.ts';
import { generateCybersecurityPrompts, generateCDNPrompts } from './domainPrompts/technologyPrompts.ts';
import { generateGenericPrompts } from './domainPrompts/genericPrompts.ts';
import { TestPrompt, BusinessClassification } from './types.ts';

export async function testPromptsInParallel(businessName: string, websiteUrl: string): Promise<TestPrompt[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    console.error('OpenAI API key not configured')
    return []
  }

  // Get classification to generate domain-specific prompts
  const classification = await classifyBusinessWithLLM(businessName, websiteUrl);
  
  // Generate comprehensive prompts based on all classification dimensions
  const prompts = generateDomainSpecificPrompts(classification, businessName);

  // Test all 7 prompts in parallel with aggressive optimization
  const testPromises = prompts.map(async (prompt) => {
    try {
      const responseContent = await callOpenAI(prompt.prompt, openaiKey, 2000);
      
      if (!responseContent) {
        return { ...prompt, response: 'error' };
      }

      console.log(`Prompt: ${prompt.type}`);
      console.log(`Response content: ${responseContent.substring(0, 200)}...`);
      
      const detectionResult = detectBusinessMention(businessName, responseContent);
      
      console.log(`Business: ${businessName}, Variations checked: ${detectionResult.variations.join(', ')}, Mentioned: ${detectionResult.mentioned}`);

      return {
        ...prompt,
        response: detectionResult.mentioned ? 'mentioned' : 'not mentioned'
      };

    } catch (error) {
      console.error(`Error testing prompt: ${prompt.type}`, error.message);
      return { ...prompt, response: 'error' };
    }
  });

  // Wait for all prompts to complete
  const results = await Promise.allSettled(testPromises);
  
  return results.map((result, index) => 
    result.status === 'fulfilled' ? result.value : 
    { type: prompts[index].type, prompt: prompts[index].prompt, response: 'error' }
  );
}

function generateDomainSpecificPrompts(classification: BusinessClassification, businessName: string): TestPrompt[] {
  const { industry, market, geography, domain } = classification;
  
  let prompts: TestPrompt[] = [];
  
  // Special handling for major global beverage brands
  if (industry === 'Food & Beverage' && domain === 'Global Beverage Brand') {
    prompts = generateBeveragePrompts(geography, market);
  } else if (industry === 'Conglomerate') {
    prompts = generateConglomeratePrompts(geography, market, domain, industry);
  } else if (domain === 'Cybersecurity & Performance' || domain === 'Cybersecurity') {
    prompts = generateCybersecurityPrompts(geography, market, domain, industry);
  } else if (domain === 'Performance & CDN') {
    prompts = generateCDNPrompts(geography, market, domain, industry);
  } else {
    prompts = generateGenericPrompts(geography, market, domain, industry);
  }
  
  return prompts.slice(0, 7); // Ensure exactly 7 prompts
}
