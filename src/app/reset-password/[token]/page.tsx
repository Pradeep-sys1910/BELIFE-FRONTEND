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
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="w-8 h-8 text-forest-600" />
          <span className="text-3xl font-serif font-bold text-forest-700">BeLife</span>
        </Link>
        <h1 className="font-serif text-3xl text-forest-700 mb-6 text-center">Reset Password</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-forest-400" />
            <input type="password" required minLength={8} placeholder="New password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-cream-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-forest-400" />
            <input type="password" required placeholder="Confirm password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-cream-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
