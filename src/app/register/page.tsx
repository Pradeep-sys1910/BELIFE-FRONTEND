'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('🌱 Account created! Check your email to verify.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
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

        <h1 className="font-serif text-3xl text-forest-700 mb-2 text-center">Join the Movement</h1>
        <p className="text-forest-500 text-center mb-8">Start your sustainable journey today</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-3.5 w-5 h-5 text-forest-400" />
            <input
              type="text" required placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-cream-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-forest-400" />
            <input
              type="email" required placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-cream-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-forest-400" />
            <input
              type="password" required minLength={8} placeholder="Password (min 8 chars)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-cream-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-forest-500 mt-6">
          Already a member? <Link href="/login" className="text-forest-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}