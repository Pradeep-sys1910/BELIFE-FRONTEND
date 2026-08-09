'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getEcoBadge } from '@/lib/ecoBadge';
import BadgeShelf from '@/components/BadgeShelf';

interface PublicUser {
  id: string;
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  email?: string;
  createdAt: string;
  _count: { followers: number; following: number };
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  readTime: number;
  createdAt: string;
  _count: { likes: number; comments: number };
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    api.get(`/users/${username}/profile`)
      .then(r => {
        setUser(r.data.user);
        setBlogs(r.data.blogs);
        setFollowerCount(r.data.user._count.followers);
        setIsPrivate(!!r.data.private);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!currentUser || !user || currentUser.id === user.id) return;
    api.get(`/users/${user.id}/follow-status`)
      .then(r => setFollowing(r.data.following))
      .catch(() => {});
  }, [currentUser, user]);

  const handleFollow = async () => {
    if (!currentUser) { router.push('/login'); return; }
    if (!user || followLoading) return;
    setFollowLoading(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setFollowerCount(n => wasFollowing ? n - 1 : n + 1);
    try {
      const { data } = await api.post(`/users/${user.id}/follow`);
      setFollowing(data.following);
      setFollowerCount(data.followerCount);
    } catch {
      setFollowing(wasFollowing);
      setFollowerCount(n => wasFollowing ? n + 1 : n - 1);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-[630px] mx-auto px-4 pt-12 pb-24 animate-pulse">
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="w-24 h-24 rounded-full" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-5 rounded w-40" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-3 rounded w-56" style={{ background: 'var(--bg-elevated)' }} />
      </div>
    </div>
  );

  if (notFound) return (
    <div className="max-w-[630px] mx-auto px-4 pt-24 pb-24 text-center">
      <div className="text-5xl mb-4">🌿</div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>User not found</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>This profile doesn't exist or may have been deleted.</p>
      <Link href="/" className="text-sm hover:underline" style={{ color: 'var(--eco-bright)' }}>← Back to Home</Link>
    </div>
  );

  if (!user) return null;

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="max-w-[630px] mx-auto px-4 pt-8 pb-24">

      {/* Profile header */}
      <header className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-10">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-[3px] shrink-0"
          style={{ background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}>
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
            : <div className="w-full h-full rounded-full flex items-center justify-center text-white text-3xl font-bold border-2 border-white"
                style={{ background: '#0F4C25' }}>
                {user.name[0].toUpperCase()}
              </div>
          }
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{user.name}</h1>
          {user.username && (
            <p className="text-sm mb-3" style={{ color: 'var(--text-faint)' }}>@{user.username}</p>
          )}

          {/* Stats row */}
          <ul className="flex gap-6 justify-center md:justify-start mb-3">
            <li className="text-sm text-center">
              <span className="font-semibold" style={{ color: 'var(--text)' }}>{blogs.length}</span>
              {' '}<span style={{ color: 'var(--text-muted)' }}>posts</span>
            </li>
            <li className="text-sm text-center cursor-pointer hover:opacity-70 transition">
              <span className="font-semibold" style={{ color: 'var(--text)' }}>{followerCount}</span>
              {' '}<span style={{ color: 'var(--text-muted)' }}>followers</span>
            </li>
            <li className="text-sm text-center cursor-pointer hover:opacity-70 transition">
              <span className="font-semibold" style={{ color: 'var(--text)' }}>{user._count.following}</span>
              {' '}<span style={{ color: 'var(--text-muted)' }}>following</span>
            </li>
          </ul>

          {/* Eco badge */}
          {(() => {
            const badge = getEcoBadge(blogs.length, followerCount);
            return (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
                style={{ background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}
                title={badge.description}>
                {badge.emoji} {badge.label}
              </div>
            );
          })()}

          {user.bio && (
            <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{user.bio}</p>
          )}
          {user.email && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              ✉️ <a href={`mailto:${user.email}`} className="hover:underline" style={{ color: 'var(--eco-bright)' }}>{user.email}</a>
            </p>
          )}
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
            Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </p>

          {/* Action buttons — only shown to other users */}
          {currentUser && !isOwnProfile && (
            <div className="mt-3 flex items-center gap-2 justify-center md:justify-start">
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition"
                style={following
                  ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  : { background: 'var(--eco)', color: '#050C07' }
                }
              >
                {following ? (
                  <><UserCheck className="w-4 h-4" /> Following</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Follow</>
                )}
              </button>
              <button
                onClick={() => router.push(`/messages?with=${user.id}`)}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition"
                style={{ color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}>
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </div>
          )}

          {isOwnProfile && (
            <Link href="/settings"
              className="mt-3 inline-block text-sm font-semibold px-5 py-2 rounded-full transition"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Edit Profile
            </Link>
          )}
        </div>
      </header>

      {/* Achievement badges */}
      {!isPrivate && <BadgeShelf userId={user.id} />}

      {/* Divider */}
      <div className="mb-6" style={{ borderTop: '1px solid var(--border)' }} />

      {/* Posts grid */}
      {isPrivate ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>This profile is private</p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{user.name} has chosen to keep their stories private.</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-faint)' }}>No posts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[3px]">
          {blogs.map(blog => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`}
              className="relative aspect-square overflow-hidden group"
              style={{ background: 'var(--bg-elevated)' }}>
              {blog.image
                ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : <div className="w-full h-full flex items-center justify-center"
                    style={{ background: 'var(--eco-dim)' }}>
                    <span className="text-3xl">🌿</span>
                  </div>
              }
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
