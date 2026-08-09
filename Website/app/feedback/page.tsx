import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FeedbackForm from '@/components/feedback/FeedbackForm';

export const metadata: Metadata = {
  title: 'شاركنا رأيك | Omnira Valet',
  description: 'قيّم تجربتك مع أومنيرا فاليه وشاركنا ملاحظاتك — رأيك يساعدنا على تحسين خدماتنا باستمرار.',
  metadataBase: new URL('https://omniravalet.com'),
  alternates: { canonical: '/feedback' },
  robots: { index: true, follow: true },
};

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-black-primary">
      <Header />
      <div className="section-padding pt-32">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h1 className="mb-4 text-4xl font-medium text-white lg:text-5xl">رأيك يهمّنا</h1>
            <p className="text-lg text-white/55">
              نسعى دائمًا لتقديم أفضل تجربة ممكنة — شاركنا ملاحظاتك، اقتراحاتك، أو تجربتك مع فريقنا.
            </p>
          </div>
          <div className="mx-auto max-w-xl">
            <FeedbackForm />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
