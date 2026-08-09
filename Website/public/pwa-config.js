/**
 * تكوين التطبيق التقدمي (PWA) لموقع أومنيرا
 * يساعد في تحسين أداء الموقع وتجربة المستخدم على الأجهزة المحمولة
 * ويوفر إمكانية عمل الموقع دون اتصال بالإنترنت
 */

// تهيئة التطبيق التقدمي
window.addEventListener('load', () => {
  initializePWA();
});

// الدالة الرئيسية لتهيئة التطبيق التقدمي
function initializePWA() {
  // تسجيل Service Worker إذا كان مدعومًا
  registerServiceWorker();
  
  // إعداد واجهة تثبيت التطبيق
  setupInstallPrompt();
  
  // تفعيل الوضع بدون اتصال
  setupOfflineMode();

  // تحسين تجربة المستخدم على الأجهزة المحمولة
  optimizeMobileExperience();
}

// تسجيل Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker تم تسجيله بنجاح:', registration.scope);

        // التحقق من التحديثات
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.error('فشل في تسجيل Service Worker:', error);
      });

    // إعادة تحميل الصفحة عندما يكون هناك تحديث للمحتوى
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}

// إعداد واجهة تثبيت التطبيق
function setupInstallPrompt() {
  let deferredPrompt;
  const installButton = document.getElementById('pwa-install-button');

  // حفظ الإشعار ليتم عرضه لاحقًا
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // إظهار زر التثبيت إذا كان موجودًا
    if (installButton) {
      installButton.style.display = 'block';
      
      installButton.addEventListener('click', () => {
        // إظهار واجهة التثبيت
        deferredPrompt.prompt();
        
        // انتظار اختيار المستخدم
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('تم تثبيت التطبيق');
          } else {
            console.log('تم رفض التثبيت');
          }
          deferredPrompt = null;
          installButton.style.display = 'none';
        });
      });
    }
  });

  // معرفة إذا تم تثبيت التطبيق بالفعل
  window.addEventListener('appinstalled', () => {
    if (installButton) {
      installButton.style.display = 'none';
    }
    deferredPrompt = null;
    console.log('تم تثبيت التطبيق');
  });
}

// إعداد الوضع بدون اتصال
function setupOfflineMode() {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // تحديث حالة الاتصال
  function updateOnlineStatus() {
    const offlineNotification = document.getElementById('offline-notification');
    
    if (!navigator.onLine) {
      // في وضع عدم الاتصال
      if (offlineNotification) {
        offlineNotification.style.display = 'block';
      } else {
        createOfflineNotification();
      }
      document.body.classList.add('offline-mode');
    } else {
      // في وضع الاتصال
      if (offlineNotification) {
        offlineNotification.style.display = 'none';
      }
      document.body.classList.remove('offline-mode');
    }
  }
  
  // إنشاء إشعار عدم الاتصال
  function createOfflineNotification() {
    const notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.innerHTML = `
      <div class="offline-alert">
        أنت حاليًا في وضع عدم الاتصال. بعض المحتوى قد لا يظهر بشكل صحيح.
        <button id="offline-close">×</button>
      </div>
    `;
    document.body.appendChild(notification);
    
    // زر إغلاق الإشعار
    document.getElementById('offline-close').addEventListener('click', () => {
      notification.style.display = 'none';
    });
    
    // إضافة نمط CSS
    const style = document.createElement('style');
    style.textContent = `
      .offline-alert {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #f8d7da;
        color: #721c24;
        text-align: center;
        padding: 10px;
        z-index: 9999;
        font-size: 14px;
        font-family: 'Cairo', sans-serif;
        direction: rtl;
      }
      #offline-close {
        background: none;
        border: none;
        color: #721c24;
        font-size: 18px;
        cursor: pointer;
        margin-right: 10px;
      }
      .offline-mode img {
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
  }
  
  // التحقق من حالة الاتصال عند التحميل
  updateOnlineStatus();
}

// تحسين تجربة المستخدم على الأجهزة المحمولة
function optimizeMobileExperience() {
  // إعداد نمط وضع ملء الشاشة للأجهزة المحمولة
  if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
    document.body.classList.add('standalone-mode');
    
    // منع السحب للأسفل لتحديث الصفحة في وضع ملء الشاشة
    document.body.addEventListener('touchmove', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // إضافة نمط لوضع ملء الشاشة
    const style = document.createElement('style');
    style.textContent = `
      .standalone-mode {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
    `;
    document.head.appendChild(style);
  }

  // تفعيل ميزة مشاركة المحتوى إذا كانت متوفرة
  setupWebShare();
}

// تفعيل ميزة مشاركة المحتوى
function setupWebShare() {
  const shareButtons = document.querySelectorAll('.share-button');
  
  if ('share' in navigator) {
    shareButtons.forEach(button => {
      button.style.display = 'flex';
      
      button.addEventListener('click', async () => {
        try {
          const title = document.title;
          const url = window.location.href;
          
          await navigator.share({
            title: title,
            url: url
          });
        } catch (error) {
          console.error('حدث خطأ أثناء المشاركة:', error);
        }
      });
    });
  }
}

// إظهار إشعار بوجود تحديث للموقع
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-alert">
      يتوفر إصدار جديد من الموقع
      <button id="update-now">تحديث الآن</button>
    </div>
  `;
  document.body.appendChild(notification);
  
  // زر التحديث
  document.getElementById('update-now').addEventListener('click', () => {
    notification.style.display = 'none';
    window.location.reload();
  });
  
  // إضافة نمط CSS
  const style = document.createElement('style');
  style.textContent = `
    .update-alert {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background-color: #d4edda;
      color: #155724;
      text-align: center;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 9999;
      font-family: 'Cairo', sans-serif;
      direction: rtl;
    }
    #update-now {
      background-color: #155724;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 5px 15px;
      margin-right: 10px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}
