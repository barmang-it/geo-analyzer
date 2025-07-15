-- Create security events table for server-side logging
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for security events
CREATE POLICY "Admins can view all security events" 
ON public.security_events 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- Create user sessions table for session management
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions" 
ON public.user_sessions 
FOR DELETE 
USING (user_id = auth.uid());

CREATE POLICY "System can insert sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (true);

-- Create failed login attempts table for account lockout
CREATE TABLE public.failed_login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT
);

-- Enable RLS on failed login attempts
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for failed login attempts
CREATE POLICY "Admins can view all failed attempts" 
ON public.failed_login_attempts 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "System can insert failed attempts" 
ON public.failed_login_attempts 
FOR INSERT 
WITH CHECK (true);

-- Create function to clean up old records
CREATE OR REPLACE FUNCTION public.cleanup_security_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove security events older than 90 days
  DELETE FROM public.security_events 
  WHERE created_at < now() - interval '90 days';
  
  -- Remove expired sessions
  DELETE FROM public.user_sessions 
  WHERE expires_at < now();
  
  -- Remove failed login attempts older than 24 hours
  DELETE FROM public.failed_login_attempts 
  WHERE attempt_time < now() - interval '24 hours';
END;
$$;

-- Create function to check account lockout
CREATE OR REPLACE FUNCTION public.is_account_locked(user_email TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*) INTO attempt_count
  FROM public.failed_login_attempts
  WHERE email = user_email
    AND attempt_time > now() - interval '15 minutes';
  
  -- Lock account if 5 or more failed attempts
  RETURN attempt_count >= 5;
END;
$$;

-- Create trigger for automatic cleanup
CREATE OR REPLACE FUNCTION public.trigger_cleanup_security_records()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Run cleanup every 100 new security events
  IF (SELECT COUNT(*) FROM public.security_events) % 100 = 0 THEN
    PERFORM public.cleanup_security_records();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER security_events_cleanup
AFTER INSERT ON public.security_events
FOR EACH ROW
EXECUTE FUNCTION public.trigger_cleanup_security_records();

-- Add indexes for performance
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_timestamp ON public.security_events(timestamp);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX idx_failed_login_attempts_time ON public.failed_login_attempts(attempt_time);