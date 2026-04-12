'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { TrendingUp, AlertTriangle, CreditCard, Ticket, Zap, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

const tierBadge = (tier: string) => {
  if (tier === 'premium') return <span className="badge-premium">Premium</span>;
  if (tier === 'standard') return <span className="badge-standard">Standard</span>;
  return <span className="badge-budget">Budget</span>;
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="h-8 skeleton w-48 mb-8 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
      </div>
    </AppLayout>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Here's your rewards summary</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card glow-brand">
            <TrendingUp className="w-5 h-5 text-brand-400 mb-1" />
            <div className="stat-value">{data?.total_points?.toLocaleString()}</div>
            <div className="stat-label">Total Points</div>
          </div>
          <div className="stat-card">
            <AlertTriangle className="w-5 h-5 text-amber-400 mb-1" />
            <div className="stat-value" style={{ color: '#f59e0b' }}>{data?.total_expiring_points?.toLocaleString()}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
          <div className="stat-card">
            <Ticket className="w-5 h-5 text-emerald-400 mb-1" />
            <div className="stat-value">{data?.coupon_stats?.active_coupons || 0}</div>
            <div className="stat-label">Active Coupons</div>
          </div>
          <div className="stat-card">
            <Zap className="w-5 h-5 text-purple-400 mb-1" />
            <div className="stat-value" style={{ color: '#c084fc' }}>{data?.points_spent_this_month?.toLocaleString()}</div>
            <div className="stat-label">Spent This Month</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card summary */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Your Cards</h2>
              <Link href="/cards" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.card_summary?.length === 0 ? (
              <div className="card p-8 text-center">
                <CreditCard className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-hint)' }} />
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>No cards linked yet</p>
                <Link href="/cards" className="btn-primary text-sm px-5 py-2">Add a Card</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.card_summary?.map((card: any) => (
                  <div key={card.id} className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{card.card_name}</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-hint)' }}>•••• {card.last_four_digits}</span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.bank_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-brand-400">{card.available_points?.toLocaleString()}</div>
                      <div className="text-xs" style={{ color: 'var(--text-hint)' }}>points</div>
                    </div>
                    {card.expiring_points > 0 && (
                      <div className="text-right">
                        <div className="text-xs font-medium text-amber-400">{card.expiring_points} expiring</div>
                        <div className="text-xs" style={{ color: 'var(--text-hint)' }}>
                          {card.expiry_date ? format(new Date(card.expiry_date), 'MMM d') : ''}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {(data?.expiring_points?.length ?? 0) > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Points Expiring
                </h2>
                <div className="space-y-2">
                  {data?.expiring_points?.map((ep: any, i: number) => (
                    <div key={i} className="card p-3" style={{ borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)' }}>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{ep.card_name} •••• {ep.last_four_digits}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-amber-400">{ep.expiring_points} pts</span>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-hint)' }}>
                          <Clock className="w-3 h-3" />
                          {format(new Date(ep.expiry_date), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/marketplace" className="btn-gold w-full mt-3 text-sm py-2">Redeem Before Expiry</Link>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Recent Coupons</h2>
                <Link href="/coupons" className="text-xs text-brand-400 hover:text-brand-300">View all</Link>
              </div>
              {data?.recent_coupons?.length === 0 ? (
                <div className="card p-5 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No coupons yet</p>
                  <Link href="/marketplace" className="text-xs text-brand-400 mt-2 block">Browse marketplace →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {data?.recent_coupons?.map((c: any) => (
                    <div key={c.id} className="card p-3 flex items-center gap-3">
                      <span className="text-lg">{c.icon || '🎫'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.brand_name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {c.points_spent} pts · {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      {tierBadge(c.tier)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick action banner */}
        <div className="mt-8 card p-6 flex items-center justify-between flex-wrap gap-4"
          style={{ background: 'rgba(192,68,240,0.06)', borderColor: 'rgba(192,68,240,0.18)' }}>
          <div>
            <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Ready to redeem?</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              You have {data?.total_points?.toLocaleString()} points available
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/marketplace" className="btn-secondary text-sm">Browse Coupons</Link>
            <Link href="/marketplace?generate=true" className="btn-primary text-sm">
              <Zap className="w-4 h-4" /> Auto-Generate
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
