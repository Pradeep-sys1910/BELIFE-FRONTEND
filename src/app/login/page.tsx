'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnverified(false);
    try {
      const { data } = await api.post('/auth/login', form);
      setUser(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setUnverified(true);
      } else {
        toast.error(err.response?.data?.message || 'Sign in failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      toast.success('Verification email sent — check your inbox.');
      setUnverified(false);
    } catch {
      toast.error('Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex w-[480px] bg-forest-700 flex-col justify-between p-12 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <Leaf className="w-7 h-7 text-forest-300" />
          <span className="text-xl font-serif font-bold text-white">BeLife</span>
        </Link>
        <div>
          <blockquote className="text-forest-100 text-2xl font-serif leading-snug mb-6">
            "The greatest threat to our planet is the belief that someone else will save it."
          </blockquote>
          <p className="text-forest-400 text-sm">— Robert Swan</p>
        </div>
        <p className="text-forest-500 text-xs">© {new Date().getFullYear()} BeLife</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <Leaf className="w-6 h-6 text-forest-600" />
            <span className="text-lg font-serif font-bold text-forest-700">BeLife</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Sign in</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back to BeLife</p>
          </div>

          {/* Unverified email notice */}
          {unverified && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-900 mb-1">Email not verified</p>
              <p className="text-xs text-amber-700 mb-3">
                Check your inbox for a verification link, or request a new one.
              </p>
              <button onClick={handleResend} disabled={resending}
                className="text-xs font-semibold text-amber-900 underline underline-offset-2 disabled:opacity-60">
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" required placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-forest-600 hover:underline">Forgot password?</Link>
              </div>
              <input type="password" required placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-forest-700 hover:bg-forest-800 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60 mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-forest-700 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
