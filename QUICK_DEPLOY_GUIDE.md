# 🚀 دليل النشر السريع - IZELL KW

## 📦 ما تحتاجه قبل البدء

- [x] حساب Supabase (مجاني)
- [x] حساب Railway (مجاني للبداية)
- [x] حساب Vercel (مجاني)
- [x] حساب GitHub (موجود بالفعل)

---

## ⚡ النشر في 15 دقيقة

### 🟢 المرحلة 1: Supabase (5 دقائق)

1. **افتح:** https://supabase.com/dashboard
2. **أنشئ مشروع جديد** أو استخدم الموجود
3. **اذهب إلى SQL Editor** → New Query
4. **انسخ والصق** محتوى:
   ```
   /home/user/izell-kw-main/backend/migrations/001_order_tracking.sql
   ```
5. **Run** ✅

6. **احصل على API Keys:**
   - Settings → API
   - انسخ:
     - `URL` = `https://xxxxx.supabase.co`
     - `service_role` = `eyJhbGc...` (للـ Backend)
     - `anon` = `eyJhbGc...` (للـ Frontend)

---

### 🔵 المرحلة 2: Railway - Backend (5 دقائق)

1. **افتح:** https://railway.app
2. **Login with GitHub**
3. **New Project** → Deploy from GitHub
4. **اختر:** `esmael-tamer/izell-kw-main`
5. **Service Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Variables Tab** - أضف:
```env
PORT=3001
NODE_ENV=production
FRONTEND_ORIGIN=https://will-update-later.vercel.app
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...من-supabase
ADMIN_SECRET=0e955bfcfba9956833bc9adf22657b67ff4056dd73afc27512007c36e741ad4b
```

7. **Deploy** ✅
8. **انسخ URL** (مثل: `https://izell-backend.up.railway.app`)

---

### 🟣 المرحلة 3: Vercel - Frontend (5 دقائق)

1. **افتح:** https://vercel.com
2. **Login with GitHub**
3. **New Project** → Import `esmael-tamer/izell-kw-main`
4. **Framework:** Vite
5. **Root Directory:** اترك فارغ (root)

6. **Environment Variables** - أضف:
```env
VITE_API_URL=https://izell-backend.up.railway.app
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...من-supabase
VITE_MYFATOORAH_API_URL=https://api.myfatoorah.com
VITE_MYFATOORAH_API_KEY=your-key-here
```

7. **Deploy** ✅
8. **انسخ URL** (مثل: `https://izell-kw.vercel.app`)

---

### 🔄 المرحلة 4: تحديث CORS (دقيقة واحدة)

1. **ارجع إلى Railway Dashboard**
2. **Variables** → Edit `FRONTEND_ORIGIN`
3. **غيّر إلى:** `https://izell-kw.vercel.app` (URL من Vercel)
4. **Save** ✅ (سيعيد النشر تلقائياً)

---

## 🧪 اختبار سريع

### 1. Backend Health Check
```bash
# افتح في المتصفح:
https://your-backend.railway.app/health

# يجب أن ترى: "status": "healthy"
```

### 2. Frontend
```bash
# افتح:
https://your-frontend.vercel.app

# يجب أن يظهر الموقع بدون أخطاء
```

### 3. Products Loading
```bash
# في Frontend، اذهب إلى صفحة المنتجات
# يجب أن تُحمّل المنتجات من Supabase
```

---

## 🎯 الخطوة النهائية: Custom Domain (اختياري)

### Railway (Backend):
1. Settings → Domains → Generate Domain
2. أو أضف Custom Domain الخاص بك

### Vercel (Frontend):
1. Settings → Domains → Add
2. اتبع التعليمات لإعداد DNS

---

## 🆘 حل المشاكل السريع

### ❌ CORS Error
**الحل:** تأكد أن `FRONTEND_ORIGIN` في Railway = Vercel URL بالضبط

### ❌ 500 Error
**الحل:** تحقق من Environment Variables في Railway

### ❌ Products not loading
**الحل:** شغّل SQL migrations في Supabase مرة أخرى

### ❌ Build Failed
**الحل:** تحقق من Build logs في Railway/Vercel

---

## 📋 Environment Variables Checklist

### ✅ Railway (Backend):
- [x] PORT
- [x] NODE_ENV=production
- [x] FRONTEND_ORIGIN
- [x] SUPABASE_URL
- [x] SUPABASE_SERVICE_ROLE_KEY
- [x] ADMIN_SECRET

### ✅ Vercel (Frontend):
- [x] VITE_API_URL
- [x] VITE_SUPABASE_URL
- [x] VITE_SUPABASE_ANON_KEY
- [x] VITE_MYFATOORAH_API_URL
- [x] VITE_MYFATOORAH_API_KEY

---

## 🎉 إذا كل شيء يعمل:

**مبروك! موقعك الآن Live وجاهز للاستخدام! 🚀**

### الروابط النهائية:
- 🌐 **الموقع:** https://your-frontend.vercel.app
- 🔌 **API:** https://your-backend.railway.app
- 📊 **Dashboard:** https://supabase.com/dashboard

### Next Steps:
1. شارك الموقع مع العملاء
2. راقب Analytics في Vercel
3. راجع Logs في Railway
4. أضف Custom Domain
5. فعّل MyFatoorah للدفع

---

## 📞 Need Help?

- **Backend Logs:** Railway Dashboard → Deployments → Logs
- **Frontend Logs:** Vercel Dashboard → Deployments → Build Logs
- **Database:** Supabase Dashboard → Table Editor

---

**تم إنشاء هذا الدليل تلقائياً بواسطة Claude Code ✨**
