
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Search, CheckCircle, Target, TrendingUp } from "lucide-react";
import { ScanForm } from "@/components/ScanForm";
import { ProcessingView } from "@/components/ProcessingView";
import { ResultsView } from "@/components/ResultsView";
import { BusinessClassification, TestPrompt, classifyBusiness, generateTestPrompts, calculateGeoScore } from "@/services/llmClassification";

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

const generateDynamicStrengthsAndGaps = (
  classification: BusinessClassification,
  testPrompts: TestPrompt[],
  geoScore: number,
  hasStructuredData: boolean,
  llmMentions: number
) => {
  const strengths: string[] = [];
  const gaps: string[] = [];
  
  // Analyze LLM mentions
  const mentionRate = llmMentions / testPrompts.length;
  
  if (mentionRate > 0.6) {
    strengths.push(`Strong LLM visibility with ${llmMentions}/${testPrompts.length} prompt matches`);
  } else if (mentionRate > 0.3) {
    strengths.push(`Moderate LLM presence with ${llmMentions}/${testPrompts.length} mentions`);
  } else {
    gaps.push(`Low LLM visibility - only ${llmMentions}/${testPrompts.length} prompts returned mentions`);
  }
  
  // Structured data analysis
  if (hasStructuredData) {
    strengths.push("Structured data (JSON-LD) detected on website");
  } else {
    gaps.push("No structured data (JSON-LD schema) found on homepage");
  }
  
  // Geography-based strengths/gaps
  if (classification.geography === 'Global') {
    strengths.push(`Global brand recognition in ${classification.industry} sector`);
  } else {
    gaps.push(`Limited to ${classification.geography} market presence`);
  }
  
  // Industry-specific analysis
  if (classification.industry === 'Technology') {
    if (mentionRate < 0.5) {
      gaps.push(`Not frequently cited in "${classification.category}" tool comparisons`);
    }
    if (geoScore < 6) {
      gaps.push("Missing from popular developer/tech community discussions");
    }
  } else if (classification.industry === 'Food & Beverage') {
    if (mentionRate < 0.7) {
      gaps.push(`Rarely mentioned in "${classification.category}" brand discussions`);
    }
  }
  
  // Score-based analysis
  if (geoScore >= 8) {
    strengths.push("Excellent overall AI discoverability score");
  } else if (geoScore >= 6) {
    strengths.push("Good foundation for AI visibility");
  } else {
    gaps.push("Below-average AI discoverability needs improvement");
  }
  
  // Ensure we have at least some content
  if (strengths.length === 0) {
    strengths.push(`Clear ${classification.industry.toLowerCase()} business classification`);
    strengths.push("Website accessible for analysis");
  }
  
  if (gaps.length === 0) {
    gaps.push("Consider expanding content marketing efforts");
  }
  
  return { strengths, gaps };
};

const generateDynamicRecommendations = (
  classification: BusinessClassification,
  testPrompts: TestPrompt[],
  geoScore: number,
  hasStructuredData: boolean,
  llmMentions: number
) => {
  const recommendations: string[] = [];
  const mentionRate = llmMentions / testPrompts.length;
  
  // Structured data recommendation
  if (!hasStructuredData) {
    recommendations.push("Add JSON-LD structured data to your homepage for better AI comprehension");
  }
  
  // Content strategy based on mention rate
  if (mentionRate < 0.5) {
    recommendations.push(`Create "Top ${classification.category}" comparison content to increase citations`);
    recommendations.push(`Engage with ${classification.industry.toLowerCase()} communities and forums`);
  }
  
  // Industry-specific recommendations
  if (classification.industry === 'Technology') {
    recommendations.push("Publish technical content and case studies to establish thought leadership");
    if (classification.geography !== 'Global') {
      recommendations.push("Expand international presence through global tech platforms");
    }
  } else if (classification.industry === 'Food & Beverage') {
    recommendations.push("Increase brand mentions through influencer partnerships and reviews");
  }
  
  // Score-based recommendations
  if (geoScore < 6) {
    recommendations.push("Focus on high-authority backlinks and press coverage");
  }
  
  // Geography expansion
  if (classification.geography !== 'Global' && geoScore > 6) {
    recommendations.push("Consider expanding to international markets to increase global AI visibility");
  }
  
  return recommendations;
};

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
      
      // Step 5: Generate dynamic metadata
      const hasStructuredData = Math.random() > 0.6;
      const llmMentions = testPrompts.filter(p => p.response?.includes('Mentioned')).length;
      
      // Step 6: Generate dynamic strengths, gaps, and recommendations
      const { strengths, gaps } = generateDynamicStrengthsAndGaps(
        classification, testPrompts, geoScore, hasStructuredData, llmMentions
      );
      const recommendations = generateDynamicRecommendations(
        classification, testPrompts, geoScore, hasStructuredData, llmMentions
      );
      
      const mockResults: ScanResults = {
        geoScore,
        benchmarkScore,
        strengths,
        gaps,
        recommendations,
        llmMentions,
        hasStructuredData,
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
