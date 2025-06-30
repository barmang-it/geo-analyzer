import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Search, CheckCircle, Target, TrendingUp } from "lucide-react";
import { ScanForm } from "@/components/ScanForm";
import { ProcessingView } from "@/components/ProcessingView";
import { ResultsView } from "@/components/ResultsView";
import { CostMonitor } from "@/components/CostMonitor";
import { UsageTracker } from "@/services/usageTracking";
import { 
  analyzeWebsite, 
  generateDynamicStrengthsAndGaps, 
  generateDynamicRecommendations,
  type BusinessClassification,
  type TestPrompt
} from "@/services/realLlmAnalysis";

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
  const [error, setError] = useState<string | null>(null);

  const handleScanStart = async (data: ScanData) => {
    setScanData(data);
    setScanStatus('processing');
    setError(null);
    
    try {
      console.log('Starting cost-protected analysis for:', data);
      
      // Check usage limits before starting
      const usageTracker = UsageTracker.getInstance();
      const usageInfo = usageTracker.getUsageInfo();
      
      if (!usageInfo.withinBudget) {
        console.log('Budget exceeded, using mock analysis');
      }
      
      // Use the cost-protected analysis service
      const analysisResult = await analyzeWebsite(data.businessName, data.websiteUrl);
      
      console.log('Analysis result:', analysisResult);
      
      // Generate dynamic strengths, gaps, and recommendations
      const { strengths, gaps } = generateDynamicStrengthsAndGaps(
        analysisResult.classification,
        analysisResult.testPrompts,
        analysisResult.geoScore,
        analysisResult.hasStructuredData,
        analysisResult.llmMentions
      );
      
      const recommendations = generateDynamicRecommendations(
        analysisResult.classification,
        analysisResult.testPrompts,
        analysisResult.geoScore,
        analysisResult.hasStructuredData,
        analysisResult.llmMentions
      );
      
      const finalResults: ScanResults = {
        geoScore: analysisResult.geoScore,
        benchmarkScore: analysisResult.benchmarkScore,
        strengths,
        gaps,
        recommendations,
        llmMentions: analysisResult.llmMentions,
        hasStructuredData: analysisResult.hasStructuredData,
        publicPresence: ["Website Analysis", "LLM Testing"],
        classification: analysisResult.classification,
        testPrompts: analysisResult.testPrompts
      };
      
      setResults(finalResults);
      setScanStatus('completed');
      
    } catch (error) {
      console.error('Scan failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      setScanStatus('error');
    }
  };

  const handleNewScan = () => {
    setScanStatus('idle');
    setScanData(null);
    setResults(null);
    setError(null);
  };

  if (scanStatus === 'processing') {
    return <ProcessingView businessName={scanData?.businessName || ''} />;
  }

  if (scanStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Analysis Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || 'An error occurred during analysis. Please try again.'}
            </p>
            <Button onClick={handleNewScan} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
        {/* Cost Monitor */}
        <div className="max-w-2xl mx-auto mb-8">
          <CostMonitor />
        </div>

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
              <CardTitle>Real LLM Testing</CardTitle>
              <CardDescription>
                Test how often your business appears in actual AI responses using live API calls
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <CardTitle>Website Analysis</CardTitle>
              <CardDescription>
                Analyze your website content, structured data, and AI-readiness automatically
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <CardTitle>Dynamic Insights</CardTitle>
              <CardDescription>
                Get personalized recommendations based on your industry and current AI visibility
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
          <p className="mb-4">Real analysis powered by OpenAI GPT-4 and live website content extraction</p>
          <div className="flex justify-center items-center space-x-6 text-sm">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Live API Testing
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Website Content Analysis
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Industry Benchmarking
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
