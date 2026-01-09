import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Check, X, Trash2, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { fetchAllReviews, updateReviewStatus, deleteReview, Review } from '@/lib/supabase-reviews';
import { toast } from '@/hooks/use-toast';

export function ReviewsManager() {
    const { i18n } = useTranslation();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const loadReviews = async () => {
        setLoading(true);
        const data = await fetchAllReviews();
        setReviews(data);
        setLoading(false);
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleApprove = async (id: string) => {
        const success = await updateReviewStatus(id, 'approved');
        if (success) {
            setReviews(reviews.map(r => r.id === id ? { ...r, status: 'approved' } : r));
            toast({
                title: i18n.language === 'ar' ? 'تم الموافقة' : 'Approved',
                description: i18n.language === 'ar' ? 'تم اعتماد التقييم' : 'Review approved'
            });
        }
    };

    const handleReject = async (id: string) => {
        const success = await updateReviewStatus(id, 'rejected');
        if (success) {
            setReviews(reviews.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
            toast({
                title: i18n.language === 'ar' ? 'تم الرفض' : 'Rejected',
                description: i18n.language === 'ar' ? 'تم رفض التقييم' : 'Review rejected'
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(i18n.language === 'ar' ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Are you sure you want to delete this review?')) {
            return;
        }
        const success = await deleteReview(id);
        if (success) {
            setReviews(reviews.filter(r => r.id !== id));
            toast({
                title: i18n.language === 'ar' ? 'تم الحذف' : 'Deleted',
                description: i18n.language === 'ar' ? 'تم حذف التقييم' : 'Review deleted'
            });
        }
    };

    const filteredReviews = filter === 'all' 
        ? reviews 
        : reviews.filter(r => r.status === filter);

    const pendingCount = reviews.filter(r => r.status === 'pending').length;
    const approvedCount = reviews.filter(r => r.status === 'approved').length;
    const rejectedCount = reviews.filter(r => r.status === 'rejected').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <Clock size={12} />
                        {i18n.language === 'ar' ? 'قيد المراجعة' : 'Pending'}
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle size={12} />
                        {i18n.language === 'ar' ? 'معتمد' : 'Approved'}
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <XCircle size={12} />
                        {i18n.language === 'ar' ? 'مرفوض' : 'Rejected'}
                    </span>
                );
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-arabic text-lg font-bold text-slate-900">
                        {i18n.language === 'ar' ? 'إدارة التقييمات' : 'Reviews Management'}
                    </h4>
                    <p className="font-arabic text-sm text-slate-500 mt-1">
                        {i18n.language === 'ar' ? `${reviews.length} تقييم` : `${reviews.length} reviews`}
                    </p>
                </div>
                <button
                    onClick={loadReviews}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-arabic font-semibold hover:bg-slate-200 transition-all"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    <span>{i18n.language === 'ar' ? 'تحديث' : 'Refresh'}</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                        filter === 'all' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
                    }`}
                >
                    <p className="font-arabic text-2xl font-bold text-slate-900">{reviews.length}</p>
                    <p className="font-arabic text-sm text-slate-500">{i18n.language === 'ar' ? 'الكل' : 'All'}</p>
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                        filter === 'pending' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                >
                    <p className="font-arabic text-2xl font-bold text-amber-600">{pendingCount}</p>
                    <p className="font-arabic text-sm text-slate-500">{i18n.language === 'ar' ? 'قيد المراجعة' : 'Pending'}</p>
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                        filter === 'approved' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                >
                    <p className="font-arabic text-2xl font-bold text-emerald-600">{approvedCount}</p>
                    <p className="font-arabic text-sm text-slate-500">{i18n.language === 'ar' ? 'معتمد' : 'Approved'}</p>
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                        filter === 'rejected' ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                >
                    <p className="font-arabic text-2xl font-bold text-red-600">{rejectedCount}</p>
                    <p className="font-arabic text-sm text-slate-500">{i18n.language === 'ar' ? 'مرفوض' : 'Rejected'}</p>
                </button>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-12">
                    <RefreshCw size={32} className="animate-spin mx-auto text-slate-400" />
                    <p className="font-arabic text-slate-500 mt-4">
                        {i18n.language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <p className="font-arabic text-slate-500">
                        {i18n.language === 'ar' ? 'لا توجد تقييمات' : 'No reviews'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Customer Info */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="font-arabic font-bold text-primary">
                                                {review.customer_name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h5 className="font-arabic font-bold text-slate-900">
                                                {review.customer_name}
                                            </h5>
                                            {review.customer_email && (
                                                <p className="font-display text-xs text-slate-500">
                                                    {review.customer_email}
                                                </p>
                                            )}
                                        </div>
                                        {getStatusBadge(review.status)}
                                        {review.verified_purchase && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                <CheckCircle size={10} />
                                                {i18n.language === 'ar' ? 'مشتري موثق' : 'Verified'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating & Title */}
                                    <div className="flex items-center gap-3 mb-2">
                                        {renderStars(review.rating)}
                                        {review.title && (
                                            <span className="font-arabic font-semibold text-slate-900">
                                                {review.title}
                                            </span>
                                        )}
                                    </div>

                                    {/* Comment */}
                                    <p className="font-arabic text-slate-600 text-sm leading-relaxed">
                                        {review.comment}
                                    </p>

                                    {/* Date */}
                                    <p className="font-display text-xs text-slate-400 mt-3">
                                        {new Date(review.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {review.status !== 'approved' && (
                                        <button
                                            onClick={() => handleApprove(review.id)}
                                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                            title={i18n.language === 'ar' ? 'موافقة' : 'Approve'}
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                    {review.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleReject(review.id)}
                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                            title={i18n.language === 'ar' ? 'رفض' : 'Reject'}
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                                        title={i18n.language === 'ar' ? 'حذف' : 'Delete'}
                                    >
                                        <Trash2 size={18} />
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
