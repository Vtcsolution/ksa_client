'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  lowQualitySrc?: string;
  blurDataURL?: string;
  loadingClassName?: string;
  loadingStyle?: React.CSSProperties;
  aspectRatio?: string;
}

/**
 * مكون صورة محسّن مع تحميل متدرج وتأثيرات تلاشي
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  lowQualitySrc,
  loadingClassName,
  loadingStyle,
  aspectRatio = '16/9',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [isInView, setIsInView] = useState(false);

  // تقنية كشف التمرير لتحميل الصور عند الحاجة فقط
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // إنشاء مراقب التقاطع
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    // العثور على العنصر الهدف
    const element = document.getElementById(`optimized-image-${currentSrc?.toString().slice(-10)}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [currentSrc]);

  // استبدال الصورة منخفضة الجودة بالصورة عالية الجودة
  useEffect(() => {
    if (isInView && lowQualitySrc && currentSrc === lowQualitySrc) {
      setCurrentSrc(src);
    }
  }, [isInView, src, lowQualitySrc, currentSrc]);

  return (
    <div
      id={`optimized-image-${currentSrc?.toString().slice(-10)}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        overflow: 'hidden',
        ...loadingStyle,
      }}
      className={cn(
        isLoading && loadingClassName,
        "bg-[#141418] rounded-lg"
      )}
    >
      <Image
        src={currentSrc || ''}
        alt={alt}
        width={width}
        height={height}
        onLoadingComplete={() => setIsLoading(false)}
        className={cn(
          'transition-opacity duration-500 ease-in-out',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#222229] border-t-gold-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

/**
 * مكون لتحميل الصور فقط عند الحاجة
 * مثالي للصفحات ذات الصور المتعددة
 */
export function LazyImage({
  src,
  alt,
  width = 800,
  height = 450,
  className,
  ...props
}: ImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const id = `lazy-image-${src?.toString().slice(-10)}`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.01
      }
    );
    
    const element = document.getElementById(id);
    if (element) observer.observe(element);
    
    return () => observer.disconnect();
  }, [src]);
  
  return (
    <div 
      id={`lazy-image-${src?.toString().slice(-10)}`} 
      className={cn(
        "relative bg-[#0E0E11] overflow-hidden",
        className
      )}
    >
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          {...props}
        />
      ) : (
        <div 
          style={{ width, height }}
          className="bg-[#141418] animate-pulse rounded"
        />
      )}
    </div>
  );
}

/**
 * مكون لعرض صور المنتج مع صور بحجم مصغر
 */
export function ProductImage({
  mainSrc,
  thumbnails = [],
  alt,
  aspectRatio = '1/1',
}: {
  mainSrc: string;
  thumbnails?: string[];
  alt: string;
  aspectRatio?: string;
}) {
  const [selectedImage, setSelectedImage] = useState(mainSrc);
  
  return (
    <div className="product-image-gallery">
      <div className="main-image mb-4">
        <OptimizedImage
          src={selectedImage}
          alt={alt}
          width={600}
          height={600}
          className="rounded-lg"
          aspectRatio={aspectRatio}
          priority={true}
        />
      </div>
      
      {thumbnails.length > 0 && (
        <div className="thumbnails flex space-x-2 space-x-reverse overflow-x-auto pb-2">
          {[mainSrc, ...thumbnails].map((thumb, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(thumb)}
              className={`thumbnail-btn min-w-[70px] h-[70px] border-2 rounded overflow-hidden ${selectedImage === thumb ? 'border-gold-primary' : 'border-[#222229]'}`}
            >
              <Image
                src={thumb}
                alt={`${alt} - صورة ${index + 1}`}
                width={70}
                height={70}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * وحدة تساعد في إنشاء عناوين URL للصور المحسنة
 * @param src مسار الصورة الأصلي
 * @param width العرض المطلوب
 * @param quality جودة الصورة (1-100)
 * @returns عنوان URL محسن
 */
export function getOptimizedImageUrl(src: string, width: number, quality: number = 75) {
  // التحقق من أن المصدر هو URL خارجي
  if (src.startsWith('http')) {
    // Unsplash
    if (src.includes('images.unsplash.com')) {
      return `${src}&w=${width}&q=${quality}&auto=format`;
    }
    
    // Cloudinary
    if (src.includes('res.cloudinary.com')) {
      return src.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
    }
    
    // للمصادر الأخرى، إرجاع المصدر كما هو
    return src;
  }
  
  // للصور المحلية، استخدام معالج الصور المدمج في Next.js
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
