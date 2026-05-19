'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/login'), 3000);
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <Leaf className="w-6 h-6 text-forest-600" />
          <span className="text-xl font-serif font-bold text-forest-700">BeLife</span>
        </Link>

        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-forest-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email</h1>
            <p className="text-sm text-gray-500">Please wait a moment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-forest-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Email verified</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your account is now active. Redirecting you to sign in...
            </p>
            <Link href="/login"
              className="inline-block bg-forest-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-forest-700 transition">
              Sign in now
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Link invalid or expired</h1>
            <p className="text-sm text-gray-500 mb-6">
              The verification link has expired or already been used. Sign in to request a new one.
            </p>
            <Link href="/login"
              className="inline-block bg-forest-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-forest-700 transition">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
