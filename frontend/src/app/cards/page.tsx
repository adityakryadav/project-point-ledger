'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CreditCard, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

const BANKS = ['HDFC Bank','SBI','ICICI Bank','Axis Bank','Kotak Mahindra','Yes Bank','IDFC First','IndusInd Bank','Punjab National Bank','Bank of Baroda','Canara Bank','Union Bank','Federal Bank','RBL Bank','Standard Chartered','HSBC India','Citibank India','American Express','Other'];
const NETWORKS = ['Visa','Mastercard','Amex','RuPay','Diners'];

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState<string|null>(null);
  const [deleting, setDeleting] = useState<string|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ card_name:'', bank_name:'HDFC Bank', last_four_digits:'', card_type:'credit', network:'Visa', reward_program:'' });

  const fetchCards = () => {
    setLoading(true);
    api.get('/cards').then(res => setCards(res.data.cards)).catch(() => toast.error('Failed to load cards')).finally(() => setLoading(false));
  };
  useEffect(() => { fetchCards(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(form.last_four_digits)) return toast.error('Last 4 digits must be exactly 4 numbers');
    setSubmitting(true);
    try {
      await api.post('/cards', form);
      toast.success('Card added and points synced!');
      setShowModal(false);
      setForm({ card_name:'', bank_name:'HDFC Bank', last_four_digits:'', card_type:'credit', network:'Visa', reward_program:'' });
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

  const T = (s: string) => ({ color: `var(--${s})` });

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Cards</h1>
            <p className="text-sm mt-1" style={T('text-muted')}>Manage your linked credit & debit cards</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Card</button>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(2)].map((_,i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}</div>
        ) : cards.length === 0 ? (
          <div className="card p-16 text-center">
            <CreditCard className="w-14 h-14 mx-auto mb-4" style={T('text-hint')} />
            <h3 className="font-display text-xl font-bold mb-2" style={T('text-muted')}>No cards yet</h3>
            <p className="text-sm mb-6" style={T('text-muted')}>Add your first card to start tracking reward points</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto"><Plus className="w-4 h-4" /> Add Your First Card</button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <div key={card.id} className="card card-hover p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold" style={T('text-primary')}>{card.card_name}</div>
                      <div className="text-xs" style={T('text-muted')}>{card.bank_name}</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-brand-500">{card.network}</span>
                </div>

                <div className="font-mono text-sm mb-4" style={T('text-hint')}>
                  •••• •••• •••• {card.last_four_digits}
                </div>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={T('text-muted')}>Available Points</div>
                    <div className="text-2xl font-display font-bold text-brand-500">{card.available_points?.toLocaleString() || 0}</div>
                  </div>
                  {card.expiring_points > 0 && (
                    <div className="text-right">
                      <div className="text-xs font-semibold text-amber-500">{card.expiring_points?.toLocaleString()} expiring</div>
                      <div className="text-xs" style={T('text-muted')}>by {card.expiry_date ? format(new Date(card.expiry_date), 'MMM d, yyyy') : 'N/A'}</div>
                    </div>
                  )}
                </div>

                {card.reward_program && (
                  <div className="text-xs mb-4 px-3 py-1.5 rounded-lg" style={{ background:'var(--bg-elevated)', color:'var(--text-muted)', border:'1px solid var(--border-subtle)' }}>
                    {card.reward_program}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3" style={{ borderTop:'1px solid var(--border-subtle)' }}>
                  <div className="flex-1 text-xs" style={T('text-hint')}>
                    {card.last_synced_at ? `Synced ${format(new Date(card.last_synced_at), 'MMM d, h:mm a')}` : 'Never synced'}
                  </div>
                  <button onClick={() => handleSync(card.id)} disabled={syncing === card.id}
                    className="p-1.5 rounded-lg transition-all" style={{ color:'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.background='var(--brand-soft)'; e.currentTarget.style.color='var(--brand-accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; }}>
                    <RefreshCw className={`w-4 h-4 ${syncing === card.id ? 'animate-spin' : ''}`} />
                  </button>
                  <button onClick={() => handleDelete(card.id)} disabled={deleting === card.id}
                    className="p-1.5 rounded-lg transition-all" style={{ color:'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cards.length > 0 && (
          <div className="mt-6 card p-4 flex items-center justify-between" style={{ borderColor:'rgba(192,68,240,0.20)', background:'var(--brand-soft)' }}>
            <span className="text-sm" style={T('text-muted')}>Total across all cards</span>
            <span className="font-display text-xl font-bold text-brand-500">
              {cards.reduce((s,c) => s + (c.available_points||0), 0).toLocaleString()} points
            </span>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 page-enter">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Add New Card</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg transition-colors" style={{ color:'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background='var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="label">Card Name</label>
                <input type="text" placeholder="e.g. HDFC Regalia" value={form.card_name} onChange={e => setForm({...form,card_name:e.target.value})} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Bank</label>
                  <select value={form.bank_name} onChange={e => setForm({...form,bank_name:e.target.value})} className="input">
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Last 4 Digits</label>
                  <input type="text" placeholder="1234" maxLength={4} value={form.last_four_digits} onChange={e => setForm({...form,last_four_digits:e.target.value.replace(/\D/g,'')})} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Card Type</label>
                  <select value={form.card_type} onChange={e => setForm({...form,card_type:e.target.value})} className="input">
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>
                <div>
                  <label className="label">Network</label>
                  <select value={form.network} onChange={e => setForm({...form,network:e.target.value})} className="input">
                    {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Reward Program (optional)</label>
                <input type="text" placeholder="e.g. SmartBuy Points" value={form.reward_program} onChange={e => setForm({...form,reward_program:e.target.value})} className="input" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Adding...' : 'Add Card'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
