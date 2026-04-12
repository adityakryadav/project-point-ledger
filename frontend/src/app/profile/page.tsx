'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { CreditCard, TrendingDown, TrendingUp, RefreshCw, Edit2, Check, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const T = (v: string) => ({ color: `var(--${v})` });

export default function ProfilePage() {
  const { refreshUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', age: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/profile').then(res => {
      setProfile(res.data);
      setEditForm({ name: res.data.user.name, age: res.data.user.age || '' });
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/profile', { name: editForm.name, age: editForm.age ? parseInt(editForm.age) : undefined });
      await refreshUser();
      setProfile((p: any) => ({ ...p, user: { ...p.user, name: editForm.name, age: editForm.age } }));
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update'); } finally { setSaving(false); }
  };

  if (loading) return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="h-36 skeleton rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>
      </div>
    </AppLayout>
  );

  const txnIcon = (type: string) => {
    if (type === 'spent') return <TrendingDown className="w-4 h-4" style={{ color:'#ef4444' }} />;
    return <TrendingUp className="w-4 h-4" style={{ color:'#10b981' }} />;
  };

  const initials = profile?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-5">
        {/* Profile header */}
        <div className="card p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center text-xl font-bold text-white flex-shrink-0 overflow-hidden">
              {profile?.user?.avatar_url
                ? <img src={profile.user.avatar_url} alt="" className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <input value={editForm.name} onChange={e => setEditForm({...editForm,name:e.target.value})}
                    className="input text-lg font-display font-bold py-1 px-2 w-auto" style={{ maxWidth:220 }} />
                  <input type="number" placeholder="Age" value={editForm.age} onChange={e => setEditForm({...editForm,age:e.target.value})}
                    className="input w-20 py-1 px-2 text-sm" min="18" max="100" />
                  <button onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg transition-colors" style={T('text-muted')}
                    onMouseEnter={e => (e.currentTarget.style.background='var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display text-2xl font-bold">{profile?.user?.name}</h1>
                  {profile?.user?.age && <span className="text-sm" style={T('text-muted')}>Age {profile.user.age}</span>}
                  <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg ml-1 transition-colors" style={T('text-hint')}
                    onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-hint)'; }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="text-sm" style={T('text-muted')}>{profile?.user?.email}</div>
              <div className="text-xs mt-1" style={T('text-hint')}>
                Member since {profile?.user?.created_at ? format(new Date(profile.user.created_at), 'MMMM yyyy') : ''}
                {profile?.user?.auth_provider !== 'local' && ` · via ${profile?.user?.auth_provider}`}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-value text-brand-500">{profile?.total_points?.toLocaleString()}</div>
            <div className="stat-label">Total Points</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profile?.cards?.length || 0}</div>
            <div className="stat-label">Linked Cards</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profile?.coupons?.filter((c:any) => c.status === 'active').length || 0}</div>
            <div className="stat-label">Active Coupons</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profile?.coupons?.filter((c:any) => c.status === 'redeemed').length || 0}</div>
            <div className="stat-label">Redeemed</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Linked Cards */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2" style={T('text-secondary')}>
              <CreditCard className="w-4 h-4 text-brand-500" /> Linked Cards
            </h2>
            {profile?.cards?.length === 0 ? (
              <div className="card p-6 text-center text-sm" style={T('text-muted')}>No cards linked</div>
            ) : (
              <div className="space-y-2">
                {profile?.cards?.map((c: any) => (
                  <div key={c.id} className="card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={T('text-primary')}>{c.card_name}</div>
                      <div className="text-xs" style={T('text-muted')}>{c.bank_name} •••• {c.last_four_digits}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-brand-500">{c.available_points?.toLocaleString()}</div>
                      <div className="text-xs" style={T('text-hint')}>pts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reward History */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2" style={T('text-secondary')}>
              <TrendingUp className="w-4 h-4 text-brand-500" /> Reward History
            </h2>
            {profile?.reward_history?.length === 0 ? (
              <div className="card p-6 text-center text-sm" style={T('text-muted')}>No transactions yet</div>
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {profile?.reward_history?.map((h: any) => (
                  <div key={h.id} className="card p-3 flex items-center gap-3">
                    {txnIcon(h.transaction_type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate" style={T('text-secondary')}>{h.description}</div>
                      <div className="text-xs" style={T('text-hint')}>{formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}</div>
                    </div>
                    <div className="text-sm font-bold" style={{ color: h.transaction_type === 'spent' ? '#ef4444' : '#10b981' }}>
                      {h.transaction_type === 'spent' ? '-' : '+'}{Math.abs(h.points).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coupon History */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2" style={T('text-secondary')}>
            Coupon History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile?.coupons?.slice(0,6).map((c: any) => (
              <div key={c.id} className="card p-3 flex items-center gap-3" style={{ opacity: c.status !== 'active' ? 0.55 : 1 }}>
                <span className="text-xl">{c.icon || '🎫'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={T('text-primary')}>{c.brand_name}</div>
                  <div className="text-xs truncate" style={T('text-muted')}>{c.title}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs px-2 py-0.5 rounded-full border capitalize"
                    style={c.status === 'active'
                      ? { background:'rgba(16,185,129,0.10)', color:'#059669', borderColor:'rgba(16,185,129,0.25)' }
                      : c.status === 'redeemed'
                      ? { background:'var(--bg-elevated)', color:'var(--text-muted)', borderColor:'var(--border-subtle)' }
                      : { background:'rgba(239,68,68,0.08)', color:'#dc2626', borderColor:'rgba(239,68,68,0.20)' }
                    }>{c.status}</div>
                  <div className="text-xs mt-0.5" style={T('text-hint')}>{c.points_spent} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
