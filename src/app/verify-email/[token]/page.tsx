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
      .then(() => { setStatus('success'); setTimeout(() => router.push('/login'), 3000); })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <Leaf className="w-6 h-6" style={{ color: 'var(--eco)' }} />
          <span className="text-xl font-serif font-bold" style={{ color: 'var(--eco-bright)' }}>BeLife</span>
        </Link>

        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--eco)' }} />
            <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Verifying your email</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Please wait a moment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--eco)' }} />
            <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Email verified</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Your account is now active. Redirecting you to sign in...
            </p>
            <Link href="/login" className="btn-primary inline-flex">Sign in now</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Link invalid or expired</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              The verification link has expired or already been used. Sign in to request a new one.
            </p>
            <Link href="/login" className="btn-primary inline-flex">Back to sign in</Link>
          </>
        )}
      </div>
    </div>
  );
}
