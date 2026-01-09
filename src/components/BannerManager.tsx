import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Image, Video, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Banner } from '@/components/HeroBanner';
import { loadBanners, saveBanners, addBanner, updateBanner, deleteBanner, reorderBanners } from '@/lib/banners';
import { ImageUploader } from './ImageUploader';
import { toast } from '@/hooks/use-toast';

// Video Uploader Component
function VideoUploader({ 
    currentVideo, 
    onVideoChange, 
    label 
}: { 
    currentVideo: string; 
    onVideoChange: (src: string) => void; 
    label: string;
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [videoUrl, setVideoUrl] = useState(currentVideo);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('video/')) {
            toast({
                title: 'خطأ',
                description: 'يرجى اختيار ملف فيديو صالح',
                variant: 'destructive',
            });
            return;
        }

        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            toast({
                title: 'خطأ',
                description: 'حجم الفيديو يجب أن يكون أقل من 50MB',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);

        try {
            // Convert to base64 for local storage (for demo)
            // In production, you should upload to Supabase Storage or similar
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setVideoUrl(base64);
                onVideoChange(base64);
                setIsUploading(false);
                toast({
                    title: 'تم الرفع',
                    description: 'تم رفع الفيديو بنجاح',
                });
            };
            reader.onerror = () => {
                setIsUploading(false);
                toast({
                    title: 'خطأ',
                    description: 'فشل في قراءة الفيديو',
                    variant: 'destructive',
                });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setIsUploading(false);
            toast({
                title: 'خطأ',
                description: 'فشل في رفع الفيديو',
                variant: 'destructive',
            });
        }
    };

    const handleUrlChange = (url: string) => {
        setVideoUrl(url);
        onVideoChange(url);
    };

    const handleRemove = () => {
        setVideoUrl('');
        onVideoChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            <label className="block font-arabic text-sm font-bold text-slate-700">
                {label} *
            </label>

            {/* Video Preview */}
            {videoUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                    <video
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        muted
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        title="حذف الفيديو"
                        aria-label="حذف الفيديو"
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Upload Options */}
            {!videoUrl && (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="video-upload"
                    />
                    <label
                        htmlFor="video-upload"
                        className="cursor-pointer"
                    >
                        <div className="flex flex-col items-center gap-3">
                            {isUploading ? (
                                <>
                                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    <p className="font-arabic text-slate-600">جاري الرفع...</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Upload className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-arabic font-bold text-slate-700">اضغط لرفع فيديو</p>
                                        <p className="font-arabic text-sm text-slate-500">MP4, WebM - حد أقصى 50MB</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </label>
                </div>
            )}

            {/* URL Input */}
            <div>
                <label className="block font-arabic text-xs text-slate-500 mb-1">
                    أو أدخل رابط الفيديو مباشرة
                </label>
                <input
                    type="url"
                    value={videoUrl.startsWith('data:') ? '' : videoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    dir="ltr"
                />
            </div>
        </div>
    );
}

export function BannerManager() {
    const { i18n } = useTranslation();
    const [banners, setBanners] = useState<Banner[]>(loadBanners());
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const handleBannersUpdate = () => {
            setBanners(loadBanners());
        };
        window.addEventListener('bannersUpdated', handleBannersUpdate);
        return () => window.removeEventListener('bannersUpdated', handleBannersUpdate);
    }, []);

    const handleAddNew = () => {
        setEditingBanner({
            id: '',
            type: 'image',
            src: '',
            titleAr: '',
            titleEn: '',
            subtitleAr: '',
            subtitleEn: '',
            ctaTextAr: '',
            ctaTextEn: '',
            ctaLink: '/shop'
        });
        setShowForm(true);
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setShowForm(true);
    };

    const handleSave = () => {
        if (!editingBanner) return;

        if (!editingBanner.src) {
            toast({
                title: i18n.language === 'ar' ? 'خطأ' : 'Error',
                description: i18n.language === 'ar' ? 'الرجاء إضافة صورة أو فيديو للبانر' : 'Please add an image or video for the banner',
                variant: 'destructive'
            });
            return;
        }

        if (editingBanner.id) {
            updateBanner(editingBanner.id, editingBanner);
        } else {
            addBanner(editingBanner);
        }

        setBanners(loadBanners());
        setShowForm(false);
        setEditingBanner(null);

        toast({
            title: i18n.language === 'ar' ? 'تم الحفظ' : 'Saved',
            description: i18n.language === 'ar' ? 'تم حفظ البانر بنجاح' : 'Banner saved successfully'
        });
    };

    const handleDelete = (id: string) => {
        if (confirm(i18n.language === 'ar' ? 'هل أنت متأكد من حذف هذا البانر؟' : 'Are you sure you want to delete this banner?')) {
            deleteBanner(id);
            setBanners(loadBanners());
            toast({
                title: i18n.language === 'ar' ? 'تم الحذف' : 'Deleted',
                description: i18n.language === 'ar' ? 'تم حذف البانر' : 'Banner deleted'
            });
        }
    };

    const handleReorder = (id: string, direction: 'up' | 'down') => {
        reorderBanners(id, direction);
        setBanners(loadBanners());
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-arabic text-lg font-bold text-slate-900">
                        {i18n.language === 'ar' ? 'إدارة البانرات' : 'Manage Banners'}
                    </h4>
                    <p className="font-arabic text-sm text-slate-500 mt-1">
                        {i18n.language === 'ar' ? `${banners.length} بانر` : `${banners.length} banners`}
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-arabic font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                >
                    <Plus size={18} />
                    <span>{i18n.language === 'ar' ? 'إضافة بانر' : 'Add Banner'}</span>
                </button>
            </div>

            {/* Banner List */}
            {!showForm && (
                <div className="space-y-4">
                    {banners.map((banner, index) => (
                        <div key={banner.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
                            <div className="flex gap-6">
                                {/* Preview */}
                                <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                                    {banner.src && (
                                        banner.type === 'video' ? (
                                            <>
                                                <video src={banner.src} className="w-full h-full object-cover" muted />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                    <Video className="w-6 h-6 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <img src={banner.src} alt={banner.titleEn} className="w-full h-full object-cover" />
                                        )
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h5 className="font-arabic font-bold text-slate-900">
                                        {i18n.language === 'ar' ? banner.titleAr : banner.titleEn}
                                    </h5>
                                    {(banner.subtitleAr || banner.subtitleEn) && (
                                        <p className="font-arabic text-sm text-slate-500 mt-1">
                                            {i18n.language === 'ar' ? banner.subtitleAr : banner.subtitleEn}
                                        </p>
                                    )}
                                    {banner.ctaLink && (
                                        <p className="font-display text-xs text-primary mt-2">
                                            → {banner.ctaLink}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleReorder(banner.id, 'up')}
                                        disabled={index === 0}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={i18n.language === 'ar' ? 'تحريك لأعلى' : 'Move up'}
                                    >
                                        <ChevronUp size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleReorder(banner.id, 'down')}
                                        disabled={index === banners.length - 1}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={i18n.language === 'ar' ? 'تحريك لأسفل' : 'Move down'}
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                        title={i18n.language === 'ar' ? 'تعديل' : 'Edit'}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                        title={i18n.language === 'ar' ? 'حذف' : 'Delete'}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {banners.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl">
                            <p className="font-arabic text-slate-500">
                                {i18n.language === 'ar' ? 'لا توجد بانرات. اضغط "إضافة بانر" للبدء' : 'No banners. Click "Add Banner" to start'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Banner Form */}
            {showForm && editingBanner && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
                    <h5 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                        {editingBanner.id
                            ? i18n.language === 'ar' ? 'تعديل البانر' : 'Edit Banner'
                            : i18n.language === 'ar' ? 'بانر جديد' : 'New Banner'}
                    </h5>

                    <div className="space-y-6">
                        {/* Media Type Selection */}
                        <div>
                            <label className="block font-arabic text-sm font-bold text-slate-700 mb-3">
                                {i18n.language === 'ar' ? 'نوع الوسائط' : 'Media Type'}
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingBanner({ ...editingBanner, type: 'image', src: '' })}
                                    className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-xl border-2 transition-all ${
                                        editingBanner.type === 'image'
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <Image size={24} />
                                    <span className="font-arabic font-bold">
                                        {i18n.language === 'ar' ? 'صورة' : 'Image'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingBanner({ ...editingBanner, type: 'video', src: '' })}
                                    className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-xl border-2 transition-all ${
                                        editingBanner.type === 'video'
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <Video size={24} />
                                    <span className="font-arabic font-bold">
                                        {i18n.language === 'ar' ? 'فيديو' : 'Video'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Image Upload */}
                        {editingBanner.type === 'image' && (
                            <ImageUploader
                                currentImage={editingBanner.src}
                                onImageChange={(src) => setEditingBanner({ ...editingBanner, src })}
                                label={i18n.language === 'ar' ? 'صورة البانر' : 'Banner Image'}
                                aspectRatio="aspect-[21/9]"
                                maxSizeMB={5}
                            />
                        )}

                        {/* Video Upload */}
                        {editingBanner.type === 'video' && (
                            <VideoUploader
                                currentVideo={editingBanner.src}
                                onVideoChange={(src) => setEditingBanner({ ...editingBanner, src })}
                                label={i18n.language === 'ar' ? 'فيديو البانر' : 'Banner Video'}
                            />
                        )}

                        {/* Titles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                                </label>
                                <input
                                    type="text"
                                    value={editingBanner.titleEn}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, titleEn: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Elegance Redefined"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                                </label>
                                <input
                                    type="text"
                                    value={editingBanner.titleAr}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, titleAr: e.target.value })}
                                    dir="rtl"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="أناقة بلا حدود"
                                />
                            </div>
                        </div>

                        {/* Subtitles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (English)'}
                                </label>
                                <textarea
                                    value={editingBanner.subtitleEn || ''}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitleEn: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Discover our exclusive collection"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}
                                </label>
                                <textarea
                                    value={editingBanner.subtitleAr || ''}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitleAr: e.target.value })}
                                    rows={2}
                                    dir="rtl"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="اكتشفي مجموعتنا الحصرية"
                                />
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'نص الزر (إنجليزي)' : 'Button Text (English)'}
                                </label>
                                <input
                                    type="text"
                                    value={editingBanner.ctaTextEn || ''}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaTextEn: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Shop Now"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'نص الزر (عربي)' : 'Button Text (Arabic)'}
                                </label>
                                <input
                                    type="text"
                                    value={editingBanner.ctaTextAr || ''}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaTextAr: e.target.value })}
                                    dir="rtl"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="تسوقي الآن"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'رابط الزر' : 'Button Link'}
                                </label>
                                <input
                                    type="text"
                                    value={editingBanner.ctaLink || ''}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaLink: e.target.value })}
                                    dir="ltr"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="/shop"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingBanner(null);
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
