
import { BusinessClassification, WebsiteContent } from './types';
import { performIntelligentClassification } from './classifiers/intelligentClassifier';

export const performBusinessClassification = async (
  businessName: string, 
  websiteUrl: string,
  websiteContent?: WebsiteContent
): Promise<BusinessClassification> => {
  
  // Try to get real LLM classification from the backend
  try {
    const supabaseUrl = "https://cxeyudjaehsmtmqnzklk.supabase.co"
    const functionUrl = `${supabaseUrl}/functions/v1/analyze-website`
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZXl1ZGphZWhzbXRtcW56a2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDA1OTUsImV4cCI6MjA2NjYxNjU5NX0.kH-nWJME9-UYvINUvPcO9DyWjVu9gVZQgc3ZxyNyPWY`
      },
      body: JSON.stringify({
        businessName,
        websiteUrl
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.classification) {
        console.log('Using real LLM classification:', result.classification)
        return result.classification
      }
    }
  } catch (error) {
    console.log('LLM classification failed, falling back to intelligent classifier:', error)
  }
  
  // Use intelligent classification system
  const contentText = websiteContent ? 
    `${websiteContent.title} ${websiteContent.description} ${websiteContent.content}` : '';
  
  return performIntelligentClassification(businessName, websiteUrl, contentText);
}
