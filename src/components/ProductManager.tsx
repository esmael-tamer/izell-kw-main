import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/lib/types';
import { loadProducts, addProduct, updateProduct, deleteProduct } from '@/lib/products';
import { ImageUploader } from './ImageUploader';
import { toast } from '@/hooks/use-toast';

export function ProductManager() {
    const { i18n } = useTranslation();
    const [products, setProducts] = useState<Product[]>(loadProducts());
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const handleProductsUpdate = () => {
            setProducts(loadProducts());
        };
        window.addEventListener('productsUpdated', handleProductsUpdate);
        return () => window.removeEventListener('productsUpdated', handleProductsUpdate);
    }, []);

    const handleAddNew = () => {
        setEditingProduct({
            id: '',
            name: '',
            nameAr: '',
            price: 0,
            image: '',
            images: [],
            category: 'dresses',
            description: '',
            descriptionAr: '',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: [],
            inStock: true,
            rating: 5,
            reviewCount: 0,
        });
        setShowForm(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct({ ...product });
        setShowForm(true);
    };

    const handleSave = () => {
        if (!editingProduct) return;

        if (!editingProduct.name || !editingProduct.nameAr || editingProduct.price <= 0) {
            toast({
                title: i18n.language === 'ar' ? 'خطأ' : 'Error',
                description: i18n.language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
                variant: 'destructive'
            });
            return;
        }

        if (editingProduct.id) {
            updateProduct(editingProduct.id, editingProduct);
        } else {
            addProduct(editingProduct);
        }

        setProducts(loadProducts());
        setShowForm(false);
        setEditingProduct(null);

        toast({
            title: i18n.language === 'ar' ? 'تم الحفظ' : 'Saved',
            description: i18n.language === 'ar' ? 'تم حفظ المنتج بنجاح' : 'Product saved successfully'
        });
    };

    const handleDelete = (id: string) => {
        if (confirm(i18n.language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
            deleteProduct(id);
            setProducts(loadProducts());
            toast({
                title: i18n.language === 'ar' ? 'تم الحذف' : 'Deleted',
                description: i18n.language === 'ar' ? 'تم حذف المنتج' : 'Product deleted'
            });
        }
    };

    const handleToggleStock = (id: string, inStock: boolean) => {
        updateProduct(id, { inStock });
        setProducts(loadProducts());
    };

    const handleAddImage = (image: string) => {
        if (!editingProduct) return;
        const newImages = [...(editingProduct.images || []), image];
        setEditingProduct({ ...editingProduct, images: newImages, image: editingProduct.image || image });
    };

    const handleRemoveImage = (index: number) => {
        if (!editingProduct) return;
        const newImages = (editingProduct.images || []).filter((_, i) => i !== index);
        setEditingProduct({
            ...editingProduct,
            images: newImages,
            image: newImages[0] || ''
        });
    };

    const handleAddColor = (color: string) => {
        if (!editingProduct || !color.trim()) return;
        if (!editingProduct.colors.includes(color.trim())) {
            setEditingProduct({
                ...editingProduct,
                colors: [...editingProduct.colors, color.trim()]
            });
        }
    };

    const handleRemoveColor = (color: string) => {
        if (!editingProduct) return;
        setEditingProduct({
            ...editingProduct,
            colors: editingProduct.colors.filter(c => c !== color)
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-arabic text-lg font-bold text-slate-900">
                        {i18n.language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}
                    </h4>
                    <p className="font-arabic text-sm text-slate-500 mt-1">
                        {i18n.language === 'ar' ? `${products.length} منتج` : `${products.length} products`}
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-arabic font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                >
                    <Plus size={18} />
                    <span>{i18n.language === 'ar' ? 'إضافة منتج' : 'Add Product'}</span>
                </button>
            </div>

            {/* Products List */}
            {!showForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
                            <div className="flex gap-4">
                                {/* Preview */}
                                <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                                    {product.image && (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    )}
                                    {!product.inStock && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <EyeOff className="text-white" size={20} />
                                        </div>
                                    )}
                                    {(product.images?.length ?? 0) > 1 && (
                                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                            +{(product.images?.length ?? 0) - 1}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-arabic font-bold text-slate-900 text-sm truncate">
                                        {i18n.language === 'ar' ? product.nameAr : product.name}
                                    </h5>
                                    <p className="font-arabic text-primary font-bold text-sm mt-1">
                                        {product.price} {i18n.language === 'ar' ? 'د.ك' : 'KWD'}
                                    </p>
                                    <p className="font-arabic text-xs text-slate-500 mt-1">
                                        {i18n.language === 'ar' ? 'المقاسات:' : 'Sizes:'} {product.sizes.join(', ')}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 mt-2">
                                        <button
                                            onClick={() => handleToggleStock(product.id, !product.inStock)}
                                            className={`p-1.5 rounded-lg transition-colors ${product.inStock
                                                ? 'hover:bg-green-50 text-green-600'
                                                : 'hover:bg-slate-100 text-slate-400'
                                                }`}
                                            title={i18n.language === 'ar' ? (product.inStock ? 'متوفر' : 'غير متوفر') : (product.inStock ? 'In Stock' : 'Out of Stock')}
                                        >
                                            {product.inStock ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                            title={i18n.language === 'ar' ? 'تعديل' : 'Edit'}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                            title={i18n.language === 'ar' ? 'حذف' : 'Delete'}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {products.length === 0 && (
                        <div className="col-span-3 text-center py-12 bg-slate-50 rounded-2xl">
                            <p className="font-arabic text-slate-500">
                                {i18n.language === 'ar' ? 'لا توجد منتجات. اضغط "إضافة منتج" للبدء' : 'No products. Click "Add Product" to start'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Product Form */}
            {showForm && editingProduct && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg max-h-[80vh] overflow-y-auto">
                    <h5 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                        {editingProduct.id
                            ? i18n.language === 'ar' ? 'تعديل المنتج' : 'Edit Product'
                            : i18n.language === 'ar' ? 'منتج جديد' : 'New Product'}
                    </h5>

                    <div className="space-y-6">
                        {/* Product Images */}
                        <div>
                            <h6 className="font-arabic text-md font-bold text-slate-800 mb-4">
                                {i18n.language === 'ar' ? 'صور المنتج' : 'Product Images'}
                            </h6>

                            {/* Existing Images */}
                            {(editingProduct.images?.length ?? 0) > 0 && (
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                    {(editingProduct.images || []).map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={img} alt={`Product ${idx + 1}`} className="w-full aspect-[3/4] object-cover rounded-xl" />
                                            <button
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label={i18n.language === 'ar' ? `حذف الصورة ${idx + 1}` : `Remove image ${idx + 1}`}
                                            >
                                                <X size={14} />
                                            </button>
                                            {idx === 0 && (
                                                <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded font-arabic">
                                                    {i18n.language === 'ar' ? 'رئيسية' : 'Main'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Image */}
                            <ImageUploader
                                currentImage=""
                                onImageChange={handleAddImage}
                                label={i18n.language === 'ar' ? 'إضافة صورة جديدة' : 'Add New Image'}
                                aspectRatio="aspect-[3/4]"
                                maxSizeMB={3}
                            />
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="product-name-en" className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'الاسم (إنجليزي) *' : 'Name (English) *'}
                                </label>
                                <input
                                    id="product-name-en"
                                    type="text"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="product-name-ar" className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'الاسم (عربي) *' : 'Name (Arabic) *'}
                                </label>
                                <input
                                    id="product-name-ar"
                                    type="text"
                                    value={editingProduct.nameAr}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                                    dir="rtl"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Price & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="product-price" className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'السعر (د.ك) *' : 'Price (KWD) *'}
                                </label>
                                <input
                                    id="product-price"
                                    type="number"
                                    value={editingProduct.price}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    step="0.5"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="product-category" className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'الفئة' : 'Category'}
                                </label>
                                <select
                                    id="product-category"
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="dresses">{i18n.language === 'ar' ? 'فساتين' : 'Dresses'}</option>
                                    <option value="bridal">{i18n.language === 'ar' ? 'عروس' : 'Bridal'}</option>
                                    <option value="new">{i18n.language === 'ar' ? 'جديد' : 'New'}</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer mt-6">
                                    <input
                                        type="checkbox"
                                        checked={editingProduct.inStock}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="font-arabic text-sm font-medium text-slate-700">
                                        {i18n.language === 'ar' ? 'متوفر' : 'In Stock'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="product-desc-en" className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                                </label>
                                <textarea
                                    id="product-desc-en"
                                    value={editingProduct.description}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="product-desc-ar" className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                                </label>
                                <textarea
                                    id="product-desc-ar"
                                    value={editingProduct.descriptionAr}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, descriptionAr: e.target.value })}
                                    rows={4}
                                    dir="rtl"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                {i18n.language === 'ar' ? 'المقاسات المتوفرة' : 'Available Sizes'}
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                    <label key={size} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={editingProduct.sizes.includes(size)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setEditingProduct({ ...editingProduct, sizes: [...editingProduct.sizes, size] });
                                                } else {
                                                    setEditingProduct({ ...editingProduct, sizes: editingProduct.sizes.filter(s => s !== size) });
                                                }
                                            }}
                                            className="rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="font-display text-sm font-medium">{size}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Colors */}
                        <div>
                            <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                {i18n.language === 'ar' ? 'الألوان المتوفرة' : 'Available Colors'}
                            </label>
                            <div className="flex gap-2 flex-wrap mb-3">
                                {editingProduct.colors.map((color, idx) => (
                                    <div key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg">
                                        <span className="font-arabic text-sm">{color}</span>
                                        <button 
                                            onClick={() => handleRemoveColor(color)} 
                                            className="text-red-500 hover:text-red-700"
                                            aria-label={i18n.language === 'ar' ? `حذف اللون ${color}` : `Remove color ${color}`}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={i18n.language === 'ar' ? 'أضف لون...' : 'Add color...'}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddColor(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingProduct(null);
                                }}
                                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-arabic font-bold hover:bg-slate-200 transition-all"
                            >
                                {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-arabic font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                            >
                                {i18n.language === 'ar' ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
