import { useState, useEffect, useCallback } from 'react';
import { Bell, BellRing, Volume2, VolumeX, X, ShoppingBag, Clock, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'new_order' | 'order_status' | 'low_stock';
  title: string;
  message: string;
  order_id?: string;
  order_number?: string;
  is_read: boolean;
  created_at: string;
}

interface OrderNotificationProviderProps {
  children: React.ReactNode;
}

export function OrderNotificationProvider({ children }: OrderNotificationProviderProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastOrderCount, setLastOrderCount] = useState<number | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

  // Check for new orders
  const checkNewOrders = useCallback(async () => {
    try {
      const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // First run - just set the count
      if (lastOrderCount === null) {
        setLastOrderCount(count || 0);
        return;
      }

      // Check if we have new orders
      if (count && count > lastOrderCount) {
        const newOrdersCount = count - lastOrderCount;
        const newOrders = data?.slice(0, newOrdersCount) || [];
        
        newOrders.forEach(order => {
          const notification: Notification = {
            id: `order-${order.id}-${Date.now()}`,
            type: 'new_order',
            title: isAr ? 'طلب جديد!' : 'New Order!',
            message: isAr 
              ? `طلب جديد #${order.order_number} بقيمة ${order.total_amount?.toFixed(3)} د.ك`
              : `New order #${order.order_number} for ${order.total_amount?.toFixed(3)} KWD`,
            order_id: order.id,
            order_number: order.order_number,
            is_read: false,
            created_at: new Date().toISOString(),
          };

          setNotifications(prev => [notification, ...prev].slice(0, 20));
          
          // Show toast
          toast({
            title: notification.title,
            description: notification.message,
          });

          // Play sound
          playNotificationSound();
        });

        setLastOrderCount(count);
        setUnreadCount(prev => prev + newOrdersCount);
      }
    } catch (err) {
      console.error('Error checking orders:', err);
    }
  }, [lastOrderCount, isAr, playNotificationSound]);

  // Set up polling for new orders
  useEffect(() => {
    // Initial check
    checkNewOrders();

    // Poll every 30 seconds
    const interval = setInterval(checkNewOrders, 30000);

    return () => clearInterval(interval);
  }, [checkNewOrders]);

  // Set up real-time subscription (if Supabase realtime is enabled)
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as any;
          
          const notification: Notification = {
            id: `order-${order.id}-${Date.now()}`,
            type: 'new_order',
            title: isAr ? 'طلب جديد!' : 'New Order!',
            message: isAr 
              ? `طلب جديد #${order.order_number} بقيمة ${order.total_amount?.toFixed(3)} د.ك`
              : `New order #${order.order_number} for ${order.total_amount?.toFixed(3)} KWD`,
            order_id: order.id,
            order_number: order.order_number,
            is_read: false,
            created_at: new Date().toISOString(),
          };

          setNotifications(prev => [notification, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: notification.title,
            description: notification.message,
          });

          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAr, playNotificationSound]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return isAr ? 'الآن' : 'Just now';
    if (diff < 3600) return isAr ? `منذ ${Math.floor(diff / 60)} دقيقة` : `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return isAr ? `منذ ${Math.floor(diff / 3600)} ساعة` : `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString(isAr ? 'ar-KW' : 'en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      {children}
      
      {/* Notification Bell Button - Bottom right for mobile, integrated for desktop */}
      <div className="fixed bottom-24 left-4 md:bottom-auto md:top-4 md:left-auto md:right-20 z-40">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          aria-label={isAr ? 'الإشعارات' : 'Notifications'}
        >
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5 md:w-6 md:h-6 text-amber-600 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed bottom-40 left-4 md:bottom-auto md:top-16 md:left-auto md:right-4 z-50 w-72 md:w-80 max-h-[60vh] md:max-h-[70vh] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-900">
              {isAr ? 'الإشعارات' : 'Notifications'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                title={soundEnabled ? (isAr ? 'كتم الصوت' : 'Mute') : (isAr ? 'تفعيل الصوت' : 'Unmute')}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label={isAr ? 'إغلاق الإشعارات' : 'Close notifications'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[50vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{isAr ? 'لا توجد إشعارات' : 'No notifications'}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-amber-50/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'new_order' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <ShoppingBag className={`w-5 h-5 ${
                        notification.type === 'new_order' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5 truncate">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {formatTime(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={markAllAsRead}
                className="flex-1 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
              >
                <Eye size={14} className="inline mr-1" />
                {isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                {isAr ? 'مسح الكل' : 'Clear all'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hook to use notifications in any component
export function useOrderNotifications() {
  const [enabled, setEnabled] = useState(true);

  const toggleNotifications = () => setEnabled(!enabled);

  return { enabled, toggleNotifications };
}
