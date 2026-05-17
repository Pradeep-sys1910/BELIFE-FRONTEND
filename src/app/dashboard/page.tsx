'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-cream-200 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-serif font-bold text-forest-700">BeLife</Link>
        <div className="flex items-center gap-4">
          <span className="text-forest-600 text-sm">Hello, {user.name} 🌿</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-forest-700 rounded-lg text-forest-700 hover:bg-forest-700 hover:text-cream-50 transition text-sm"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-forest-700 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-forest-500">Your sustainable journey continues here.</p>
          {!user.verified && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
              ⚠️ Please verify your email to unlock all features. Check your inbox.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream-200 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-serif text-xl text-forest-700 mb-2">Read Blogs</h3>
            <p className="text-forest-500 text-sm mb-4">Explore stories on sustainable living</p>
            <Link href="/blogs" className="btn-primary text-sm">Explore</Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream-200 text-center">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="font-serif text-xl text-forest-700 mb-2">Write a Blog</h3>
            <p className="text-forest-500 text-sm mb-4">Share your green journey with the world</p>
            <Link href="/blogs/new" className="btn-primary text-sm">Start Writing</Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream-200 text-center">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="font-serif text-xl text-forest-700 mb-2">My Profile</h3>
            <p className="text-forest-500 text-sm mb-4">Update your name, bio and avatar</p>
            <Link href="/profile" className="btn-primary text-sm">Edit Profile</Link>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm border border-cream-200">
          <h2 className="font-serif text-2xl text-forest-700 mb-4">Account Details</h2>
          <div className="space-y-3 text-sm text-forest-600">
            <div className="flex gap-3"><span className="font-medium w-20">Name:</span><span>{user.name}</span></div>
            <div className="flex gap-3"><span className="font-medium w-20">Email:</span><span>{user.email}</span></div>
            <div className="flex gap-3"><span className="font-medium w-20">Status:</span>
              <span className={user.verified ? 'text-green-600' : 'text-yellow-600'}>
                {user.verified ? '✓ Verified' : '⚠ Not verified'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
