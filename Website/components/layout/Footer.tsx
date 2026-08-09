import Link from 'next/link';
import Image from 'next/image';
const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/omniravalet/', path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z' },
  { label: 'X', href: 'https://x.com/elorepariss', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@omniravalet', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
  { label: 'YouTube', href: 'https://www.youtube.com/@Omniravalet', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  const columns = [
    {
      title: 'الخدمات',
      links: [
        { name: 'فاليه باركينج', href: '/services/valet-parking' },
        { name: 'إدارة المواقف', href: '/services/parking-management' },
        { name: 'التقنيات المتقدمة', href: '/services/advanced-technology' },
        { name: 'المنظمون المحترفون', href: '/services/professional-organizers' },
      ],
    },
    {
      title: 'الشركة',
      links: [
        { name: 'من نحن', href: '/about' },
        { name: 'أعمالنا', href: '/portfolio' },
        { name: 'الأسعار', href: '/pricing' },
        { name: 'المدن', href: '/locations' },
        { name: 'المقالات', href: '/blog' },
        { name: 'اتصل بنا', href: '/contact' },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/10 bg-[#0A0A0C]">
      <div className="container-custom py-20 lg:py-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          {/* brand */}
          <div className="lg:col-span-5">
            <Image
              src="/logo.png"
              alt="Omnira Valet"
              width={220}
              height={62}
              className="h-12 w-auto object-contain"
            />
            <p className="mt-7 max-w-sm text-sm font-light leading-relaxed text-white/50">
              خدمة صفّ السيارات الفاخرة في المملكة — نصنع من لحظة الوصول تجربةً لا
              تُنسى.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors duration-300 hover:border-gold-primary hover:text-gold-primary"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {columns.map((c) => (
            <div key={c.title} className="lg:col-span-2">
              <h4 className="mb-5 text-[11px] font-medium tracking-[0.25em] text-gold-primary/80">
                {c.title}
              </h4>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className="text-sm text-white/55 transition-colors duration-300 hover:text-white">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3">
            <h4 className="mb-5 text-[11px] font-medium tracking-[0.25em] text-gold-primary/80">
              تواصل
            </h4>
            <ul className="space-y-4 text-sm text-white/55">
              <li>مركز الملك عبدالله المالي (KAFD) · المنطقة 4 · مبنى 4.07 · الدور 7 · الرياض</li>
              <li>
                <a href="https://wa.me/966551962033" dir="ltr" className="transition-colors duration-300 hover:text-white">
                  +966 55 196 2033
                </a>
              </li>
              <li>
                <a href="mailto:info@omniravalet.com" className="transition-colors duration-300 hover:text-white">
                  info@omniravalet.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row">
          <p>© {year} Omnira Valet — السجل التجاري 7051975600</p>
          <div className="flex items-center gap-5">
            <Link href="/feedback" className="transition-colors duration-300 hover:text-white">شاركنا رأيك</Link>
            <Link href="/testimonials" className="transition-colors duration-300 hover:text-white">آراء عملائنا</Link>
            <Link href="/privacy" className="transition-colors duration-300 hover:text-white">سياسة الخصوصية</Link>
            <Link href="/terms" className="transition-colors duration-300 hover:text-white">الشروط والأحكام</Link>
          </div>
          <p className="flex items-center gap-1.5">
            صُمّم بواسطة
            <a href="https://www.skywaveads.com" target="_blank" rel="noopener noreferrer" className="text-white/60 transition-colors duration-300 hover:text-gold-primary">
              Sky Wave
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
