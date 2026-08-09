'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw } from 'lucide-react';

export default function Error({
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
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-7xl md:text-8xl font-extralight mb-6">
          <span className="gold-shine-effect">خطأ</span>
        </h1>
        <h2 className="text-3xl md:text-4xl font-medium mb-6 text-white">
          حدث خطأ ما
        </h2>
        <p className="text-lg text-white/55 mb-10 max-w-md mx-auto leading-relaxed">
          عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
          >
            <span>حاول مرة أخرى</span>
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base border border-white/20 text-white/80 rounded-full hover:border-gold-primary hover:text-white transition-colors duration-300"
          >
            <span>العودة للرئيسية</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
