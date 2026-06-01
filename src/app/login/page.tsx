'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const FACTS = [
  "The Amazon rainforest produces 20% of the world's oxygen.",
  "A single tree can absorb 48 lbs of CO₂ per year.",
  "Seagrass meadows absorb carbon 35× faster than tropical rainforests.",
  "Indigenous peoples protect 80% of the world's remaining biodiversity.",
  "Trees communicate through underground fungal networks.",
  "Spending just 20 minutes in nature lowers stress hormone levels.",
  "Renewable energy could power 90% of global electricity by 2050.",
  "The Arctic is warming nearly 4× faster than the rest of the planet.",
  "Bamboo can grow up to 3 feet in a single day.",
  "Coral reefs support 25% of all marine life despite covering <1% of the ocean.",
];

const inputCls = `
  w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none
  placeholder:text-[#2E4A35] text-[#DFF0E3]
`;
const inputStyle: React.CSSProperties = {
  background: 'var(--input-bg)',
  border:     '1px solid var(--input-border)',
};
const inputFocusStyle: React.CSSProperties = {
  borderColor: 'rgba(74,222,128,0.4)',
  background:  'var(--input-bg)',
  boxShadow:   '0 0 0 3px rgba(34,197,94,0.08)',
};

function Input({
  type = 'text', placeholder, value, onChange, required, autoComplete,
  suffix,
}: {
  type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean;
  autoComplete?: string; suffix?: React.ReactNode;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div className="relative">
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required={required}
        autoComplete={autoComplete}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        className={inputCls + (suffix ? ' pr-11' : '')}
        style={focus ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router      = useRouter();
  const { setUser } = useAuthStore();
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending,  setResending]  = useState(false);
  const [fact]  = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setUnverified(false);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 403) setUnverified(true);
      else toast.error(err.response?.data?.message || 'Sign in failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent — check your inbox.');
      setUnverified(false);
    } catch { toast.error('Failed to resend. Try again.'); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── Left brand panel ────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[440px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(34,197,94,0.07) 0%, transparent 70%)',
        }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
        }} />

        <Link href="/" className="relative z-10">
          <Image src="/logo.png" alt="BeLife" width={140} height={58} className="object-contain" priority />
        </Link>

        <div className="relative z-10">
          <div className="w-8 h-0.5 mb-6 rounded-full" style={{ background: '#22C55E' }} />
          <blockquote className="text-xl font-serif leading-relaxed mb-4" style={{ color: '#A8C8B0' }}>
            "{fact}"
          </blockquote>
          <p className="text-sm font-medium" style={{ color: 'var(--text-faint)' }}>— Nature Fact</p>
        </div>

        <p className="text-xs relative z-10" style={{ color: '#1E3A24' }}>
          © {new Date().getFullYear()} BeLife
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px] animate-fade-in">

          <Link href="/" className="inline-block mb-10 lg:hidden">
            <Image src="/logo.png" alt="BeLife" width={120} height={50} className="object-contain" priority />
          </Link>

          <div className="mb-8">
            <h1 className="text-[28px] font-semibold tracking-tight leading-tight" style={{ color: '#E8F5EC' }}>
              Welcome back
            </h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Sign in to continue to BeLife
            </p>
          </div>

          {unverified && (
            <div
              className="mb-6 p-4 rounded-2xl"
              style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: '#FDE68A' }}>Email not verified</p>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: '#CA8A04' }}>
                Check your inbox for a verification link, or request a new one.
              </p>
              <button
                onClick={handleResend} disabled={resending}
                className="text-xs font-semibold underline underline-offset-2 disabled:opacity-60 transition-opacity"
                style={{ color: '#FBBF24' }}
              >
                {resending ? 'Sending…' : 'Resend verification email →'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>
                Email
              </label>
              <Input
                type="email" placeholder="you@example.com"
                value={email} onChange={setEmail}
                required autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium transition-colors hover:text-eco-400" style={{ color: '#4ADE80' }}>
                  Forgot?
                </Link>
              </div>
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password} onChange={setPassword}
                required autoComplete="current-password"
                suffix={
                  <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}
                    style={{ color: 'var(--text-faint)' }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 mt-1 active:scale-[0.98] disabled:opacity-50"
              style={{ background: loading ? '#16A34A' : '#22C55E', color: '#050C07' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: 'var(--bg)', color: 'var(--text-faint)' }}>or</span>
            </div>
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            New to BeLife?{' '}
            <Link href="/register" className="font-semibold hover:text-eco-300 transition-colors" style={{ color: '#4ADE80' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
