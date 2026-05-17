'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-forest-600 mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="text-center mb-8">
          <Leaf className="w-12 h-12 text-forest-600 mx-auto mb-3" />
          <h1 className="font-serif text-3xl text-forest-700 mb-2">Forgot Password?</h1>
          <p className="text-forest-500">We'll send you reset instructions</p>
        </div>

        {sent ? (
          <div className="text-center bg-forest-50 p-6 rounded-2xl">
            <Mail className="w-12 h-12 text-forest-600 mx-auto mb-3" />
            <p className="text-forest-700 font-medium mb-2">Check your inbox</p>
            <p className="text-sm text-forest-500">We've sent a password reset link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-forest-400" />
              <input
                type="email" required placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-cream-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
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