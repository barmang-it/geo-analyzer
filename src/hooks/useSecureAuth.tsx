import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SecurityService } from '@/services/securityService';
import { validateEmail, validatePassword, sanitizeInput } from '@/utils/security';
import { toast } from 'sonner';

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  sessionToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  checkAdminStatus: (userId: string) => Promise<boolean>;
  getUserSessions: () => Promise<any[]>;
  invalidateSession: (sessionToken: string) => Promise<void>;
}

const SecureAuthContext = createContext<SecureAuthContextType | null>(null);

export function SecureAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedEmail = sanitizeInput(email);
      
      if (!validateEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if account is locked
      const isLocked = await SecurityService.checkAccountLockout(sanitizedEmail);
      if (isLocked) {
        await SecurityService.logSecurityEvent({
          event_type: 'LOGIN_BLOCKED_ACCOUNT_LOCKED',
          event_data: { email: sanitizedEmail }
        });
        return { success: false, error: 'Account is temporarily locked due to multiple failed attempts' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        await SecurityService.logFailedLogin(sanitizedEmail);
        await SecurityService.logSecurityEvent({
          event_type: 'LOGIN_FAILED',
          event_data: { email: sanitizedEmail, error: error.message }
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create secure session
        const token = await SecurityService.createSession(data.user.id);
        setSessionToken(token);
        
        await SecurityService.logSecurityEvent({
          event_type: 'LOGIN_SUCCESS',
          event_data: { email: sanitizedEmail }
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedEmail = sanitizeInput(email);
      
      if (!validateEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email format' };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.message };
      }

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        await SecurityService.logSecurityEvent({
          event_type: 'SIGNUP_FAILED',
          event_data: { email: sanitizedEmail, error: error.message }
        });
        return { success: false, error: error.message };
      }

      await SecurityService.logSecurityEvent({
        event_type: 'SIGNUP_SUCCESS',
        event_data: { email: sanitizedEmail }
      });

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await SecurityService.invalidateSession(sessionToken);
      }

      await SecurityService.logSecurityEvent({
        event_type: 'LOGOUT',
        event_data: { user_id: user?.id }
      });

      await supabase.auth.signOut();
      setSessionToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserSessions = async () => {
    if (!user?.id) return [];
    return await SecurityService.getUserSessions(user.id);
  };

  const invalidateSession = async (token: string) => {
    await SecurityService.invalidateSession(token);
    if (token === sessionToken) {
      await logout();
    }
  };

  useEffect(() => {
    let sessionInterval: NodeJS.Timeout;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          const adminStatus = await checkAdminStatus(session.user.id);
          setIsAdmin(adminStatus);

          // Update session activity every 5 minutes
          if (sessionToken) {
            sessionInterval = setInterval(() => {
              SecurityService.updateSessionActivity(sessionToken);
            }, 5 * 60 * 1000);
          }

          // Log auth state change
          await SecurityService.logSecurityEvent({
            event_type: 'AUTH_STATE_CHANGE',
            event_data: { event, user_id: session.user.id }
          });
        } else {
          setIsAdmin(false);
          setSessionToken(null);
          if (sessionInterval) {
            clearInterval(sessionInterval);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (sessionInterval) {
        clearInterval(sessionInterval);
      }
    };
  }, [sessionToken]);

  const value = {
    user,
    session,
    loading,
    isAdmin,
    sessionToken,
    login,
    logout,
    signup,
    checkAdminStatus,
    getUserSessions,
    invalidateSession,
  };

  return (
    <SecureAuthContext.Provider value={value}>
      {children}
    </SecureAuthContext.Provider>
  );
}

export function useSecureAuth() {
  const context = useContext(SecureAuthContext);
  if (!context) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
}