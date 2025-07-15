import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { toast } from 'sonner';

interface UserSession {
  id: string;
  session_token: string;
  last_activity: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export const SessionManager: React.FC = () => {
  const { getUserSessions, invalidateSession, sessionToken } = useSecureAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const userSessions = await getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleInvalidateSession = async (token: string) => {
    try {
      await invalidateSession(token);
      toast.success('Session terminated successfully');
      await loadSessions();
    } catch (error) {
      console.error('Failed to invalidate session:', error);
      toast.error('Failed to terminate session');
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (userAgent.includes('Tablet')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Loading your active sessions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Active Sessions
        </CardTitle>
        <CardDescription>
          Manage your active sessions across different devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-muted-foreground">No active sessions found.</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getDeviceIcon(session.user_agent)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {session.user_agent.split(' ')[0]} Browser
                    </span>
                    {session.session_token === sessionToken && (
                      <Badge variant="secondary">Current Session</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>IP: {session.ip_address}</p>
                    <p>Last active: {formatLastActivity(session.last_activity)}</p>
                    <p>Started: {new Date(session.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              {session.session_token !== sessionToken && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleInvalidateSession(session.session_token)}
                >
                  Terminate
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};