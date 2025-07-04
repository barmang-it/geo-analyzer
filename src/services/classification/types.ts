
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

export interface WebsiteContent {
  title: string;
  description: string;
  content: string;
  hasStructuredData: boolean;
}

export interface AnalysisResult {
  businessName?: string;
  websiteUrl?: string;
  classification: BusinessClassification;
  testPrompts: TestPrompt[];
  geoScore: number;
  benchmarkScore: number;
  hasStructuredData: boolean;
  llmMentions: number;
  publicPresence?: string[];
  strengths?: string[];
  gaps?: string[];
  recommendations?: string[];
  timestamp?: string;
}
