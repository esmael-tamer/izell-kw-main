import { useState, useEffect } from 'react';
import { 
  Users, Search, Loader2, AlertCircle, RefreshCw, Mail, Phone, 
  MapPin, Calendar, ShoppingBag, Eye, X, DollarSign, Package
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  address: string;
  city: string;
  area: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

export function CustomerManagement() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch orders and aggregate by customer
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Group orders by email to create customer profiles
      const customerMap = new Map<string, Customer>();
      
      ordersData?.forEach(order => {
        const email = order.email || 'unknown@email.com';
        const existing = customerMap.get(email);
        
        if (existing) {
          existing.total_orders += 1;
          existing.total_spent += order.total_amount || 0;
          // Keep the latest order date
          if (new Date(order.created_at) > new Date(existing.created_at)) {
            existing.created_at = order.created_at;
          }
        } else {
          customerMap.set(email, {
            id: email, // Using email as unique identifier
            email: email,
            phone: order.phone || '',
            full_name: order.full_name || 'Guest',
            address: order.address || '',
            city: order.city || '',
            area: order.area || '',
            created_at: order.created_at,
            total_orders: 1,
            total_spent: order.total_amount || 0,
          });
        }
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (err) {
      console.error('Error loading customers:', err);
      setError(isAr ? 'فشل تحميل العملاء' : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (customer: Customer) => {
    setLoadingOrders(true);
    try {
      const { data, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('email', customer.email)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setCustomerOrders(data?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        items: order.items || [],
      })) || []);
    } catch (err) {
      console.error('Error loading customer orders:', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل الطلبات' : 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await loadCustomerOrders(customer);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      processing: { ar: 'قيد المعالجة', en: 'Processing' },
      shipped: { ar: 'تم الشحن', en: 'Shipped' },
      delivered: { ar: 'تم التوصيل', en: 'Delivered' },
      cancelled: { ar: 'ملغي', en: 'Cancelled' },
    };
    return isAr ? statusTexts[status]?.ar : statusTexts[status]?.en || status;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isAr ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.city.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadCustomers}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {isAr ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isAr ? 'إدارة العملاء' : 'Customer Management'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAr ? `${customers.length} عميل` : `${customers.length} customers`}
          </p>
        </div>
        <button
          onClick={loadCustomers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isAr ? 'بحث بالاسم، البريد، الهاتف...' : 'Search by name, email, phone...'}
          className="w-full pr-10 pl-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{customers.length}</div>
          <div className="text-sm opacity-80">{isAr ? 'إجمالي العملاء' : 'Total Customers'}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">
            {customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(3)}
          </div>
          <div className="text-sm opacity-80">{isAr ? 'إجمالي المبيعات' : 'Total Revenue'}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <Package className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">
            {customers.reduce((sum, c) => sum + c.total_orders, 0)}
          </div>
          <div className="text-sm opacity-80">{isAr ? 'إجمالي الطلبات' : 'Total Orders'}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <ShoppingBag className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">
            {customers.length > 0 
              ? (customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length).toFixed(3) 
              : '0.000'}
          </div>
          <div className="text-sm opacity-80">{isAr ? 'متوسط قيمة العميل' : 'Avg Customer Value'}</div>
        </div>
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {isAr ? 'لا يوجد عملاء' : 'No customers found'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    {isAr ? 'العميل' : 'Customer'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    {isAr ? 'الهاتف' : 'Phone'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    {isAr ? 'المدينة' : 'City'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    {isAr ? 'الطلبات' : 'Orders'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    {isAr ? 'إجمالي الإنفاق' : 'Total Spent'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    {isAr ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-600 font-bold">
                            {customer.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{customer.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                    <td className="px-4 py-3 text-gray-600" dir="ltr">{customer.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.city || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                        <ShoppingBag size={14} />
                        {customer.total_orders}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-600">
                        {customer.total_spent.toFixed(3)} {isAr ? 'د.ك' : 'KWD'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                      >
                        <Eye size={16} />
                        {isAr ? 'عرض' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold">
                {isAr ? 'تفاصيل العميل' : 'Customer Details'}
              </h3>
              <button 
                onClick={() => setSelectedCustomer(null)} 
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-2xl">
                    {selectedCustomer.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">{selectedCustomer.full_name}</h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {selectedCustomer.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      <span dir="ltr">{selectedCustomer.phone}</span>
                    </span>
                  </div>
                  {selectedCustomer.address && (
                    <div className="flex items-start gap-1 mt-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-0.5" />
                      <span>{selectedCustomer.address}, {selectedCustomer.area}, {selectedCustomer.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedCustomer.total_orders}</div>
                  <div className="text-sm text-gray-500">{isAr ? 'إجمالي الطلبات' : 'Total Orders'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedCustomer.total_spent.toFixed(3)}</div>
                  <div className="text-sm text-gray-500">{isAr ? 'إجمالي الإنفاق' : 'Total Spent'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {selectedCustomer.total_orders > 0 
                      ? (selectedCustomer.total_spent / selectedCustomer.total_orders).toFixed(3) 
                      : '0.000'}
                  </div>
                  <div className="text-sm text-gray-500">{isAr ? 'متوسط الطلب' : 'Avg Order'}</div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingBag size={18} />
                  {isAr ? 'سجل الطلبات' : 'Order History'}
                </h5>
                
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">{isAr ? 'لا توجد طلبات' : 'No orders found'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{order.order_number}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(order.created_at)}
                          </span>
                          <span className="font-semibold text-amber-600">
                            {order.total_amount.toFixed(3)} {isAr ? 'د.ك' : 'KWD'}
                          </span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              {order.items.map((item, idx) => (
                                <span key={idx}>
                                  {item.product_name} x{item.quantity}
                                  {idx < order.items.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
