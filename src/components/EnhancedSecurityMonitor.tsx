import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  Users,
  Lock,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { SessionManager } from './SessionManager';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: any;
  ip_address: string | null;
  timestamp: string;
}

interface SecurityCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

interface SecurityStats {
  totalEvents: number;
  failedLogins: number;
  lockedAccounts: number;
  activeSessions: number;
}

export const EnhancedSecurityMonitor: React.FC = () => {
  const { isAdmin } = useSecureAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadSecurityData();
    }
  }, [isAdmin]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSecurityEvents(),
        loadSecurityChecks(),
        loadSecurityStats()
      ]);
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityEvents = async () => {
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    // Type cast the data to match our interface
    const typedData = (data || []).map(event => ({
      ...event,
      ip_address: event.ip_address as string | null,
      event_data: event.event_data as any
    }));
    setSecurityEvents(typedData);
  };

  const loadSecurityChecks = async () => {
    // Simulate security checks - in a real app, these would come from actual security audits
    const checks: SecurityCheck[] = [
      {
        name: 'RLS Policies Enabled',
        status: 'pass',
        message: 'All tables have Row Level Security enabled'
      },
      {
        name: 'Failed Login Monitoring',
        status: 'pass',
        message: 'Failed login attempts are being tracked'
      },
      {
        name: 'Session Management',
        status: 'pass',
        message: 'User sessions are properly managed and tracked'
      },
      {
        name: 'Security Event Logging',
        status: 'pass',
        message: 'Security events are being logged to database'
      },
      {
        name: 'Account Lockout Protection',
        status: 'pass',
        message: 'Account lockout is active after failed attempts'
      }
    ];

    setSecurityChecks(checks);
  };

  const loadSecurityStats = async () => {
    try {
      const [eventsResponse, failedLoginsResponse, sessionsResponse] = await Promise.all([
        supabase.from('security_events').select('*', { count: 'exact', head: true }),
        supabase.from('failed_login_attempts')
          .select('*', { count: 'exact', head: true })
          .gte('attempt_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_sessions')
          .select('*', { count: 'exact', head: true })
          .gt('expires_at', new Date().toISOString())
      ]);

      setSecurityStats({
        totalEvents: eventsResponse.count || 0,
        failedLogins: failedLoginsResponse.count || 0,
        lockedAccounts: 0, // Would need to calculate based on failed attempts
        activeSessions: sessionsResponse.count || 0
      });
    } catch (error) {
      console.error('Failed to load security stats:', error);
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

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('FAILED') || eventType.includes('BLOCKED')) {
      return 'destructive';
    }
    if (eventType.includes('SUCCESS') || eventType.includes('LOGIN')) {
      return 'default';
    }
    return 'secondary';
  };

  if (!isAdmin) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Access denied. Administrator privileges required to view security monitoring.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Monitor</CardTitle>
          <CardDescription>Loading security data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Security Monitor</h2>
          <p className="text-muted-foreground">
            Comprehensive security monitoring and management
          </p>
        </div>
        <Button onClick={loadSecurityData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Stats */}
      {securityStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{securityStats.totalEvents}</p>
                  <p className="text-sm text-muted-foreground">Security Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{securityStats.failedLogins}</p>
                  <p className="text-sm text-muted-foreground">Failed Logins (24h)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{securityStats.lockedAccounts}</p>
                  <p className="text-sm text-muted-foreground">Locked Accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{securityStats.activeSessions}</p>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="checks">Security Checks</TabsTrigger>
          <TabsTrigger value="sessions">Session Management</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Latest security events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.length === 0 ? (
                  <p className="text-muted-foreground">No security events found.</p>
                ) : (
                  securityEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getEventTypeColor(event.event_type) as any}>
                              {event.event_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            IP: {event.ip_address || 'Unknown'} | 
                            User: {event.user_id ? event.user_id.substring(0, 8) + '...' : 'Anonymous'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks">
          <Card>
            <CardHeader>
              <CardTitle>Security Checks</CardTitle>
              <CardDescription>
                System security health checks and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityChecks.map((check, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-medium">{check.name}</p>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};