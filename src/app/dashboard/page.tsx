'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Grid3x3, PenSquare, Settings, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { getEcoBadge } from '@/lib/ecoBadge';

interface Blog {
  id: string; title: string; slug: string; image: string;
  createdAt: string;
  _count: { likes: number; comments: number };
}

export default function DashboardPage() {
  const router   = useRouter();
  const { user } = useAuthStore();
  const [blogs,          setBlogs]          = useState<Blog[]>([]);
  const [followerCount,  setFollowerCount]  = useState(0);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    Promise.all([
      api.get('/blogs', { params: { author: user.id, limit: 18 } }),
      user.username ? api.get(`/users/${user.username}/profile`) : Promise.resolve(null),
    ]).then(([blogsRes, profileRes]) => {
      setBlogs((blogsRes.data as any).blogs || []);
      if (profileRes) setFollowerCount(profileRes.data.user._count?.followers ?? 0);
    }).catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-8 pb-24">

      {/* Profile header */}
      <header className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-10 animate-fade-in">

        {/* Avatar */}
        <div
          className="w-24 h-24 md:w-32 md:h-32 rounded-full p-[3px] shrink-0"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #0F4C25 100%)' }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name}
              className="w-full h-full rounded-full object-cover"
              style={{ border: '2px solid var(--bg-card)' }}
            />
          ) : (
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-white text-4xl font-bold"
              style={{ background: 'var(--bg-card)', border: '2px solid var(--bg-card)' }}
            >
              {user.name[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
            <h1 className="text-xl font-semibold" style={{ color: '#E8F5EC' }}>{user.name}</h1>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Link href="/settings"
                className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-200"
                style={{ background: 'var(--bg-elevated)', color: '#DFF0E3', border: '1px solid var(--border)' }}>
                Edit Profile
              </Link>
              <Link href="/blogs/new"
                className="text-sm font-bold px-4 py-1.5 rounded-lg transition-all duration-200"
                style={{ background: '#22C55E', color: '#050C07' }}>
                Write
              </Link>
              <Link href="/messages"
                className="p-2 rounded-lg transition-all duration-200"
                style={{ background: 'var(--bg-elevated)', color: '#DFF0E3', border: '1px solid var(--border)' }}>
                <MessageCircle className="w-4 h-4" />
              </Link>
              <Link href="/settings"
                className="p-2 rounded-lg transition-all duration-200"
                style={{ background: 'var(--bg-elevated)', color: '#DFF0E3', border: '1px solid var(--border)' }}>
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <ul className="flex gap-6 justify-center md:justify-start mb-3">
            <li className="text-sm">
              <span className="font-semibold" style={{ color: '#E8F5EC' }}>{loading ? '—' : blogs.length}</span>
              {' '}<span style={{ color: 'var(--text-muted)' }}>posts</span>
            </li>
            <li className="text-sm">
              <span className="font-semibold" style={{ color: '#E8F5EC' }}>{loading ? '—' : followerCount}</span>
              {' '}<span style={{ color: 'var(--text-muted)' }}>followers</span>
            </li>
          </ul>

          {/* Eco badge */}
          {!loading && (() => {
            const badge = getEcoBadge(blogs.length, followerCount);
            return (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}
                title={badge.description}>
                {badge.emoji} {badge.label}
              </div>
            );
          })()}

          {/* Bio */}
          <div className="text-sm text-left">
            <p className="font-semibold" style={{ color: '#DFF0E3' }}>{user.name}</p>
            {user.bio && <p className="mt-0.5 whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{user.bio}</p>}
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{user.email}</p>
          </div>

          {!user.verified && (
            <div
              className="mt-3 px-3 py-2 rounded-lg text-xs text-left"
              style={{
                background: 'rgba(251,191,36,0.07)',
                border:     '1px solid rgba(251,191,36,0.2)',
                color:      '#FBBF24',
              }}
            >
              ⚠️ Verify your email to unlock all features. Check your inbox.
            </div>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex justify-center gap-8 mb-1" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          className="flex items-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-widest -mt-px"
          style={{ color: '#E8F5EC', borderTop: '1px solid #4ADE80' }}
        >
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
        <div className="text-center py-16">
          <PenSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>No posts yet</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>Share your first sustainable story</p>
          <Link href="/blogs/new" className="btn-primary text-sm">Write Now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[3px]">
          {blogs.map(blog => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`}
              className="relative aspect-square overflow-hidden group"
              style={{ background: 'var(--bg-elevated)' }}
            >
              {blog.image ? (
                <img
                  src={blog.image} alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <span className="text-3xl">🌿</span>
                </div>
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-semibold"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
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
