
export interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  category: string;
  domain: string;
}

export interface TestPrompt {
  type: string;
  prompt: string;
  response?: string;
}
