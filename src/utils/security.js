// Security utilities for input sanitization and validation

export const sanitizeInput = (input, maxLength = 1000) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .replace(/\s+/g, ' '); // Normalize whitespace
};

export const validatePulseScore = (score) => {
  const num = parseInt(score);
  return !isNaN(num) && num >= 1 && num <= 5;
};

export const validateTextResponse = (text, minLength = 10, maxLength = 1000) => {
  const sanitized = sanitizeInput(text, maxLength);
  return sanitized.length >= minLength && sanitized.length <= maxLength;
};

export const validateFullReview = (text, minLength = 10, maxLength = 2000) => {
  const sanitized = sanitizeInput(text, maxLength);
  return sanitized.length >= minLength && sanitized.length <= maxLength;
};

export const addRandomDelay = () => {
  // Add random delay between 1-3 seconds to prevent timing attacks
  const delay = Math.random() * 2000 + 1000;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const generateAnonymousId = () => {
  // Generate a simple anonymous ID for tracking without personal data
  return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};
