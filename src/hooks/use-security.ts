/**
 * Custom hook for security features
 * يوفر وظائف الأمان للمكونات
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  checkApiRateLimit,
  checkSearchRateLimit,
  logSecurityEvent,
  getSession,
  updateSessionActivity,
  sanitizeInput,
  isValidEmail,
  isValidKuwaitPhone,
  checkPasswordStrength,
  encryptData,
  decryptData,
  SECURITY_CONFIG
} from '@/lib/security';

/**
 * Hook للتحقق من Rate Limit
 */
export function useRateLimit() {
  const { user } = useAuth();

  const checkLimit = useCallback((endpoint: string) => {
    const userId = user?.id || 'anonymous';
    return checkApiRateLimit(userId, endpoint);
  }, [user?.id]);

  const checkSearch = useCallback((query: string) => {
    const identifier = user?.id || 'anonymous';
    const result = checkSearchRateLimit(identifier);
    
    if (!result.allowed) {
      logSecurityEvent('rate_limit', `Search rate limit exceeded for ${identifier}`);
    }
    
    return result;
  }, [user?.id]);

  return { checkLimit, checkSearch };
}

/**
 * Hook لتتبع نشاط الجلسة
 */
export function useSessionActivity() {
  const { user } = useAuth();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      const now = Date.now();
      // تحديث النشاط كل 5 دقائق كحد أقصى
      if (now - lastActivity > 5 * 60 * 1000) {
        updateSessionActivity();
        setLastActivity(now);
      }
    };

    // الاستماع لأحداث المستخدم
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [user, lastActivity]);

  return { lastActivity };
}

/**
 * Hook للتحقق من المدخلات
 */
export function useInputValidation() {
  const validateEmail = useCallback((email: string) => {
    const cleaned = sanitizeInput(email.trim().toLowerCase());
    return {
      value: cleaned,
      isValid: isValidEmail(cleaned),
      error: isValidEmail(cleaned) ? null : 'البريد الإلكتروني غير صالح'
    };
  }, []);

  const validatePhone = useCallback((phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return {
      value: cleaned,
      isValid: isValidKuwaitPhone(cleaned),
      error: isValidKuwaitPhone(cleaned) ? null : 'رقم الهاتف غير صالح (يجب أن يبدأ بـ 5, 6, أو 9)'
    };
  }, []);

  const validatePassword = useCallback((password: string) => {
    const result = checkPasswordStrength(password);
    return {
      value: password,
      isValid: result.isStrong,
      score: result.score,
      feedback: result.feedback,
      strength: result.score <= 2 ? 'weak' : result.score <= 4 ? 'medium' : 'strong'
    };
  }, []);

  const sanitize = useCallback((input: string) => {
    return sanitizeInput(input);
  }, []);

  return { validateEmail, validatePhone, validatePassword, sanitize };
}

/**
 * Hook للتشفير وفك التشفير
 */
export function useEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false);

  const encrypt = useCallback(async (data: string): Promise<string | null> => {
    setIsEncrypting(true);
    try {
      const encrypted = await encryptData(data);
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  const decrypt = useCallback(async (encryptedData: string): Promise<string | null> => {
    try {
      const decrypted = await decryptData(encryptedData);
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }, []);

  return { encrypt, decrypt, isEncrypting };
}

/**
 * Hook لتسجيل الأحداث الأمنية
 */
export function useSecurityLogger() {
  const { user } = useAuth();

  const log = useCallback((
    type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'rate_limit' | 'suspicious_activity',
    details: string
  ) => {
    const userInfo = user ? ` [User: ${user.email}]` : '';
    logSecurityEvent(type, `${details}${userInfo}`);
  }, [user]);

  return { log };
}

/**
 * Hook للحماية من الهجمات
 */
export function useSecurityProtection() {
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);

  useEffect(() => {
    // كشف محاولات الحقن
    const checkForInjection = (input: string): boolean => {
      const patterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi,
      ];
      return patterns.some(pattern => pattern.test(input));
    };

    // مراقبة مدخلات النماذج
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (target && target.value && checkForInjection(target.value)) {
        setSuspiciousActivity(true);
        logSecurityEvent('suspicious_activity', `Potential injection attempt detected: ${target.name || 'unknown field'}`);
        // يمكن إضافة إجراءات إضافية هنا
      }
    };

    document.addEventListener('input', handleInput);
    return () => document.removeEventListener('input', handleInput);
  }, []);

  return { suspiciousActivity };
}

/**
 * Hook شامل للأمان
 */
export function useSecurity() {
  const rateLimit = useRateLimit();
  const sessionActivity = useSessionActivity();
  const validation = useInputValidation();
  const encryption = useEncryption();
  const logger = useSecurityLogger();
  const protection = useSecurityProtection();

  return {
    ...rateLimit,
    ...sessionActivity,
    ...validation,
    ...encryption,
    ...logger,
    ...protection,
    config: SECURITY_CONFIG
  };
}

export default useSecurity;
