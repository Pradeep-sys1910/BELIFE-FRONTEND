'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Users, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const HIDE_ON = [
  '/login', '/register', '/verify-email', '/forgot-password',
  '/reset-password', '/delete-account', '/messages', '/blogs/new',
  '/onboarding',
];

interface RecentBlog {
  id: string;
  title: string;
  slug: string;
  _count: { likes: number; comments: number };
  author: { name: string; avatar?: string };
}

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  _count: { followers: number; blogs: number };
}

function Avatar({ name, avatar, size = 32 }: { name: string; avatar?: string; size?: number }) {
  const s: React.CSSProperties = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };
  if (avatar) return <img src={avatar} alt={name} style={{ ...s, objectFit: 'cover' }} />;
  return (
    <div
      style={{ ...s, background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
      className="flex items-center justify-center text-white font-bold text-xs"
    >
      {name[0].toUpperCase()}
    </div>
  );
}

export default function RightSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [recent, setRecent] = useState<RecentBlog[]>([]);
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const shouldHide =
    HIDE_ON.some(p => pathname.startsWith(p)) ||
    (pathname.startsWith('/blogs/') && pathname !== '/blogs/new' && !pathname.endsWith('/new'));

  useEffect(() => {
    if (shouldHide) return;
    api.get('/blogs', { params: { limit: 5 } })
      .then(r => setRecent((r.data as any).blogs?.slice(0, 5) || []))
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, [shouldHide]);

  useEffect(() => {
    if (shouldHide || !user) return;
    setLoadingSuggested(true);
    api.get('/users/suggested')
      .then(r => setSuggested((r.data as any[])?.slice(0, 4) || []))
      .catch(() => {})
      .finally(() => setLoadingSuggested(false));
  }, [shouldHide, user?.id]);

  const handleFollow = async (userId: string) => {
    const alreadyFollowed = followedIds.has(userId);
    setFollowedIds(prev => {
      const next = new Set(prev);
      alreadyFollowed ? next.delete(userId) : next.add(userId);
      return next;
    });
    try {
      await api.post(`/users/${userId}/follow`);
    } catch {
      setFollowedIds(prev => {
        const next = new Set(prev);
        alreadyFollowed ? next.add(userId) : next.delete(userId);
        return next;
      });
    }
  };

  if (shouldHide) return null;

  return (
    <aside className="hidden xl:block w-[280px] shrink-0 pt-8 pb-24 pl-2 pr-4 sticky top-0 h-screen overflow-y-auto no-scrollbar">

      {/* Recent Stories */}
      <div
        className="rounded-2xl p-4 mb-4 animate-fade-in"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4" style={{ color: 'var(--eco-bright)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Stories</h3>
        </div>

        {loadingRecent ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="skeleton w-4 h-3 rounded shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-2.5 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>No stories yet</p>
        ) : (
          <div className="space-y-4">
            {recent.map((blog, i) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`} className="flex items-start gap-2.5 group">
                <span
                  className="text-xs font-bold mt-0.5 w-4 shrink-0 tabular-nums"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p
                    className="text-xs font-medium leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-eco-400"
                    style={{ color: 'var(--text)' }}
                  >
                    {blog.title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {blog.author.name}
                    {blog._count.likes > 0 && ` · ❤️ ${blog._count.likes}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/blogs"
          className="inline-block mt-4 text-xs font-semibold transition-colors hover:underline"
          style={{ color: 'var(--eco-bright)' }}
        >
          See all stories →
        </Link>
      </div>

      {/* Suggested Writers (auth only) */}
      {user && (
        <div
          className="rounded-2xl p-4 mb-4 animate-fade-in stagger-1"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4" style={{ color: 'var(--eco-bright)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Suggested Writers</h3>
          </div>

          {loadingSuggested ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-2.5 w-16 rounded" />
                  </div>
                  <div className="skeleton h-6 w-14 rounded-full" />
                </div>
              ))}
            </div>
          ) : suggested.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>You're following everyone!</p>
          ) : (
            <div className="space-y-3">
              {suggested.map(u => {
                const followed = followedIds.has(u.id);
                return (
                  <div key={u.id} className="flex items-center gap-2.5">
                    <Link href={`/profile/${u.username}`}>
                      <Avatar name={u.name} avatar={u.avatar} size={32} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${u.username}`}>
                        <p className="text-xs font-semibold truncate leading-tight transition-colors hover:text-eco-400" style={{ color: 'var(--text)' }}>
                          {u.name}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                          {u._count.blogs} post{u._count.blogs !== 1 ? 's' : ''}
                        </p>
                      </Link>
                    </div>
                    <button
                      onClick={() => handleFollow(u.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all duration-200"
                      style={followed
                        ? { background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }
                        : { background: 'var(--eco)', color: '#050C07' }
                      }
                    >
                      {!followed && <UserPlus className="w-2.5 h-2.5" />}
                      {followed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Community Quick Links */}
      <div
        className="rounded-2xl p-4 animate-fade-in stagger-2"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Explore</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/forum',      label: '💬 Forum' },
            { href: '/groups',     label: '👥 Groups' },
            { href: '/campaigns',  label: '📣 Campaigns' },
            { href: '/challenges', label: '🏆 Challenges' },
            { href: '/thoughts',   label: '💡 Thoughts' },
            { href: '/categories', label: '🏷️ Topics' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 hover:border-[var(--border-eco)] hover:text-[var(--eco-bright)]"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-4 px-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {[
            { href: '/about',   label: 'About' },
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms',   label: 'Terms' },
            { href: '/contact', label: 'Contact' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[10px] transition-colors hover:text-[var(--text-muted)]"
              style={{ color: 'var(--text-faint)' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'var(--text-faint)' }}>
          © {new Date().getFullYear()} BeLife
        </p>
      </div>
    </aside>
  );
}
