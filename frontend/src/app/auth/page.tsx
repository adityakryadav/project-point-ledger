'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Gift } from 'lucide-react';

const INDIAN_CITIES = ['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Surat','Lucknow','Kanpur','Nagpur','Indore','Thane','Bhopal','Visakhapatnam','Pimpri-Chinchwad','Patna','Vadodara','Other'];

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'login'|'register'>(searchParams.get('tab') === 'register' ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [regStep, setRegStep] = useState(1); // 2-step registration
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '',
    phone: '', gender: '', city: '', referred_by: '',
  });

  const { login, register, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (isAuthenticated) router.push('/dashboard'); }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Invalid credentials');
    }
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setRegStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (register as any)(form.name, form.email, form.password,
        form.age ? parseInt(form.age) : undefined,
        { phone: form.phone, gender: form.gender, city: form.city, referred_by: form.referred_by }
      );
      toast.success('Account created! Welcome to Point Ledger 🎉');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || 'Something went wrong');
      setRegStep(1);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const F = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Preview cards on left panel
  const previewCards = [
    { emoji: '🍕', brand: "Domino's",   pts: '200 pts', disc: '20% OFF',   bg: '#003087' },
    { emoji: '✈️', brand: 'IndiGo',     pts: '500 pts', disc: 'Rs 500 OFF', bg: '#1E3A8A' },
    { emoji: '🎬', brand: 'PVR',        pts: '350 pts', disc: 'Rs 150 OFF', bg: '#E71C23' },
    { emoji: '🛍️', brand: 'Myntra',     pts: '350 pts', disc: '25% OFF',   bg: '#FF3F6C' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0b', display: 'flex' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(192,68,240,0.15) 0%, #0d0d0b 60%, rgba(124,58,237,0.10) 100%)' }} />
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'rgba(192,68,240,0.08)', filter: 'blur(80px)' }} />

        <div className="relative text-center max-w-md">
          <Link href="/" style={{ display: 'block', marginBottom: 40 }}>
            <span className="font-display text-3xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Point Ledger
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {previewCards.map(c => (
              <div key={c.brand} style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                <div style={{ background: c.bg, padding: '14px 16px' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{c.emoji}</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{c.brand}</div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{c.pts}</div>
                </div>
                <div style={{ background: '#1c1c1a', padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#c044f0', background: 'rgba(192,68,240,0.12)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(192,68,240,0.20)' }}>{c.disc}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.30)', fontSize: 13 }}>Join thousands redeeming smarter every day</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <Link href="/" className="lg:hidden font-display text-2xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent block text-center mb-8">
            Point Ledger
          </Link>

          <div className="card p-8">
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-elevated)', borderRadius: 12, marginBottom: 24 }}>
              {(['login','register'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setRegStep(1); }}
                  style={{
                    flex: 1, padding: '8px 0', fontSize: 14, fontWeight: 500, borderRadius: 8,
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: tab === t ? 'var(--brand-accent)' : 'transparent',
                    color: tab === t ? '#fff' : 'var(--text-muted)',
                  }}>
                  {t === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-hint)' }} />
                    <input type="email" placeholder="you@email.com" value={form.email} onChange={e => F('email', e.target.value)} className="input pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-hint)' }} />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={e => F('password', e.target.value)} className="input pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-hint)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-2">
                  {isLoading ? <span className="flex items-center gap-2 justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span>
                    : <span className="flex items-center gap-2 justify-center">Sign In <ArrowRight className="w-4 h-4" /></span>}
                </button>
              </form>
            )}

            {/* REGISTER STEP 1 — core info */}
            {tab === 'register' && regStep === 1 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Step 1 of 2 — Basic Info</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 24, height: 3, borderRadius: 2, background: 'var(--brand-accent)' }} />
                    <div style={{ width: 24, height: 3, borderRadius: 2, background: 'var(--bg-elevated)' }} />
                  </div>
                </div>
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-hint)' }} />
                    <input type="text" placeholder="Your full name" value={form.name} onChange={e => F('name', e.target.value)} className="input pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-hint)' }} />
                    <input type="email" placeholder="you@email.com" value={form.email} onChange={e => F('email', e.target.value)} className="input pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-hint)' }} />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={e => F('password', e.target.value)} className="input pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-hint)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Age (optional)</label>
                    <input type="number" placeholder="18+" value={form.age} onChange={e => F('age', e.target.value)} className="input" min="18" max="100" />
                  </div>
                  <div>
                    <label className="label">Gender (optional)</label>
                    <select value={form.gender} onChange={e => F('gender', e.target.value)} className="input">
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* REGISTER STEP 2 — extra details */}
            {tab === 'register' && regStep === 2 && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Step 2 of 2 — Almost there!</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 24, height: 3, borderRadius: 2, background: 'var(--brand-accent)' }} />
                    <div style={{ width: 24, height: 3, borderRadius: 2, background: 'var(--brand-accent)' }} />
                  </div>
                </div>
                <div>
                  <label className="label">Phone Number (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-hint)' }} />
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => F('phone', e.target.value)} className="input pl-10" maxLength={15} />
                  </div>
                </div>
                <div>
                  <label className="label">City (optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-hint)' }} />
                    <select value={form.city} onChange={e => F('city', e.target.value)} className="input pl-10">
                      <option value="">Select your city</option>
                      {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Referral Code (optional)</label>
                  <div className="relative">
                    <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-hint)' }} />
                    <input type="text" placeholder="Enter friend's code" value={form.referred_by} onChange={e => F('referred_by', e.target.value.toUpperCase())} className="input pl-10" maxLength={10} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Get bonus points when you sign up with a referral code</p>
                </div>

                <div style={{ padding: 12, borderRadius: 10, background: 'var(--brand-soft)', border: '1px solid rgba(192,68,240,0.20)' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                    🎁 Your referral code: <strong style={{ color: 'var(--brand-accent)' }}>{form.name.replace(/\s+/g,'').toUpperCase().slice(0,4)}XXXX</strong> — share after signup to earn bonus points!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setRegStep(1)} className="btn-secondary flex-1">← Back</button>
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3">
                    {isLoading
                      ? <span className="flex items-center gap-2 justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span>
                      : <span className="flex items-center gap-2 justify-center">Create Account 🎉</span>}
                  </button>
                </div>
              </form>
            )}

            {/* Google OAuth */}
            <div style={{ position: 'relative', margin: '20px 0' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', borderTop: '1px solid var(--border-subtle)' }} />
              </div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <span style={{ padding: '0 12px', fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-card)' }}>or continue with</span>
              </div>
            </div>
            <button onClick={handleGoogleLogin} className="btn-secondary w-full py-2.5 flex items-center justify-center gap-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
