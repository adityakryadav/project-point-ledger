'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Ticket, ExternalLink, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { format, isPast } from 'date-fns';

// Brand color map (same as marketplace)
const BRAND_STYLES: Record<string, { bg: string; accent: string; text: string }> = {
  "Dominos":    { bg: '#003087', accent: '#E31837', text: '#ffffff' },
  "Burger King":{ bg: '#F5EBDC', accent: '#D62300', text: '#502314' },
  "McDonalds":  { bg: '#FFC72C', accent: '#DA020E', text: '#27251F' },
  "Swiggy":     { bg: '#FC8019', accent: '#ffffff', text: '#ffffff' },
  "Zomato":     { bg: '#E23744', accent: '#ffffff', text: '#ffffff' },
  "KFC":        { bg: '#F40027', accent: '#ffffff', text: '#ffffff' },
  "Pizza Hut":  { bg: '#EE3124', accent: '#ffffff', text: '#ffffff' },
  "Zara":       { bg: '#000000', accent: '#ffffff', text: '#ffffff' },
  "Zudio":      { bg: '#1A1A2E', accent: '#E94560', text: '#ffffff' },
  "H&M":        { bg: '#E50010', accent: '#ffffff', text: '#ffffff' },
  "Myntra":     { bg: '#FF3F6C', accent: '#ffffff', text: '#ffffff' },
  "Nike":       { bg: '#111111', accent: '#ffffff', text: '#ffffff' },
  "PVR":        { bg: '#E71C23', accent: '#FFD700', text: '#ffffff' },
  "INOX":       { bg: '#00437A', accent: '#ffffff', text: '#ffffff' },
  "IMAX":       { bg: '#000000', accent: '#C9A84C', text: '#C9A84C' },
  "BookMyShow": { bg: '#E51937', accent: '#ffffff', text: '#ffffff' },
  "MakeMyTrip": { bg: '#E03628', accent: '#ffffff', text: '#ffffff' },
  "Cleartrip":  { bg: '#F77C00', accent: '#ffffff', text: '#ffffff' },
  "Ola":        { bg: '#1C9F3C', accent: '#ffffff', text: '#ffffff' },
  "Uber":       { bg: '#000000', accent: '#ffffff', text: '#ffffff' },
  "Amazon":     { bg: '#232F3E', accent: '#FF9900', text: '#FF9900' },
  "Flipkart":   { bg: '#2874F0', accent: '#FFD700', text: '#ffffff' },
  "Croma":      { bg: '#12783D', accent: '#ffffff', text: '#ffffff' },
  "Apple":      { bg: '#1D1D1F', accent: '#ffffff', text: '#ffffff' },
  "Samsung":    { bg: '#1428A0', accent: '#ffffff', text: '#ffffff' },
  "Nykaa":      { bg: '#FC2779', accent: '#ffffff', text: '#ffffff' },
  "Mamaearth":  { bg: '#F5A623', accent: '#ffffff', text: '#ffffff' },
  "Cult.fit":   { bg: '#000000', accent: '#FF6B00', text: '#ffffff' },
  "Decathlon":  { bg: '#0082C8', accent: '#ffffff', text: '#ffffff' },
  "Puma":       { bg: '#000000', accent: '#ffffff', text: '#ffffff' },
};

function getBrandStyle(name: string) {
  return BRAND_STYLES[name] || { bg: '#1c1c1a', accent: '#c044f0', text: '#ffffff' };
}

function BrandLogo({ url, name, size = 40 }: { url?: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const style = getBrandStyle(name);
  if (!url || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 10, background: style.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, fontWeight: 800, color: style.bg, flexShrink: 0,
      }}>
        {name.charAt(0)}
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, overflow: 'hidden',
      flexShrink: 0, background: '#fff', border: '1px solid rgba(0,0,0,0.10)',
    }}>
      <img src={url} alt={name} onError={() => setErr(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
    </div>
  );
}

const QUOTES = [
  "The secret to getting ahead is getting started.",
  "Every point spent is a memory created.",
  "Small savings today, big rewards tomorrow.",
  "Spend wisely, live richly.",
  "The best things in life are worth every point.",
  "Treat yourself — you've earned it.",
  "Life is short. Redeem your points.",
];

function generatePDF(bill: any) {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const date = format(new Date(bill.created_at), 'dd MMM yyyy, hh:mm a');
  const style = getBrandStyle(bill.brand_name);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background: #f5f4f0; }
  .page { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .header { background: ${style.bg}; padding: 28px 32px; display: flex; align-items: center; gap: 16px; }
  .logo-box { width: 52px; height: 52px; border-radius: 12px; background: ${style.accent}22; border: 2px solid ${style.accent}44; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .logo-box img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
  .logo-fallback { width: 52px; height: 52px; border-radius: 12px; background: ${style.accent}; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: ${style.bg}; flex-shrink: 0; }
  .header-text h1 { margin: 0; font-size: 22px; font-weight: 800; color: ${style.text}; }
  .header-text p  { margin: 4px 0 0; font-size: 12px; color: ${style.text}; opacity: 0.65; }
  .discount { display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 8px; background: ${style.accent}22; border: 1px solid ${style.accent}55; color: ${style.accent}; font-weight: 800; font-size: 20px; }
  .body { padding: 24px 32px; }
  .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin: 16px 0 8px; }
  .info-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f5f4f0; }
  .info-label { font-size: 13px; color: #666; }
  .info-value { font-size: 13px; color: #111; font-weight: 500; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; margin-top: 4px; }
  .total-label { font-size: 14px; font-weight: 700; color: #111; }
  .total-value { font-size: 14px; font-weight: 800; color: ${style.bg}; }
  .quote { margin-top: 20px; padding: 14px 18px; border-radius: 10px; background: #f9f8f5; border-left: 3px solid ${style.bg}; font-style: italic; font-size: 13px; color: #666; line-height: 1.6; }
  .footer { margin-top: 16px; padding-top: 14px; border-top: 1px solid #f0efe9; text-align: center; font-size: 11px; color: #bbb; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: capitalize;
    background: ${bill.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)'};
    color: ${bill.status === 'active' ? '#059669' : '#6b7280'}; }
</style></head><body>
<div class="page">
  <div class="header">
    ${bill.brand_logo_url
      ? `<div class="logo-box"><img src="${bill.brand_logo_url}" alt="${bill.brand_name}" /></div>`
      : `<div class="logo-fallback">${bill.brand_name.charAt(0)}</div>`}
    <div class="header-text">
      <h1>${bill.brand_name}</h1>
      <p>${bill.title}</p>
      ${bill.discount_label ? `<div class="discount">${bill.discount_label}</div>` : ''}
    </div>
  </div>
  <div class="body">
    <div class="section-title">Customer</div>
    <div class="info-row"><span class="info-label">Name</span><span class="info-value">${bill.user_name}</span></div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-value">${bill.user_email}</span></div>
    <div class="info-row"><span class="info-label">Date</span><span class="info-value">${date}</span></div>

    <div class="section-title">Card Used</div>
    <div class="info-row"><span class="info-label">Card</span><span class="info-value">${bill.card_name || 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">Bank</span><span class="info-value">${bill.bank_name || 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">Number</span><span class="info-value">•••• •••• •••• ${bill.last_four_digits || '----'}</span></div>

    <div class="section-title">Points Summary</div>
    <div class="info-row"><span class="info-label">Coupon face value</span><span class="info-value">${bill.breakdown_coupon || bill.points_spent} pts</span></div>
    <div class="info-row"><span class="info-label">Service charge</span><span class="info-value">${Math.max(0, bill.points_spent - (bill.breakdown_coupon || bill.points_spent))} pts</span></div>
    <div class="total-row"><span class="total-label">Total Points Charged</span><span class="total-value">${bill.points_spent} pts</span></div>

    <div class="quote">"${quote}"</div>
    <div class="footer">Point Ledger · Transaction ID: ${bill.id}</div>
  </div>
</div>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) return toast.error('Allow popups to download PDF');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}

export default function MyCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'active'|'redeemed'|'expired'>('all');
  const [redeeming, setRedeeming] = useState<string|null>(null);
  const [downloading, setDownloading] = useState<string|null>(null);

  useEffect(() => {
    api.get('/coupons/my-coupons')
      .then(res => setCoupons(res.data.coupons))
      .catch(() => toast.error('Failed to load coupons'))
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (coupon: any) => {
    setRedeeming(coupon.id);
    try {
      const res = await api.post(`/coupons/user/${coupon.id}/redeem`);
      window.open(res.data.redemption_url, '_blank', 'noopener,noreferrer');
      toast.success(`Redirecting to ${res.data.brand_name}...`);
      setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, status: 'redeemed' } : c));
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Redemption failed');
    } finally { setRedeeming(null); }
  };

  const handleDownloadBill = async (coupon: any) => {
    setDownloading(coupon.id);
    try {
      const res = await api.get(`/coupons/user/${coupon.id}/bill`);
      generatePDF(res.data.bill);
    } catch { toast.error('Failed to get bill'); }
    finally { setDownloading(null); }
  };

  const filtered = coupons.filter(c => filter === 'all' || c.status === filter);
  const counts = {
    all: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    redeemed: coupons.filter(c => c.status === 'redeemed').length,
    expired: coupons.filter(c => c.status === 'expired').length,
  };

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">My Coupons</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your generated coupons</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'var(--bg-elevated)' }}>
          {(['all','active','redeemed','expired'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-1.5"
              style={filter === f ? { background: 'var(--brand-accent)', color: '#fff' } : { color: 'var(--text-muted)' }}>
              {f}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: filter === f ? 'rgba(255,255,255,0.2)' : 'var(--bg-hover)' }}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <Ticket className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-hint)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {filter === 'all' ? 'No coupons yet — visit Marketplace to generate some!' : `No ${filter} coupons`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => {
              const bStyle = getBrandStyle(c.brand_name);
              const isExpired = c.expires_at && isPast(new Date(c.expires_at)) && c.status === 'active';
              const isRedeemed = c.status === 'redeemed';

              return (
                <div key={c.id} style={{
                  borderRadius: 16, overflow: 'hidden',
                  boxShadow: isRedeemed ? 'none' : '0 4px 20px rgba(0,0,0,0.12)',
                  opacity: isRedeemed ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}>
                  {/* Brand-styled header strip */}
                  <div style={{
                    background: bStyle.bg, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <BrandLogo url={c.brand_logo_url} name={c.brand_name} size={40} />
                      <div>
                        <div style={{ color: bStyle.text, fontWeight: 700, fontSize: 15 }}>{c.brand_name}</div>
                        <div style={{ color: bStyle.text, opacity: 0.6, fontSize: 11 }}>{c.category_name}</div>
                      </div>
                    </div>
                    {c.discount_label && (
                      <div style={{
                        padding: '3px 10px', borderRadius: 8, fontSize: 13, fontWeight: 800,
                        background: `${bStyle.accent}25`, color: bStyle.accent,
                        border: `1px solid ${bStyle.accent}40`,
                      }}>
                        {c.discount_label}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{
                    background: 'var(--bg-card)', padding: '14px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    borderLeft: `3px solid ${bStyle.bg}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{c.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {/* Status */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                          background: c.status === 'active' ? 'rgba(16,185,129,0.10)' : c.status === 'redeemed' ? 'var(--bg-elevated)' : 'rgba(239,68,68,0.08)',
                          color: c.status === 'active' ? '#059669' : c.status === 'redeemed' ? 'var(--text-muted)' : '#dc2626',
                          border: `1px solid ${c.status === 'active' ? 'rgba(16,185,129,0.25)' : c.status === 'redeemed' ? 'var(--border-subtle)' : 'rgba(239,68,68,0.20)'}`,
                        }}>
                          {c.status === 'active' ? <CheckCircle style={{ width: 11 }} /> : <XCircle style={{ width: 11 }} />}
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                        {/* Expiry */}
                        {c.expires_at && (
                          <span style={{ fontSize: 11, color: isExpired ? '#ef4444' : 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock style={{ width: 11 }} />
                            {isExpired ? 'Expired' : `Expires ${format(new Date(c.expires_at), 'MMM d, yyyy')}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {/* Download bill */}
                      <button onClick={() => handleDownloadBill(c)} disabled={downloading === c.id}
                        title="Download Bill"
                        style={{
                          padding: 8, borderRadius: 10, border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = bStyle.bg; (e.currentTarget as HTMLElement).style.color = bStyle.text; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                        <Download style={{ width: 15 }} />
                      </button>

                      {/* Redeem */}
                      {c.status === 'active' && !isExpired && (
                        <button onClick={() => handleRedeem(c)} disabled={redeeming === c.id}
                          style={{
                            padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            background: bStyle.bg, color: bStyle.text, cursor: 'pointer',
                            border: 'none', display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                          {redeeming === c.id
                            ? <div style={{ width: 13, height: 13, border: `2px solid ${bStyle.text}30`, borderTop: `2px solid ${bStyle.text}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            : <ExternalLink style={{ width: 13 }} />}
                          Redeem
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
