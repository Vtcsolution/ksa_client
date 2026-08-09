'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen bg-gradient-to-b from-beige-light via-[#0E0E11] to-beige-light flex items-center justify-center px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-9xl font-black mb-4 text-sage-primary">500</h1>
            <h2 className="text-4xl font-bold mb-6 text-brown-dark">
              خطأ في الخادم
            </h2>
            <p className="text-xl text-brown-text mb-8">
              عذراً، حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 space-x-reverse px-8 py-4 text-lg bg-sage-primary text-white rounded-2xl hover:bg-sage-dark transition-all"
            >
              <span>العودة للرئيسية</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
