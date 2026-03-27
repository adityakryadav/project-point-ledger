import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [status, setStatus] = React.useState({ loading: false, error: null });

  function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    // Mock auth request so the UI can show loading/error states.
    window.setTimeout(() => {
      const isValid = email.includes('@') && password.length >= 6;
      if (!isValid) {
        setStatus({
          loading: false,
          error: 'Please enter a valid email and a password (min 6 characters).',
        });
        return;
      }
      navigate('/dashboard');
    }, 650);
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 overflow-hidden relative">
      {/* Background blobs for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 ui-fade-in-up">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 tracking-tight">Point Ledger</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enterprise Terminal</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Secure Access</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Enter your credentials to access the ledger management system.
          </p>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <Input
              id="email"
              label="Professional Email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              labelClassName="text-xs font-bold text-slate-700 uppercase tracking-tight"
            />
            <Input
              id="password"
              label="Secure Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              labelClassName="text-xs font-bold text-slate-700 uppercase tracking-tight"
            />

            {status.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium ui-fade-in" role="alert">
                {status.error}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={!email || !password || status.loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 text-base"
            >
              {status.loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Authenticating…
                </span>
              ) : (
                'Sign In to Terminal'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">v2.4.0-stable</span>
            <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account? <button type="button" className="text-white font-semibold hover:underline decoration-blue-500/50 underline-offset-4 ml-1">Contact your administrator</button>
        </p>
      </div>
    </div>
  );
}

