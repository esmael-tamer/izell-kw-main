import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Tag, Percent, DollarSign, Calendar, Check, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { 
  fetchCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon, 
  toggleCouponStatus,
  Coupon 
} from '@/lib/supabase-coupons';

export function CouponManager() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    min_order: 0,
    max_discount: 0,
    usage_limit: 0,
    expires_at: '',
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCoupons();
      setCoupons(data);
      if (data.length === 0) {
        console.log('No coupons found - table might be empty or not exist');
      }
    } catch (err) {
      console.error('Error loading coupons:', err);
      setError(isAr ? 'فشل تحميل الكوبونات. تأكد من إنشاء جدول coupons في Supabase.' : 'Failed to load coupons. Make sure the coupons table exists in Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      min_order: 0,
      max_discount: 0,
      usage_limit: 0,
      expires_at: '',
      is_active: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.discount_type,
      value: coupon.discount_value,
      min_order: coupon.min_order_amount || 0,
      max_discount: 0,
      usage_limit: coupon.max_uses || 0,
      expires_at: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : '',
      is_active: coupon.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'يرجى إدخال كود الكوبون' : 'Please enter coupon code',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.type,
        discount_value: formData.value,
        min_order_amount: formData.min_order,
        max_uses: formData.usage_limit || null,
        valid_until: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_active: formData.is_active,
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData);
        toast({
          title: isAr ? 'تم التحديث' : 'Updated',
          description: isAr ? 'تم تحديث الكوبون بنجاح' : 'Coupon updated successfully',
        });
      } else {
        await createCoupon(couponData);
        toast({
          title: isAr ? 'تمت الإضافة' : 'Added',
          description: isAr ? 'تم إضافة الكوبون بنجاح' : 'Coupon added successfully',
        });
      }
      
      await loadCoupons();
      resetForm();
    } catch (err) {
      console.error('Error saving coupon:', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل حفظ الكوبون' : 'Failed to save coupon',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا الكوبون؟' : 'Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await deleteCoupon(id);
      toast({
        title: isAr ? 'تم الحذف' : 'Deleted',
        description: isAr ? 'تم حذف الكوبون بنجاح' : 'Coupon deleted successfully',
      });
      await loadCoupons();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل حذف الكوبون' : 'Failed to delete coupon',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await toggleCouponStatus(coupon.id, !coupon.is_active);
      toast({
        title: isAr ? 'تم التحديث' : 'Updated',
        description: coupon.is_active 
          ? (isAr ? 'تم تعطيل الكوبون' : 'Coupon disabled')
          : (isAr ? 'تم تفعيل الكوبون' : 'Coupon enabled'),
      });
      await loadCoupons();
    } catch (err) {
      console.error('Error toggling coupon status:', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحديث حالة الكوبون' : 'Failed to update coupon status',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return isAr ? 'غير محدد' : 'Not set';
    return new Date(dateString).toLocaleDateString(isAr ? 'ar-KW' : 'en-US');
  };

  const isExpired = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

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
          onClick={loadCoupons}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {isAr ? 'إعادة المحاولة' : 'Retry'}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          {isAr 
            ? 'تأكد من إنشاء جدول coupons في Supabase SQL Editor' 
            : 'Make sure to create the coupons table in Supabase SQL Editor'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {isAr ? 'إدارة الكوبونات' : 'Coupon Management'}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {isAr ? 'إضافة كوبون' : 'Add Coupon'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingCoupon ? (isAr ? 'تعديل الكوبون' : 'Edit Coupon') : (isAr ? 'إضافة كوبون جديد' : 'Add New Coupon')}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isAr ? 'كود الكوبون' : 'Coupon Code'}
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="SAVE20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700 mb-1">
                {isAr ? 'نوع الخصم' : 'Discount Type'}
              </label>
              <select
                id="discount_type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="percentage">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                <option value="fixed">{isAr ? 'مبلغ ثابت (د.ك)' : 'Fixed Amount (KWD)'}</option>
              </select>
            </div>

            <div>
              <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700 mb-1">
                {isAr ? 'قيمة الخصم' : 'Discount Value'}
              </label>
              <div className="relative">
                {formData.type === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  id="discount_value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  min="0"
                  step={formData.type === 'percentage' ? '1' : '0.5'}
                  max={formData.type === 'percentage' ? '100' : undefined}
                />
              </div>
            </div>

            <div>
              <label htmlFor="min_order" className="block text-sm font-medium text-gray-700 mb-1">
                {isAr ? 'الحد الأدنى للطلب' : 'Minimum Order'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="min_order"
                  type="number"
                  value={formData.min_order}
                  onChange={(e) => setFormData({ ...formData, min_order: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isAr ? 'عدد الاستخدامات المسموح' : 'Usage Limit'}
              </label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                min="0"
                placeholder={isAr ? '0 = غير محدود' : '0 = Unlimited'}
              />
            </div>

            <div>
              <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-1">
                {isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                {isAr ? 'الكوبون نشط' : 'Coupon is active'}
              </label>
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingCoupon ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إضافة' : 'Add')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {isAr ? 'لا توجد كوبونات حالياً' : 'No coupons found'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`bg-white border rounded-lg p-4 shadow-sm ${
                !coupon.is_active || isExpired(coupon.valid_until) ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${coupon.is_active ? 'bg-amber-100' : 'bg-gray-100'}`}>
                    {coupon.discount_type === 'percentage' ? (
                      <Percent className={`w-6 h-6 ${coupon.is_active ? 'text-amber-600' : 'text-gray-400'}`} />
                    ) : (
                      <DollarSign className={`w-6 h-6 ${coupon.is_active ? 'text-amber-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{coupon.code}</h3>
                      {!coupon.is_active && (
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                          {isAr ? 'معطل' : 'Disabled'}
                        </span>
                      )}
                      {isExpired(coupon.valid_until) && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">
                          {isAr ? 'منتهي' : 'Expired'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}% ${isAr ? 'خصم' : 'off'}`
                        : `${coupon.discount_value} ${isAr ? 'د.ك خصم' : 'KWD off'}`
                      }
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span>
                        {isAr ? 'الحد الأدنى:' : 'Min:'} {coupon.min_order_amount || 0} {isAr ? 'د.ك' : 'KWD'}
                      </span>
                      <span>
                        {isAr ? 'الاستخدامات:' : 'Uses:'} {coupon.current_uses || 0}
                        {coupon.max_uses ? `/${coupon.max_uses}` : ''}
                      </span>
                      <span>
                        {isAr ? 'ينتهي:' : 'Expires:'} {formatDate(coupon.valid_until)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(coupon)}
                    className={`p-2 rounded-lg transition-colors ${
                      coupon.is_active 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={coupon.is_active ? (isAr ? 'تعطيل' : 'Disable') : (isAr ? 'تفعيل' : 'Enable')}
                  >
                    {coupon.is_active ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title={isAr ? 'تعديل' : 'Edit'}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
