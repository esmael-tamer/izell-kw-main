# ✅ IZELL KW - قائمة اختبار النشر

## 🔍 اختبارات ما بعد النشر

### 1. Backend Health Check
```bash
# افتح في المتصفح:
https://your-backend.railway.app/health

# يجب أن ترى:
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-10T...",
  "environment": "production"
}
```

### 2. Frontend Access
```bash
# افتح في المتصفح:
https://your-frontend.vercel.app

# يجب أن يحمل الموقع بدون أخطاء في Console
```

### 3. CORS Test
```bash
# افتح Frontend Console وشغّل:
fetch('https://your-backend.railway.app/products')
  .then(r => r.json())
  .then(console.log)

# يجب أن يعمل بدون CORS errors
```

### 4. Products API
```bash
curl https://your-backend.railway.app/products

# يجب أن ترى قائمة المنتجات
```

### 5. Store Settings API
```bash
curl https://your-backend.railway.app/store-settings

# يجب أن ترى إعدادات المتجر
```

### 6. Order Creation Test
```bash
# من Frontend، جرب:
# 1. إضافة منتجات إلى السلة
# 2. الذهاب إلى Checkout
# 3. إنشاء طلب
# 4. التحقق من Order Tracking
```

### 7. Admin Endpoint Test
```bash
# اختبر تحديث حالة الطلب:
curl -X PATCH \
  https://your-backend.railway.app/orders/admin/IZ-20260110-ABCD1234/status \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: your-admin-secret" \
  -d '{"status": "confirmed"}'

# يجب أن يعمل مع Admin Secret الصحيح فقط
```

### 8. Security Headers Check
```bash
# افتح DevTools → Network → اختر أي request
# تحقق من Headers:
# - Strict-Transport-Security
# - X-Content-Type-Options
# - X-Frame-Options
# - Content-Security-Policy
```

### 9. HTTPS Enforcement
```bash
# جرب فتح:
http://your-backend.railway.app/health

# يجب أن يُعاد توجيهك إلى:
https://your-backend.railway.app/health
```

### 10. Rate Limiting Test
```bash
# شغّل هذا 100 مرة:
for i in {1..100}; do
  curl -s https://your-backend.railway.app/products > /dev/null
  echo "Request $i"
done

# يجب أن ترى 429 Too Many Requests بعد الحد المسموح
```

---

## ⚠️ المشاكل الشائعة والحلول

### 🔴 Problem: CORS Error
**السبب:** FRONTEND_ORIGIN غير صحيح في Backend
**الحل:**
1. اذهب إلى Railway → Variables
2. تأكد من FRONTEND_ORIGIN = Vercel URL الكامل
3. احفظ وانتظر إعادة النشر

### 🔴 Problem: 500 Internal Server Error
**السبب:** متغيرات البيئة مفقودة
**الحل:**
1. تحقق من جميع Environment Variables في Railway
2. تأكد من SUPABASE_URL و SERVICE_ROLE_KEY صحيحين

### 🔴 Problem: Products not loading
**السبب:** Database tables غير موجودة
**الحل:**
1. اذهب إلى Supabase SQL Editor
2. شغّل جميع SQL files في `/supabase-*.sql`

### 🔴 Problem: Frontend shows API URL error
**السبب:** VITE_API_URL غير صحيح
**الحل:**
1. اذهب إلى Vercel → Settings → Environment Variables
2. تأكد من VITE_API_URL = Railway URL الكامل
3. Redeploy Frontend

---

## 🎯 Next Steps بعد النشر الناجح

1. **Custom Domain:**
   - Railway: اذهب إلى Settings → Domains
   - Vercel: اذهب إلى Settings → Domains
   - أضف domain الخاص بك

2. **SSL Certificate:**
   - Railway و Vercel يوفرون SSL مجاناً تلقائياً

3. **Monitoring:**
   - Railway Dashboard → Metrics
   - Vercel Dashboard → Analytics
   - راقب Errors و Usage

4. **Database Backups:**
   - Supabase: Settings → Database → Backups
   - فعّل Point-in-time Recovery

5. **Error Tracking:**
   - سجّل في Sentry.io (اختياري)
   - أضف Sentry DSN إلى Environment Variables

6. **Performance Monitoring:**
   - استخدم Vercel Analytics
   - راقب Backend logs في Railway

---

## 📞 روابط مهمة

- **Backend API:** https://your-backend.railway.app
- **Frontend:** https://your-frontend.vercel.app
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 🔐 أمان إضافي (موصى به)

1. **Enable 2FA:**
   - Railway Account Settings
   - Vercel Account Settings
   - Supabase Account Settings

2. **Rotate Secrets شهرياً:**
   - ADMIN_SECRET
   - API Keys

3. **Review Logs أسبوعياً:**
   - تحقق من محاولات الوصول غير المصرح بها
   - راقب Rate Limiting logs

4. **Database Security:**
   - فعّل Row Level Security في Supabase
   - راجع Database policies

---

✅ **إذا مرت جميع الاختبارات، مبروك! موقعك الآن Live! 🎉**
