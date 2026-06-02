'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Status = 'confirming' | 'loading' | 'success' | 'error';

export default function DeleteAccountPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [status, setStatus] = useState<Status>('confirming');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = async () => {
    setStatus('loading');
    try {
      await api.delete(`/auth/confirm-delete/${token}`);
      logout();
      setStatus('success');
      setTimeout(() => router.push('/'), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'This link is invalid or has expired.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--eco)' }} />
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Account deleted</h1>
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            Your account and all associated data have been permanently removed from BeLife.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Redirecting you to the home page...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="max-w-md w-full text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Link expired</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{errorMsg}</p>
          <Link href="/settings" className="btn-primary inline-flex">
            Back to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-5 bg-red-500/10">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>

        <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: 'var(--text)' }}>
          Delete your account?
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
          This is the final step. This action is <strong style={{ color: 'var(--text)' }}>permanent</strong> and cannot be undone.
        </p>

        {/* What gets deleted */}
        <div className="rounded-xl p-4 mb-4 space-y-2 bg-red-500/10" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">What will be permanently deleted</p>
          {[
            'Your profile and all personal account data',
            'All blog posts and articles you published',
            'All your comments and likes',
            'Your messages and conversations',
          ].map(item => (
            <div key={item} className="flex items-start gap-2 text-sm text-red-300">
              <span className="mt-0.5 shrink-0">✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-xs text-amber-400 leading-relaxed">
            <strong>Your content belongs to you.</strong> BeLife does not own any content you have posted.
            Once your account is deleted, your content will be removed from our platform.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/settings"
            className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' }}>
            Cancel
          </Link>
          <button onClick={handleConfirm} disabled={status === 'loading'}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
            {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === 'loading' ? 'Deleting...' : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
