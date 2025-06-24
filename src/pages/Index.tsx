
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Search, CheckCircle, Target, TrendingUp } from "lucide-react";
import { ScanForm } from "@/components/ScanForm";
import { ProcessingView } from "@/components/ProcessingView";
import { ResultsView } from "@/components/ResultsView";
import { BusinessClassification, TestPrompt, classifyBusiness, generateTestPrompts } from "@/services/llmClassification";

export type ScanStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface ScanData {
  businessName: string;
  websiteUrl: string;
}

export interface ScanResults {
  geoScore: number;
  benchmarkScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  llmMentions: number;
  hasStructuredData: boolean;
  publicPresence: string[];
  classification: BusinessClassification;
  testPrompts: TestPrompt[];
}

const Index = () => {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [results, setResults] = useState<ScanResults | null>(null);

  const handleScanStart = async (data: ScanData) => {
    setScanData(data);
    setScanStatus('processing');
    
    try {
      // Step 1: Classify the business using LLM
      const classification = await classifyBusiness(data.businessName, data.websiteUrl);
      
      // Step 2: Generate test prompts based on classification
      const testPrompts = generateTestPrompts(classification, data.businessName);
      
      // Step 3: Simulate running prompts against LLMs
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Step 4: Calculate dynamic scores
      const { geoScore, benchmarkScore } = calculateGeoScore(classification, data.businessName, testPrompts);
      
      // Step 5: Generate results with dynamic scoring
      const mockResults: ScanResults = {
        geoScore,
        benchmarkScore,
        strengths: [
          `Clear ${classification.industry.toLowerCase()} product description on homepage`,
          "Public presence on Crunchbase",
          `Active presence in ${classification.geography} market`
        ],
        gaps: [
          `No mention in common "Top ${classification.category.toLowerCase()}" prompts`,
          "No structured data detected on homepage",
          `Not cited in ${classification.industry.toLowerCase()} forums and Q&A platforms`
        ],
        recommendations: [
          "Add structured metadata (JSON-LD schema)",
          `Create public profile on ${classification.industry.toLowerCase()}-specific platforms`,
          `Publish "Top 5 ${classification.category.toLowerCase()} tools" content`,
          `Encourage mentions on ${classification.geography} high-authority forums`
        ],
        llmMentions: testPrompts.filter(p => p.response?.includes('Mentioned')).length,
        hasStructuredData: Math.random() > 0.6,
        publicPresence: ["Crunchbase", "LinkedIn"],
        classification,
        testPrompts
      };
      
      setResults(mockResults);
      setScanStatus('completed');
    } catch (error) {
      console.error('Scan failed:', error);
      setScanStatus('error');
    }
  };

  const handleNewScan = () => {
    setScanStatus('idle');
    setScanData(null);
    setResults(null);
  };

  if (scanStatus === 'processing') {
    return <ProcessingView businessName={scanData?.businessName || ''} />;
  }

  if (scanStatus === 'completed' && results && scanData) {
    return (
      <ResultsView 
        results={results} 
        scanData={scanData} 
        onNewScan={handleNewScan}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
            CiteMe.AI
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            GEO is the new SEO
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            LLMs are the new search engine.<br />
            <span className="font-semibold text-gray-800">Is your business showing up?</span>
          </p>
          
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Discover how visible your brand is in AI-generated responses from ChatGPT, Claude, and Perplexity. 
            Get your GEO Score and actionable recommendations to improve your AI discoverability.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>LLM Visibility Scan</CardTitle>
              <CardDescription>
                Test how often your business appears in AI responses across multiple use cases
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <CardTitle>GEO Score (0-10)</CardTitle>
              <CardDescription>
                Get a comprehensive score based on citations, structured data, and competitive benchmarking
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <CardTitle>Actionable Insights</CardTitle>
              <CardDescription>
                Receive specific recommendations to improve your visibility in generative AI tools
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Scan Form */}
        <div className="max-w-2xl mx-auto">
          <ScanForm onScanStart={handleScanStart} />
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16 text-gray-500">
          <p className="mb-4">Trusted by innovative businesses to optimize their AI presence</p>
          <div className="flex justify-center items-center space-x-6 text-sm">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Scans 3+ Major LLMs
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Competitive Benchmarking
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Actionable Recommendations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
