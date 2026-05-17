'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', avatar: '' });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    setForm({ name: user.name || '', bio: (user as any).bio || '', avatar: user.avatar || '' });
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      setUser({ ...data, verified: user!.verified }, token!);
      toast.success('Profile updated! 🌿');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="bg-white border-b border-cream-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-forest-700">BeLife</Link>
          <Link href="/dashboard" className="text-forest-600 hover:text-forest-800 text-sm">Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl text-forest-700 mb-8">Edit Profile</h1>

        {/* Avatar preview */}
        {form.avatar && (
          <div className="mb-6 flex justify-center">
            <img src={form.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-cream-200" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl p-8 shadow-sm border border-cream-200">
          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Name *</label>
            <input
              type="text" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Avatar URL</label>
            <input
              type="url"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div className="pt-2 flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/dashboard" className="px-6 py-3 border border-cream-200 rounded-lg text-forest-600 hover:border-forest-400 transition">
              Cancel
            </Link>
          </div>
        </form>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-cream-200 shadow-sm">
          <p className="text-sm text-forest-600"><span className="font-medium">Email:</span> {user.email}</p>
          <p className="text-sm text-forest-600 mt-2"><span className="font-medium">Status:</span> {user.verified ? '✓ Verified' : '⚠ Not verified — check your email'}</p>
        </div>
      </main>
    </div>
  );
}
