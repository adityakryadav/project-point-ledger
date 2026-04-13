'use client';
import AppLayout from '@/components/layout/AppLayout';
import { useSettingsStore } from '@/store/settingsStore';
import { Sun, Moon, Bell, BellOff, Zap, Ticket, Star, BookOpen, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
}

function ToggleRow({ label, description, checked, onChange, icon }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b last:border-0"
      style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'var(--bg-elevated)' }}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</div>
        </div>
      </div>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme, notifications, setNotification } = useSettingsStore();

  const handleTheme = (selected: 'dark' | 'light') => {
    setTheme(selected);
    toast.success(`${selected === 'dark' ? '🌙 Dark' : '☀️ Light'} mode enabled`);
  };

  const handleNotif = (key: keyof typeof notifications, value: boolean) => {
    setNotification(key, value);
    toast.success(value ? 'Notification enabled' : 'Notification disabled');
  };

  return (
    <AppLayout>
      <div className="max-w-2xl page-enter">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Customise your Point Ledger experience
          </p>
        </div>

        {/* ── Appearance ── */}
        <section className="card p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <Monitor className="w-4 h-4 text-brand-400" />
            <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Appearance
            </h2>
          </div>

          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Choose your preferred colour mode</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Dark mode card */}
            <button
              onClick={() => handleTheme('dark')}
              className={`relative rounded-xl p-4 text-left transition-all duration-200 border-2 ${
                theme === 'dark'
                  ? 'border-brand-500 shadow-lg shadow-brand-500/15'
                  : 'border-transparent hover:border-brand-500/30'
              }`}
              style={{ background: '#0d0d0b' }}
            >
              {theme === 'dark' && (
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-400" />
              )}
              {/* Mini preview */}
              <div className="rounded-lg overflow-hidden mb-3" style={{ background: '#141412', padding: '8px' }}>
                <div className="h-2 w-16 rounded mb-1.5" style={{ background: '#1c1c1a' }} />
                <div className="h-1.5 w-10 rounded mb-1.5" style={{ background: '#242422' }} />
                <div className="flex gap-1">
                  <div className="h-6 w-full rounded" style={{ background: '#1c1c1a' }} />
                  <div className="h-6 w-full rounded" style={{ background: '#1c1c1a' }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-sm font-medium text-white">Dark</span>
              </div>
            </button>

            {/* Light mode card */}
            <button
              onClick={() => handleTheme('light')}
              className={`relative rounded-xl p-4 text-left transition-all duration-200 border-2 ${
                theme === 'light'
                  ? 'border-brand-500 shadow-lg shadow-brand-500/15'
                  : 'border-transparent hover:border-brand-500/30'
              }`}
              style={{ background: '#f5f4f0' }}
            >
              {theme === 'light' && (
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-500" />
              )}
              <div className="rounded-lg overflow-hidden mb-3" style={{ background: '#eeede8', padding: '8px' }}>
                <div className="h-2 w-16 rounded mb-1.5" style={{ background: '#fff' }} />
                <div className="h-1.5 w-10 rounded mb-1.5" style={{ background: '#e0dfd8' }} />
                <div className="flex gap-1">
                  <div className="h-6 w-full rounded" style={{ background: '#fff' }} />
                  <div className="h-6 w-full rounded" style={{ background: '#fff' }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-gold-500" />
                <span className="text-sm font-medium" style={{ color: '#18181a' }}>Light</span>
              </div>
            </button>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-brand-400" />
            <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Notifications
            </h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Control what alerts you receive in the app
          </p>

          <ToggleRow
            label="Expiring Points Alert"
            description="Notify me when reward points are expiring within 4 days"
            checked={notifications.expiringPoints}
            onChange={v => handleNotif('expiringPoints', v)}
            icon={<Zap className="w-4 h-4 text-gold-400" />}
          />
          <ToggleRow
            label="Expiring Coupons Alert"
            description="Remind me before my coupons expire so I don't miss out"
            checked={notifications.expiringCoupons}
            onChange={v => handleNotif('expiringCoupons', v)}
            icon={<Ticket className="w-4 h-4 text-brand-400" />}
          />
          <ToggleRow
            label="Points Earned"
            description="Alert when new reward points are synced to your cards"
            checked={notifications.pointsEarned}
            onChange={v => handleNotif('pointsEarned', v)}
            icon={<Star className="w-4 h-4 text-emerald-400" />}
          />
          <ToggleRow
            label="New Coupons Available"
            description="Get notified when new coupons are added to the marketplace"
            checked={notifications.newCoupons}
            onChange={v => handleNotif('newCoupons', v)}
            icon={<Bell className="w-4 h-4 text-purple-400" />}
          />
          <ToggleRow
            label="Weekly Digest"
            description="A weekly summary of your points balance and top coupon picks"
            checked={notifications.weeklyDigest}
            onChange={v => handleNotif('weeklyDigest', v)}
            icon={<BookOpen className="w-4 h-4 text-blue-400" />}
          />

          <div className="mt-5 p-3 rounded-xl text-xs flex items-start gap-2"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            <BellOff className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            Notifications are shown within the app. Browser push notifications require additional permission.
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
