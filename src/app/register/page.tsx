'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleUsername = (val: string) => {
    // auto-lowercase, strip invalid chars as user types
    setForm({ ...form, username: val.toLowerCase().replace(/[^a-z0-9_]/g, '') });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.username.length < 3) {
      toast.error('Username must be at least 3 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        ...form,
        email: form.email.toLowerCase().trim(),
      });
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex w-[480px] bg-forest-700 flex-col justify-between p-12 shrink-0">
        <Link href="/" className="inline-block">
          <Image src="/logo.png" alt="BeLife" width={110} height={40} className="object-contain" priority />
        </Link>
        <div>
          <h2 className="text-white text-3xl font-serif font-bold leading-snug mb-4">
            Join a community that cares about the planet.
          </h2>
          <ul className="space-y-3 text-forest-200 text-sm">
            <li className="flex items-start gap-2"><span className="mt-0.5 text-forest-400">✓</span> Read and write sustainable living stories</li>
            <li className="flex items-start gap-2"><span className="mt-0.5 text-forest-400">✓</span> Connect with eco-conscious people worldwide</li>
            <li className="flex items-start gap-2"><span className="mt-0.5 text-forest-400">✓</span> Free forever — no credit card required</li>
          </ul>
        </div>
        <p className="text-forest-500 text-xs">© {new Date().getFullYear()} BeLife</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <Link href="/" className="inline-block mb-10 lg:hidden">
            <Image src="/logo.png" alt="BeLife" width={110} height={40} className="object-contain" priority />
          </Link>

          {done ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-forest-50 border-2 border-forest-200 flex items-center justify-center mx-auto mb-5">
                <Leaf className="w-7 h-7 text-forest-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Check your inbox</h1>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                We sent a verification link to <span className="font-medium text-gray-700">{form.email}</span>. Click it to activate your account.
              </p>
              <p className="text-xs text-gray-400 mb-6">Didn't receive it? Check your spam folder.</p>
              <Link href="/login"
                className="inline-block bg-forest-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-forest-800 transition">
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Create an account</h1>
                <p className="text-gray-500 text-sm mt-1">Start your sustainable journey today</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                  <input type="text" required placeholder="Jane Smith"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username <span className="text-gray-400 font-normal">(your unique @id)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">@</span>
                    <input type="text" required placeholder="jane_smith" minLength={3} maxLength={20}
                      value={form.username}
                      onChange={e => handleUsername(e.target.value)}
                      className="w-full pl-7 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">3–20 chars · letters, numbers, underscores only</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" required placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input type="password" required minLength={8} placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-forest-700 hover:bg-forest-800 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60 mt-2">
                  {loading ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  By creating an account you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and{' '}
                  <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                </p>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-forest-700 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
