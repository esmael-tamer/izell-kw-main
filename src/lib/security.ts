/**
 * Security Utilities for IZELL Store
 * يتضمن: تشفير البيانات، Rate Limiting، التحقق من الصلاحيات
 */

// ===========================================
// 🔐 DATA ENCRYPTION / DECRYPTION
// ===========================================

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'izell-kw-secure-key-2024';

/**
 * تشفير البيانات الحساسة
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // إنشاء مفتاح التشفير
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ENCRYPTION_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // إنشاء salt عشوائي
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // اشتقاق المفتاح
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // إنشاء IV عشوائي
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // تشفير البيانات
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );
    
    // دمج salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // تحويل إلى Base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('فشل في تشفير البيانات');
  }
}

/**
 * فك تشفير البيانات
 */
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    
    // تحويل من Base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );
    
    // استخراج salt, iv, و encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);
    
    // إنشاء مفتاح التشفير
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ENCRYPTION_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // اشتقاق المفتاح
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // فك التشفير
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('فشل في فك تشفير البيانات');
  }
}

/**
 * تشفير بسيط للبيانات الحساسة (للاستخدام السريع)
 */
export function simpleEncrypt(text: string): string {
  return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) => 
    String.fromCharCode(parseInt(p1, 16))
  ));
}

/**
 * فك التشفير البسيط
 */
export function simpleDecrypt(encoded: string): string {
  return decodeURIComponent(
    atob(encoded).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
}

// ===========================================
// ⏱️ RATE LIMITING
// ===========================================

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blocked: boolean;
  blockExpires?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxRequests: number;      // عدد الطلبات المسموح
  windowMs: number;         // الفترة الزمنية بالمللي ثانية
  blockDurationMs: number;  // مدة الحظر بالمللي ثانية
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000,        // دقيقة واحدة
  blockDurationMs: 300000 // 5 دقائق
};

const STRICT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60000,        // دقيقة واحدة
  blockDurationMs: 600000 // 10 دقائق
};

/**
 * التحقق من Rate Limit
 */
export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  // التحقق من الحظر
  if (entry?.blocked && entry.blockExpires && entry.blockExpires > now) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.blockExpires - now) / 1000)
    };
  }
  
  // إعادة تعيين إذا انتهت الفترة
  if (!entry || (now - entry.firstRequest) > config.windowMs) {
    rateLimitStore.set(identifier, {
      count: 1,
      firstRequest: now,
      blocked: false
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000)
    };
  }
  
  // زيادة العداد
  entry.count++;
  
  // التحقق من تجاوز الحد
  if (entry.count > config.maxRequests) {
    entry.blocked = true;
    entry.blockExpires = now + config.blockDurationMs;
    rateLimitStore.set(identifier, entry);
    
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil(config.blockDurationMs / 1000)
    };
  }
  
  rateLimitStore.set(identifier, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((config.windowMs - (now - entry.firstRequest)) / 1000)
  };
}

/**
 * Rate Limit لعمليات تسجيل الدخول
 */
export function checkLoginRateLimit(email: string): { allowed: boolean; remaining: number; resetIn: number } {
  return checkRateLimit(`login:${email}`, STRICT_RATE_LIMIT);
}

/**
 * Rate Limit لعمليات API
 */
export function checkApiRateLimit(userId: string, endpoint: string): { allowed: boolean; remaining: number; resetIn: number } {
  return checkRateLimit(`api:${userId}:${endpoint}`, DEFAULT_RATE_LIMIT);
}

/**
 * Rate Limit للبحث
 */
export function checkSearchRateLimit(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
  return checkRateLimit(`search:${identifier}`, {
    maxRequests: 30,
    windowMs: 60000,
    blockDurationMs: 120000
  });
}

/**
 * إعادة تعيين Rate Limit لمعرف معين
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * مسح جميع Rate Limits
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

// ===========================================
// 🛡️ INPUT VALIDATION & SANITIZATION
// ===========================================

/**
 * تنظيف النص من الأكواد الضارة (XSS Prevention)
 */
export function sanitizeInput(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من قوة كلمة المرور
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score++;
  else feedback.push('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
  
  if (password.length >= 12) score++;
  
  if (/[a-z]/.test(password)) score++;
  else feedback.push('أضف حروف صغيرة');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('أضف حروف كبيرة');
  
  if (/[0-9]/.test(password)) score++;
  else feedback.push('أضف أرقام');
  
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('أضف رموز خاصة');
  
  return {
    score,
    feedback,
    isStrong: score >= 4
  };
}

/**
 * التحقق من صحة رقم الهاتف الكويتي
 */
export function isValidKuwaitPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // أرقام الكويت تبدأ بـ 5, 6, 9 وطولها 8 أرقام
  return /^[569]\d{7}$/.test(cleaned);
}

/**
 * تنظيف رقم الهاتف
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// ===========================================
// 🔒 SESSION MANAGEMENT
// ===========================================

const SESSION_KEY = 'izell_session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 ساعة

interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

/**
 * إنشاء جلسة جديدة
 */
export function createSession(userId: string, email: string, role: 'admin' | 'user' = 'user'): void {
  const now = Date.now();
  const session: SessionData = {
    userId,
    email,
    role,
    createdAt: now,
    expiresAt: now + SESSION_EXPIRY,
    lastActivity: now
  };
  
  const encrypted = simpleEncrypt(JSON.stringify(session));
  localStorage.setItem(SESSION_KEY, encrypted);
}

/**
 * الحصول على الجلسة الحالية
 */
export function getSession(): SessionData | null {
  try {
    const encrypted = localStorage.getItem(SESSION_KEY);
    if (!encrypted) return null;
    
    const session: SessionData = JSON.parse(simpleDecrypt(encrypted));
    
    // التحقق من انتهاء الصلاحية
    if (Date.now() > session.expiresAt) {
      destroySession();
      return null;
    }
    
    return session;
  } catch {
    destroySession();
    return null;
  }
}

/**
 * تحديث نشاط الجلسة
 */
export function updateSessionActivity(): void {
  const session = getSession();
  if (session) {
    session.lastActivity = Date.now();
    const encrypted = simpleEncrypt(JSON.stringify(session));
    localStorage.setItem(SESSION_KEY, encrypted);
  }
}

/**
 * حذف الجلسة
 */
export function destroySession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * التحقق من صلاحية المسؤول
 */
export function isAdmin(): boolean {
  const session = getSession();
  return session?.role === 'admin';
}

// ===========================================
// 🔐 CSRF TOKEN
// ===========================================

const CSRF_KEY = 'izell_csrf_token';

/**
 * إنشاء CSRF Token
 */
export function generateCsrfToken(): string {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  sessionStorage.setItem(CSRF_KEY, token);
  return token;
}

/**
 * التحقق من CSRF Token
 */
export function verifyCsrfToken(token: string): boolean {
  const storedToken = sessionStorage.getItem(CSRF_KEY);
  return storedToken === token;
}

// ===========================================
// 📊 SECURITY LOGGING
// ===========================================

interface SecurityLog {
  timestamp: number;
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'rate_limit' | 'suspicious_activity';
  details: string;
  ip?: string;
  userAgent?: string;
}

const securityLogs: SecurityLog[] = [];
const MAX_LOGS = 1000;

/**
 * تسجيل حدث أمني
 */
export function logSecurityEvent(
  type: SecurityLog['type'],
  details: string
): void {
  const log: SecurityLog = {
    timestamp: Date.now(),
    type,
    details,
    userAgent: navigator.userAgent
  };
  
  securityLogs.unshift(log);
  
  // الاحتفاظ بآخر 1000 سجل فقط
  if (securityLogs.length > MAX_LOGS) {
    securityLogs.pop();
  }
  
  // إرسال تحذير للأحداث الخطيرة
  if (type === 'suspicious_activity' || type === 'rate_limit') {
    console.warn(`[SECURITY] ${type}: ${details}`);
  }
}

/**
 * الحصول على سجلات الأمان
 */
export function getSecurityLogs(limit: number = 100): SecurityLog[] {
  return securityLogs.slice(0, limit);
}

/**
 * مسح سجلات الأمان
 */
export function clearSecurityLogs(): void {
  securityLogs.length = 0;
}

// ===========================================
// 🛡️ SECURE API WRAPPER
// ===========================================

/**
 * Wrapper آمن لطلبات API
 */
export async function secureApiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  userId?: string
): Promise<T> {
  // التحقق من Rate Limit
  const rateLimitCheck = checkApiRateLimit(userId || 'anonymous', endpoint);
  if (!rateLimitCheck.allowed) {
    logSecurityEvent('rate_limit', `Rate limit exceeded for ${endpoint}`);
    throw new Error(`تم تجاوز الحد المسموح. حاول مرة أخرى بعد ${rateLimitCheck.resetIn} ثانية`);
  }
  
  // إضافة CSRF Token
  const csrfToken = generateCsrfToken();
  
  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', csrfToken);
  headers.set('X-Request-ID', crypto.randomUUID());
  
  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'same-origin'
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// تصدير الثوابت المفيدة
export const SECURITY_CONFIG = {
  SESSION_EXPIRY,
  MAX_LOGIN_ATTEMPTS: STRICT_RATE_LIMIT.maxRequests,
  LOGIN_BLOCK_DURATION: STRICT_RATE_LIMIT.blockDurationMs,
  API_RATE_LIMIT: DEFAULT_RATE_LIMIT.maxRequests,
  SEARCH_RATE_LIMIT: 30
};
