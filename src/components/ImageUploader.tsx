import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/lib/content';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
    currentImage?: string;
    onImageChange: (imageData: string) => void;
    label: string;
    aspectRatio?: string;
    maxSizeMB?: number;
}

export function ImageUploader({
    currentImage,
    onImageChange,
    label,
    aspectRatio = 'aspect-video',
    maxSizeMB = 2
}: ImageUploaderProps) {
    const { i18n } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | undefined>(currentImage);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            toast({
                title: i18n.language === 'ar' ? 'خطأ' : 'Error',
                description: i18n.language === 'ar' ? 'الرجاء اختيار صورة' : 'Please select an image file',
                variant: 'destructive'
            });
            return;
        }

        // التحقق من حجم الملف
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            toast({
                title: i18n.language === 'ar' ? 'خطأ' : 'Error',
                description: i18n.language === 'ar'
                    ? `حجم الصورة يجب أن يكون أقل من ${maxSizeMB} ميجا`
                    : `Image size must be less than ${maxSizeMB}MB`,
                variant: 'destructive'
            });
            return;
        }

        setIsUploading(true);
        try {
            const imageData = await uploadImage(file);
            setPreview(imageData);
            onImageChange(imageData);
            toast({
                title: i18n.language === 'ar' ? 'تم الرفع' : 'Uploaded',
                description: i18n.language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully'
            });
        } catch (error) {
            toast({
                title: i18n.language === 'ar' ? 'خطأ' : 'Error',
                description: i18n.language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image',
                variant: 'destructive'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(undefined);
        onImageChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast({
            title: i18n.language === 'ar' ? 'تم الحذف' : 'Removed',
            description: i18n.language === 'ar' ? 'تم حذف الصورة' : 'Image removed'
        });
    };

    return (
        <div className="space-y-3">
            <label className="block font-arabic text-sm font-bold text-slate-700">
                {label}
            </label>

            {preview ? (
                <div className="relative group">
                    <div className={`relative ${aspectRatio} w-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50`}>
                        <img
                            src={preview}
                            alt={label}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-white text-slate-900 rounded-lg font-arabic font-bold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
                            >
                                <Upload size={16} />
                                {i18n.language === 'ar' ? 'تغيير' : 'Change'}
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-arabic font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <X size={16} />
                                {i18n.language === 'ar' ? 'حذف' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`relative ${aspectRatio} w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-primary transition-all group ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        {isUploading ? (
                            <>
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="font-arabic text-sm text-slate-500">
                                    {i18n.language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="font-arabic font-bold text-slate-700 mb-1">
                                        {i18n.language === 'ar' ? 'انقر لرفع صورة' : 'Click to upload image'}
                                    </p>
                                    <p className="font-arabic text-xs text-slate-500">
                                        {i18n.language === 'ar' ? `حجم أقصى ${maxSizeMB} ميجا` : `Max ${maxSizeMB}MB`}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload image"
            />
        </div>
    );
}
