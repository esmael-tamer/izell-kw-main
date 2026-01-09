import { useState, useEffect } from 'react';
import { Star, ThumbsUp, User, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { fetchProductReviews, createReview, getProductRating, Review } from '@/lib/supabase-reviews';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setIsLoading(true);
    const [reviewsData, ratingData] = await Promise.all([
      fetchProductReviews(productId),
      getProductRating(productId),
    ]);
    setReviews(reviewsData);
    setRating(ratingData);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.comment.trim()) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    const result = await createReview({
      product_id: productId,
      customer_name: formData.name,
      customer_email: formData.email,
      rating: formData.rating,
      title: formData.title,
      comment: formData.comment,
      verified_purchase: false,
    });

    if (result) {
      toast({
        title: isAr ? 'شكراً لك! ✓' : 'Thank you! ✓',
        description: isAr ? 'تم إرسال تقييمك وسيتم مراجعته قريباً' : 'Your review has been submitted and will be reviewed soon',
      });
      setShowForm(false);
      setFormData({ ...formData, title: '', comment: '', rating: 5 });
    } else {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'Error, please try again',
        variant: 'destructive',
      });
    }
    
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isAr ? 'ar-KW' : 'en-KW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          aria-label={`${star} stars`}
        >
          <Star
            size={readonly ? 16 : 24}
            className={`${star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} transition-colors`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="mt-12 border-t border-slate-100 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="font-arabic text-2xl font-bold mb-2">
            {isAr ? 'تقييمات العملاء' : 'Customer Reviews'}
          </h2>
          <div className="flex items-center gap-3">
            <StarRating value={Math.round(rating.average)} readonly />
            <span className="font-arabic text-lg font-bold">{rating.average.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({rating.count} {isAr ? 'تقييم' : 'reviews'})
            </span>
          </div>
        </div>
        
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'default'}
        >
          {showForm ? (isAr ? 'إلغاء' : 'Cancel') : (isAr ? 'اكتب تقييماً' : 'Write a Review')}
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl p-6 mb-8 space-y-4">
          <h3 className="font-arabic text-lg font-bold mb-4">
            {isAr ? `تقييم: ${productName}` : `Review: ${productName}`}
          </h3>
          
          <div className="flex items-center gap-4">
            <span className="font-arabic text-sm">{isAr ? 'تقييمك:' : 'Your Rating:'}</span>
            <StarRating value={formData.rating} onChange={(v) => setFormData({ ...formData, rating: v })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-arabic text-sm text-muted-foreground mb-1 block">
                {isAr ? 'الاسم *' : 'Name *'}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isAr ? 'اسمك' : 'Your name'}
                className="font-arabic"
              />
            </div>
            <div>
              <label className="font-arabic text-sm text-muted-foreground mb-1 block">
                {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={isAr ? 'بريدك الإلكتروني' : 'Your email'}
              />
            </div>
          </div>

          <div>
            <label className="font-arabic text-sm text-muted-foreground mb-1 block">
              {isAr ? 'عنوان التقييم (اختياري)' : 'Review Title (optional)'}
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isAr ? 'ملخص تجربتك' : 'Summary of your experience'}
              className="font-arabic"
            />
          </div>

          <div>
            <label className="font-arabic text-sm text-muted-foreground mb-1 block">
              {isAr ? 'تقييمك *' : 'Your Review *'}
            </label>
            <Textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder={isAr ? 'شاركينا تجربتك مع المنتج...' : 'Share your experience with this product...'}
              className="font-arabic min-h-[120px]"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isAr ? 'إرسال التقييم' : 'Submit Review'
            )}
          </Button>
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-32 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-full mb-2" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <Star size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="font-arabic text-lg text-muted-foreground">
            {isAr ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
          </p>
          <p className="font-arabic text-sm text-muted-foreground mt-2">
            {isAr ? 'كوني أول من يقيّم هذا المنتج!' : 'Be the first to review this product!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-slate-50 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-arabic font-medium">{review.customer_name}</span>
                      {review.verified_purchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <Check size={12} />
                          {isAr ? 'مشتري موثق' : 'Verified'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                </div>
                <StarRating value={review.rating} readonly />
              </div>
              
              {review.title && (
                <h4 className="font-arabic font-bold mb-2">{review.title}</h4>
              )}
              <p className="font-arabic text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
