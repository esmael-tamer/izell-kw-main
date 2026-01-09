import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { updateSessionActivity, logSecurityEvent } from '@/lib/security';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export function ProtectedRoute({ children, requiredRole = 'admin' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // تحديث نشاط الجلسة عند الوصول للصفحات المحمية
  useEffect(() => {
    if (user) {
      updateSessionActivity();
    }
  }, [user, location.pathname]);

  // تسجيل محاولات الوصول غير المصرح بها
  useEffect(() => {
    if (!loading && !user) {
      logSecurityEvent('suspicious_activity', `Unauthorized access attempt to ${location.pathname}`);
    }
  }, [loading, user, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
          </div>
          <p className="mt-4 text-muted-foreground font-arabic">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // حفظ الصفحة المطلوبة للرجوع إليها بعد تسجيل الدخول
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // التحقق من الصلاحيات (يمكن توسيعها لاحقاً)
  // if (requiredRole === 'admin' && !isAdmin()) {
  //   return <Navigate to="/" replace />;
  // }

  return <>{children}</>;
}
