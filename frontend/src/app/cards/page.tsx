'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, RefreshCw, Trash2, X, Shield, Lock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { getBankStyle, NETWORK_COLORS } from '@/lib/themes';
import BrandedCard from '@/components/ui/BrandedCard';
import { BankLogo } from '@/components/ui/LogoComponents';

const BANKS = ['HDFC Bank','SBI','ICICI Bank','Axis Bank','Kotak Mahindra','Yes Bank','IDFC First','IndusInd Bank','Punjab National Bank','Bank of Baroda','Canara Bank','Union Bank','Federal Bank','RBL Bank','Standard Chartered','HSBC India','Citibank India','American Express','Other'];
const NETWORKS = ['Visa','Mastercard','Amex','RuPay','Diners'];
const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const YEARS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i));

function ThemedCard({ card, onSync, onDelete, syncing, deleting }: any) {
  const bank = getBankStyle(card.bank_name);
  const netColor = NETWORK_COLORS[card.network] || '#888';
  const [logoErr, setLogoErr] = useState(false);

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.22)', position: 'relative' }}>
      {/* Card face */}
      <div style={{ background: bank.gradient, padding: '22px 22px 18px', minHeight: 170, position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        {/* Bank logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {bank.logo && !logoErr
              ? <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <img src={bank.logo} alt={card.bank_name} onError={() => setLogoErr(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                </div>
              : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: bank.text }}>
                  {card.bank_name.charAt(0)}
                </div>
            }
            <div>
              <div style={{ color: bank.text, fontWeight: 700, fontSize: 13, opacity: 0.9 }}>{card.bank_name}</div>
              <div style={{ color: bank.text, fontSize: 11, opacity: 0.55 }}>{card.card_type === 'credit' ? 'Credit Card' : 'Debit Card'}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: netColor, background: 'rgba(255,255,255,0.12)', padding: '3px 10px', borderRadius: 20 }}>{card.network}</div>
        </div>

        {/* Card number */}
        <div style={{ fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.2em', color: bank.text, opacity: 0.9, marginBottom: 16 }}>
          •••• •••• •••• {card.last_four_digits}
        </div>

        {/* Points + expiry row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, color: bank.text, opacity: 0.5, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 2 }}>Available Points</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: bank.accent, lineHeight: 1 }}>{card.available_points?.toLocaleString() || 0}</div>
          </div>
          {card.expiring_points > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#FCD34D' }}>{card.expiring_points?.toLocaleString()} expiring</div>
              <div style={{ fontSize: 10, color: bank.text, opacity: 0.55 }}>by {card.expiry_date ? format(new Date(card.expiry_date), 'MMM d, yyyy') : 'N/A'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div style={{ background: 'var(--bg-card)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{card.card_name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>
            {card.last_synced_at ? `Synced ${format(new Date(card.last_synced_at), 'MMM d, h:mm a')}` : 'Never synced'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onSync(card.id)} disabled={syncing === card.id}
            style={{ padding: 8, borderRadius: 10, border: 'none', background: 'var(--bg-elevated)', cursor: 'pointer', color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = bank.bg; (e.currentTarget as HTMLElement).style.color = bank.text; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
            <RefreshCw style={{ width: 15, height: 15, animation: syncing === card.id ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
          <button onClick={() => onDelete(card.id)} disabled={deleting === card.id}
            style={{ padding: 8, borderRadius: 10, border: 'none', background: 'var(--bg-elevated)', cursor: 'pointer', color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
            <Trash2 style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState<string|null>(null);
  const [deleting, setDeleting] = useState<string|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [form, setForm] = useState({ card_name: '', bank_name: 'HDFC Bank', last_four_digits: '', card_type: 'credit', network: 'Visa', reward_program: '', expiry_month: '01', expiry_year: String(new Date().getFullYear()), cardholder_name: '', cvv: '' });

  const fetchCards = () => {
    setLoading(true);
    api.get('/cards').then(res => setCards(res.data.cards)).catch(() => toast.error('Failed to load cards')).finally(() => setLoading(false));
  };
  useEffect(() => { fetchCards(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(form.last_four_digits)) return toast.error('Last 4 digits must be exactly 4 numbers');
    if (!form.cardholder_name.trim()) return toast.error('Cardholder name is required');
    if (!/^\d{3,4}$/.test(form.cvv)) return toast.error('CVV must be 3 or 4 digits');
    setSubmitting(true);
    try {
      await api.post('/cards', { card_name: form.card_name, bank_name: form.bank_name, last_four_digits: form.last_four_digits, card_type: form.card_type, network: form.network, reward_program: form.reward_program });
      toast.success('Card added and points synced!');
      setShowModal(false);
      setForm({ card_name: '', bank_name: 'HDFC Bank', last_four_digits: '', card_type: 'credit', network: 'Visa', reward_program: '', expiry_month: '01', expiry_year: String(new Date().getFullYear()), cardholder_name: '', cvv: '' });
      fetchCards();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Failed to add card'); }
    finally { setSubmitting(false); }
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    try { await api.post(`/cards/${id}/sync`); toast.success('Points synced!'); fetchCards(); }
    catch { toast.error('Sync failed'); } finally { setSyncing(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this card?')) return;
    setDeleting(id);
    try { await api.delete(`/cards/${id}`); toast.success('Card removed'); setCards(cards.filter(c => c.id !== id)); }
    catch { toast.error('Failed to remove card'); } finally { setDeleting(null); }
  };

  const previewBank = getBankStyle(form.bank_name);
  const netColor = NETWORK_COLORS[form.network] || '#888';

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Cards</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your linked credit & debit cards</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Card</button>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">{[...Array(2)].map((_,i) => <div key={i} className="h-52 skeleton rounded-2xl" />)}</div>
        ) : cards.length === 0 ? (
          <div className="card p-16 text-center">
            <CreditCard className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-hint)' }} />
            <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--text-muted)' }}>No cards yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Add your first card to start tracking reward points</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto"><Plus className="w-4 h-4" /> Add Your First Card</button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {cards.map(card => <ThemedCard key={card.id} card={card} onSync={handleSync} onDelete={handleDelete} syncing={syncing} deleting={deleting} />)}
          </div>
        )}

        {cards.length > 0 && (
          <div className="mt-6 card p-4 flex items-center justify-between" style={{ borderColor: 'rgba(192,68,240,0.20)', background: 'var(--brand-soft)' }}>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total across all cards</span>
            <span className="font-display text-xl font-bold text-brand-500">{cards.reduce((s,c) => s + (c.available_points||0), 0).toLocaleString()} points</span>
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card page-enter" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">Add New Card</h2>
              <button onClick={() => setShowModal(false)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X style={{ width: 18 }} />
              </button>
            </div>

            {/* Live card preview */}
            <div style={{ borderRadius: 16, marginBottom: 20, padding: '20px 22px', minHeight: 160, background: previewBank.gradient, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: previewBank.text, opacity: 0.8 }}>{form.bank_name}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: netColor, background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: 12 }}>{form.network}</div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 15, letterSpacing: '0.18em', color: previewBank.text, opacity: 0.85, marginBottom: 14 }}>
                •••• •••• •••• {form.last_four_digits || '____'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 9, color: previewBank.text, opacity: 0.5, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Card Holder</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: previewBank.text }}>{form.cardholder_name || 'YOUR NAME'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: previewBank.text, opacity: 0.5, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Expires</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: previewBank.text }}>{form.expiry_month}/{form.expiry_year.slice(-2)}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="label">Cardholder Name</label>
                <input type="text" placeholder="Name as on card" value={form.cardholder_name} onChange={e => setForm({...form, cardholder_name: e.target.value.toUpperCase()})} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Card Name / Variant</label>
                  <input type="text" placeholder="e.g. HDFC Regalia" value={form.card_name} onChange={e => setForm({...form, card_name: e.target.value})} className="input" required />
                </div>
                <div><label className="label">Bank</label>
                  <select value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} className="input">
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Last 4 Digits</label>
                  <input type="text" placeholder="1234" maxLength={4} value={form.last_four_digits} onChange={e => setForm({...form, last_four_digits: e.target.value.replace(/\D/g,'')})} className="input font-mono" required />
                </div>
                <div><label className="label">Expiry Month</label>
                  <select value={form.expiry_month} onChange={e => setForm({...form, expiry_month: e.target.value})} className="input">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div><label className="label">Expiry Year</label>
                  <select value={form.expiry_year} onChange={e => setForm({...form, expiry_year: e.target.value})} className="input">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label">CVV</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-hint)' }} />
                  <input type={showCVV ? 'text' : 'password'} placeholder="3 or 4 digits" maxLength={4} value={form.cvv} onChange={e => setForm({...form, cvv: e.target.value.replace(/\D/g,'')})} className="input pl-9 pr-20 font-mono" required />
                  <button type="button" onClick={() => setShowCVV(!showCVV)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>{showCVV ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Card Type</label>
                  <select value={form.card_type} onChange={e => setForm({...form, card_type: e.target.value})} className="input">
                    <option value="credit">Credit</option><option value="debit">Debit</option><option value="prepaid">Prepaid</option>
                  </select>
                </div>
                <div><label className="label">Network</label>
                  <select value={form.network} onChange={e => setForm({...form, network: e.target.value})} className="input">
                    {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label">Reward Program (optional)</label>
                <input type="text" placeholder="e.g. SmartBuy Points" value={form.reward_program} onChange={e => setForm({...form, reward_program: e.target.value})} className="input" />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: 'var(--text-muted)' }}>
                <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                Your card details are encrypted. Only the last 4 digits are stored — CVV and full card number are never saved.
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Adding...' : 'Add Card'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
