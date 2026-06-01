'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('📧 Reset link sent! Check your email.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full rounded-3xl p-10" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <Link href="/login" className="inline-flex items-center gap-2 mb-6 transition"
          style={{ color: 'var(--eco-bright)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="text-center mb-8">
          <Leaf className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--eco)' }} />
          <h1 className="font-serif text-3xl mb-2" style={{ color: 'var(--text)' }}>Forgot Password?</h1>
          <p style={{ color: 'var(--text-muted)' }}>We'll send you reset instructions</p>
        </div>

        {sent ? (
          <div className="text-center p-6 rounded-2xl" style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
            <Mail className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--eco-bright)' }} />
            <p className="font-medium mb-2" style={{ color: 'var(--eco-bright)' }}>Check your inbox</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5" style={{ color: 'var(--text-faint)' }} />
              <input
                type="email" required placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
