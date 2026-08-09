# دليل صور Open Graph لكل صفحة

## ✅ تم تحديث الصفحات التالية:

### 1. الصفحة الرئيسية `/`
- ✅ الصورة: صف سيارات فاخرة
- ✅ الحجم: 1200x630
- ✅ المصدر: getOGImage('home')

### 2. من نحن `/about`
- ✅ الصورة: فريق عمل محترف
- ✅ الحجم: 1200x630
- ✅ المصدر: getOGImage('about')

---

## 📋 الصفحات المتبقية (للتحديث):

### الصفحات الرئيسية:

#### `/services`
```typescript
import { getOGImage } from '@/lib/og-images';
images: [getOGImage('services')]
```

#### `/pricing`
```typescript
images: [getOGImage('pricing')]
```

#### `/contact`
```typescript
images: [getOGImage('contact')]
```

#### `/locations`
```typescript
images: [getOGImage('locations')]
```

---

### صفحات الخدمات:

#### `/services/valet-parking`
```typescript
images: [getOGImage('valetParking')]
```

#### `/services/parking-management`
```typescript
images: [getOGImage('parkingManagement')]
```

#### `/services/advanced-technology`
```typescript
images: [getOGImage('advancedTechnology')]
```

#### `/services/professional-organizers`
```typescript
images: [getOGImage('professionalOrganizers')]
```

#### `/services/consultation`
```typescript
images: [getOGImage('consultation')]
```

#### `/services/golf-cart`
```typescript
images: [getOGImage('golfCart')]
```

#### `/services/support-services`
```typescript
images: [getOGImage('supportServices')]
```

#### `/services/car-wash`
```typescript
images: [getOGImage('carWash')]
```

#### `/services/hotels`
```typescript
images: [getOGImage('hotels')]
```

#### `/services/restaurants`
```typescript
images: [getOGImage('restaurants')]
```

#### `/services/malls`
```typescript
images: [getOGImage('malls')]
```

#### `/services/events`
```typescript
images: [getOGImage('events')]
```

#### `/services/hospitals`
```typescript
images: [getOGImage('hospitals')]
```

#### `/services/corporate`
```typescript
images: [getOGImage('corporate')]
```

#### `/services/vip`
```typescript
images: [getOGImage('vip')]
```

---

## 🔧 كيفية تحديث أي صفحة:

### الخطوات:

1. **استيراد الدالة:**
```typescript
import { getOGImage } from '@/lib/og-images';
```

2. **استبدال في openGraph:**
```typescript
openGraph: {
  // ... other fields
  images: [getOGImage('pageKey')], // استبدل pageKey بالمفتاح المناسب
}
```

3. **استبدال في twitter:**
```typescript
twitter: {
  // ... other fields
  images: [getOGImage('pageKey').url],
}
```

---

## 📊 الصور المتاحة:

| Key | الصفحة | الوصف |
|-----|--------|-------|
| `home` | الرئيسية | سيارات فاخرة |
| `about` | من نحن | فريق عمل |
| `services` | الخدمات | صف سيارات |
| `pricing` | الأسعار | جودة وأسعار |
| `contact` | اتصل بنا | تواصل |
| `locations` | المواقع | خريطة |
| `valetParking` | فاليه | خدمة فاليه |
| `parkingManagement` | إدارة | تكنولوجيا |
| `advancedTechnology` | تقنيات | حديثة |
| ... | ... | ... |

---

## ✅ الفوائد:

1. **SEO محسّن** - صورة مخصصة لكل صفحة
2. **Social Media** - ظهور جذاب على Facebook, Twitter, LinkedIn
3. **Click-Through Rate** - زيادة النقرات من نتائج البحث
4. **Brand Image** - صورة احترافية للعلامة التجارية
