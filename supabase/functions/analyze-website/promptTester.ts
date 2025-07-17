
import { classifyBusinessWithLLM } from './businessClassifier.ts';
import { callOpenAI } from './utils/openaiClient.ts';
import { detectBusinessMention } from './utils/mentionDetector.ts';
import { generateSpecificIndustryPrompts } from './domainPrompts/specificIndustryPrompts.ts';
import { TestPrompt, BusinessClassification } from './types.ts';

export async function testPromptsInParallel(businessName: string, websiteUrl: string, classification: BusinessClassification): Promise<TestPrompt[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('OpenAI API key not configured');
    return [];
  }

  console.log(`Testing prompts for business: ${businessName}, website: ${websiteUrl}`);
  console.log(`Using provided classification:`, classification);
  
  // Generate industry-specific prompts
  const prompts = generateSpecificIndustryPrompts(
    classification.industry,
    classification.market,
    classification.geography,
    classification.category,
    classification.domain
  );
  console.log(`Generated ${prompts.length} industry-specific prompts for testing`);

  // Test all prompts with proper error handling and longer timeout
  const testPromises = prompts.map(async (prompt, index) => {
    try {
      console.log(`Testing prompt ${index + 1}/${prompts.length}: ${prompt.type}`);
      
      const responseContent = await callOpenAI(prompt.prompt, openaiKey, 10000);
      
      if (!responseContent) {
        console.error(`No response received for prompt: ${prompt.type}`);
        return { ...prompt, response: 'error' };
      }

      console.log(`Response for "${prompt.type}": ${responseContent.substring(0, 150)}...`);
      
      const detectionResult = detectBusinessMention(businessName, responseContent);
      
      const finalResponse = detectionResult.mentioned ? 'mentioned' : 'not mentioned';
      console.log(`Final result for "${prompt.type}": ${finalResponse}`);

      return {
        ...prompt,
        response: finalResponse
      };

    } catch (error) {
      console.error(`Error testing prompt "${prompt.type}":`, error.message);
      return { ...prompt, response: 'error' };
    }
  });

  // Wait for all prompts to complete with proper error handling
  const results = await Promise.allSettled(testPromises);
  
  const finalResults = results.map((result, index) => 
    result.status === 'fulfilled' ? result.value : 
    { type: prompts[index].type, prompt: prompts[index].prompt, response: 'error' }
  );

  console.log(`Prompt testing complete. Results summary:`);
  finalResults.forEach(result => {
    console.log(`  ${result.type}: ${result.response}`);
  });

  return finalResults;
}

// Removed the old dynamic prompts function - now using industry-specific prompts
