'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalModalProps {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function PortalModal({ onClose, children, maxWidth = 520 }: PortalModalProps) {
  const elRef = useRef<HTMLDivElement | null>(null);

  if (!elRef.current) {
    elRef.current = document.createElement('div');
  }

  useEffect(() => {
    const el = elRef.current!;
    document.body.appendChild(el);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.removeChild(el);
      document.body.style.overflow = '';
    };
  }, []);

  if (typeof window === 'undefined') return null;

  const modal = (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.40)',
          padding: 24,
          animation: 'fadeUp 0.25s ease-out forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );

  return createPortal(modal, elRef.current);
}
