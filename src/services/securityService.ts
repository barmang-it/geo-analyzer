import { supabase } from "@/integrations/supabase/client";

export interface SecurityEvent {
  event_type: string;
  event_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  url?: string;
}

export class SecurityService {
  static async logSecurityEvent(event: SecurityEvent) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get client info
      const clientInfo = {
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        url: window.location.href
      };

      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: user?.id || null,
          event_type: event.event_type,
          event_data: event.event_data,
          ...clientInfo,
          ...event
        });

      if (error) {
        console.error('Failed to log security event:', error);
        // Fallback to local storage for critical events
        this.logToLocalStorage(event);
      }
    } catch (error) {
      console.error('Security logging error:', error);
      this.logToLocalStorage(event);
    }
  }

  private static logToLocalStorage(event: SecurityEvent) {
    const localLog = {
      timestamp: new Date().toISOString(),
      ...event,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('security_logs_fallback') || '[]');
    existingLogs.push(localLog);
    
    // Keep only last 50 logs in fallback
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50);
    }
    
    localStorage.setItem('security_logs_fallback', JSON.stringify(existingLogs));
  }

  private static async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  static async checkAccountLockout(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_account_locked', { user_email: email });
      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Failed to check account lockout:', error);
      return false;
    }
  }

  static async logFailedLogin(email: string) {
    try {
      const clientInfo = {
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('failed_login_attempts')
        .insert({
          email,
          ...clientInfo
        });

      if (error) {
        console.error('Failed to log failed login attempt:', error);
      }
    } catch (error) {
      console.error('Failed login logging error:', error);
    }
  }

  static async createSession(userId: string): Promise<string | null> {
    try {
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      const clientInfo = {
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          ...clientInfo
        });

      if (error) {
        console.error('Failed to create session:', error);
        return null;
      }

      return sessionToken;
    } catch (error) {
      console.error('Session creation error:', error);
      return null;
    }
  }

  static async updateSessionActivity(sessionToken: string) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Failed to update session activity:', error);
      }
    } catch (error) {
      console.error('Session activity update error:', error);
    }
  }

  static async invalidateSession(sessionToken: string) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Failed to invalidate session:', error);
      }
    } catch (error) {
      console.error('Session invalidation error:', error);
    }
  }

  static async getUserSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }
}
