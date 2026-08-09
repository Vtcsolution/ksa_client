// سكريبت لجعل أيقونات الفافيكون دائرية في جميع المتصفحات
(function() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // انتظر حتى يتم تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
      // البحث عن جميع روابط الفافيكون
      const faviconLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
      
      // تطبيق نمط دائري على كل رابط
      faviconLinks.forEach(link => {
        // إنشاء نسخة من الصورة لتحويلها إلى دائرية
        const originalHref = link.getAttribute('href');
        if (originalHref && originalHref.includes('.png') || originalHref.includes('.jpg') || originalHref.includes('.jpeg')) {
          // إنشاء عنصر canvas لرسم الصورة بشكل دائري
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const size = Math.min(img.width, img.height);
            canvas.width = size;
            canvas.height = size;
            
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            
            // رسم الصورة داخل المسار الدائري
            ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
            
            try {
              // تحويل الصورة إلى URL دائري
              const circularImageUrl = canvas.toDataURL();
              // تحديث الرابط بالصورة الدائرية
              link.setAttribute('href', circularImageUrl);
            } catch(e) {
              console.warn('تعذر تحويل الفافيكون إلى شكل دائري:', e);
            }
          };
          
          img.onerror = function() {
            console.warn('تعذر تحميل الصورة لتحويلها إلى شكل دائري:', originalHref);
          };
          
          img.src = originalHref;
        }
      });
    });
  }
})();
