
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { ScanData } from "@/pages/Index";

interface ScanFormProps {
  onScanStart: (data: ScanData) => void;
}

export const ScanForm = ({ onScanStart }: ScanFormProps) => {
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim() || !websiteUrl.trim()) {
      return;
    }

    setIsLoading(true);
    
    // Format URL if needed
    let formattedUrl = websiteUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    onScanStart({
      businessName: businessName.trim(),
      websiteUrl: formattedUrl
    });
  };

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
            />
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
            />
          </div>
          
          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            disabled={isLoading || !businessName.trim() || !websiteUrl.trim()}
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
