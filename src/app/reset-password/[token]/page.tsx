'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset! 🌿');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full rounded-3xl p-10" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="w-8 h-8" style={{ color: 'var(--eco)' }} />
          <span className="text-3xl font-serif font-bold" style={{ color: 'var(--eco-bright)' }}>BeLife</span>
        </Link>
        <h1 className="font-serif text-3xl mb-6 text-center" style={{ color: 'var(--text)' }}>Reset Password</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5" style={{ color: 'var(--text-faint)' }} />
            <input type="password" required minLength={8} placeholder="New password"
              value={password} onChange={e => setPassword(e.target.value)}
              className="input pl-12" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5" style={{ color: 'var(--text-faint)' }} />
            <input type="password" required placeholder="Confirm password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              className="input pl-12" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
