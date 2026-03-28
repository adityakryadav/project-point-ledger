import React from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const POINT_TO_INR = 0.75;
const FEE_RATE = 0.02; // 2% fee on gross INR
const GST_ON_FEES = 0.18; // 18% GST on fee

function formatINR(n) {
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);
}

export default function ExchangeCalculator() {
  const from = 'Points';
  const to = 'INR';
  const [amount, setAmount] = React.useState('');

  const [submitState, setSubmitState] = React.useState({
    status: 'idle', // idle | loading | success | error
    message: null,
    error: null,
  });

  const points = parseFloat(amount);
  const validPoints = Number.isFinite(points) && points > 0;

  const grossInr = validPoints ? points * POINT_TO_INR : 0;
  const fee = validPoints ? grossInr * FEE_RATE : 0;
  const gst = validPoints ? fee * GST_ON_FEES : 0;
  const netInr = validPoints ? grossInr - fee - gst : 0;

  function onSubmit(e) {
    e.preventDefault();
    if (!amount) {
      setSubmitState({ status: 'error', message: null, error: 'Points amount is required.' });
      return;
    }
    if (!validPoints) {
      setSubmitState({ status: 'error', message: null, error: 'Enter a valid points amount greater than 0.' });
      return;
    }

    setSubmitState({ status: 'loading', message: null, error: null });

    // Mock async request to demonstrate loading/error states.
    window.setTimeout(() => {
      const shouldFail = points > 50000 || Math.random() < 0.12;
      if (shouldFail) {
        setSubmitState({
          status: 'error',
          message: null,
          error: 'Exchange request failed. Please try again.',
        });
        return;
      }

      setSubmitState({
        status: 'success',
        message: `Exchange queued: ${formatINR(netInr)} INR will be credited (mock).`,
        error: null,
      });
    }, 900);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Asset Exchange</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900 tracking-tight">Convert Points to INR</h1>
              <p className="mt-2 text-slate-500 font-medium">Fast, secure conversion with transparent fee modeling.</p>
            </div>
            <div className="hidden sm:block">
              <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Rate</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">1 Point = ₹ 0.75</p>
              </div>
            </div>
          </div>
        </div>

        <form className="p-8 space-y-8 flex-1" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              id="from"
              label="Source Currency"
              value={from}
              disabled
              inputClassName="bg-slate-50 border-slate-200 text-slate-500 font-bold"
            />
            <Input
              id="to"
              label="Target Currency"
              value={to}
              disabled
              inputClassName="bg-slate-50 border-slate-200 text-slate-500 font-bold"
            />
          </div>

          <div className="relative">
            <Input
              id="points"
              label="Points to Exchange"
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              labelClassName="text-sm font-black text-slate-900"
              inputClassName="h-16 text-2xl font-black px-6 border-slate-200 focus:ring-blue-500/10 focus:border-blue-500"
            />
            <div className="absolute right-6 bottom-4 text-xs font-black text-slate-400 uppercase tracking-widest">
              Points
            </div>
          </div>

          {submitState.error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-xs font-bold ui-fade-in">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {submitState.error}
            </div>
          )}

          {submitState.status === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-600 text-xs font-bold ui-fade-in">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {submitState.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || submitState.status === 'loading'}
            className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg shadow-xl shadow-blue-500/20"
          >
            {submitState.status === 'loading' ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing Request…
              </span>
            ) : (
              'Initiate Exchange'
            )}
          </Button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="bg-[#0f172a] rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[60px]" />
          
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest relative z-10">Settlement Quote</h3>
          
          <div className="mt-8 space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Gross Amount</span>
              <span className="font-bold">₹ {formatINR(grossInr)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Platform Fee (2%)</span>
              <span className="font-bold text-slate-200">- ₹ {formatINR(fee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">GST on Fees (18%)</span>
              <span className="font-bold text-slate-200">- ₹ {formatINR(gst)}</span>
            </div>
            
            <div className="pt-5 border-t border-slate-800">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Net Credit</span>
                  <p className="text-3xl font-black mt-1">₹ {formatINR(netInr)}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Exchange Policy</h4>
          <ul className="space-y-3">
            {[
              'Instant processing for Platinum members',
              'Settlement to registered bank account',
              'Final value includes all applicable taxes',
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-500 font-medium">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

