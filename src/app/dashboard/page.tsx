'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Grid3x3, PenSquare, Settings, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Blog {
  id: string;
  title: string;
  slug: string;
  image: string;
  createdAt: string;
  _count: { likes: number; comments: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/blogs', { params: { author: user.id, limit: 18 } })
      .then(r => setBlogs(r.data.blogs || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-[630px] mx-auto px-4 pt-8 pb-24">

      {/* Profile header */}
      <header className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-10 animate-fade-in">

        {/* Avatar */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-tr from-forest-400 to-forest-700 shrink-0">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
            : <div className="w-full h-full rounded-full bg-forest-600 flex items-center justify-center text-white text-4xl font-bold border-2 border-white">
                {user.name[0].toUpperCase()}
              </div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left w-full">
          {/* Username + actions */}
          <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
            <h1 className="text-xl font-normal text-gray-900">{user.name}</h1>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Link href="/profile"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold px-4 py-1.5 rounded-lg transition">
                Edit Profile
              </Link>
              <Link href="/blogs/new"
                className="bg-forest-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-forest-700 transition">
                Write
              </Link>
              <Link href="/messages"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-2 rounded-lg transition">
                <MessageCircle className="w-4 h-4" />
              </Link>
              <Link href="/profile"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-2 rounded-lg transition">
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <ul className="flex gap-6 justify-center md:justify-start mb-4">
            <li className="text-sm">
              <span className="font-semibold text-gray-900">{loading ? '—' : blogs.length}</span>
              {' '}<span className="text-gray-500">posts</span>
            </li>
          </ul>

          {/* Bio */}
          <div className="text-sm text-left">
            <p className="font-semibold text-gray-900">{user.name}</p>
            {user.bio && <p className="text-gray-700 mt-0.5 whitespace-pre-line">{user.bio}</p>}
            <p className="text-gray-400 text-xs mt-1">{user.email}</p>
          </div>

          {/* Verification notice */}
          {!user.verified && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-xs text-left">
              ⚠️ Verify your email to unlock all features. Check your inbox.
            </div>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-t border-gray-200 flex justify-center gap-8 mb-1">
        <button className="flex items-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-widest border-t border-gray-900 -mt-px text-gray-900">
          <Grid3x3 className="w-3.5 h-3.5" /> Posts
        </button>
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-[3px]">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton aspect-square" style={{ borderRadius: 0 }} />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <PenSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium mb-1">No posts yet</p>
          <p className="text-xs mb-4">Share your first sustainable story</p>
          <Link href="/blogs/new" className="btn-primary text-sm">Write Now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[3px]">
          {blogs.map(blog => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`}
              className="relative aspect-square bg-gray-100 overflow-hidden group">
              {blog.image
                ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : <div className="w-full h-full bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center">
                    <span className="text-3xl">🌿</span>
                  </div>
              }
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-semibold">
                <span>❤️ {blog._count.likes}</span>
                <span>💬 {blog._count.comments}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
