'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Zap, X, Star, ShoppingBag, TrendingUp, Crown, Sparkles, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

const tierBadge = (tier: string) => {
  if (tier === 'premium') return <span className="badge-premium">Premium</span>;
  if (tier === 'standard') return <span className="badge-standard">Standard</span>;
  return <span className="badge-budget">Budget</span>;
};

const SECTIONS = [
  { key: 'all',      label: 'All Coupons',         icon: ShoppingBag },
  { key: 'best',     label: 'Best Coupons',         icon: Crown },
  { key: 'premium',  label: 'Premium',              icon: Sparkles },
  { key: 'trending', label: "Last Month's Fav",     icon: TrendingUp },
  { key: 'budget',   label: 'Not-So Premium',       icon: Clock },
];

function BrandLogo({ url, name }: { url?: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!url || err) {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br from-brand-600 to-purple-700 flex-shrink-0">
        {name.charAt(0)}
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
      <img src={url} alt={name} onError={() => setErr(true)} className="w-full h-full object-contain p-1" />
    </div>
  );
}

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [showGenModal, setShowGenModal] = useState(searchParams.get('generate') === 'true');
  const [genCard, setGenCard] = useState('');
  const [genCategory, setGenCategory] = useState('');
  const [genSub, setGenSub] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState<any>(null);
  const [purchaseCard, setPurchaseCard] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  const fetchCoupons = () => {
    const params: any = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedSub) params.subcategory = selectedSub;
    if (activeSection !== 'all') params.section = activeSection;
    api.get('/coupons', { params }).then(res => setCoupons(res.data.coupons)).catch(() => {});
  };

  useEffect(() => {
    Promise.all([api.get('/coupons/categories'), api.get('/cards')]).then(([catRes, cardRes]) => {
      setCategories(catRes.data.categories);
      setCards(cardRes.data.cards);
      if (cardRes.data.cards.length > 0) { setGenCard(cardRes.data.cards[0].id); setPurchaseCard(cardRes.data.cards[0].id); }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCoupons(); }, [search, selectedCategory, selectedSub, activeSection]);

  const handleGenerate = async () => {
    if (!genCard) return toast.error('Select a card first');
    setGenerating(true);
    try {
      const res = await api.post('/coupons/generate', {
        card_id: genCard,
        ...(genCategory && { category_slug: genCategory }),
        ...(genSub && { subcategory_slug: genSub }),
      });
      const b = res.data.breakdown;
      toast.success(`🎉 Generated ${res.data.coupon.brand_name}! 500 pts charged.`);
      setShowGenModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Generation failed');
    } finally { setGenerating(false); }
  };

  const handlePurchase = async () => {
    if (!purchaseCard || !showPurchaseModal) return;
    setPurchasing(true);
    try {
      await api.post(`/coupons/${showPurchaseModal.id}/purchase`, { card_id: purchaseCard });
      toast.success(`Purchased ${showPurchaseModal.brand_name}!`);
      setShowPurchaseModal(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Purchase failed');
    } finally { setPurchasing(false); }
  };

  const activeCategory = categories.find(c => c.slug === selectedCategory);
  const T = (v: string) => ({ color: `var(--${v})` });

  // Dynamic price label based on demand_score
  const demandLabel = (score: number) => {
    if (score >= 90) return { label: '🔥 Hot', color: '#ef4444' };
    if (score >= 75) return { label: '📈 Trending', color: '#f59e0b' };
    return null;
  };

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Marketplace</h1>
            <p className="text-sm mt-1" style={T('text-muted')}>{coupons.length} coupons available</p>
          </div>
          <button onClick={() => setShowGenModal(true)} className="btn-primary">
            <Zap className="w-4 h-4" /> Smart Generate
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={activeSection === s.key
                ? { background: 'var(--brand-accent)', color: '#fff' }
                : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }
              }>
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={T('text-hint')} />
            <input type="text" placeholder="Search brands..." value={search}
              onChange={e => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setSelectedSub(''); }}
            className="input w-auto min-w-40">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
          </select>
          {activeCategory?.subcategories?.[0]?.slug && (
            <select value={selectedSub} onChange={e => setSelectedSub(e.target.value)} className="input w-auto min-w-36">
              <option value="">All Brands</option>
              {activeCategory.subcategories.map((s: any) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          )}
          {(search || selectedCategory || selectedSub) && (
            <button onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedSub(''); }}
              className="btn-secondary px-3 py-2.5 text-xs">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Coupon grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-52 skeleton rounded-2xl" />)}
          </div>
        ) : coupons.length === 0 ? (
          <div className="card p-16 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={T('text-hint')} />
            <p style={T('text-muted')}>No coupons found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => {
              const demand = demandLabel(c.demand_score);
              return (
                <div key={c.id} className="card card-hover p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <BrandLogo url={c.brand_logo_url} name={c.brand_name} />
                      <div>
                        <div className="font-semibold text-sm" style={T('text-primary')}>{c.brand_name}</div>
                        <div className="text-xs" style={T('text-muted')}>{c.parent_category_name || c.category_name}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {tierBadge(c.tier)}
                      {demand && <span className="text-xs font-semibold" style={{ color: demand.color }}>{demand.label}</span>}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm leading-relaxed mb-3" style={T('text-secondary')}>{c.title}</p>
                    {c.discount_label && (
                      <div className="inline-block px-3 py-1 rounded-lg text-sm font-bold mb-3"
                        style={{ background: 'var(--brand-soft)', border: '1px solid rgba(192,68,240,0.20)', color: 'var(--brand-accent)' }}>
                        {c.discount_label}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="points-chip">
                      <Star className="w-3 h-3 fill-current" />
                      {c.points_required} pts
                    </div>
                    <button onClick={() => setShowPurchaseModal(c)} className="btn-secondary text-xs px-3 py-1.5">
                      Redeem
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Smart Generate Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 page-enter">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-400" /> Smart Generate
              </h2>
              <button onClick={() => setShowGenModal(false)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Always charges <strong>500 points</strong>. Narrowing down gets you a better coupon value from a lower tier.
            </p>

            {/* Breakdown explainer */}
            <div className="rounded-xl p-3 mb-5 text-xs space-y-1.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>How points are charged:</div>
              <div className="flex justify-between" style={{ color: genCategory ? 'var(--text-hint)' : 'var(--text-primary)' }}>
                <span>No filter → 500-pt coupon</span><span className="font-bold">500 pts</span>
              </div>
              <div className="flex justify-between" style={{ color: genCategory && !genSub ? 'var(--text-primary)' : 'var(--text-hint)' }}>
                <span>Category filter → 350-pt coupon + 150 premium</span><span className="font-bold">500 pts</span>
              </div>
              <div className="flex justify-between" style={{ color: genSub ? 'var(--text-primary)' : 'var(--text-hint)' }}>
                <span>Brand filter → 200-pt coupon + 150 + 150</span><span className="font-bold">500 pts</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Use Points From</label>
                <select value={genCard} onChange={e => setGenCard(e.target.value)} className="input">
                  {cards.length === 0
                    ? <option>No cards — add a card first</option>
                    : cards.map(c => <option key={c.id} value={c.id}>{c.card_name} •••• {c.last_four_digits} ({c.available_points?.toLocaleString()} pts)</option>)}
                </select>
              </div>
              <div>
                <label className="label">Category (optional)</label>
                <select value={genCategory} onChange={e => { setGenCategory(e.target.value); setGenSub(''); }} className="input">
                  <option value="">No filter — best match</option>
                  {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              {genCategory && categories.find(c => c.slug === genCategory)?.subcategories?.[0]?.slug && (
                <div>
                  <label className="label">Brand (optional)</label>
                  <select value={genSub} onChange={e => setGenSub(e.target.value)} className="input">
                    <option value="">Any brand</option>
                    {categories.find(c => c.slug === genCategory)?.subcategories?.map((s: any) => (
                      <option key={s.slug} value={s.slug}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowGenModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleGenerate} disabled={generating || !genCard} className="btn-primary flex-1">
                {generating ? 'Generating...' : '✨ Generate (500 pts)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-6 page-enter">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold">Confirm Purchase</h2>
              <button onClick={() => setShowPurchaseModal(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <BrandLogo url={showPurchaseModal.brand_logo_url} name={showPurchaseModal.brand_name} />
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{showPurchaseModal.brand_name}</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{showPurchaseModal.title}</div>
                </div>
              </div>
              <div className="mt-3 points-chip w-fit">
                <Star className="w-3 h-3 fill-current" /> {showPurchaseModal.points_required} pts required
              </div>
            </div>
            <div className="mb-4">
              <label className="label">Deduct points from</label>
              <select value={purchaseCard} onChange={e => setPurchaseCard(e.target.value)} className="input">
                {cards.map(c => <option key={c.id} value={c.id}>{c.card_name} •••• {c.last_four_digits} ({c.available_points?.toLocaleString()} pts)</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPurchaseModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePurchase} disabled={purchasing} className="btn-primary flex-1">
                {purchasing ? 'Purchasing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
