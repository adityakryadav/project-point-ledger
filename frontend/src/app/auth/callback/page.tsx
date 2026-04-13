'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const { setTokenAndFetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google sign-in failed. Please try again.');
      router.push('/auth');
      return;
    }

    if (token) {
      setTokenAndFetchUser(token).then(() => {
        toast.success('Signed in with Google!');
        router.push('/dashboard');
      });
    } else {
      router.push('/auth');
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Completing sign-in...</p>
      </div>
    </div>
  );
}
