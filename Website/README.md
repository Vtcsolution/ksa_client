# 🚗 OMNIRA - موقع خدمات صف السيارات

![OMNIRA](https://img.shields.io/badge/OMNIRA-أومنيرا-7FA08E?style=for-the-badge)

موقع تعريفي احترافي لشركة **أومنيرا (OMNIRA)** المتخصصة في خدمات صف السيارات (Valet Parking) وإدارة المواقف الذكية في المملكة العربية السعودية.

> موقع **تعريفي ثابت (frontend-only)** بالكامل — لا توجد قاعدة بيانات أو واجهة برمجية خلفية. كل المحتوى مُولّد ثابتاً.

## 🎨 التقنيات المستخدمة

- **Next.js 14** - React Framework (App Router)
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **GSAP** - Advanced Animations
- **Lucide React** - Icons
- **Radix UI** - Accessible UI Primitives
- **React Hook Form + Zod** - النماذج والتحقق من المدخلات
- **Zustand** - State Management

## 🚀 البدء

### المتطلبات

- Node.js 20+
- npm أو yarn

### التنصيب والتشغيل

```bash
# تنصيب المكتبات
npm install

# تشغيل الموقع في وضع التطوير
npm run dev

# بناء الموقع للإنتاج
npm run build

# تشغيل الموقع في وضع الإنتاج
npm start

# فحص جودة الكود
npm run lint
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 📁 هيكل المشروع

```
omnira-website/
├── app/                    # الصفحات والمسارات (App Router)
│   ├── about/             # من نحن
│   ├── services/          # الخدمات وقطاعات العملاء
│   ├── locations/         # المدن
│   ├── pricing/           # الأسعار
│   ├── contact/           # اتصل بنا
│   └── sitemap/           # خريطة الموقع
├── components/             # مكونات React
├── lib/                    # أدوات مساعدة وإعدادات السيو
└── public/                 # الملفات الثابتة (صور، sitemap، robots)
```

## 🎨 الألوان

نظام ألوان مستوحى من الطبيعة السعودية (Sage / Sand) — انظر `tailwind.config.ts`:

- **Sage Primary (اللون الأساسي):** `#7FA08E`
- **Sage Light:** `#9FB8A8`
- **Sage Medium:** `#6B8A7A`
- **Sage Dark:** `#5A7568`
- **Sand / Beige (خلفيات):** `#F5F0E8` → `#FAF7F2`

> اللغة الأساسية للموقع هي العربية مع اتجاه RTL.

## 📝 الصفحات

- `/` - الصفحة الرئيسية
- `/about` - من نحن
- `/services` - الخدمات (مع صفحات فرعية لكل خدمة وقطاع)
- `/locations` - المدن
- `/pricing` - الأسعار
- `/contact` - اتصل بنا
- `/sitemap` - خريطة الموقع

## 🌐 النشر على Netlify

الموقع جاهز للنشر على Netlify (انظر `netlify.toml`):

1. قم بربط المستودع مع Netlify
2. سيتم البناء والنشر تلقائياً عند كل دفعة

## 📄 الترخيص

© 2025 OMNIRA Company Holding - جميع الحقوق محفوظة
