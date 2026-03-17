import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState({ loading: false, error: null });
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };

    if (!formData.name) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ loading: true, error: null });

    // Mock signup delay
    setTimeout(() => {
      signup({ name: formData.name, email: formData.email });
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#312e81] overflow-hidden relative">
      {/* Soft Glow Background */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 opacity-20 blur-3xl rounded-full"></div> 
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 opacity-20 blur-3xl rounded-full"></div> 

      {/* Left Branding Section (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 z-10 animate-fade-in">
        <div className="max-w-lg">
          <div className="flex items-center gap-5 mb-10"> 
            <div className="p-4 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10"> 
              <img src="/logo.png" className="h-16 w-auto object-contain" /> 
            </div> 
            <span className="text-white text-2xl font-semibold tracking-wide"> 
              Point Ledger 
            </span> 
          </div> 

          <h1 className="text-6xl font-bold text-white leading-tight"> 
            Finance. 
            <br /> 
            Simplified. 
          </h1> 

          <p className="mt-4 text-gray-300 text-lg max-w-md"> 
            Manage points, track exchanges, and control your financial ledger — all in one powerful dashboard. 
          </p> 

          <div className="mt-8 space-y-3 text-gray-300"> 
            <p className="flex items-center gap-2">✔ Real-time transaction tracking</p> 
            <p className="flex items-center gap-2">✔ Secure point-to-INR exchange</p> 
            <p className="flex items-center gap-2">✔ Enterprise-grade analytics</p> 
          </div> 
        </div>
      </div>

      {/* Right Section: Signup Card */}
      <div className="flex-1 flex items-center justify-center px-4 lg:px-20 z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/20">
            <Link to="/" className="flex items-center justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="logo" 
                className="h-16 w-auto object-contain drop-shadow-lg" 
              />
            </Link>

            <div className="mb-10 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Create Account</h2>
              <p className="text-gray-500 font-medium mt-2">Join the next generation terminal</p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="gap-5 flex flex-col">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={status.loading}
                    className={`block w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    } focus:ring-2 focus:ring-indigo-500 focus:scale-[1.02] outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={status.loading}
                    className={`block w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    } focus:ring-2 focus:ring-indigo-500 focus:scale-[1.02] outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={status.loading}
                      className={`block w-full px-4 py-3 rounded-lg border ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-indigo-500 focus:scale-[1.02] outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400`}
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                      Confirm
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={status.loading}
                      className={`block w-full px-4 py-3 rounded-lg border ${
                        errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      } focus:ring-2 focus:ring-indigo-500 focus:scale-[1.02] outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400`}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {status.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 font-bold animate-fade-in" role="alert">
                  {status.error}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={status.loading}
                  className="w-full flex justify-center py-3.5 px-4 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status.loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.959 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-white/0 px-4 text-gray-500 font-medium bg-transparent">OR CONTINUE WITH</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.68-1.54 2.64-3.81 2.64-6.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
