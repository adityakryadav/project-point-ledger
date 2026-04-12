import { create } from 'zustand';

interface NotificationSettings {
  expiringPoints: boolean;
  expiringCoupons: boolean;
  newCoupons: boolean;
  pointsEarned: boolean;
  weeklyDigest: boolean;
}

interface SettingsState {
  theme: 'dark' | 'light';
  notifications: NotificationSettings;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
}

const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: loadFromStorage<'dark' | 'light'>('rm-theme', 'dark'),
  notifications: loadFromStorage<NotificationSettings>('rm-notifications', {
    expiringPoints: true,
    expiringCoupons: true,
    newCoupons: false,
    pointsEarned: true,
    weeklyDigest: false,
  }),

  setTheme: (theme) => {
    localStorage.setItem('rm-theme', JSON.stringify(theme));
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setNotification: (key, value) => {
    const updated = { ...get().notifications, [key]: value };
    localStorage.setItem('rm-notifications', JSON.stringify(updated));
    set({ notifications: updated });
  },
}));
