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

  const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 focus:bg-white transition-all duration-200";

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex w-[460px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #091810 0%, #112A1C 45%, #1E4530 100%)' }}>
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(62,122,90,0.25) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(62,122,90,0.15) 0%, transparent 70%)' }} />

        <Link href="/" className="relative z-10">
          <Image src="/logo.png" alt="BeLife" width={120} height={44} className="object-contain" priority />
        </Link>

        <div className="relative z-10">
          <div className="w-8 h-0.5 bg-forest-500 mb-6 rounded-full" />
          <h2 className="text-white text-2xl font-serif font-semibold leading-snug mb-6">
            Join a community that cares about the planet.
          </h2>
          <ul className="space-y-3.5">
            {[
              'Read and write sustainable living stories',
              'Connect with eco-conscious people worldwide',
              'Free forever — no credit card required',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-forest-500/20 border border-forest-500/40 flex items-center justify-center shrink-0">
                  <span className="text-forest-400 text-[10px]">✓</span>
                </span>
                <span className="text-forest-200/80 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-forest-700 text-xs relative z-10">© {new Date().getFullYear()} BeLife</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[360px] animate-fade-in">

          <Link href="/" className="inline-block mb-10 lg:hidden">
            <Image src="/logo.png" alt="BeLife" width={110} height={40} className="object-contain" priority />
          </Link>

          {done ? (
            <div className="text-center py-6 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center mx-auto mb-5">
                <Leaf className="w-8 h-8 text-forest-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Check your inbox</h1>
              <p className="text-sm text-gray-500 mb-1.5 leading-relaxed">
                We sent a verification link to
              </p>
              <p className="text-sm font-semibold text-gray-800 mb-5">{form.email}</p>
              <p className="text-xs text-gray-400 mb-6">Didn't get it? Check your spam folder.</p>
              <Link href="/login"
                className="inline-block bg-forest-800 text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-forest-900 transition-all duration-200 shadow-sm hover:shadow-md">
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-[26px] font-semibold text-gray-900 tracking-tight leading-tight">Create account</h1>
                <p className="text-gray-400 text-sm mt-1.5">Start your sustainable journey today</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full name</label>
                  <input type="text" required placeholder="Jane Smith"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inputCls} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none font-medium">@</span>
                    <input type="text" required placeholder="jane_smith" minLength={3} maxLength={20}
                      value={form.username} onChange={e => handleUsername(e.target.value)}
                      className={inputCls + ' pl-8'} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">3–20 chars · letters, numbers, underscores only</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" required placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputCls} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                  <input type="password" required minLength={8} placeholder="Min. 8 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className={inputCls} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-forest-800 hover:bg-forest-900 text-white py-3 rounded-xl text-sm font-semibold
                             transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md mt-1 active:scale-[0.98]">
                  {loading ? 'Creating account…' : 'Create account'}
                </button>

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By signing up you agree to our{' '}
                  <Link href="/terms" className="text-gray-600 underline underline-offset-2 hover:text-gray-800">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-gray-600 underline underline-offset-2 hover:text-gray-800">Privacy Policy</Link>.
                </p>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
              </div>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-forest-700 font-semibold hover:text-forest-800 transition-colors">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
