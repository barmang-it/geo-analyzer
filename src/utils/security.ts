// Security utilities for input validation and sanitization

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
  }
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isRateLimited = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const requests = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  
  // Remove old requests outside the window
  const validRequests = requests.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (validRequests.length >= limit) {
    return true;
  }
  
  // Add current request
  validRequests.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validRequests));
  
  return false;
};

export const logSecurityEvent = async (event: string, details: Record<string, any>) => {
  // Import SecurityService dynamically to avoid circular dependencies
  const { SecurityService } = await import('@/services/securityService');
  
  await SecurityService.logSecurityEvent({
    event_type: event,
    event_data: details
  });
};
