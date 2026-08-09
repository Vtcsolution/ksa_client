'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace('/dashboard');
        router.refresh();
      } else if (res.status === 429) {
        setError('محاولات كثيرة — انتظر قليلاً ثم أعد المحاولة.');
      } else {
        setError('كلمة المرور غير صحيحة.');
      }
    } catch {
      setError('تعذّر الاتصال. حاول مجددًا.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0C] px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_35%,rgba(201,162,74,0.08),transparent_70%)]" />
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-9"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-primary/25 bg-gold-primary/10">
            <Lock className="h-6 w-6 text-gold-primary" />
          </div>
          <h1 className="text-2xl font-medium text-white">لوحة تحكّم الليدز</h1>
          <p className="mt-2 text-sm text-white/45">أومنيرا فاليه — دخول خاص</p>
        </div>

        <label className="mb-2 block text-sm text-white/70">كلمة المرور</label>
        <input
          type="password"
          value={password}
          autoFocus
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#131318] px-4 py-3.5 text-white placeholder:text-white/30 transition-all focus:border-gold-primary/60 focus:outline-none focus:ring-4 focus:ring-gold-primary/10"
          placeholder="••••••••"
        />

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold-primary py-3.5 text-sm font-medium text-[#0A0A0C] transition-colors duration-300 hover:bg-gold-light disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'دخول'}
        </button>
      </form>
    </main>
  );
}
