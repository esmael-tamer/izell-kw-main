import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Download,
  Calendar,
  Activity,
  FileText,
  Save,
  RotateCcw,
  LogOut,
  Loader2,
  Tag,
  RefreshCw,
  LayoutGrid
} from 'lucide-react';
import { Product, Order } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { SalesChart } from '@/components/SalesChart';
import { HomeContent, loadHomeContent, fetchHomeContent, saveHomeContent, resetHomeContent } from '@/lib/content';
import { loadProducts } from '@/lib/products';
import { ContentEditor } from '@/components/ContentEditor';
import { useAuth } from '@/contexts/AuthContext';
import { fetchOrders, updateOrderStatus, getOrderStats, SupabaseOrder } from '@/lib/supabase-orders';
import { fetchProducts } from '@/lib/supabase-products';
import { CouponManager } from '@/components/CouponManager';
import { OrderDetailModal } from '@/components/OrderDetailModal';
import { ProductManagement } from '@/components/ProductManagement';
import { CustomerManagement } from '@/components/CustomerManagement';
import { StoreSettings } from '@/components/StoreSettings';
import { OrderNotificationProvider } from '@/components/OrderNotifications';
import { SectionNamesManager } from '@/components/SectionNamesManager';
import { ReviewsManager } from '@/components/ReviewsManager';
import { Star } from 'lucide-react';

type TabType = 'dashboard' | 'orders' | 'products' | 'customers' | 'coupons' | 'reviews' | 'settings' | 'reports' | 'content' | 'sections';

const Admin = () => {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [productList, setProductList] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<SupabaseOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [homeContent, setHomeContent] = useState<HomeContent>(loadHomeContent());
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 });
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // جلب البيانات من Supabase
  const loadData = async () => {
    setLoading(true);
    try {
      // جلب الطلبات
      const ordersData = await fetchOrders();
      setOrders(ordersData || []);
      
      // جلب المنتجات
      const productsData = await fetchProducts();
      if (productsData.length > 0) {
        setProductList(productsData);
      } else {
        setProductList(loadProducts());
      }

      // جلب محتوى الموقع من Supabase
      const contentData = await fetchHomeContent();
      setHomeContent(contentData);

      // حساب الإحصائيات
      const orderStats = await getOrderStats();
      const deliveredCount = ordersData?.filter(o => o.status === 'delivered').length || 0;
      setStats({
        totalOrders: orderStats.totalOrders || ordersData?.length || 0,
        totalRevenue: orderStats.totalRevenue || 0,
        pendingOrders: orderStats.pendingOrders || 0,
        deliveredOrders: deliveredCount,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setProductList(loadProducts());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // تحديث حالة الطلب
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
    type OrderStatus = typeof validStatuses[number];
    
    if (!validStatuses.includes(newStatus as OrderStatus)) {
      return;
    }
    
    setUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, newStatus as OrderStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as OrderStatus } : order
      ));
      toast({
        title: i18n.language === 'ar' ? 'تم التحديث' : 'Updated',
        description: i18n.language === 'ar' ? 'تم تحديث حالة الطلب بنجاح' : 'Order status updated successfully',
      });
    } catch (error) {
      toast({
        title: i18n.language === 'ar' ? 'خطأ' : 'Error',
        description: i18n.language === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update order status',
        variant: 'destructive',
      });
    }
    setUpdatingStatus(null);
  };

  // فتح تفاصيل الطلب
  const handleViewOrder = (order: SupabaseOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const totalRevenue = stats.totalRevenue;
  const totalOrders = stats.totalOrders;
  const pendingOrders = stats.pendingOrders;

  const filteredProducts = useMemo(() => {
    return productList.filter(p =>
      p.nameAr.includes(searchQuery) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.includes(searchQuery)
    );
  }, [productList, searchQuery]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    // فلتر حسب الحالة
    if (orderFilter !== 'all') {
      filtered = filtered.filter(o => o.status === orderFilter);
    }
    
    // فلتر حسب البحث
    if (orderSearchQuery.trim()) {
      const query = orderSearchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.customer_name?.toLowerCase().includes(query) ||
        o.customer_phone?.includes(query) ||
        o.order_number?.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query)
      );
    }
    
    // فلتر حسب التاريخ
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.created_at);
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [orderFilter, orders, orderSearchQuery, dateFilter]);

  // تصدير الطلبات كـ CSV
  const exportOrdersCSV = () => {
    const headers = ['رقم الطلب', 'العميل', 'الهاتف', 'المبلغ', 'الحالة', 'التاريخ'];
    const rows = filteredOrders.map(order => [
      order.order_number || order.id.slice(0, 8),
      order.customer_name,
      order.customer_phone,
      order.total.toFixed(3),
      order.status,
      new Date(order.created_at).toLocaleDateString('ar-KW')
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: i18n.language === 'ar' ? 'تم التصدير' : 'Exported',
      description: i18n.language === 'ar' ? `تم تصدير ${filteredOrders.length} طلب` : `Exported ${filteredOrders.length} orders`,
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProductList(productList.filter((p) => p.id !== id));
    toast({
      title: t('admin.deleteProduct'),
      description: i18n.language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully',
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: Clock,
          label: i18n.language === 'ar' ? 'قيد الانتظار' : 'Pending'
        };
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: CheckCircle,
          label: i18n.language === 'ar' ? 'مؤكد' : 'Confirmed'
        };
      case 'processing':
        return {
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: Package,
          label: i18n.language === 'ar' ? 'قيد التجهيز' : 'Processing'
        };
      case 'shipped':
        return {
          color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          icon: Truck,
          label: i18n.language === 'ar' ? 'تم الشحن' : 'Shipped'
        };
      case 'delivered':
        return {
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: CheckCircle,
          label: i18n.language === 'ar' ? 'تم التسليم' : 'Delivered'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertCircle,
          label: i18n.language === 'ar' ? 'ملغي' : 'Cancelled'
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: AlertCircle,
          label: status
        };
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'تم تسجيل الخروج',
      description: 'نراك قريباً!',
    });
    navigate('/login');
  };

  return (
    <OrderNotificationProvider>
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row admin-panel" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-x border-border md:h-screen sticky top-0 z-30 shadow-sm hidden md:flex flex-col">
        <div className="p-8 border-b border-slate-50">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-xl transition-transform group-hover:scale-110">i</div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 leading-none">izel</h1>
              <p className="font-arabic text-[10px] uppercase font-bold tracking-widest text-primary mt-1">{t('admin.title')}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'dashboard' as TabType, icon: LayoutDashboard, label: i18n.language === 'ar' ? 'لوحة التحكم' : 'Dashboard' },
            { id: 'orders' as TabType, icon: ShoppingCart, label: t('admin.orders') },
            { id: 'products' as TabType, icon: Package, label: i18n.language === 'ar' ? 'المنتجات' : 'Products' },
            { id: 'customers' as TabType, icon: Users, label: i18n.language === 'ar' ? 'العملاء' : 'Customers' },
            { id: 'coupons' as TabType, icon: Tag, label: i18n.language === 'ar' ? 'الكوبونات' : 'Coupons' },
            { id: 'reviews' as TabType, icon: Star, label: i18n.language === 'ar' ? 'التقييمات' : 'Reviews' },
            { id: 'sections' as TabType, icon: LayoutGrid, label: i18n.language === 'ar' ? 'أسماء الأقسام' : 'Sections' },
            { id: 'content' as TabType, icon: FileText, label: i18n.language === 'ar' ? 'إدارة المحتوى' : 'Content' },
            { id: 'settings' as TabType, icon: Activity, label: i18n.language === 'ar' ? 'الإعدادات' : 'Settings' },
            { id: 'reports' as TabType, icon: BarChart3, label: i18n.language === 'ar' ? 'التقارير' : 'Reports' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-admin font-semibold transition-all duration-200 ${activeTab === item.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'opacity-100' : 'opacity-60'} />
              <span>{item.label}</span>
              {activeTab === item.id && (
                <div className={`mr-auto ${i18n.language === 'ar' ? 'rotate-180' : ''}`}>
                  <ChevronRight size={16} className="opacity-60" />
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 font-arabic text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ArrowRight size={16} className={i18n.language === 'ar' ? '' : 'rotate-180'} />
            <span>{i18n.language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 border border-red-200 font-arabic text-sm font-bold text-red-600 hover:bg-red-100 transition-all"
          >
            <LogOut size={16} />
            <span>{i18n.language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Mobile Header - Improved */}
        <div className="md:hidden bg-white border-b border-border sticky top-0 z-40">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-3">
            <Link to="/" className="font-display text-xl font-bold text-primary">izel</Link>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 rounded-lg bg-slate-100 text-slate-600"
                aria-label="Refresh"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg bg-red-50 text-red-600"
                aria-label="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          
          {/* Mobile Tab Navigation - Scrollable */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex p-2 gap-1 min-w-max">
              {[
                { id: 'dashboard' as TabType, icon: LayoutDashboard, label: i18n.language === 'ar' ? 'الرئيسية' : 'Home' },
                { id: 'orders' as TabType, icon: ShoppingCart, label: i18n.language === 'ar' ? 'الطلبات' : 'Orders' },
                { id: 'products' as TabType, icon: Package, label: i18n.language === 'ar' ? 'المنتجات' : 'Products' },
                { id: 'customers' as TabType, icon: Users, label: i18n.language === 'ar' ? 'العملاء' : 'Customers' },
                { id: 'coupons' as TabType, icon: Tag, label: i18n.language === 'ar' ? 'الكوبونات' : 'Coupons' },
                { id: 'content' as TabType, icon: FileText, label: i18n.language === 'ar' ? 'المحتوى' : 'Content' },
                { id: 'sections' as TabType, icon: LayoutGrid, label: i18n.language === 'ar' ? 'الأقسام' : 'Sections' },
                { id: 'settings' as TabType, icon: Activity, label: i18n.language === 'ar' ? 'الإعدادات' : 'Settings' },
                { id: 'reports' as TabType, icon: BarChart3, label: i18n.language === 'ar' ? 'التقارير' : 'Reports' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-admin font-semibold whitespace-nowrap transition-all ${
                    activeTab === item.id 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6 md:space-y-8">
          {/* Header Section */}
          <div>
            <h2 className="font-admin text-xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && (i18n.language === 'ar' ? 'أهلاً بك' : 'Welcome')}
              {activeTab === 'orders' && (i18n.language === 'ar' ? 'الطلبات' : 'Orders')}
              {activeTab === 'products' && (i18n.language === 'ar' ? 'المنتجات' : 'Products')}
              {activeTab === 'customers' && (i18n.language === 'ar' ? 'العملاء' : 'Customers')}
              {activeTab === 'coupons' && (i18n.language === 'ar' ? 'الكوبونات' : 'Coupons')}
              {activeTab === 'reviews' && (i18n.language === 'ar' ? 'التقييمات' : 'Reviews')}
              {activeTab === 'sections' && (i18n.language === 'ar' ? 'الأقسام' : 'Sections')}
              {activeTab === 'settings' && (i18n.language === 'ar' ? 'الإعدادات' : 'Settings')}
              {activeTab === 'reports' && (i18n.language === 'ar' ? 'التقارير' : 'Reports')}
              {activeTab === 'content' && (i18n.language === 'ar' ? 'المحتوى' : 'Content')}
            </h2>
            <p className="font-admin text-slate-500 mt-1 text-sm md:text-base hidden md:block">
              {activeTab === 'dashboard' && (i18n.language === 'ar' ? 'إليك تحديثات متجرك لهذا اليوم' : 'Here are your store updates for today')}
              {activeTab === 'orders' && (i18n.language === 'ar' ? `لديك ${orders.length} طلب إجمالي` : `You have ${orders.length} total orders`)}
              {activeTab === 'products' && (i18n.language === 'ar' ? 'إضافة وتعديل وحذف المنتجات' : 'Add, edit and delete products')}
              {activeTab === 'customers' && (i18n.language === 'ar' ? 'عرض وإدارة بيانات العملاء' : 'View and manage customer data')}
              {activeTab === 'coupons' && (i18n.language === 'ar' ? 'إنشاء وإدارة كوبونات الخصم' : 'Create and manage discount coupons')}
              {activeTab === 'reviews' && (i18n.language === 'ar' ? 'مراجعة واعتماد تقييمات العملاء' : 'Review and approve customer ratings')}
              {activeTab === 'sections' && (i18n.language === 'ar' ? 'تخصيص عناوين أقسام الصفحة الرئيسية' : 'Customize home page section titles')}
              {activeTab === 'settings' && (i18n.language === 'ar' ? 'تخصيص إعدادات متجرك' : 'Customize your store settings')}
            </p>
          </div>
        </div>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 md:space-y-8 px-4 md:px-6 lg:px-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {[
                { label: i18n.language === 'ar' ? 'المبيعات' : 'Revenue', value: `${totalRevenue.toFixed(3)}`, unit: 'د.ك', trend: '+12.5%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: i18n.language === 'ar' ? 'الطلبات' : 'Orders', value: totalOrders.toString(), unit: '', trend: '+8.2%', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: i18n.language === 'ar' ? 'قيد الانتظار' : 'Pending', value: pendingOrders.toString(), unit: '', trend: '', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: i18n.language === 'ar' ? 'مكتملة' : 'Done', value: stats.deliveredOrders.toString(), unit: '', trend: '', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color}`}>
                      <stat.icon size={18} className="md:w-[22px] md:h-[22px]" />
                    </div>
                    {stat.trend && (
                      <span className="text-[10px] md:text-xs font-bold px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full bg-emerald-50 text-emerald-600 hidden sm:inline">
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-lg md:text-3xl font-price font-bold text-slate-900 stat-number">
                      {stat.value}<span className="text-xs md:text-sm mr-1">{stat.unit}</span>
                    </p>
                    <p className="font-admin text-[10px] md:text-sm text-slate-500 mt-0.5 md:mt-1 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}            </div>

            {/* Quick Sales Overview */}
            <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h3 className="font-admin text-base md:text-xl font-bold text-slate-900">
                    {i18n.language === 'ar' ? 'نظرة على المبيعات' : 'Sales Overview'}
                  </h3>
                  <p className="font-admin text-xs md:text-sm text-slate-500 mt-0.5">
                    {i18n.language === 'ar' ? 'آخر 7 أشهر' : 'Last 7 months'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-primary font-admin text-xs md:text-sm font-bold hover:underline flex items-center gap-1"
                >
                  {i18n.language === 'ar' ? 'التفاصيل' : 'Details'}
                  <ChevronRight size={14} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
              <SalesChart type="area" />
            </div>

            {/* Recent Orders - Mobile Cards / Desktop Table */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 md:p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-admin text-base md:text-xl font-bold text-slate-900">
                  {i18n.language === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}
                </h3>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-primary font-admin text-xs md:text-sm font-bold hover:underline"
                >
                  {i18n.language === 'ar' ? 'عرض الكل' : 'View All'}
                </button>
              </div>
              
              {/* Mobile View - Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => {
                  const style = getStatusInfo(order.status);
                  return (
                    <div key={order.id} className="p-4 hover:bg-slate-50/50" onClick={() => handleViewOrder(order)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-price text-sm font-bold text-slate-900">#{order.order_number || order.id.slice(0,6)}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${style.color}`}>
                          <style.icon size={10} />
                          {style.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-admin text-sm font-medium text-slate-700">{order.customer_name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5" dir="ltr">{order.customer_phone}</p>
                        </div>
                        <p className="font-price text-sm font-bold text-primary">{Number(order.total).toFixed(3)} د.ك</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto text-right">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-right">{i18n.language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-right">{i18n.language === 'ar' ? 'العميل' : 'Customer'}</th>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-right">{i18n.language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-center">{i18n.language === 'ar' ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.slice(0, 5).map((order) => {
                      const style = getStatusInfo(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => handleViewOrder(order)}>
                          <td className="px-6 py-4 font-price text-sm font-bold text-slate-900">{order.order_number || order.id.slice(0,8)}</td>
                          <td className="px-6 py-4 font-admin text-sm text-slate-600 font-medium">{order.customer_name}</td>
                          <td className="px-6 py-4 font-price text-sm font-bold text-primary">{Number(order.total).toFixed(3)} د.ك</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold font-admin ${style.color}`}>
                                <style.icon size={12} />
                                {style.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* Orders View */}
        {activeTab === 'orders' && (
          <div className="space-y-4 md:space-y-6 px-4 md:px-6 lg:px-10 animate-in fade-in duration-500">
            {/* Search and Filters Row - Mobile Optimized */}
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder={i18n.language === 'ar' ? 'بحث...' : 'Search...'}
                  className="w-full pr-10 pl-4 py-2.5 border-2 border-slate-200 rounded-xl font-admin text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              {/* Date Filter & Actions Row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Date Filters - Scrollable on mobile */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
                  {[
                    { value: 'all', label: i18n.language === 'ar' ? 'الكل' : 'All' },
                    { value: 'today', label: i18n.language === 'ar' ? 'اليوم' : 'Today' },
                    { value: 'week', label: i18n.language === 'ar' ? 'أسبوع' : 'Week' },
                    { value: 'month', label: i18n.language === 'ar' ? 'شهر' : 'Month' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setDateFilter(option.value as typeof dateFilter)}
                      className={`px-3 py-1.5 rounded-lg font-admin text-xs font-bold transition-all whitespace-nowrap ${
                        dateFilter === option.value
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              
                {/* Actions */}
                <div className="flex gap-1.5">
                  <button
                    onClick={exportOrdersCSV}
                    className="p-2 bg-emerald-50 text-emerald-700 rounded-lg font-admin font-bold hover:bg-emerald-100 transition-all"
                    aria-label={i18n.language === 'ar' ? 'تصدير' : 'Export'}
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-2 bg-primary/10 text-primary rounded-lg font-admin font-bold hover:bg-primary/20 transition-all"
                    aria-label={i18n.language === 'ar' ? 'تحديث' : 'Refresh'}
                  >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>
            </div>

            {/* Status Filters - Scrollable */}
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`px-3 md:px-5 py-2 rounded-xl font-admin text-xs md:text-sm font-bold transition-all whitespace-nowrap ${orderFilter === status
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-white border border-slate-200 text-slate-500'
                      }`}
                  >
                    {status === 'all' ? (i18n.language === 'ar' ? 'الكل' : 'All') : getStatusInfo(status).label}
                    {status !== 'all' && (
                      <span className="mr-1 text-[10px] opacity-70">
                        ({orders.filter(o => o.status === status).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-xs md:text-sm">
              <p className="font-admin text-slate-500">
                {i18n.language === 'ar' 
                  ? `${filteredOrders.length} من ${orders.length}`
                  : `${filteredOrders.length} of ${orders.length}`
                }
              </p>
            </div>

            {/* Orders List - Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredOrders.map((order) => {
                const style = getStatusInfo(order.status);
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-price text-sm font-bold text-slate-900">#{order.order_number || order.id.slice(0,6)}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${style.color}`}>
                        <style.icon size={10} />
                        {style.label}
                      </span>
                    </div>
                    
                    {/* Customer Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-admin text-sm font-semibold text-slate-800">{order.customer_name}</p>
                        <p className="text-[11px] text-slate-400" dir="ltr">{order.customer_phone}</p>
                      </div>
                      <p className="font-price text-base font-bold text-primary">{Number(order.total).toFixed(3)} د.ك</p>
                    </div>
                    
                    {/* Actions Row */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl font-admin text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label={i18n.language === 'ar' ? 'تغيير الحالة' : 'Change status'}
                      >
                        <option value="pending">{i18n.language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                        <option value="confirmed">{i18n.language === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
                        <option value="shipped">{i18n.language === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                        <option value="delivered">{i18n.language === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                        <option value="cancelled">{i18n.language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                      </select>
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2.5 bg-primary text-white rounded-xl"
                        aria-label={i18n.language === 'ar' ? 'عرض التفاصيل' : 'View details'}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                    
                    {/* Date */}
                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                      {new Date(order.created_at).toLocaleDateString('ar-KW')}
                    </p>
                  </div>
                );
              })}
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="font-admin text-sm text-slate-500">
                    {i18n.language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
                  </p>
                </div>
              )}
            </div>

            {/* Orders Table - Desktop */}
            <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto text-right">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-right">{i18n.language === 'ar' ? 'الطلب' : 'Order'}</th>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-right">{i18n.language === 'ar' ? 'العميل' : 'Customer'}</th>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-right">{i18n.language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-center">{i18n.language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-center">{i18n.language === 'ar' ? 'تغيير' : 'Change'}</th>
                      <th className="px-6 py-4 font-admin text-xs font-bold text-slate-400 uppercase tracking-widest text-center">{i18n.language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.map((order) => {
                      const style = getStatusInfo(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-price text-sm font-bold text-slate-900">{order.order_number || order.id.slice(0,8)}</td>
                          <td className="px-6 py-4">
                            <p className="font-admin text-sm font-semibold text-slate-900">{order.customer_name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5" dir="ltr">{order.customer_phone}</p>
                          </td>
                          <td className="px-6 py-4 font-price text-sm font-bold text-primary">{Number(order.total).toFixed(3)} د.ك</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold font-admin shadow-sm ${style.color}`}>
                                <style.icon size={12} />
                                {style.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center gap-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                disabled={updatingStatus === order.id}
                                className="px-3 py-2 border border-slate-200 rounded-xl font-admin text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                aria-label={i18n.language === 'ar' ? 'تغيير حالة الطلب' : 'Change order status'}
                              >
                                <option value="pending">{i18n.language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                                <option value="confirmed">{i18n.language === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
                                <option value="shipped">{i18n.language === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                                <option value="delivered">{i18n.language === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                                <option value="cancelled">{i18n.language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                              </select>
                              {updatingStatus === order.id && (
                                <Loader2 size={16} className="animate-spin text-primary" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-xl font-admin text-xs font-bold hover:bg-primary/20 transition-all"
                              >
                                <Eye size={14} />
                                <span>{i18n.language === 'ar' ? 'عرض' : 'View'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <p className="font-admin text-slate-500">
                    {i18n.language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products View */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in duration-500">
            <ProductManagement />
          </div>
        )}

        {/* Customers View */}
        {activeTab === 'customers' && (
          <div className="animate-in fade-in duration-500">
            <CustomerManagement />
          </div>
        )}

        {/* Coupons View */}
        {activeTab === 'coupons' && (
          <div className="animate-in fade-in duration-500">
            <CouponManager />
          </div>
        )}

        {/* Settings View */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-500">
            <StoreSettings />
          </div>
        )}

        {/* Reviews Management View */}
        {activeTab === 'reviews' && (
          <div className="animate-in fade-in duration-500 bg-white rounded-2xl border border-border/50 p-6 shadow-sm">
            <ReviewsManager />
          </div>
        )}

        {/* Sections Names View */}
        {activeTab === 'sections' && (
          <div className="animate-in fade-in duration-500 bg-white rounded-2xl border border-border/50 p-6 shadow-sm">
            <SectionNamesManager />
          </div>
        )}

        {/* Content Management View */}
        {activeTab === 'content' && (
          <ContentEditor
            content={homeContent}
            onContentChange={setHomeContent}
          />
        )}

        {/* Reports View */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Export */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-arabic text-2xl font-bold text-slate-900">
                  {i18n.language === 'ar' ? 'تحليلات المبيعات' : 'Sales Analytics'}
                </h3>
                <p className="font-arabic text-sm text-slate-500 mt-1">
                  {i18n.language === 'ar' ? 'آخر 7 أشهر' : 'Last 7 months'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toast({
                      title: i18n.language === 'ar' ? 'تصدير البيانات' : 'Export Data',
                      description: i18n.language === 'ar' ? 'جاري تحميل التقرير...' : 'Downloading report...'
                    });
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-arabic font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <Download size={18} />
                  <span>{i18n.language === 'ar' ? 'تصدير' : 'Export'}</span>
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-arabic font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                  <Calendar size={18} />
                  <span>{i18n.language === 'ar' ? 'الفترة' : 'Period'}</span>
                </button>
              </div>
            </div>

            {/* Chart Type Selector */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl w-fit">
              {(['area', 'line', 'bar'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-5 py-2 rounded-lg font-arabic text-sm font-bold transition-all ${chartType === type
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {type === 'area' && (i18n.language === 'ar' ? 'مساحة' : 'Area')}
                  {type === 'line' && (i18n.language === 'ar' ? 'خطي' : 'Line')}
                  {type === 'bar' && (i18n.language === 'ar' ? 'أعمدة' : 'Bar')}
                </button>
              ))}
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                {i18n.language === 'ar' ? 'نمو المبيعات والطلبات' : 'Sales & Orders Growth'}
              </h4>
              <SalesChart type={chartType} />
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Top Products */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <TrendingUp size={20} />
                  </div>
                  <h4 className="font-arabic text-lg font-bold text-slate-900">
                    {i18n.language === 'ar' ? 'الأكثر مبيعاً' : 'Top Products'}
                  </h4>
                </div>
                <div className="space-y-4">
                  {productList.slice(0, 3).map((product, idx) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-arabic text-sm font-bold text-slate-900 truncate">
                          {i18n.language === 'ar' ? product.nameAr : product.name}
                        </p>
                        <p className="font-display text-xs text-slate-400">{product.price.toFixed(2)} د.ك</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Activity size={20} />
                  </div>
                  <h4 className="font-arabic text-lg font-bold text-slate-900">
                    {i18n.language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
                  </h4>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-arabic text-sm font-bold text-slate-900">
                          {i18n.language === 'ar' ? 'طلب جديد' : 'New Order'} #{order.id.slice(0,8)}
                        </p>
                        <p className="font-arabic text-xs text-slate-400 mt-0.5">
                          {order.customer_name} • {Number(order.total).toFixed(3)} د.ك
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <BarChart3 size={20} />
                  </div>
                  <h4 className="font-arabic text-lg font-bold text-slate-900">
                    {i18n.language === 'ar' ? 'مؤشرات الأداء' : 'Performance'}
                  </h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-arabic text-xs text-slate-500">
                        {i18n.language === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}
                      </span>
                      <span className="font-display text-sm font-bold text-slate-900">12.5%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12.5%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-arabic text-xs text-slate-500">
                        {i18n.language === 'ar' ? 'متوسط قيمة الطلب' : 'Avg Order Value'}
                      </span>
                      <span className="font-display text-sm font-bold text-slate-900">185 د.ك</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-arabic text-xs text-slate-500">
                        {i18n.language === 'ar' ? 'رضا العملاء' : 'Customer Satisfaction'}
                      </span>
                      <span className="font-display text-sm font-bold text-slate-900">94%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
    </OrderNotificationProvider>
  );
};

export default Admin;
