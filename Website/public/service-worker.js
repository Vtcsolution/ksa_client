// Service Worker لتحسين أداء موقع أومنيرا
// التاريخ: نوفمبر 2025
// الإصدار: 1.0.0

const CACHE_NAME = 'omnira-cache-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_IMAGE = '/offline-image.svg';

// الملفات الرئيسية للتخزين المسبق
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/offline-image.svg',
  '/favicon.png',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/circular-favicon.js',
  '/fonts/Cairo-Regular.ttf',
  '/fonts/Cairo-Medium.ttf',
  '/fonts/Cairo-SemiBold.ttf',
  '/fonts/Cairo-Bold.ttf',
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('[ServiceWorker] تثبيت');
  
  // تخزين الملفات المهمة مسبقاً
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] تخزين مسبق للملفات الأساسية');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // التنشيط الفوري دون انتظار تحديث الصفحة
        return self.skipWaiting();
      })
  );
});

// تنشيط Service Worker
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] تنشيط');
  
  // حذف التخزينات المؤقتة القديمة
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] حذف التخزين المؤقت القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // استلام التحكم بالصفحات فوراً
      return self.clients.claim();
    })
  );
});

// استراتيجية "الشبكة أولاً، ثم التخزين المؤقت"
self.addEventListener('fetch', event => {
  // تجاهل طلبات البيانات
  if (
    event.request.url.includes('/api/') || 
    event.request.url.includes('chrome-extension') ||
    event.request.url.includes('analytics') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // استراتيجية الاستجابة للطلبات
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // نسخة من الاستجابة للتخزين المؤقت
        const responseClone = response.clone();
        
        // تخزين الاستجابة في التخزين المؤقت
        caches.open(CACHE_NAME).then(cache => {
          // تخزين الصفحات والأصول فقط (ليس الملفات الديناميكية)
          if (
            event.request.url.match(/\.(html|js|css|png|jpg|jpeg|svg|gif|webp|woff2|ttf)$/) || 
            event.request.url.endsWith('/')
          ) {
            cache.put(event.request, responseClone);
          }
        });
        
        return response;
      })
      .catch(() => {
        // استرجاع من التخزين المؤقت إذا فشل الاتصال
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // إذا كانت صورة ولم تكن موجودة في التخزين المؤقت، عرض صورة عدم الاتصال
            if (event.request.url.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
              return caches.match(OFFLINE_IMAGE);
            }
            
            // إذا كانت صفحة ولم تكن موجودة في التخزين المؤقت، عرض صفحة عدم الاتصال
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // إذا لم يكن هناك استجابة، إرجاع خطأ
            return new Response('حدث خطأ في الاتصال بالخادم.', {
              status: 503,
              statusText: 'خدمة غير متوفرة',
              headers: new Headers({
                'Content-Type': 'text/plain;charset=UTF-8'
              })
            });
          });
      })
  );
});

// معالجة رسائل من الصفحة
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// إشعارات الخلفية (يتطلب إذن من المستخدم)
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
