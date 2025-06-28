import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, TrendingUp, LogOut } from 'lucide-react';
import { UsageTracker } from '@/services/usageTracking';
import { useAuth } from '@/hooks/useAuth';
import { AdminLogin } from './AdminLogin';

export const CostMonitor = () => {
  const { isAdmin, logout } = useAuth();
  const [usageInfo, setUsageInfo] = useState(UsageTracker.getInstance().getUsageInfo());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsageInfo(UsageTracker.getInstance().getUsageInfo());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Show login form if not admin
  if (!isAdmin) {
    return <AdminLogin />;
  }

  const budgetPercentage = ((5 - usageInfo.budgetRemaining) / 5) * 100;
  const isNearLimit = budgetPercentage > 80;

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardHeader 
        className="cursor-pointer pb-2" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Cost Protection Active (Admin)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isNearLimit ? "destructive" : "secondary"}>
              ${usageInfo.budgetRemaining.toFixed(2)} remaining
            </Badge>
            {isNearLimit && <AlertTriangle className="w-4 h-4 text-orange-500" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="h-6 w-6 p-0"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Daily Budget Usage</span>
                <span>${usageInfo.dailyCost.toFixed(4)} / $5.00</span>
              </div>
              <Progress value={budgetPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">Scans Today</span>
                </div>
                <p className="text-lg font-semibold">{usageInfo.dailyScans}</p>
              </div>
              
              <div>
                <div className="font-medium">Rate Limit Hits</div>
                <p className="text-lg font-semibold">{usageInfo.rateLimitHits}</p>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>Protection Features:</strong>
              <ul className="mt-1 space-y-1">
                <li>• 10 scans per hour per user</li>
                <li>• $5 daily budget limit</li>
                <li>• Automatic fallback to mock analysis</li>
                <li>• Real-time usage monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
