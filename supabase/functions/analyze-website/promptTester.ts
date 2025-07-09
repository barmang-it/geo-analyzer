
import { classifyBusinessWithLLM } from './businessClassifier.ts';
import { callOpenAI } from './utils/openaiClient.ts';
import { detectBusinessMention } from './utils/mentionDetector.ts';
import { TestPrompt, BusinessClassification } from './types.ts';

export async function testPromptsInParallel(businessName: string, websiteUrl: string): Promise<TestPrompt[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('OpenAI API key not configured');
    return [];
  }

  console.log(`Testing prompts for business: ${businessName}, website: ${websiteUrl}`);

  // Get classification to generate dynamic prompts
  const classification = await classifyBusinessWithLLM(businessName, websiteUrl);
  console.log(`Classification result:`, classification);
  
  // Generate dynamic prompts using ChatGPT
  const prompts = await generateDynamicPrompts(classification, businessName, openaiKey);
  console.log(`Generated ${prompts.length} dynamic prompts for testing`);

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

async function generateDynamicPrompts(
  classification: BusinessClassification, 
  businessName: string,
  openaiKey: string
): Promise<TestPrompt[]> {
  const { industry, market, geography, domain, category } = classification;
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;

  const prompt = `Generate exactly 7 test prompts that would likely mention companies similar to "${businessName}" in real conversations or queries. 

Business Classification:
- Industry: ${industry}
- Market: ${market}
- Geography: ${geography}
- Domain: ${domain}
- Category: ${category}

Create prompts that would naturally result in mentioning companies like this one. The prompts should be:
1. Realistic questions people might ask
2. Relevant to the business type and market
3. Geographically appropriate (${geoText})
4. Industry-specific and contextual
5. Varied in approach (competitors, recommendations, comparisons, etc.)

Return ONLY a JSON array with this exact format:
[
  {"type": "Brief descriptive name", "prompt": "The actual question/prompt"},
  {"type": "Brief descriptive name", "prompt": "The actual question/prompt"},
  ...
]

Make sure each prompt type name is brief (2-3 words) and each prompt is a natural question that would likely generate mentions of companies in this space.`;

  try {
    console.log('Generating dynamic prompts using ChatGPT...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at generating test prompts for business analysis. You understand different industries and markets. Always return valid JSON arrays only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('Generated dynamic prompts content:', content);

    // Parse the JSON response
    const prompts = JSON.parse(content);
    
    // Validate and ensure proper format
    if (!Array.isArray(prompts) || prompts.length !== 7) {
      throw new Error('Invalid prompt format from ChatGPT');
    }
    
    return prompts.map((p: any) => ({
      type: p.type || 'Generated Prompt',
      prompt: p.prompt || 'What are leading companies in this industry?'
    }));

  } catch (error) {
    console.error('Failed to generate dynamic prompts:', error);
    
    // Fallback to basic prompts
    return [
      {
        type: "Industry Leaders",
        prompt: `What are the top companies in the ${industry.toLowerCase()} industry ${geoText}?`
      },
      {
        type: "Market Analysis",
        prompt: `Which companies dominate the ${market.toLowerCase()} market ${geoText}?`
      },
      {
        type: "Business Solutions",
        prompt: `What are the best ${domain.toLowerCase()} solutions available ${geoText}?`
      },
      {
        type: "Competitive Landscape",
        prompt: `Who are the main competitors in ${industry.toLowerCase()} ${geoText}?`
      },
      {
        type: "Industry Innovation",
        prompt: `Which companies are leading innovation in ${industry.toLowerCase()} ${geoText}?`
      },
      {
        type: "Service Providers",
        prompt: `What companies provide ${domain.toLowerCase()} services ${geoText}?`
      },
      {
        type: "Market Recommendations",
        prompt: `Recommend top ${industry.toLowerCase()} companies for ${market.toLowerCase()} ${geoText}.`
      }
    ];
  }
}
