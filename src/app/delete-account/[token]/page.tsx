'use client';

import { useState, useEffect } from 'react';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Account deleted</h1>
          <p className="text-gray-500 text-sm mb-2">
            Your account and all associated data have been permanently removed from BeLife.
          </p>
          <p className="text-gray-400 text-xs">Redirecting you to the home page...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Link expired</h1>
          <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
          <Link href="/settings"
            className="inline-block bg-forest-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-800 transition">
            Back to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
          Delete your account?
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          This is the final step. This action is <strong>permanent</strong> and cannot be undone.
        </p>

        {/* What gets deleted */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 space-y-2">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">What will be permanently deleted</p>
          {[
            'Your profile and all personal account data',
            'All blog posts and articles you published',
            'All your comments and likes',
            'Your messages and conversations',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-red-800">
              <span className="mt-0.5 shrink-0">✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* License notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Content license notice:</strong> As per BeLife's{' '}
            <Link href="/terms" className="underline hover:text-amber-900">Terms of Service</Link>,
            BeLife retains a perpetual license to use any content you have previously published
            on the platform. Any user or the platform may continue to use that content.
            Publicly visible content may remain in cached or archived form.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/settings"
            className="flex-1 text-center border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </Link>
          <button
            onClick={handleConfirm}
            disabled={status === 'loading'}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
            {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === 'loading' ? 'Deleting...' : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
