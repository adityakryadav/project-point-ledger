'use client';
import { useState } from 'react';
import { getBankStyle } from '@/lib/brandStyles';

interface Props {
  card_name: string;
  bank_name: string;
  last_four_digits: string;
  network?: string;
  available_points?: number;
  expiring_points?: number;
  expiry_date?: string;
  compact?: boolean; // small inline version for dashboard/profile
}

function BankLogo({ url, name, size = 32 }: { url: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (!url || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, fontWeight: 800, color: '#fff',
        flexShrink: 0,
      }}>
        {name.charAt(0)}
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, overflow: 'hidden',
      background: 'rgba(255,255,255,0.90)', flexShrink: 0,
    }}>
      <img src={url} alt={name} onError={() => setErr(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
    </div>
  );
}

// Network symbol
function NetworkMark({ network }: { network?: string }) {
  const n = (network || '').toLowerCase();
  if (n === 'visa') return <span style={{ fontFamily: 'serif', fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: 1 }}>VISA</span>;
  if (n === 'mastercard') return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#EB001B', opacity: 0.9 }} />
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F79E1B', marginLeft: -10, opacity: 0.9 }} />
    </div>
  );
  if (n === 'amex') return <span style={{ fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: 1 }}>AMEX</span>;
  if (n === 'rupay') return <span style={{ fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: 1 }}>RuPay</span>;
  if (n === 'diners') return <span style={{ fontWeight: 700, fontSize: 13, color: '#fff', letterSpacing: 1 }}>Diners</span>;
  return null;
}

export default function BrandedCard({ card_name, bank_name, last_four_digits, network, available_points, expiring_points, expiry_date, compact = false }: Props) {
  const style = getBankStyle(bank_name);

  if (compact) {
    // Small horizontal card for dashboard / profile lists
    return (
      <div style={{
        borderRadius: 14, overflow: 'hidden',
        background: `linear-gradient(135deg, ${style.bg}, ${style.bg2})`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
        position: 'relative',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <BankLogo url={style.logoUrl} name={bank_name} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: style.text, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card_name}</div>
          <div style={{ color: style.textMuted, fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>•••• {last_four_digits}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ color: style.text, fontWeight: 800, fontSize: 15 }}>{available_points?.toLocaleString() || 0}</div>
          <div style={{ color: style.textMuted, fontSize: 10 }}>points</div>
        </div>
        {expiring_points && expiring_points > 0 ? (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: '#FCD34D', fontWeight: 700, fontSize: 11 }}>{expiring_points} exp</div>
          </div>
        ) : null}
      </div>
    );
  }

  // Full card — looks like a physical card
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: `linear-gradient(135deg, ${style.bg} 0%, ${style.bg2} 100%)`,
      padding: '20px 22px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
      position: 'relative',
      minHeight: 180,
    }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ position: 'relative' }}>
        {/* Top row: bank logo + network */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <BankLogo url={style.logoUrl} name={bank_name} size={36} />
          <NetworkMark network={network} />
        </div>

        {/* Chip */}
        <div style={{
          width: 38, height: 28, borderRadius: 5, marginBottom: 16,
          background: `linear-gradient(135deg, ${style.chip}, ${style.chip}99)`,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 24, height: 18, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))' }} />
        </div>

        {/* Card number */}
        <div style={{ color: style.text, fontFamily: 'monospace', fontSize: 16, letterSpacing: 3, marginBottom: 16 }}>
          •••• •••• •••• {last_four_digits}
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: style.textMuted, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Card</div>
            <div style={{ color: style.text, fontWeight: 700, fontSize: 13 }}>{card_name}</div>
            <div style={{ color: style.textMuted, fontSize: 10, marginTop: 1 }}>{bank_name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: style.textMuted, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Points</div>
            <div style={{ color: style.text, fontWeight: 800, fontSize: 18 }}>{available_points?.toLocaleString() || 0}</div>
            {expiring_points && expiring_points > 0 ? (
              <div style={{ color: '#FCD34D', fontSize: 10, marginTop: 2 }}>{expiring_points} expiring</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
