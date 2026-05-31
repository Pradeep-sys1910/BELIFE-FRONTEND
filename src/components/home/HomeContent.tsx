'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Users, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Blog {
  id: string; title: string; slug: string; excerpt: string; image: string;
  readTime: number; createdAt: string;
  author:   { name: string; username?: string; avatar?: string };
  category: { name: string; slug: string } | null;
  _count:   { likes: number; comments: number };
}

interface Category { id: string; name: string; slug: string; icon: string }

// ── Shared Avatar ─────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 36 }: { name: string; avatar?: string; size?: number }) {
  const s: React.CSSProperties = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };
  if (avatar) return <img src={avatar} alt={name} style={{ ...s, objectFit: 'cover' }} />;
  return (
    <div
      style={{ ...s, background: 'linear-gradient(135deg, #22C55E 0%, #0F4C25 100%)' }}
      className="flex items-center justify-center text-white font-bold text-sm"
    >
      {name[0].toUpperCase()}
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ blog, index }: { blog: Blog; index: number }) {
  const { user } = useAuthStore();
  const router   = useRouter();
  const [liked,   setLiked]   = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [likes,   setLikes]   = useState(blog._count.likes);
  const [liking,  setLiking]  = useState(false);

  const handleLike = async () => {
    if (!user) { router.push('/login'); return; }
    if (liking) return;
    const was = liked;
    setLiked(!was); setLikes(n => was ? n - 1 : n + 1); setLiking(true);
    try {
      const { data } = await api.post(`/blogs/${blog.id}/like`);
      setLiked(data.liked); setLikes(data.count);
    } catch {
      setLiked(was); setLikes(n => was ? n + 1 : n - 1);
    } finally { setLiking(false); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog.title, url: `${window.location.origin}/blogs/${blog.slug}` })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/blogs/${blog.slug}`)
        .catch(() => {});
    }
  };

  return (
    <article
      className="rounded-2xl overflow-hidden mb-4 animate-slide-up"
      style={{
        background:    'var(--bg-card)',
        border:        '1px solid var(--border)',
        animationDelay: `${index * 0.055}s`,
        transition:    'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,222,128,0.15)';
        (e.currentTarget as HTMLElement).style.transform   = 'translateY(-1px)';
        (e.currentTarget as HTMLElement).style.boxShadow  = '0 8px 32px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.transform   = '';
        (e.currentTarget as HTMLElement).style.boxShadow  = '';
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link
          href={blog.author.username ? `/profile/${blog.author.username}` : '#'}
          className="flex items-center gap-3 group"
        >
          <Avatar name={blog.author.name} avatar={blog.author.avatar} size={38} />
          <div>
            <p
              className="text-sm font-semibold leading-tight transition-colors duration-200 group-hover:text-eco-400"
              style={{ color: '#DFF0E3' }}
            >
              {blog.author.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {blog.category
                ? <Link href={`/categories/${blog.category.slug}`} className="hover:text-eco-400 transition-colors">{blog.category.name}</Link>
                : null}
              {blog.category ? ' · ' : ''}
              {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        <button className="p-1 rounded-full transition-colors duration-200" style={{ color: 'var(--text-faint)' }}>
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Cover image */}
      {blog.image && (
        <Link href={`/blogs/${blog.slug}`}>
          <div className="w-full aspect-[16/9] overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <img
              src={blog.image} alt={blog.title}
              className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      {/* Title + excerpt */}
      <div className="px-4 pt-3 pb-2">
        <Link href={`/blogs/${blog.slug}`}>
          <h2
            className="text-base font-semibold leading-snug line-clamp-2 mb-1 transition-colors duration-200 hover:text-eco-400"
            style={{ color: '#E8F5EC' }}
          >
            {blog.title}
          </h2>
          {blog.excerpt && (
            <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {blog.excerpt}
            </p>
          )}
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-200 group"
            style={{ color: liked ? '#F87171' : 'var(--text-faint)' }}
          >
            <Heart
              className="w-4.5 h-4.5 transition-all duration-200 group-hover:text-red-400"
              style={{ width: 18, height: 18, fill: liked ? '#F87171' : 'none' }}
              strokeWidth={liked ? 0 : 1.7}
            />
            <span className="text-xs font-medium group-hover:text-red-400">{likes > 0 ? likes : ''}</span>
          </button>

          <Link
            href={`/blogs/${blog.slug}#comments`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-200 group"
            style={{ color: 'var(--text-faint)' }}
          >
            <MessageCircle style={{ width: 18, height: 18 }} strokeWidth={1.7} className="group-hover:text-eco-400 transition-colors" />
            <span className="text-xs font-medium group-hover:text-eco-400">
              {blog._count.comments > 0 ? blog._count.comments : ''}
            </span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center px-2.5 py-1.5 rounded-full transition-all duration-200 group"
            style={{ color: 'var(--text-faint)' }}
          >
            <Share2 style={{ width: 18, height: 18 }} strokeWidth={1.7} className="group-hover:text-eco-400 transition-colors" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{blog.readTime} min</span>
          <button
            onClick={() => { if (!user) { router.push('/login'); return; } setSaved(s => !s); }}
            className="flex items-center px-2.5 py-1.5 rounded-full transition-all duration-200 group"
            style={{ color: saved ? '#4ADE80' : 'var(--text-faint)' }}
          >
            <Bookmark
              style={{ width: 18, height: 18, fill: saved ? '#4ADE80' : 'none' }}
              strokeWidth={saved ? 0 : 1.7}
              className="group-hover:text-eco-400 transition-colors"
            />
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="skeleton w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-3 w-28 rounded" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
      </div>
      <div className="skeleton w-full aspect-[16/9]" style={{ borderRadius: 0 }} />
      <div className="px-4 pt-3 pb-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type FeedTab = 'forYou' | 'following';

export default function HomeContent() {
  const { user } = useAuthStore();
  const [tab,             setTab]             = useState<FeedTab>('forYou');
  const [blogs,           setBlogs]           = useState<Blog[]>([]);
  const [followingBlogs,  setFollowingBlogs]  = useState<Blog[]>([]);
  const [categories,      setCategories]      = useState<Category[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [followLoading,   setFollowLoading]   = useState(false);
  const [followLoaded,    setFollowLoaded]    = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/blogs', { params: { limit: 10 } }).catch(() => ({ data: { blogs: [] } })),
      api.get('/categories').catch(() => ({ data: [] })),
    ]).then(([bRes, cRes]) => {
      setBlogs((bRes.data as any).blogs || []);
      setCategories(((cRes.data as any[]) || []).slice(0, 12));
    }).finally(() => setLoading(false));
  }, []);

  const handleFollowingTab = () => {
    setTab('following');
    if (followLoaded || !user) return;
    setFollowLoading(true);
    api.get('/blogs/following', { params: { limit: 10 } })
      .then(r => setFollowingBlogs((r.data as any).blogs || []))
      .catch(() => {})
      .finally(() => { setFollowLoading(false); setFollowLoaded(true); });
  };

  const feed        = tab === 'forYou' ? blogs : followingBlogs;
  const feedLoading = tab === 'forYou' ? loading : followLoading;

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">

      {/* Category bubbles */}
      {categories.length > 0 && (
        <div className="relative mb-6">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer">
                <div
                  className="w-14 h-14 rounded-full p-[2px] transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #0F4C25)' }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-xl"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    {cat.icon}
                  </div>
                </div>
                <span className="text-[11px] font-medium truncate w-14 text-center transition-colors duration-200 group-hover:text-eco-400"
                  style={{ color: 'var(--text-muted)' }}>
                  {cat.name.split(' ')[0]}
                </span>
              </Link>
            ))}
          </div>
          <div
            className="absolute top-0 right-0 h-[calc(100%-12px)] w-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }}
          />
        </div>
      )}

      {/* Feed tabs */}
      {user && (
        <div
          className="flex gap-1 mb-4 p-1 rounded-xl"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {[
            { key: 'forYou',    label: 'For You',   icon: Sparkles, onClick: () => setTab('forYou') },
            { key: 'following', label: 'Following', icon: Users,    onClick: handleFollowingTab },
          ].map(({ key, label, icon: Icon, onClick }) => (
            <button
              key={key}
              onClick={onClick}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={tab === key
                ? { background: 'var(--bg-card)', color: '#DFF0E3', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }
                : { color: 'var(--text-faint)' }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="mb-5" style={{ borderTop: '1px solid var(--border)' }} />

      {/* Feed */}
      {feedLoading ? (
        <>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</>
      ) : tab === 'following' && feed.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🌿</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#E8F5EC' }}>Following feed is empty</h3>
          <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            Follow eco-writers to see their stories here.{' '}
            <Link href="/blogs" className="text-eco-400 hover:underline">Explore stories →</Link>
          </p>
        </div>
      ) : feed.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#E8F5EC' }}>No stories yet</h3>
          <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            Be the first to share an eco story with the community.
          </p>
          {user
            ? <Link href="/blogs/new" className="btn-primary">Write a Story</Link>
            : <Link href="/register" className="btn-primary">Join & Write</Link>}
        </div>
      ) : (
        <>
          {feed.map((blog, i) => <PostCard key={blog.id} blog={blog} index={i} />)}
          <div className="text-center pt-2 pb-8">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200"
              style={{
                color:  '#4ADE80',
                border: '1px solid rgba(74,222,128,0.2)',
              }}
            >
              Explore all stories
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
