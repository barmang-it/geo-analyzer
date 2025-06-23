
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Search, Globe, Target, TrendingUp } from "lucide-react";

interface ProcessingViewProps {
  businessName: string;
}

const processingSteps = [
  {
    id: 1,
    title: "Scanning LLM Responses",
    description: "Testing visibility across ChatGPT, Claude, and Perplexity",
    icon: Search,
    duration: 2000
  },
  {
    id: 2,
    title: "Analyzing Website Structure",
    description: "Checking for structured data and metadata",
    icon: Globe,
    duration: 1500
  },
  {
    id: 3,
    title: "Competitive Benchmarking",
    description: "Comparing against industry leaders",
    icon: Target,
    duration: 2000
  },
  {
    id: 4,
    title: "Generating Recommendations",
    description: "Creating personalized optimization strategies",
    icon: TrendingUp,
    duration: 2500
  }
];

export const ProcessingView = ({ businessName }: ProcessingViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepIndex = 0;
    let stepProgress = 0;
    
    const interval = setInterval(() => {
      if (stepIndex < processingSteps.length) {
        stepProgress += 10;
        
        if (stepProgress >= 100) {
          stepProgress = 0;
          stepIndex += 1;
          setCurrentStep(stepIndex);
        }
        
        const totalProgress = (stepIndex * 100 + stepProgress) / processingSteps.length;
        setProgress(totalProgress);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
            CiteMe.AI
          </Badge>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Analyzing {businessName}
          </h1>
          <p className="text-gray-600">
            Running comprehensive GEO analysis across multiple AI platforms
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Progress</span>
              <span className="text-sm font-normal text-gray-500">
                {Math.round(progress)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-6" />
            
            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isPending = index > currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                      isCurrent ? 'bg-blue-50 border border-blue-200' : 
                      isCompleted ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${
                      isCompleted ? 'text-green-600' : 
                      isCurrent ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        isCompleted ? 'text-green-800' : 
                        isCurrent ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        isCompleted ? 'text-green-600' : 
                        isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    
                    <div className={`flex-shrink-0 ${
                      isCompleted ? 'text-green-600' : 
                      isCurrent ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {isCompleted && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Complete
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Processing...
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-gray-500 text-sm">
          <p>This usually takes 30-60 seconds. Please don't close this page.</p>
        </div>
      </div>
    </div>
  );
};
