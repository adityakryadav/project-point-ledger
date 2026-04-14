'use client';
import { useState } from 'react';
import { getCouponBrandStyle } from '@/lib/brandStyles';

interface Props {
  brand_name: string;
  brand_logo_url?: string;
  title?: string;
  discount_label?: string;
  points_spent?: number;
  status?: string;
  tier?: string;
  created_at?: string;
  size?: 'sm' | 'md';
}

function Logo({ url, name, size = 32 }: { url?: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const style = getCouponBrandStyle(name);
  if (!url || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 8, flexShrink: 0,
        background: style.accent, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 800, fontSize: size * 0.45, color: style.bg,
      }}>
        {name.charAt(0)}
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}>
      <img src={url} alt={name} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
    </div>
  );
}

export default function BrandedCouponMini({ brand_name, brand_logo_url, title, discount_label, points_spent, status, created_at, size = 'sm' }: Props) {
  const style = getCouponBrandStyle(brand_name);
  const logoSize = size === 'sm' ? 32 : 40;

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'stretch',
    }}>
      {/* Brand color strip */}
      <div style={{
        background: style.bg, padding: size === 'sm' ? '10px 12px' : '12px 14px',
        display: 'flex', alignItems: 'center', flexShrink: 0,
        borderRight: `2px solid ${style.accent}30`,
      }}>
        <Logo url={brand_logo_url} name={brand_name} size={logoSize} />
      </div>
      {/* Content */}
      <div style={{
        flex: 1, minWidth: 0, padding: size === 'sm' ? '8px 12px' : '10px 14px',
        background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: size === 'sm' ? 13 : 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {brand_name}
          </div>
          {title && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title}
            </div>
          )}
          {points_spent !== undefined && (
            <div style={{ fontSize: 10, color: 'var(--text-hint)', marginTop: 2 }}>
              {points_spent} pts charged
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {discount_label && (
            <div style={{
              fontSize: 12, fontWeight: 800, color: style.accent,
              background: `${style.accent}15`, padding: '2px 8px', borderRadius: 6,
              border: `1px solid ${style.accent}30`, whiteSpace: 'nowrap',
            }}>
              {discount_label}
            </div>
          )}
          {status && (
            <div style={{
              fontSize: 10, marginTop: 4, textTransform: 'capitalize', fontWeight: 600,
              color: status === 'active' ? '#059669' : status === 'redeemed' ? 'var(--text-muted)' : '#dc2626',
            }}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
