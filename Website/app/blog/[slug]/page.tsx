import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from '@/components/ui/BlurImage';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ShareButtons from '@/components/blog/ShareButtons';
import { staticArticles } from '@/lib/static-content';
import { generateArticleSchema } from '@/lib/seo-config';

const getArticle = (slug: string) => staticArticles.find((a) => a.slug === slug);

export function generateStaticParams() {
  return staticArticles.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!a) return {};
  return {
    title: `${a.title} | Omnira Valet`,
    description: a.excerpt,
    keywords: a.tags,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: {
      title: a.title,
      description: a.excerpt,
      url: `https://omniravalet.com/blog/${a.slug}`,
      siteName: 'Omnira Valet',
      images: [{ url: `https://omniravalet.com${a.image}`, width: 1200, height: 630, alt: a.title }],
      locale: 'ar_SA',
      type: 'article',
    },
    robots: { index: true, follow: true },
  };
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d;
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!a) notFound();

  const articleSchema = generateArticleSchema({
    title: a.title,
    description: a.excerpt,
    url: `/blog/${a.slug}`,
    image: `https://omniravalet.com${a.image}`,
    datePublished: a.publishDate,
    dateModified: a.publishDate,
  });
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://omniravalet.com/' },
      { '@type': 'ListItem', position: 2, name: 'المقالات', item: 'https://omniravalet.com/blog' },
      { '@type': 'ListItem', position: 3, name: a.title, item: `https://omniravalet.com/blog/${a.slug}` },
    ],
  };
  const others = staticArticles.filter((x) => x.slug !== a.slug).slice(0, 2);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <ReadingProgress />
      <main className="min-h-screen bg-[#0A0A0C]">
        <Header />

        {/* hero */}
        <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-[#0A0A0C] pt-20">
          <div className="absolute inset-0">
            <Image src={a.image} alt={a.title} fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/60 to-[#0A0A0C]/40" />
          </div>
          <div className="container-custom relative z-10 pb-16">
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/45">
              <Link href="/" className="hover:text-gold-primary">الرئيسية</Link>
              <span className="text-white/25">/</span>
              <Link href="/blog" className="hover:text-gold-primary">المقالات</Link>
            </nav>
            <span className="mb-4 inline-block rounded-full border border-gold-primary/30 bg-[#0A0A0C]/50 px-4 py-1.5 text-[11px] font-medium text-gold-light backdrop-blur-sm">
              {a.category}
            </span>
            <h1 className="max-w-4xl text-3xl font-light leading-tight text-white sm:text-5xl lg:text-6xl">{a.title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-white/50">
              <span className="flex items-center gap-2"><User className="h-4 w-4 text-gold-primary/70" />{a.author}</span>
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gold-primary/70" />{formatDate(a.publishDate)}</span>
            </div>
          </div>
        </section>

        {/* content */}
        <section className="bg-[#0A0A0C] py-20 lg:py-28">
          <div className="container-custom max-w-3xl">
            <article
              className="[&_h2:first-of-type]:hidden [&_h2]:mb-5 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-white [&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-gold-light [&_p]:mb-6 [&_p]:text-lg [&_p]:leading-loose [&_p]:text-white/65"
              dangerouslySetInnerHTML={{ __html: a.content }}
            />

            {/* tags */}
            <div className="mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-8">
              {a.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-white/60">
                  #{t}
                </span>
              ))}
            </div>

            {/* share */}
            <ShareButtons title={a.title} slug={a.slug} />

            {/* CTA */}
            <div className="mt-14 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-10 text-center">
              <h3 className="mb-3 text-2xl font-medium text-white">جاهزون لخدمة منشأتك</h3>
              <p className="mb-7 text-white/55">تواصل معنا للحصول على عرض سعر مخصّص لخدمات صف السيارات.</p>
              <Link href="/contact" className="inline-flex rounded-full bg-gold-primary px-9 py-3.5 text-sm font-medium text-[#0A0A0C] transition-colors duration-300 hover:bg-gold-light">
                احجز الآن
              </Link>
            </div>
          </div>
        </section>

        {/* other articles */}
        {others.length > 0 && (
          <section className="bg-[#0A0A0C] pb-24">
            <div className="container-custom max-w-3xl">
              <h2 className="mb-8 text-xl font-medium text-white">مقالات أخرى</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {others.map((o) => (
                  <Link key={o.id} href={`/blog/${o.slug}`} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-300 hover:border-gold-primary/40">
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-gold-primary" />
                    <span className="text-sm text-white/75 group-hover:text-white">{o.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
}
