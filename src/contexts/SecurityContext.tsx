/**
 * Security Context Provider
 * يوفر طبقة حماية شاملة للتطبيق
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  logSecurityEvent,
  getSecurityLogs,
  clearSecurityLogs,
  updateSessionActivity,
  SECURITY_CONFIG
} from '@/lib/security';

interface SecurityContextType {
  isSecure: boolean;
  threatLevel: 'low' | 'medium' | 'high';
  lastSecurityCheck: number;
  securityLogs: ReturnType<typeof getSecurityLogs>;
  runSecurityCheck: () => void;
  clearLogs: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const { user } = useAuth();
  const [isSecure, setIsSecure] = useState(true);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [lastSecurityCheck, setLastSecurityCheck] = useState(Date.now());
  const [securityLogs, setSecurityLogs] = useState<ReturnType<typeof getSecurityLogs>>([]);

  // فحص أمني دوري
  const runSecurityCheck = () => {
    const logs = getSecurityLogs(50);
    setSecurityLogs(logs);

    // تحليل السجلات للكشف عن التهديدات
    const recentLogs = logs.filter(log => 
      Date.now() - log.timestamp < 15 * 60 * 1000 // آخر 15 دقيقة
    );

    const suspiciousCount = recentLogs.filter(
      log => log.type === 'suspicious_activity' || log.type === 'rate_limit'
    ).length;

    const failedLogins = recentLogs.filter(
      log => log.type === 'login_failure'
    ).length;

    // تحديد مستوى التهديد
    if (suspiciousCount >= 5 || failedLogins >= 10) {
      setThreatLevel('high');
      setIsSecure(false);
      logSecurityEvent('suspicious_activity', `High threat level detected: ${suspiciousCount} suspicious activities, ${failedLogins} failed logins`);
    } else if (suspiciousCount >= 2 || failedLogins >= 5) {
      setThreatLevel('medium');
      setIsSecure(true);
    } else {
      setThreatLevel('low');
      setIsSecure(true);
    }

    setLastSecurityCheck(Date.now());
  };

  const clearLogs = () => {
    clearSecurityLogs();
    setSecurityLogs([]);
    logSecurityEvent('logout', 'Security logs cleared by admin');
  };

  // فحص أمني عند تحميل التطبيق
  useEffect(() => {
    runSecurityCheck();

    // فحص دوري كل 5 دقائق
    const interval = setInterval(runSecurityCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // تتبع نشاط المستخدم
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      updateSessionActivity();
    };

    // الاستماع لأحداث المستخدم المهمة
    window.addEventListener('beforeunload', () => {
      logSecurityEvent('logout', `User session ended: ${user.email}`);
    });

    // تتبع نقرات الماوس على الأزرار الحساسة
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-security-action]')) {
        const action = target.closest('[data-security-action]')?.getAttribute('data-security-action');
        logSecurityEvent('suspicious_activity', `Security action triggered: ${action}`);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [user]);

  // كشف DevTools (اختياري - للتطوير يمكن تعطيله)
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // في الإنتاج يمكن تفعيل هذا
        // logSecurityEvent('suspicious_activity', 'DevTools detected');
      }
    };

    // تعطيل في التطوير
    if (import.meta.env.PROD) {
      window.addEventListener('resize', detectDevTools);
      return () => window.removeEventListener('resize', detectDevTools);
    }
  }, []);

  // حماية من copy/paste للبيانات الحساسة
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString() || '';
      // التحقق من نسخ بيانات حساسة
      if (selection.includes('@') || /\d{8,}/.test(selection)) {
        // يمكن تسجيل هذا كحدث
        // logSecurityEvent('suspicious_activity', 'Sensitive data copied');
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, []);

  return (
    <SecurityContext.Provider value={{
      isSecure,
      threatLevel,
      lastSecurityCheck,
      securityLogs,
      runSecurityCheck,
      clearLogs
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
