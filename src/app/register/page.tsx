'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const inputCls =
  'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 text-[var(--text)] placeholder:text-[var(--text-faint)]';
const inputStyle: React.CSSProperties = {
  background: 'var(--input-bg)',
  border:     '1px solid var(--input-border)',
};
const focusStyle: React.CSSProperties = {
  borderColor: 'rgba(74,222,128,0.4)',
  background:  'var(--input-bg)',
  boxShadow:   '0 0 0 3px rgba(34,197,94,0.08)',
};

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  );
}

function Input({
  type = 'text', placeholder, value, onChange, required, autoComplete, prefix, suffix,
}: {
  type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean;
  autoComplete?: string; prefix?: string; suffix?: React.ReactNode;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm select-none" style={{ color: 'var(--text-muted)' }}>
          {prefix}
        </span>
      )}
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        required={required} autoComplete={autoComplete}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        className={inputCls + (prefix ? ' pl-8' : '') + (suffix ? ' pr-11' : '')}
        style={focus ? { ...inputStyle, ...focusStyle } : inputStyle}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>
      )}
    </div>
  );
}

const PERKS = [
  'Read & write sustainable living stories',
  'Follow eco-conscious writers you love',
  'Join topic groups and discussions',
  'Free forever — no credit card needed',
];

export default function RegisterPage() {
  const [name,      setName]      = useState('');
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);

  const handleUsername = (val: string) =>
    setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) { toast.error('Username must be at least 3 characters.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { name, username, email: email.toLowerCase().trim(), password });
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── Left brand panel ────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[440px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 20% 30%, rgba(34,197,94,0.07) 0%, transparent 70%)',
        }} />

        <Link href="/" className="relative z-10">
          <Image src="/logo.png" alt="BeLife" width={140} height={58} className="object-contain" priority />
        </Link>

        <div className="relative z-10">
          <div className="w-8 h-0.5 mb-6 rounded-full" style={{ background: '#22C55E' }} />
          <h2 className="text-2xl font-serif font-semibold mb-6 leading-snug" style={{ color: '#C8DCCC' }}>
            Join a community that cares about the planet.
          </h2>
          <ul className="space-y-3.5">
            {PERKS.map((perk, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]"
                  style={{
                    background: 'rgba(34,197,94,0.12)',
                    border:     '1px solid rgba(34,197,94,0.3)',
                    color:      '#4ADE80',
                  }}
                >
                  ✓
                </span>
                <span className="text-sm leading-relaxed" style={{ color: '#6E9674' }}>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs relative z-10" style={{ color: '#1E3A24' }}>
          © {new Date().getFullYear()} BeLife
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[360px] animate-fade-in">

          <Link href="/" className="inline-block mb-8 lg:hidden">
            <Image src="/logo.png" alt="BeLife" width={120} height={50} className="object-contain" priority />
          </Link>

          {done ? (
            <div className="text-center py-6 animate-scale-in">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <Leaf className="w-8 h-8" style={{ color: '#4ADE80' }} />
              </div>
              <h1 className="text-xl font-semibold mb-2" style={{ color: '#E8F5EC' }}>Check your inbox</h1>
              <p className="text-sm mb-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                We sent a verification link to
              </p>
              <p className="text-sm font-semibold mb-5" style={{ color: '#DFF0E3' }}>{email}</p>
              <p className="text-xs mb-6" style={{ color: 'var(--text-faint)' }}>Didn't get it? Check your spam folder.</p>
              <Link
                href="/login"
                className="inline-block py-3 px-7 rounded-xl text-sm font-bold transition-all duration-200"
                style={{ background: '#22C55E', color: '#050C07' }}
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-[28px] font-semibold tracking-tight leading-tight" style={{ color: '#E8F5EC' }}>
                  Create account
                </h1>
                <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Start your sustainable journey today
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Full name">
                  <Input placeholder="Jane Smith" value={name} onChange={setName} required autoComplete="name" />
                </Field>

                <Field label="Username" hint="3–20 chars · letters, numbers, underscores only">
                  <Input
                    placeholder="jane_smith" value={username}
                    onChange={handleUsername} required prefix="@"
                    autoComplete="username"
                  />
                </Field>

                <Field label="Email">
                  <Input type="email" placeholder="you@example.com" value={email} onChange={setEmail} required autoComplete="email" />
                </Field>

                <Field label="Password">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password} onChange={setPassword} required autoComplete="new-password"
                    suffix={
                      <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1} style={{ color: 'var(--text-faint)' }}>
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </Field>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 mt-1 active:scale-[0.98] disabled:opacity-50"
                  style={{ background: '#22C55E', color: '#050C07' }}
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>

                <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                  By signing up you agree to our{' '}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-eco-400" style={{ color: 'var(--text-muted)' }}>Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-eco-400" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>.
                </p>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs" style={{ background: 'var(--bg)', color: 'var(--text-faint)' }}>or</span>
                </div>
              </div>

              <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link href="/login" className="font-semibold hover:text-eco-300 transition-colors" style={{ color: '#4ADE80' }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
