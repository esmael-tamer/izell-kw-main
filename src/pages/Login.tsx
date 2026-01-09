import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Mail, AlertTriangle, Shield } from 'lucide-react';
import { 
  checkLoginRateLimit, 
  logSecurityEvent, 
  isValidEmail,
  sanitizeInput,
  SECURITY_CONFIG 
} from '@/lib/security';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // تنظيف المدخلات
    const cleanEmail = sanitizeInput(email.trim().toLowerCase());
    
    // التحقق من صحة البريد الإلكتروني
    if (!isValidEmail(cleanEmail)) {
      toast({
        title: 'خطأ',
        description: 'البريد الإلكتروني غير صالح',
        variant: 'destructive',
      });
      return;
    }
    
    // التحقق من Rate Limit
    const rateLimitCheck = checkLoginRateLimit(cleanEmail);
    if (!rateLimitCheck.allowed) {
      setIsBlocked(true);
      setBlockTimeRemaining(rateLimitCheck.resetIn);
      logSecurityEvent('rate_limit', `Login blocked for ${cleanEmail} - too many attempts`);
      
      toast({
        title: 'تم حظر تسجيل الدخول مؤقتاً',
        description: `تم تجاوز الحد المسموح. حاول مرة أخرى بعد ${Math.ceil(rateLimitCheck.resetIn / 60)} دقيقة`,
        variant: 'destructive',
      });
      
      // بدء العد التنازلي
      const timer = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return;
    }
    
    setIsLoading(true);
    logSecurityEvent('login_attempt', `Login attempt for ${cleanEmail}`);

    const { error } = await signIn(cleanEmail, password);

    if (error) {
      logSecurityEvent('login_failure', `Login failed for ${cleanEmail}: ${error.message}`);
      
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: `البريد الإلكتروني أو كلمة المرور غير صحيحة (${rateLimitCheck.remaining} محاولات متبقية)`,
        variant: 'destructive',
      });
    } else {
      logSecurityEvent('login_success', `Login successful for ${cleanEmail}`);
      
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك في لوحة التحكم',
      });
      navigate('/admin');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-foreground mb-2">تسجيل الدخول</h1>
            <p className="text-muted-foreground text-sm">أدخل بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          {/* تحذير الحظر */}
          {isBlocked && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">تم حظر تسجيل الدخول مؤقتاً</p>
                <p className="text-xs text-destructive/80 mt-1">
                  تم تجاوز عدد المحاولات المسموح ({SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS} محاولات).
                  <br />
                  حاول مرة أخرى بعد: {Math.floor(blockTimeRemaining / 60)}:{String(blockTimeRemaining % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pr-10" 
                  required 
                  dir="ltr"
                  disabled={isBlocked}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pr-10 pl-10" 
                  required 
                  dir="ltr"
                  disabled={isBlocked}
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isBlocked}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12" 
              disabled={isLoading || isBlocked}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : isBlocked ? 'محظور مؤقتاً' : 'تسجيل الدخول'}
            </Button>
          </form>

          {/* معلومات الأمان */}
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              محمي بتشفير SSL وحماية متقدمة
            </p>
          </div>

          <div className="mt-4 text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-primary">العودة إلى الصفحة الرئيسية</a>
          </div>
        </div>
      </div>
    </div>
  );
}
