import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from '@/components/ui/BlurImage';
import RevealMask from '@/components/ui/RevealMask';
import { staticArticles } from '@/lib/static-content';

export const metadata: Metadata = {
  title: 'مقالات ورؤى | Omnira Valet - فاليه باركينج وإدارة المواقف',
  description:
    'مقالات ورؤى من أومنيرا فاليه حول خدمات صف السيارات، الفاليه باركينج، تقنيات إدارة المواقف، وتجربة الضيافة الفاخرة في المملكة العربية السعودية.',
  alternates: { canonical: '/blog' },
  robots: { index: true, follow: true },
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d;
  }
}

export default function BlogPage() {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'مقالات أومنيرا فاليه',
    url: 'https://omniravalet.com/blog',
    inLanguage: 'ar',
    publisher: { '@type': 'Organization', name: 'Omnira Valet', logo: 'https://omniravalet.com/logo.png' },
    blogPost: staticArticles.map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      url: `https://omniravalet.com/blog/${a.slug}`,
      datePublished: a.publishDate,
      image: `https://omniravalet.com${a.image}`,
      author: { '@type': 'Organization', name: a.author },
    })),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://omniravalet.com/' },
      { '@type': 'ListItem', position: 2, name: 'المقالات', item: 'https://omniravalet.com/blog' },
    ],
  };
  return (
    <main className="min-h-screen bg-[#0A0A0C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Header />
      <section className="container-custom pb-24 pt-36">
        <div className="mb-16 text-center">
          <span className="mb-5 inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            رؤى
          </span>
          <h1 className="text-4xl font-extralight gold-shine-effect sm:text-6xl lg:text-7xl">مقالات أومنيرا</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-white/55">
            رؤى ونصائح حول الفاليه باركينج، إدارة المواقف، وتجربة الضيافة الفاخرة.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {staticArticles.map((a) => (
            <Link
              key={a.id}
              href={`/blog/${a.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
            >
              <RevealMask className="relative h-60 w-full overflow-hidden">
                <Image src={a.image} alt={a.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/20 to-transparent" />
                <span className="absolute bottom-4 right-4 rounded-full border border-gold-primary/30 bg-[#0A0A0C]/70 px-4 py-1.5 text-[11px] font-medium text-gold-light backdrop-blur-sm">
                  {a.category}
                </span>
              </RevealMask>

              <div className="p-8">
                <p className="mb-3 text-xs text-white/40">{formatDate(a.publishDate)}</p>
                <h2 className="mb-3 text-xl font-medium leading-snug text-white transition-colors group-hover:text-gold-light sm:text-2xl">
                  {a.title}
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-white/55 line-clamp-3">{a.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-sm text-gold-primary">
                  اقرأ المقال
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
