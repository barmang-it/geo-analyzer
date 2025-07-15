-- Fix Function Search Path Mutable issues by setting secure search_path
-- This prevents potential SQL injection and privilege escalation attacks

-- Fix cleanup_security_records function
CREATE OR REPLACE FUNCTION public.cleanup_security_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
$function$;

-- Fix is_account_locked function
CREATE OR REPLACE FUNCTION public.is_account_locked(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
$function$;

-- Fix trigger_cleanup_security_records function
CREATE OR REPLACE FUNCTION public.trigger_cleanup_security_records()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Run cleanup every 100 new security events
  IF (SELECT COUNT(*) FROM public.security_events) % 100 = 0 THEN
    PERFORM public.cleanup_security_records();
  END IF;
  
  RETURN NEW;
END;
$function$;