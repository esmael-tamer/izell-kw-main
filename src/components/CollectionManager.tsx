import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Collection, loadCollections, saveCollections, addCollection, updateCollection, deleteCollection, reorderCollections } from '@/lib/collections';
import { ImageUploader } from './ImageUploader';
import { toast } from '@/hooks/use-toast';

export function CollectionManager() {
    const { i18n } = useTranslation();
    const [collections, setCollections] = useState<Collection[]>(loadCollections());
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const handleCollectionsUpdate = () => {
            setCollections(loadCollections());
        };
        window.addEventListener('collectionsUpdated', handleCollectionsUpdate);
        return () => window.removeEventListener('collectionsUpdated', handleCollectionsUpdate);
    }, []);

    const handleAddNew = () => {
        setEditingCollection({
            id: '',
            nameAr: '',
            nameEn: '',
            image: '',
            link: '/shop',
            order: 0,
            enabled: true
        });
        setShowForm(true);
    };

    const handleEdit = (collection: Collection) => {
        setEditingCollection(collection);
        setShowForm(true);
    };

    const handleSave = () => {
        if (!editingCollection) return;

        if (!editingCollection.image || !editingCollection.nameEn || !editingCollection.nameAr) {
            toast({
                title: i18n.language === 'ar' ? 'خطأ' : 'Error',
                description: i18n.language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
                variant: 'destructive'
            });
            return;
        }

        if (editingCollection.id) {
            updateCollection(editingCollection.id, editingCollection);
        } else {
            addCollection(editingCollection);
        }

        setCollections(loadCollections());
        setShowForm(false);
        setEditingCollection(null);

        toast({
            title: i18n.language === 'ar' ? 'تم الحفظ' : 'Saved',
            description: i18n.language === 'ar' ? 'تم حفظ المجموعة بنجاح' : 'Collection saved successfully'
        });
    };

    const handleDelete = (id: string) => {
        if (confirm(i18n.language === 'ar' ? 'هل أنت متأكد من حذف هذه المجموعة؟' : 'Are you sure you want to delete this collection?')) {
            deleteCollection(id);
            setCollections(loadCollections());
            toast({
                title: i18n.language === 'ar' ? 'تم الحذف' : 'Deleted',
                description: i18n.language === 'ar' ? 'تم حذف المجموعة' : 'Collection deleted'
            });
        }
    };

    const handleReorder = (id: string, direction: 'up' | 'down') => {
        reorderCollections(id, direction);
        setCollections(loadCollections());
    };

    const handleToggleEnabled = (id: string, enabled: boolean) => {
        updateCollection(id, { enabled });
        setCollections(loadCollections());
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-arabic text-lg font-bold text-slate-900">
                        {i18n.language === 'ar' ? 'إدارة المجموعات' : 'Manage Collections'}
                    </h4>
                    <p className="font-arabic text-sm text-slate-500 mt-1">
                        {i18n.language === 'ar' ? `${collections.length} مجموعة` : `${collections.length} collections`}
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-arabic font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                >
                    <Plus size={18} />
                    <span>{i18n.language === 'ar' ? 'إضافة مجموعة' : 'Add Collection'}</span>
                </button>
            </div>

            {/* Collections List */}
            {!showForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collections.map((collection, index) => (
                        <div key={collection.id} className="bg-white p-4 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
                            <div className="flex gap-4">
                                {/* Preview */}
                                <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                                    {collection.image && (
                                        <img src={collection.image} alt={collection.nameEn} className="w-full h-full object-cover" />
                                    )}
                                    {!collection.enabled && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <EyeOff className="text-white" size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-arabic font-bold text-slate-900 truncate">
                                        {i18n.language === 'ar' ? collection.nameAr : collection.nameEn}
                                    </h5>
                                    <p className="font-display text-xs text-primary mt-1 truncate">
                                        → {collection.link}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 mt-3">
                                        <button
                                            onClick={() => handleToggleEnabled(collection.id, !collection.enabled)}
                                            className={`p-1.5 rounded-lg transition-colors ${collection.enabled
                                                    ? 'hover:bg-green-50 text-green-600'
                                                    : 'hover:bg-slate-100 text-slate-400'
                                                }`}
                                            title={i18n.language === 'ar' ? (collection.enabled ? 'مفعّل' : 'معطّل') : (collection.enabled ? 'Enabled' : 'Disabled')}
                                        >
                                            {collection.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleReorder(collection.id, 'up')}
                                            disabled={index === 0}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            title={i18n.language === 'ar' ? 'تحريك لأعلى' : 'Move up'}
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleReorder(collection.id, 'down')}
                                            disabled={index === collections.length - 1}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            title={i18n.language === 'ar' ? 'تحريك لأسفل' : 'Move down'}
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(collection)}
                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                            title={i18n.language === 'ar' ? 'تعديل' : 'Edit'}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(collection.id)}
                                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                            title={i18n.language === 'ar' ? 'حذف' : 'Delete'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {collections.length === 0 && (
                        <div className="col-span-2 text-center py-12 bg-slate-50 rounded-2xl">
                            <p className="font-arabic text-slate-500">
                                {i18n.language === 'ar' ? 'لا توجد مجموعات. اضغط "إضافة مجموعة" للبدء' : 'No collections. Click "Add Collection" to start'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Collection Form */}
            {showForm && editingCollection && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
                    <h5 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                        {editingCollection.id
                            ? i18n.language === 'ar' ? 'تعديل المجموعة' : 'Edit Collection'
                            : i18n.language === 'ar' ? 'مجموعة جديدة' : 'New Collection'}
                    </h5>

                    <div className="space-y-6">
                        {/* Image Upload */}
                        <ImageUploader
                            currentImage={editingCollection.image}
                            onImageChange={(image) => setEditingCollection({ ...editingCollection, image })}
                            label={i18n.language === 'ar' ? 'صورة المجموعة *' : 'Collection Image *'}
                            aspectRatio="aspect-[3/4]"
                            maxSizeMB={3}
                        />

                        {/* Names */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'الاسم (إنجليزي) *' : 'Name (English) *'}
                                </label>
                                <input
                                    type="text"
                                    value={editingCollection.nameEn}
                                    onChange={(e) => setEditingCollection({ ...editingCollection, nameEn: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="OCCASIONS"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'الاسم (عربي) *' : 'Name (Arabic) *'}
                                </label>
                                <input
                                    type="text"
                                    value={editingCollection.nameAr}
                                    onChange={(e) => setEditingCollection({ ...editingCollection, nameAr: e.target.value })}
                                    dir="rtl"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="مناسبات"
                                />
                            </div>
                        </div>

                        {/* Link */}
                        <div>
                            <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                {i18n.language === 'ar' ? 'رابط المجموعة' : 'Collection Link'}
                            </label>
                            <input
                                type="text"
                                value={editingCollection.link}
                                onChange={(e) => setEditingCollection({ ...editingCollection, link: e.target.value })}
                                dir="ltr"
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="/shop?category=..."
                            />
                        </div>

                        {/* Enabled Toggle */}
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="font-arabic font-bold text-slate-900">
                                {i18n.language === 'ar' ? 'تفعيل المجموعة' : 'Enable Collection'}
                            </span>
                            <input
                                type="checkbox"
                                checked={editingCollection.enabled}
                                onChange={(e) => setEditingCollection({ ...editingCollection, enabled: e.target.checked })}
                                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                        </label>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingCollection(null);
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
