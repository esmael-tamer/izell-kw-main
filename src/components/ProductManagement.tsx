import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, Package, Search, Loader2, AlertCircle, 
  RefreshCw, Image, X, Save, DollarSign, Tag, Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  uploadProductImage,
  SupabaseProduct
} from '@/lib/supabase-products';
import { Product } from '@/lib/types';

interface ProductFormData {
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  original_price: number;
  category: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  is_featured: boolean;
  is_new: boolean;
  is_sale: boolean;
}

const initialFormData: ProductFormData = {
  name: '',
  name_ar: '',
  description: '',
  description_ar: '',
  price: 0,
  original_price: 0,
  category: '',
  image: '',
  images: [],
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['Black', 'White'],
  stock: 0,
  is_featured: false,
  is_new: false,
  is_sale: false,
};

const categories = [
  { value: 'dresses', labelAr: 'فساتين', labelEn: 'Dresses' },
  { value: 'abayas', labelAr: 'عبايات', labelEn: 'Abayas' },
  { value: 'bags', labelAr: 'حقائب', labelEn: 'Bags' },
  { value: 'accessories', labelAr: 'إكسسوارات', labelEn: 'Accessories' },
  { value: 'shoes', labelAr: 'أحذية', labelEn: 'Shoes' },
];

export function ProductManagement() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(isAr ? 'فشل تحميل المنتجات' : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_ar: product.nameAr,
      description: product.description || '',
      description_ar: product.descriptionAr || '',
      price: product.price,
      original_price: product.originalPrice || 0,
      category: product.category,
      image: product.image,
      images: product.images || [],
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Black', 'White'],
      stock: product.inStock ? 10 : 0,
      is_featured: false,
      is_new: product.isNew || false,
      is_sale: product.onSale || false,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadProductImage(file);
      setFormData({ ...formData, image: imageUrl });
      toast({
        title: isAr ? 'تم الرفع' : 'Uploaded',
        description: isAr ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully',
      });
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل رفع الصورة' : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.name_ar.trim()) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'يرجى إدخال اسم المنتج' : 'Please enter product name',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const productData: Omit<SupabaseProduct, 'id' | 'created_at'> = {
        name: formData.name,
        name_ar: formData.name_ar,
        description: formData.description,
        description_ar: formData.description_ar,
        price: formData.price,
        original_price: formData.original_price || undefined,
        category: formData.category,
        image: formData.image || '/placeholder.svg',
        images: formData.images,
        sizes: formData.sizes,
        colors: formData.colors,
        stock: formData.stock,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        is_sale: formData.is_sale,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: isAr ? 'تم التحديث' : 'Updated',
          description: isAr ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully',
        });
      } else {
        await createProduct(productData);
        toast({
          title: isAr ? 'تمت الإضافة' : 'Added',
          description: isAr ? 'تم إضافة المنتج بنجاح' : 'Product added successfully',
        });
      }
      
      await loadProducts();
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل حفظ المنتج' : 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(id);
      toast({
        title: isAr ? 'تم الحذف' : 'Deleted',
        description: isAr ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully',
      });
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل حذف المنتج' : 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameAr.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
          onClick={loadProducts}
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
        <h2 className="text-xl font-bold text-gray-900">
          {isAr ? 'إدارة المنتجات' : 'Product Management'}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {isAr ? 'إضافة منتج' : 'Add Product'}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث عن منتج...' : 'Search products...'}
            className="w-full pr-10 pl-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          aria-label={isAr ? 'فلتر التصنيف' : 'Category filter'}
        >
          <option value="all">{isAr ? 'كل التصنيفات' : 'All Categories'}</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {isAr ? cat.labelAr : cat.labelEn}
            </option>
          ))}
        </select>
        <button
          onClick={loadProducts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold">
                {editingProduct ? (isAr ? 'تعديل المنتج' : 'Edit Product') : (isAr ? 'إضافة منتج جديد' : 'Add New Product')}
              </h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg" aria-label={isAr ? 'إغلاق' : 'Close'}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name_en" className="block text-sm font-medium text-gray-700 mb-1">
                    {isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}
                  </label>
                  <input
                    id="name_en"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="name_ar" className="block text-sm font-medium text-gray-700 mb-1">
                    {isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}
                  </label>
                  <input
                    id="name_ar"
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="desc_en" className="block text-sm font-medium text-gray-700 mb-1">
                    {isAr ? 'الوصف بالإنجليزية' : 'Description (English)'}
                  </label>
                  <textarea
                    id="desc_en"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label htmlFor="desc_ar" className="block text-sm font-medium text-gray-700 mb-1">
                    {isAr ? 'الوصف بالعربية' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    id="desc_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    {isAr ? 'السعر' : 'Price'} (KWD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      step="0.5"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-1">
                    {isAr ? 'السعر الأصلي' : 'Original Price'}
                  </label>
                  <input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    step="0.5"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    {isAr ? 'المخزون' : 'Stock'}
                  </label>
                  <input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    {isAr ? 'التصنيف' : 'Category'}
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">{isAr ? 'اختر تصنيف' : 'Select Category'}</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {isAr ? cat.labelAr : cat.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isAr ? 'صورة المنتج' : 'Product Image'}
                </label>
                <div className="flex items-center gap-4">
                  {formData.image && (
                    <img src={formData.image} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                    <Image size={18} />
                    {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع صورة' : 'Upload Image')}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label={isAr ? 'حذف الصورة' : 'Remove image'}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isAr ? 'المقاسات المتاحة' : 'Available Sizes'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const sizes = formData.sizes.includes(size)
                          ? formData.sizes.filter(s => s !== size)
                          : [...formData.sizes, size];
                        setFormData({ ...formData, sizes });
                      }}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                        formData.sizes.includes(size)
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {isAr ? 'منتج مميز' : 'Featured'}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {isAr ? 'منتج جديد' : 'New'}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_sale}
                    onChange={(e) => setFormData({ ...formData, is_sale: e.target.checked })}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {isAr ? 'عرض خاص' : 'On Sale'}
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
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
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  {editingProduct ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إضافة' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{isAr ? `${filteredProducts.length} منتج` : `${filteredProducts.length} products`}</span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {isAr ? 'لا توجد منتجات' : 'No products found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative">
                <img
                  src={product.image}
                  alt={isAr ? product.nameAr : product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {product.isNew && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                      {isAr ? 'جديد' : 'NEW'}
                    </span>
                  )}
                  {product.onSale && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      {isAr ? 'خصم' : 'SALE'}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 truncate">
                  {isAr ? product.nameAr : product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-amber-600">{product.price.toFixed(3)} {isAr ? 'د.ك' : 'KWD'}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">{product.originalPrice.toFixed(3)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit size={16} />
                    {isAr ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    aria-label={isAr ? 'حذف المنتج' : 'Delete product'}
                  >
                    <Trash2 size={16} />
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
