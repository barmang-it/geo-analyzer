
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

export interface AnalysisResult {
  classification: BusinessClassification;
  testPrompts: TestPrompt[];
  geoScore: number;
  benchmarkScore: number;
  hasStructuredData: boolean;
  llmMentions: number;
}
