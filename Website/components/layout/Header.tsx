'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Magnetic from '@/components/ui/Magnetic';
import { useQuoteModal } from '@/lib/quote-modal-store';

const Header = () => {
  const openQuote = useQuoteModal((s) => s.openQuote);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // hover-intent: open instantly, close with a small forgiving delay
  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShowServicesMenu(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShowServicesMenu(false), 200);
  };
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // close menus on route change
  useEffect(() => {
    setShowServicesMenu(false);
    setIsMobileMenuOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: 'الرئيسية', href: '/', hasSubmenu: false },
    { name: 'من نحن', href: '/about', hasSubmenu: false },
    { name: 'خدماتنا', href: '/services', hasSubmenu: true },
    { name: 'أعمالنا', href: '/portfolio', hasSubmenu: false },
    { name: 'المدن', href: '/locations', hasSubmenu: false },
    { name: 'الأسعار', href: '/pricing', hasSubmenu: false },
    { name: 'المقالات', href: '/blog', hasSubmenu: false },
    { name: 'آراء العملاء', href: '/feedback', hasSubmenu: false },
    { name: 'اتصل بنا', href: '/contact', hasSubmenu: false },
  ];

  const servicesMenu = [
    { name: 'فاليه باركينج', href: '/services/valet-parking' },
    { name: 'إدارة المواقف', href: '/services/parking-management' },
    { name: 'تقنيات متقدمة', href: '/services/advanced-technology' },
    { name: 'خدمات VIP', href: '/services/vip' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom relative">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center h-full py-3" aria-label="أومنيرا فاليه">
            <Image
              src="/logo.png"
              alt="Omnira Valet"
              width={300}
              height={84}
              className="object-contain w-auto h-11 md:h-14 drop-shadow-[0_2px_10px_rgba(201,162,74,0.35)] transition-transform duration-500 group-hover:scale-[1.04]"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.hasSubmenu && openMenu()}
                  onMouseLeave={() => item.hasSubmenu && scheduleClose()}
                >
                  <Link
                    href={item.href}
                    className={`group relative flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.hasSubmenu && (
                      <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
                    )}
                    {/* thin gold underline */}
                    <span
                      className={`pointer-events-none absolute -bottom-0.5 right-4 left-4 h-px bg-gold-primary transition-transform duration-300 origin-right ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>

                  {/* Services Mega Menu — pt-3 acts as a hover bridge (NO margin gap, it kills the menu) */}
                  {item.hasSubmenu && showServicesMenu && (
                    <div
                      className="absolute top-full right-1/2 z-[100] w-72 translate-x-1/2 pt-3"
                      onMouseEnter={openMenu}
                      onMouseLeave={scheduleClose}
                    >
                    <div className="bg-[#0E0E11]/98 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/10 p-5 animate-slideDown">
                      <div className="mb-3 pb-3 border-b border-white/10">
                        <h3 className="text-[11px] font-medium tracking-[0.25em] text-gold-primary/70">
                          خدماتنا
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {servicesMenu.map((service, idx) => (
                          <Link
                            key={service.href}
                            href={service.href}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors duration-300 group hover:bg-white/[0.04] animate-fadeInUp"
                            onClick={() => setShowServicesMenu(false)}
                            style={{ animationDelay: `${idx * 60}ms`, opacity: 0 }}
                          >
                            <span className="text-sm font-medium text-white/65 group-hover:text-white transition-colors duration-300">
                              {service.name}
                            </span>
                            <svg
                              className="w-4 h-4 text-gold-primary opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+966551962033"
              className="p-2.5 text-white/55 hover:text-gold-primary transition-colors duration-300"
              aria-label="اتصل بنا"
            >
              <Phone className="w-5 h-5" />
            </a>
            <Magnetic strength={0.4}>
              <button
                onClick={() => openQuote({ source: 'header' })}
                className="group inline-flex items-center gap-2 rounded-full bg-gold-primary px-7 py-2.5 text-sm font-medium text-[#0A0A0C] transition-colors duration-300 hover:bg-gold-light"
              >
                <span>احجز الآن</span>
                <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
              </button>
            </Magnetic>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white"
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0A0A0C]/95 backdrop-blur-xl">
          <nav className="container-custom py-6 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              // خدماتنا — expandable accordion on mobile
              if (item.hasSubmenu) {
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        className={`flex-1 py-3.5 text-base font-medium transition-colors duration-300 ${
                          isActive ? 'text-gold-primary' : 'text-white/70 hover:text-white'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => setMobileServicesOpen((v) => !v)}
                        aria-label="فتح قائمة الخدمات"
                        aria-expanded={mobileServicesOpen}
                        className="p-3 text-white/60"
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-300 ${
                            mobileServicesOpen ? 'rotate-180 text-gold-primary' : ''
                          }`}
                        />
                      </button>
                    </div>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ${
                        mobileServicesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="mb-2 space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-2">
                          {servicesMenu.map((service) => (
                            <Link
                              key={service.href}
                              href={service.href}
                              className="block rounded-lg px-4 py-3 text-sm text-white/65 transition-colors duration-300 hover:bg-white/[0.05] hover:text-white"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {service.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-3.5 text-base font-medium transition-colors duration-300 ${
                    isActive ? 'text-gold-primary' : 'text-white/70 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => { setIsMobileMenuOpen(false); openQuote({ source: 'header-mobile' }); }}
              className="mt-5 block w-full rounded-full bg-gold-primary py-3.5 text-center text-sm font-medium text-[#0A0A0C] transition-colors duration-300 hover:bg-gold-light"
            >
              احجز الآن
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
