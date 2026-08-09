/**
 * مساعد لإنشاء الروابط المعيارية وروابط اللغات البديلة
 * يعزز السيو عن طريق منع تكرار المحتوى
 */

export type AlternateURLs = {
  canonical: string;
  languages?: { [locale: string]: string };
  types?: { [type: string]: string };
  media?: { [media: string]: string };
};

/**
 * إنشاء الروابط المعيارية وروابط اللغات البديلة
 * @param path المسار الحالي للصفحة
 * @param options خيارات إضافية
 */
export function generateURLs(
  path: string,
  options: {
    addTrailingSlash?: boolean;
    baseURL?: string;
    locales?: string[];
    removeIndex?: boolean;
  } = {},
): AlternateURLs {
  const {
    addTrailingSlash = false,
    baseURL = 'https://omniravalet.com',
    locales = ['ar'],
    removeIndex = true,
  } = options;

  // معالجة المسار
  let cleanPath = path;
  
  // إزالة / من البداية إذا كانت موجودة
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // إزالة index.html أو index.php إذا طُلب ذلك
  if (removeIndex) {
    cleanPath = cleanPath.replace(/index\.(html|php)$/, '');
  }
  
  // إضافة / للنهاية إذا طُلب ذلك
  if (addTrailingSlash && cleanPath && !cleanPath.endsWith('/')) {
    cleanPath = `${cleanPath}/`;
  }
  
  // إزالة / من النهاية إذا لم يطلب إضافتها
  if (!addTrailingSlash && cleanPath.endsWith('/') && cleanPath !== '') {
    cleanPath = cleanPath.substring(0, cleanPath.length - 1);
  }
  
  // إنشاء الرابط المعياري
  const canonicalPath = cleanPath ? `${baseURL}/${cleanPath}` : baseURL;
  
  // إنشاء روابط اللغات البديلة
  const languages: { [locale: string]: string } = {};
  
  if (locales.includes('ar')) {
    languages['ar'] = canonicalPath;
  }

  // إرجاع النتيجة
  return {
    canonical: canonicalPath,
    languages,
  };
}

/**
 * إنشاء علامة الرابط المعياري بصيغة HTML
 * @param url الرابط المعياري
 */
export function createCanonicalTag(url: string): string {
  return `<link rel="canonical" href="${url}" />`;
}

/**
 * إنشاء علامات اللغات البديلة بصيغة HTML
 * @param languages روابط اللغات البديلة
 */
export function createAlternateLangTags(languages: { [locale: string]: string }): string {
  return Object.entries(languages)
    .map(([locale, url]) => `<link rel="alternate" hreflang="${locale}" href="${url}" />`)
    .join('\n');
}

/**
 * دالة مساعدة للحصول على علامات الـ SEO كاملة
 * @param path مسار الصفحة الحالي
 * @param options خيارات إضافية
 */
export function getSEOTags(
  path: string,
  options?: {
    addTrailingSlash?: boolean;
    baseURL?: string;
    locales?: string[];
    removeIndex?: boolean;
  },
): string {
  const urls = generateURLs(path, options);
  
  const canonicalTag = createCanonicalTag(urls.canonical);
  const alternateLangTags = urls.languages ? createAlternateLangTags(urls.languages) : '';
  
  return `${canonicalTag}\n${alternateLangTags}`;
}

/**
 * تحسين الروابط للسيو
 * @param url الرابط المراد تحسينه
 */
export function optimizeURL(url: string): string {
  // إزالة الباراميترات غير المهمة للسيو
  const urlObj = new URL(url);
  
  // باراميترات يجب الاحتفاظ بها
  const keepParams = ['id', 'category', 'tag', 'page'];
  
  // حذف جميع الباراميترات الأخرى
  for (const param of urlObj.searchParams.keys()) {
    if (!keepParams.includes(param)) {
      urlObj.searchParams.delete(param);
    }
  }
  
  return urlObj.toString();
}

const canonicalUrl = {
  generateURLs,
  createCanonicalTag,
  createAlternateLangTags,
  getSEOTags,
  optimizeURL,
};

export default canonicalUrl;
