import type { Metadata } from "next";
import dynamic from "next/dynamic";
import localFont from "next/font/local";
import './globals.css';
import './favicon.css';
import "./performance.css";
import "./presentation.css";
import { localBusinessSchema, organizationSchema } from "@/lib/schemas";
import ScrollProgress from "@/components/ui/ScrollProgress";
import IntroLoader from "@/components/ui/IntroLoader";

const WhatsAppButton = dynamic(() => import("@/components/layout/WhatsAppButton"), { ssr: false });
const ScrollToTop = dynamic(() => import("@/components/ui/ScrollToTop"), { ssr: false });
const SlideNav = dynamic(() => import("@/components/ui/SlideNav"), { ssr: false });
const SlideAnimator = dynamic(() => import("@/components/ui/SlideAnimator"), { ssr: false });
const SmoothScroll = dynamic(() => import("@/components/ui/SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), { ssr: false });
const QuoteModal = dynamic(() => import("@/components/ui/QuoteModal"), { ssr: false });

// IBM Plex Sans Arabic — the professional Arabic typeface (refined, editorial, luxury-grade).
// Weights 800/900 intentionally map to the Bold file so `font-black` headings render
// the true Bold cut instead of an ugly browser-synthesized bold.
const arabicFont = localFont({
  src: [
    { path: "../public/fonts/IBMPlexSansArabic-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "../public/fonts/IBMPlexSansArabic-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/IBMPlexSansArabic-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/IBMPlexSansArabic-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/IBMPlexSansArabic-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/IBMPlexSansArabic-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/IBMPlexSansArabic-Bold.woff2", weight: "800", style: "normal" },
    { path: "../public/fonts/IBMPlexSansArabic-Bold.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-ibm-plex",
  display: "swap",
  fallback: ["IBM Plex Sans Arabic", "system-ui", "Tahoma"],
});

export const metadata: Metadata = {
  title: {
    default: "Omnira Valet | خدمات صف السيارات الاحترافية في السعودية",
    template: "%s | Omnira Valet"
  },
  description: "أومنيرا فاليه - شركة سعودية رائدة في خدمات صف السيارات الاحترافية وإدارة المواقف الذكية. حلول متطورة للفنادق، المطاعم، الفعاليات والمنشآت التجارية في الرياض، جدة والدمام.",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon.png', sizes: 'any', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  metadataBase: new URL('https://omniravalet.com'),
  keywords: [
    "صف السيارات",
    "خدمات فاليه",
    "valet parking",
    "صف سيارات الرياض",
    "صف سيارات جدة",
    "أومنيرا",
    "OMNIRA",
    "خدمات صف السيارات السعودية",
    "صف السيارات للفعاليات",
    "صف السيارات للفنادق"
  ],
  authors: [{ name: "Omnira Valet" }],
  creator: "Omnira Valet",
  publisher: "Omnira Valet",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://omniravalet.com',
    title: 'Omnira Valet | خدمات صف السيارات الاحترافية',
    description: 'شركة سعودية رائدة في خدمات صف السيارات الاحترافية',
    siteName: 'Omnira Valet',
    images: [
      {
        url: '/favicon.png',
        width: 800,
        height: 800,
        alt: 'Omnira Valet | خدمات صف السيارات الاحترافية في السعودية',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omnira Valet | خدمات صف السيارات الاحترافية',
    description: 'شركة سعودية رائدة في خدمات صف السيارات الاحترافية',
    images: ['/favicon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* PWA Support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C68B48" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://vimeo.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://cdn.pixabay.com" />
        
        {/* SEO enhancements */}
        <link rel="canonical" href="https://omniravalet.com" />
        <link rel="alternate" hrefLang="ar" href="https://omniravalet.com" />
        <link rel="alternate" hrefLang="x-default" href="https://omniravalet.com" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        
        {/* Circular Favicon Script */}
        <script src="/circular-favicon.js" async defer />
      </head>
      <body className={`${arabicFont.variable} antialiased`} suppressHydrationWarning>
        <IntroLoader />
        <ScrollProgress />
        {children}
        <WhatsAppButton />
        <ScrollToTop />
        <SlideNav />
        <SlideAnimator />
        <SmoothScroll />
        <CustomCursor />
        <QuoteModal />
      </body>
    </html>
  );
}
