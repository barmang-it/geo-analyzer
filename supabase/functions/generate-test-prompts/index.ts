
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  category: string;
  domain: string;
}

interface TestPrompt {
  type: string;
  prompt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { classification, businessName }: { 
      classification: BusinessClassification, 
      businessName: string 
    } = await req.json();

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    console.log('Generating test prompts for:', businessName);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
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

    console.log('Generated content:', content);

    // Parse the JSON response
    let prompts: TestPrompt[];
    try {
      prompts = JSON.parse(content);
      
      // Validate the response format
      if (!Array.isArray(prompts) || prompts.length !== 7) {
        throw new Error('Invalid response format');
      }
      
      // Ensure all prompts have the required fields
      prompts = prompts.map(p => ({
        type: p.type || 'Generated Prompt',
        prompt: p.prompt || 'What are leading companies in this industry?'
      }));
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    console.log(`Successfully generated ${prompts.length} test prompts`);

    return new Response(JSON.stringify({ prompts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-test-prompts function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate test prompts',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
