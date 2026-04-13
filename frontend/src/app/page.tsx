'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Sparkles, CreditCard, ShoppingBag, TrendingUp, ArrowRight, Star } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, refreshUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    refreshUser().then(() => {
      if (useAuthStore.getState().isAuthenticated) router.push('/dashboard');
    });
  }, []);

  const features = [
    { icon: CreditCard, title: 'Link Your Cards', desc: 'Connect all your credit & debit cards in one place. We aggregate your reward points automatically.' },
    { icon: TrendingUp, title: 'Track Points', desc: 'See expiring points, total balance, and card-wise breakdown — all on a single dashboard.' },
    { icon: Sparkles, title: 'Smart Generation', desc: 'Our algorithm picks the best coupon for your points balance with smart tier-fallback logic.' },
    { icon: ShoppingBag, title: 'Curated Marketplace', desc: 'Browse 100+ coupons across food, travel, fashion, movies, and more. Premium picks included.' },
  ];

  const stats = [
    { value: '₹15,000 Cr', label: 'Points unredeemed annually' },
    { value: '50+', label: 'Brand partners' },
    { value: '200–500', label: 'Point tiers available' },
    { value: '99%', label: 'User satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/[0.04] bg-surface-950/80 backdrop-blur-xl">
        <span className="font-display text-xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
          Point Ledger
        </span>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
          <Link href="/auth?tab=register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 text-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-700/10 blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto page-enter">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm mb-8">
            <Star className="w-3.5 h-3.5 fill-current" />
            Turn idle reward points into real savings
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold leading-tight mb-6">
            Your points deserve{' '}
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-brand-300 bg-clip-text text-transparent">
              better rewards
            </span>
          </h1>

          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Aggregate credit card reward points across all your cards, and redeem them for
            curated coupons across food, travel, fashion, and more. Smart. Simple. Rewarding.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth?tab=register" className="btn-primary px-8 py-3 text-base">
              Start Redeeming <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth" className="btn-secondary px-8 py-3 text-base">
              Sign In
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative max-w-3xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className="font-display text-2xl font-bold text-brand-300">{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="font-display text-3xl font-bold text-center mb-12 text-white/90">
          Everything you need to maximise rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card card-hover p-6 flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-6 mb-16 max-w-4xl md:mx-auto rounded-3xl overflow-hidden">
        <div className="bg-gradient-brand p-12 text-center noise">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to redeem smarter?</h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Join thousands of users who no longer let their reward points expire unused.
          </p>
          <Link href="/auth?tab=register" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:bg-white/90 transition-colors">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="text-center text-white/20 text-sm py-8 border-t border-white/[0.04]">
        © 2025 Point Ledger. All rights reserved.
      </footer>
    </div>
  );
}
