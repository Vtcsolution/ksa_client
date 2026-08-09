import Link from 'next/link';
import { ArrowRight, Search, Home, Phone } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة | أومنيرا فاليه - لم يتم العثور على الصفحة المطلوبة',
  description: 'لم يتم العثور على الصفحة التي تبحث عنها. يمكنك العودة للصفحة الرئيسية أو استعراض خدماتنا في صف السيارات والفاليه باركينج وإدارة المواقف.',
  robots: {
    index: false,
    follow: true,
  }
};

export default function NotFound() {
  // الصفحات الرئيسية المقترحة
  const suggestedPages = [
    { title: 'الرئيسية', href: '/', icon: <Home className="w-5 h-5" /> },
    { title: 'خدماتنا', href: '/services', icon: <Search className="w-5 h-5" /> },
    { title: 'اتصل بنا', href: '/contact', icon: <Phone className="w-5 h-5" /> },
  ];

  // الخدمات المشهورة
  const popularServices = [
    { title: 'خدمة الفاليه باركينج', href: '/services/valet-parking' },
    { title: 'إدارة المواقف', href: '/services/parking-management' },
    { title: 'خدمات الفنادق', href: '/services/hotels' },
  ];

  return (
    <>
      <Header />
      
      <div className="min-h-[80vh] py-32 bg-[#0A0A0C] flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-8xl md:text-9xl font-extralight mb-6">
            <span className="gold-shine-effect">404</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-medium mb-6 text-white">
            الصفحة غير موجودة
          </h2>
          <p className="text-lg text-white/55 mb-10 max-w-xl mx-auto leading-relaxed">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يمكنك تجربة أحد الروابط التالية.
          </p>
          
          {/* الأزرار الرئيسية */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {suggestedPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="btn-gold flex items-center gap-2 px-6 py-3 text-sm"
              >
                {page.icon}
                <span>{page.title}</span>
              </Link>
            ))}
          </div>
          
          {/* الخدمات الشائعة */}
          <div className="mt-12">
            <h3 className="text-[11px] font-medium tracking-[0.25em] text-gold-primary/70 mb-5">خدماتنا الشائعة</h3>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {popularServices.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className="text-sm text-white/55 hover:text-white transition-colors duration-300"
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
