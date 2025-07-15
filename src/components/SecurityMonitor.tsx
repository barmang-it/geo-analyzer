import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

interface SecurityAudit {
  timestamp: string;
  checks: SecurityCheck[];
  recommendations: string[];
}

export const SecurityMonitor = () => {
  const { isAdmin } = useSecureAuth();
  const [auditData, setAuditData] = useState<SecurityAudit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      loadSecurityAudit();
      loadSecurityLogs();
    }
  }, [isAdmin]);

  const loadSecurityAudit = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      const { data, error } = await supabase.functions.invoke('security-audit', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setAuditData(data);
    } catch (error) {
      console.error('Error loading security audit:', error);
      toast.error('Failed to load security audit');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecurityLogs = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      setSecurityLogs(logs.slice(-10)); // Show last 10 logs
    } catch (error) {
      console.error('Error loading security logs:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Security Monitor</h2>
        </div>
        <Button 
          onClick={loadSecurityAudit} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {auditData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Security Audit</CardTitle>
              <CardDescription>
                Last updated: {new Date(auditData.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditData.checks.map((check, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{check.name}</span>
                        <Badge className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Actions to improve security posture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {auditData.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Last 10 security events from client-side monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityLogs.length === 0 ? (
            <p className="text-muted-foreground">No security events recorded.</p>
          ) : (
            <div className="space-y-2">
              {securityLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.event}</span>
                      <Badge variant="outline">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {JSON.stringify(log.details)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};