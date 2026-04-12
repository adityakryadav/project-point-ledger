'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import {
  LayoutDashboard, CreditCard, ShoppingBag, Ticket, User,
  LogOut, Sparkles, Menu, Settings, ChevronRight, Sun, Moon
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/cards',       icon: CreditCard,       label: 'My Cards' },
  { href: '/marketplace', icon: ShoppingBag,      label: 'Marketplace' },
  { href: '/coupons',     icon: Ticket,           label: 'My Coupons' },
  { href: '/profile',     icon: User,             label: 'Profile' },
  { href: '/settings',    icon: Settings,         label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, refreshUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useSettingsStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    refreshUser().then(() => {
      if (!useAuthStore.getState().isAuthenticated) router.push('/auth');
      setLoading(false);
    });
  }, []);

  const handleLogout = () => { logout(); router.push('/auth'); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }}
      >
        <div className="p-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Point Ledger
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={active
                  ? { background: 'rgba(192,68,240,0.12)', color: '#d874f8', border: '1px solid rgba(192,68,240,0.20)' }
                  : { color: 'var(--text-muted)', border: '1px solid transparent' }
                }
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-brand-400' : ''}`} />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-brand-400/60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium mb-1 transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-brand-400" />}
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1" style={{ background: 'var(--bg-input)' }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
              {user?.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header
          className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 backdrop-blur-xl"
          style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Point Ledger
          </span>
          <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
