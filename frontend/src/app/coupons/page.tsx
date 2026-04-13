'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Ticket, ExternalLink, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { format, isPast } from 'date-fns';

const tierBadge = (tier: string) => {
  if (tier === 'premium') return <span className="badge-premium">Premium</span>;
  if (tier === 'standard') return <span className="badge-standard">Standard</span>;
  return <span className="badge-budget">Budget</span>;
};

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
  const filterCase = bill.filter_case || 'none';

  const rows = [
    ['Coupon Value', `${bill.breakdown_coupon || bill.points_spent} pts`],
    ...(filterCase === 'category' || filterCase === 'subcategory'
      ? [['Category Premium', `${bill.breakdown_category || 0} pts`]] : []),
    ...(filterCase === 'subcategory'
      ? [['Brand Premium', `${bill.breakdown_brand || 0} pts`]] : []),
    ['──────────────────', '──────'],
    ['TOTAL CHARGED', `${bill.points_spent} pts`],
  ];

  const rowsHtml = rows.map(([label, value]) =>
    `<tr>
      <td style="padding:6px 0;color:${label.includes('TOTAL') ? '#111' : '#555'};font-weight:${label.includes('TOTAL') ? '700' : '400'}">${label}</td>
      <td style="padding:6px 0;text-align:right;color:${label.includes('TOTAL') ? '#7c3aed' : '#111'};font-weight:${label.includes('TOTAL') ? '700' : '400'}">${value}</td>
    </tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background: #f5f4f0; }
  .page { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .header { background: linear-gradient(135deg, #7c3aed, #c044f0); padding: 32px; text-align: center; color: white; }
  .header h1 { font-size: 26px; margin: 0 0 4px; font-weight: 800; letter-spacing: -0.5px; }
  .header p { margin: 0; opacity: 0.8; font-size: 13px; }
  .body { padding: 28px 32px; }
  .brand-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f0efe9; }
  .brand-logo { width: 48px; height: 48px; border-radius: 12px; object-fit: contain; border: 1px solid #eee; padding: 4px; }
  .brand-initial { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #c044f0); color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; }
  .brand-name { font-size: 18px; font-weight: 700; color: #111; }
  .brand-title { font-size: 13px; color: #666; margin-top: 2px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin: 16px 0 8px; }
  .info-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f5f4f0; }
  .info-label { font-size: 13px; color: #666; }
  .info-value { font-size: 13px; color: #111; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .tag-premium { background: rgba(245,158,11,0.12); color: #b45309; }
  .tag-standard { background: rgba(59,130,246,0.12); color: #1d4ed8; }
  .tag-budget { background: rgba(16,185,129,0.12); color: #065f46; }
  .quote { margin-top: 24px; padding: 16px 20px; border-radius: 12px; background: linear-gradient(135deg, rgba(124,58,237,0.06), rgba(192,68,240,0.06)); border-left: 3px solid #7c3aed; font-style: italic; font-size: 13px; color: #555; line-height: 1.6; }
  .footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0efe9; text-align: center; font-size: 11px; color: #bbb; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>Point Ledger</h1>
    <p>Coupon Purchase Receipt</p>
  </div>
  <div class="body">
    <div class="brand-row">
      ${bill.brand_logo_url
        ? `<img class="brand-logo" src="${bill.brand_logo_url}" alt="${bill.brand_name}" />`
        : `<div class="brand-initial">${bill.brand_name.charAt(0)}</div>`}
      <div>
        <div class="brand-name">${bill.brand_name}</div>
        <div class="brand-title">${bill.title}</div>
        <span class="tag tag-${bill.tier}">${bill.tier.charAt(0).toUpperCase() + bill.tier.slice(1)}</span>
      </div>
    </div>

    <div class="section-title">Customer Details</div>
    <div class="info-row"><span class="info-label">Name</span><span class="info-value">${bill.user_name}</span></div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-value">${bill.user_email}</span></div>
    <div class="info-row"><span class="info-label">Date</span><span class="info-value">${date}</span></div>

    <div class="section-title">Card Used</div>
    <div class="info-row"><span class="info-label">Card</span><span class="info-value">${bill.card_name || 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">Bank</span><span class="info-value">${bill.bank_name || 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">Number</span><span class="info-value">•••• •••• •••• ${bill.last_four_digits || '----'}</span></div>

    <div class="section-title">Points Breakdown</div>
    <table>${rowsHtml}</table>

    <div class="section-title">Coupon Info</div>
    <div class="info-row"><span class="info-label">Acquired Via</span><span class="info-value" style="text-transform:capitalize">${bill.acquired_via}</span></div>
    <div class="info-row"><span class="info-label">Status</span><span class="info-value" style="text-transform:capitalize">${bill.status}</span></div>
    <div class="info-row"><span class="info-label">Expires</span><span class="info-value">${bill.expires_at ? format(new Date(bill.expires_at), 'dd MMM yyyy') : 'N/A'}</span></div>

    <div class="quote">"${quote}"</div>

    <div class="footer">
      Thank you for using Point Ledger · This is a system-generated receipt<br/>
      Transaction ID: ${bill.id}
    </div>
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
  const counts = { all: coupons.length, active: coupons.filter(c=>c.status==='active').length, redeemed: coupons.filter(c=>c.status==='redeemed').length, expired: coupons.filter(c=>c.status==='expired').length };
  const T = (v: string) => ({ color: `var(--${v})` });

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">My Coupons</h1>
          <p className="text-sm mt-1" style={T('text-muted')}>Generated and purchased coupons</p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'var(--bg-elevated)' }}>
          {(['all','active','redeemed','expired'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-1.5"
              style={filter === f ? { background: 'var(--brand-accent)', color: '#fff' } : { color: 'var(--text-muted)' }}>
              {f} <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: filter===f ? 'rgba(255,255,255,0.2)' : 'var(--bg-hover)' }}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <Ticket className="w-12 h-12 mx-auto mb-3" style={T('text-hint')} />
            <p className="text-sm" style={T('text-muted')}>{filter==='all' ? 'No coupons yet. Visit Marketplace to get started!' : `No ${filter} coupons`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const isExpired = c.expires_at && isPast(new Date(c.expires_at)) && c.status === 'active';
              return (
                <div key={c.id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all"
                  style={{ opacity: c.status === 'redeemed' ? 0.65 : 1 }}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: c.status==='active' ? 'var(--brand-soft)' : 'var(--bg-elevated)' }}>
                      {c.category_icon || '🎫'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold" style={T('text-primary')}>{c.brand_name}</span>
                        {tierBadge(c.tier)}
                        <span className="text-xs capitalize" style={T('text-hint')}>{c.acquired_via}</span>
                      </div>
                      <div className="text-sm truncate mt-0.5" style={T('text-secondary')}>{c.title}</div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs" style={T('text-hint')}>{c.points_spent} pts charged</span>
                        {c.expires_at && (
                          <span className="text-xs flex items-center gap-1" style={{ color: isExpired ? '#ef4444' : 'var(--text-hint)' }}>
                            <Clock className="w-3 h-3" />
                            {isExpired ? 'Expired' : `Expires ${format(new Date(c.expires_at), 'MMM d, yyyy')}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                      style={c.status==='active'
                        ? { background:'rgba(16,185,129,0.10)', color:'#059669', borderColor:'rgba(16,185,129,0.25)' }
                        : c.status==='redeemed'
                        ? { background:'var(--bg-elevated)', color:'var(--text-muted)', borderColor:'var(--border-subtle)' }
                        : { background:'rgba(239,68,68,0.08)', color:'#dc2626', borderColor:'rgba(239,68,68,0.20)' }
                      }>
                      {c.status==='active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {c.status.charAt(0).toUpperCase()+c.status.slice(1)}
                    </span>

                    {/* Download bill */}
                    <button onClick={() => handleDownloadBill(c)} disabled={downloading===c.id}
                      className="p-2 rounded-lg transition-all" title="Download Bill"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.background='var(--brand-soft)'; e.currentTarget.style.color='var(--brand-accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; }}>
                      <Download className="w-4 h-4" />
                    </button>

                    {c.status==='active' && !isExpired && (
                      <button onClick={() => handleRedeem(c)} disabled={redeeming===c.id}
                        className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5">
                        {redeeming===c.id ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                        Redeem Me
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
