'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Zap, X, ShoppingBag, TrendingUp, Crown, Sparkles, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getCouponBrandStyle } from '@/lib/brandStyles';
import BrandedCouponMini from '@/components/ui/BrandedCouponMini';
import PortalModal from '@/components/ui/PortalModal';

const SECTIONS = [
  { key: 'all',      label: 'All Coupons',     icon: ShoppingBag },
  { key: 'best',     label: 'Best Coupons',     icon: Crown },
  { key: 'premium',  label: 'Premium',          icon: Sparkles },
  { key: 'trending', label: "Last Month's Fav", icon: TrendingUp },
  { key: 'budget',   label: 'Not-So Premium',   icon: Clock },
];

const MIN_POINTS = 50;


function CouponLogo({ url, name, size = 40 }: { url?: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const style = getCouponBrandStyle(name);
  const src = url || '';
  if (!src || err) {
    return (
      <div style={{ width: size, height: size, borderRadius: 10, background: style.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42, fontWeight: 800, color: style.bg }}>
        {name.charAt(0)}
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}>
      <img src={src} alt={name} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
    </div>
  );
}

function CouponCard({ c }: { c: any }) {
  const style = getCouponBrandStyle(c.brand_name);
  const demand = c.demand_score >= 90 ? '🔥 Hot' : c.demand_score >= 75 ? '📈 Trending' : null;
  return (
    <div style={{
      background: style.bg, borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.28)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.18)'; }}
    >
      <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CouponLogo url={c.brand_logo_url} name={c.brand_name} size={40} />
          <div>
            <div style={{ color: style.text, fontWeight: 700, fontSize: 14 }}>{c.brand_name}</div>
            <div style={{ color: style.text, opacity: 0.55, fontSize: 11 }}>{c.parent_category_name || c.category_name}</div>
          </div>
        </div>
        {demand && <span style={{ fontSize: 11, fontWeight: 700, color: style.accent }}>{demand}</span>}
      </div>
      <div style={{ height: 1, background: `${style.text}15`, margin: '0 18px' }} />
      <div style={{ padding: '12px 18px 8px', flex: 1 }}>
        {c.discount_label && (
          <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 8, marginBottom: 6, background: `${style.accent}22`, border: `1px solid ${style.accent}44`, color: style.accent, fontWeight: 800, fontSize: 17 }}>{c.discount_label}</div>
        )}
        <p style={{ color: style.text, opacity: 0.7, fontSize: 12, lineHeight: 1.5, margin: 0 }}>{c.title}</p>
      </div>
      <div style={{ padding: '10px 18px', borderTop: `1px solid ${style.text}15`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: style.text, opacity: 0.45, fontWeight: 500 }}>Generate to redeem</span>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: `${style.text}15`, color: style.text, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{c.tier}</span>
      </div>
    </div>
  );
}

interface CouponSpec { category_slug: string; subcategory_slug: string; sameAsFirst: boolean; }

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
  const [visibleCount, setVisibleCount] = useState(6);
  const GLIMPSE_COUNT = 6;

  const [genCard, setGenCard] = useState('');
  const [pointsToConvert, setPointsToConvert] = useState(0);
  const [couponCount, setCouponCount] = useState(1);
  const [couponSpecs, setCouponSpecs] = useState<CouponSpec[]>([{ category_slug: '', subcategory_slug: '', sameAsFirst: false }]);
  const [generating, setGenerating] = useState(false);

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
      if (cardRes.data.cards.length > 0) setGenCard(cardRes.data.cards[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCoupons(); setVisibleCount(6); }, [search, selectedCategory, selectedSub, activeSection]);

  const selectedCardData = cards.find(c => c.id === genCard);
  const availablePoints = selectedCardData?.available_points || 0;
  const maxCoupons = pointsToConvert >= MIN_POINTS ? Math.min(Math.floor(pointsToConvert / MIN_POINTS), 10) : 0;
  const ptsPerCoupon = couponCount > 0 ? Math.floor(pointsToConvert / couponCount) : 0;

  // Sync couponSpecs array length with couponCount
  useEffect(() => {
    setCouponSpecs(prev => {
      const newSpecs = [...prev];
      while (newSpecs.length < couponCount) newSpecs.push({ category_slug: '', subcategory_slug: '', sameAsFirst: newSpecs.length > 0 ? true : false });
      return newSpecs.slice(0, couponCount);
    });
  }, [couponCount]);

  const updateSpec = (idx: number, field: keyof CouponSpec, value: any) => {
    setCouponSpecs(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'sameAsFirst' && value && idx > 0) {
        next[idx].category_slug = next[0].category_slug;
        next[idx].subcategory_slug = next[0].subcategory_slug;
      }
      return next;
    });
  };

  // When first spec changes, propagate to all "same as first" specs
  const updateFirstSpec = (field: 'category_slug' | 'subcategory_slug', value: string) => {
    setCouponSpecs(prev => prev.map((s, i) => {
      if (i === 0) return { ...s, [field]: value, ...(field === 'category_slug' ? { subcategory_slug: '' } : {}) };
      if (s.sameAsFirst) return { ...s, [field]: value, ...(field === 'category_slug' ? { subcategory_slug: '' } : {}) };
      return s;
    }));
  };

  const handleGenerate = async () => {
    if (!genCard) return toast.error('Select a card first');
    if (pointsToConvert < MIN_POINTS) return toast.error(`Minimum ${MIN_POINTS} points needed`);
    if (pointsToConvert > availablePoints) return toast.error('Not enough points on selected card');

    setGenerating(true);
    let successCount = 0;
    for (let i = 0; i < couponCount; i++) {
      const spec = couponSpecs[i] || couponSpecs[0];
      try {
        await api.post('/coupons/generate', {
          card_id: genCard,
          points_to_spend: ptsPerCoupon,
          ...(spec.category_slug && { category_slug: spec.category_slug }),
          ...(spec.subcategory_slug && { subcategory_slug: spec.subcategory_slug }),
        });
        successCount++;
      } catch (err: any) {
        toast.error(err?.response?.data?.error || `Coupon ${i + 1} failed`);
        break;
      }
    }
    setGenerating(false);
    if (successCount > 0) {
      toast.success(`🎉 Generated ${successCount} coupon${successCount > 1 ? 's' : ''}! Check My Coupons.`);
      setShowGenModal(false);
    }
  };

  const activeCategory = categories.find(c => c.slug === selectedCategory);
  const T = (v: string) => ({ color: `var(--${v})` });

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Marketplace</h1>
            <p className="text-sm mt-1" style={T('text-muted')}>Browse coupons — use Generate to convert your points</p>
          </div>
          <button onClick={() => setShowGenModal(true)} className="btn-primary">
            <Zap className="w-4 h-4" /> Generate Coupons
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
          <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedSub(''); }} className="input w-auto min-w-40">
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
            <button onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedSub(''); }} className="btn-secondary px-3 py-2.5 text-xs">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Grid — shows glimpse, loads 6 more each click */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="h-52 skeleton rounded-2xl" />)}
          </div>
        ) : coupons.length === 0 ? (
          <div className="card p-16 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={T('text-hint')} />
            <p style={T('text-muted')}>No coupons found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {coupons.slice(0, visibleCount).map(c => <CouponCard key={c.id} c={c} />)}
            </div>

            {/* Pagination controls */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm" style={T('text-muted')}>
                Showing {Math.min(visibleCount, coupons.length)} of {coupons.length} coupons
              </p>
              <div className="flex gap-3">
                {visibleCount < coupons.length && (
                  <button
                    onClick={() => setVisibleCount(v => v + GLIMPSE_COUNT)}
                    className="btn-secondary px-6 py-2.5"
                  >
                    Show 6 more ↓
                  </button>
                )}
                {visibleCount > GLIMPSE_COUNT && (
                  <button
                    onClick={() => { setVisibleCount(GLIMPSE_COUNT); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="btn-secondary px-6 py-2.5"
                  >
                    ↑ Show less
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Generate Modal — rendered via portal directly to document.body, always centered to viewport */}
      {showGenModal && (
        <PortalModal onClose={() => setShowGenModal(false)} maxWidth={520}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="font-display text-xl font-bold" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <Zap style={{ width: 20, color: 'var(--brand-accent)' }} /> Generate Coupons
            </h2>
            <button onClick={() => setShowGenModal(false)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <X style={{ width: 18 }} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Card */}
            <div>
              <label className="label">Use Points From Card</label>
              <select value={genCard} onChange={e => { setGenCard(e.target.value); setPointsToConvert(0); setCouponCount(1); }} className="input">
                {cards.length === 0 ? <option>No cards — add a card first</option>
                  : cards.map(c => <option key={c.id} value={c.id}>{c.card_name} •••• {c.last_four_digits} ({c.available_points?.toLocaleString()} pts)</option>)}
              </select>
            </div>

            {/* Points slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="label" style={{ margin: 0 }}>Points to Convert</label>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-accent)' }}>{pointsToConvert.toLocaleString()} pts</span>
              </div>
              <input type="range" min={0} max={availablePoints} step={1} value={pointsToConvert}
                onChange={e => { setPointsToConvert(parseInt(e.target.value)); setCouponCount(1); }}
                style={{ width: '100%', accentColor: 'var(--brand-accent)' }} disabled={availablePoints === 0} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-hint)', marginTop: 4 }}>
                <span>0</span><span>{availablePoints.toLocaleString()} max</span>
              </div>
            </div>

            {/* Coupon count slider */}
            {pointsToConvert >= MIN_POINTS && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="label" style={{ margin: 0 }}>Number of Coupons</label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-accent)' }}>{couponCount}</span>
                </div>
                <input type="range" min={1} max={maxCoupons} step={1} value={Math.min(couponCount, maxCoupons)}
                  onChange={e => setCouponCount(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-accent)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-hint)', marginTop: 4 }}>
                  <span>1</span><span>{maxCoupons} max</span>
                </div>
                <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>~{ptsPerCoupon.toLocaleString()} pts per coupon × {couponCount}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-accent)' }}>{pointsToConvert.toLocaleString()} pts total</span>
                </div>
              </div>
            )}

            {/* Per-coupon specs */}
            {pointsToConvert >= MIN_POINTS && couponCount >= 1 && (
              <div>
                <label className="label">Coupon Preferences</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Array.from({ length: couponCount }).map((_, idx) => {
                    const spec = couponSpecs[idx] || { category_slug: '', subcategory_slug: '', sameAsFirst: false };
                    const useSame = idx > 0 && spec.sameAsFirst;
                    const cat = useSame ? couponSpecs[0].category_slug : spec.category_slug;
                    const catData = categories.find(c => c.slug === cat);
                    return (
                      <div key={idx} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Coupon {idx + 1}</span>
                          {idx > 0 && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <input type="checkbox" checked={spec.sameAsFirst}
                                onChange={e => updateSpec(idx, 'sameAsFirst', e.target.checked)}
                                style={{ accentColor: 'var(--brand-accent)' }} />
                              Same as first
                            </label>
                          )}
                        </div>
                        {!useSame && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <select value={spec.category_slug} onChange={e => updateSpec(idx, 'category_slug', e.target.value)} className="input" style={{ flex: 1, fontSize: 12 }}>
                              <option value="">Any category</option>
                              {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
                            </select>
                            {catData?.subcategories?.[0]?.slug && (
                              <select value={spec.subcategory_slug} onChange={e => updateSpec(idx, 'subcategory_slug', e.target.value)} className="input" style={{ flex: 1, fontSize: 12 }}>
                                <option value="">Any brand</option>
                                {catData.subcategories.map((s: any) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                              </select>
                            )}
                          </div>
                        )}
                        {useSame && (
                          <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>
                            Same as Coupon 1: {couponSpecs[0].category_slug || 'Any category'}{couponSpecs[0].subcategory_slug ? ` → ${couponSpecs[0].subcategory_slug}` : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  💡 Same-brand multiple requests will get different offers where possible.
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => setShowGenModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleGenerate} disabled={generating || pointsToConvert < MIN_POINTS || !genCard} className="btn-primary" style={{ flex: 1 }}>
              {generating ? 'Generating...' : `✨ Get ${couponCount} Coupon${couponCount > 1 ? 's' : ''}`}
            </button>
          </div>
        </PortalModal>
      )}
    </AppLayout>
  );
}
