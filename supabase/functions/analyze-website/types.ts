
export interface TestPrompt {
  type: string;
  prompt: string;
  response?: string;
}

export interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  domain: string;
}
