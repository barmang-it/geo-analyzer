import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Download, Share, RotateCcw, TrendingUp, Target, Globe, Search, MapPin, Building } from "lucide-react";
import { ScanData, ScanResults } from "@/pages/Index";

interface ResultsViewProps {
  results: ScanResults;
  scanData: ScanData;
  onNewScan: () => void;
}

export const ResultsView = ({ results, scanData, onNewScan }: ResultsViewProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800";
    if (score >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleDownloadReport = () => {
    // In production, this would generate and download a PDF
    console.log("Downloading report...");
  };

  const handleShareScore = () => {
    // In production, this would open share dialog
    console.log("Sharing score...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
            CiteMe.AI Analysis Complete
          </Badge>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {scanData.businessName} GEO Report
          </h1>
          <p className="text-gray-600 mb-6">
            Analysis completed for {scanData.websiteUrl}
          </p>
          
          <div className="flex justify-center gap-4">
            <Button onClick={handleDownloadReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handleShareScore} variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share Score
            </Button>
            <Button onClick={onNewScan}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Business Classification */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Business Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Industry</div>
                <Badge variant="outline" className="text-sm font-medium">
                  {results.classification.industry}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Market</div>
                <Badge variant="outline" className="text-sm font-medium">
                  {results.classification.market}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Geography</div>
                <Badge variant="outline" className="text-sm font-medium">
                  <MapPin className="w-3 h-3 mr-1" />
                  {results.classification.geography}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GEO Score Card */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
              Your GEO Score
            </CardTitle>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(results.geoScore)}`}>
                  {results.geoScore}
                </div>
                <div className="text-xl text-gray-600">/10</div>
                <Badge className={`mt-2 ${getScoreBadgeColor(results.geoScore)}`}>
                  {results.geoScore >= 8 ? "Excellent" : 
                   results.geoScore >= 6 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-600 mb-2">
                  Benchmark
                </div>
                <div className="text-lg text-gray-500">
                  Category Average: {results.benchmarkScore}/10
                </div>
                <div className={`text-sm font-medium ${
                  results.geoScore > results.benchmarkScore ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.geoScore > results.benchmarkScore ? 
                    `${(results.geoScore - results.benchmarkScore).toFixed(1)} above average` :
                    `${(results.benchmarkScore - results.geoScore).toFixed(1)} below average`
                  }
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-lg">LLM Mentions</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {results.llmMentions}
              </div>
              <p className="text-sm text-gray-600">
                Across 7 test prompts
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <CardTitle className="text-lg">Structured Data</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                results.hasStructuredData ? 'text-green-600' : 'text-red-600'
              }`}>
                {results.hasStructuredData ? "✓" : "✗"}
              </div>
              <p className="text-sm text-gray-600">
                JSON-LD Schema
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
              <CardTitle className="text-lg">Public Presence</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {results.publicPresence.length}
              </div>
              <p className="text-sm text-gray-600">
                Platforms found
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Test Prompts Used */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Search className="w-5 h-5 mr-2 text-purple-600" />
              Test Prompts Used
            </CardTitle>
            <p className="text-gray-600">
              These prompts were customized based on your business classification and tested across multiple LLMs
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.testPrompts.map((prompt, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {prompt.type}
                    </Badge>
                    {prompt.response && (
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        prompt.response.includes('Mentioned') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {prompt.response.includes('Mentioned') ? '✓ Found' : '✗ Not Found'}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{prompt.prompt}"
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Gaps */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-green-600" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.gaps.map((gap, index) => (
                  <li key={index} className="flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-3 mt-0.5 text-red-600" />
                    <span className="text-gray-700">{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 text-center">
              🚀 Recommended Actions
            </CardTitle>
            <p className="text-gray-600 text-center">
              Implement these changes to improve your GEO Score
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Ready to improve your AI visibility? Start with the highest-impact recommendations.
          </p>
          <Button 
            onClick={onNewScan}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Analyze Another Business
          </Button>
        </div>
      </div>
    </div>
  );
};
