
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { ScanData } from "@/pages/Index";
import { sanitizeInput } from "@/utils/security";

interface ScanFormProps {
  onScanStart: (data: ScanData) => void;
}

const validateBusinessName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

const validateUrl = (url: string): boolean => {
  try {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return false;
    
    // Add https if no protocol specified
    const fullUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
    const urlObj = new URL(fullUrl);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Input sanitization now handled by shared utils

export const ScanForm = ({ onScanStart }: ScanFormProps) => {
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{businessName?: string; websiteUrl?: string}>({});

  const validateForm = () => {
    const newErrors: {businessName?: string; websiteUrl?: string} = {};
    
    if (!validateBusinessName(businessName)) {
      newErrors.businessName = businessName.trim().length < 2 ? 
        'Business name must be at least 2 characters' : 
        'Business name is too long (max 100 characters)';
    }
    
    if (!validateUrl(websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid website URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Format URL if needed
      let formattedUrl = websiteUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      onScanStart({
        businessName: sanitizeInput(businessName),
        websiteUrl: sanitizeInput(formattedUrl)
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setIsLoading(false);
    }
  };

  const isFormValid = validateBusinessName(businessName) && validateUrl(websiteUrl);

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Check Your Brand's AI Visibility
        </CardTitle>
        <p className="text-gray-600">
          Enter your business details to get your GEO Score and recommendations
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
              Business Name
            </Label>
            <Input
              id="businessName"
              type="text"
              placeholder="e.g., Acme Corp"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-12 text-lg"
              required
              maxLength={100}
              autoComplete="organization"
            />
            {errors.businessName && (
              <p className="text-sm text-red-600">{errors.businessName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-700">
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="e.g., acmecorp.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="h-12 text-lg"
              required
              maxLength={500}
              autoComplete="url"
            />
            {errors.websiteUrl && (
              <p className="text-sm text-red-600">{errors.websiteUrl}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            disabled={isLoading || !isFormValid}
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? "Starting Scan..." : "Run GEO Analysis"}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Free analysis • Takes 30-60 seconds • No signup required
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
