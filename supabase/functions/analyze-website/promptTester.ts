
import { classifyBusinessWithLLM } from './businessClassifier.ts';
import { callOpenAI } from './utils/openaiClient.ts';
import { detectBusinessMention } from './utils/mentionDetector.ts';
import { generateBeveragePrompts } from './domainPrompts/beveragePrompts.ts';
import { generateConglomeratePrompts } from './domainPrompts/conglomeratePrompts.ts';
import { generateCybersecurityPrompts, generateCDNPrompts } from './domainPrompts/technologyPrompts.ts';
import { generateGenericPrompts } from './domainPrompts/genericPrompts.ts';
import { TestPrompt, BusinessClassification } from './types.ts';

export async function testPromptsInParallel(businessName: string, websiteUrl: string): Promise<TestPrompt[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('OpenAI API key not configured');
    return [];
  }

  console.log(`Testing prompts for business: ${businessName}, website: ${websiteUrl}`);

  // Get classification to generate domain-specific prompts
  const classification = await classifyBusinessWithLLM(businessName, websiteUrl);
  console.log(`Classification result:`, classification);
  
  // Generate comprehensive prompts based on all classification dimensions
  const prompts = generateDomainSpecificPrompts(classification, businessName);
  console.log(`Generated ${prompts.length} prompts for testing`);

  // Test all prompts with proper error handling and longer timeout
  const testPromises = prompts.map(async (prompt, index) => {
    try {
      console.log(`Testing prompt ${index + 1}/${prompts.length}: ${prompt.type}`);
      
      const responseContent = await callOpenAI(prompt.prompt, openaiKey, 10000); // 10 second timeout
      
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

function generateDomainSpecificPrompts(classification: BusinessClassification, businessName: string): TestPrompt[] {
  const { industry, market, geography, domain } = classification;
  
  let prompts: TestPrompt[] = [];
  
  // Route based on industry first, then domain - ensuring appropriate prompts for each business type
  if (industry === 'Food & Beverage') {
    if (domain === 'Global Beverage Brand') {
      prompts = generateBeveragePrompts(geography, market);
    } else if (market.toLowerCase().includes('consumer') || market.toLowerCase().includes('retail')) {
      // Generate retail-focused prompts for consumer/retail food & beverage companies
      prompts = generateRetailFocusedPrompts(geography, market);
    } else {
      prompts = generateGenericPrompts(geography, market, domain, industry);
    }
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

function generateRetailFocusedPrompts(geography: string, market: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  const geoTextAlt = geography === 'Global' ? 'globally' : `in ${geography}`;

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
