'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal,
  Users, Sparkles, Leaf, ArrowRight, PenLine, Globe, Trophy,
} from 'lucide-react';
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

// ── Avatar ────────────────────────────────────────────────────────────────────
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

// ── Guest Landing ──────────────────────────────────────────────────────────────
function GuestLanding() {
  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="text-center px-4 pt-8 pb-10 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
        />

        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold relative z-10"
          style={{ background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}
        >
          <Leaf className="w-3 h-3" />
          The platform for eco writers
        </div>

        <h1
          className="font-serif text-4xl sm:text-5xl font-bold mb-4 leading-tight relative z-10"
          style={{ color: '#E8F5EC' }}
        >
          Stories for a<br />
          <span style={{ color: 'var(--eco-bright)' }}>Greener World</span>
        </h1>

        <p
          className="text-base mb-8 max-w-sm mx-auto leading-relaxed relative z-10"
          style={{ color: 'var(--text-muted)' }}
        >
          A community of eco-writers sharing tips on sustainable living, climate action, and mindful choices.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap relative z-10">
          <Link href="/register" className="btn-primary group">
            Get started — it's free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/blogs" className="btn-secondary">Browse Stories</Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8 px-1">
        {[
          { icon: PenLine, label: 'Stories',   value: '500+' },
          { icon: Users,   label: 'Writers',   value: '200+' },
          { icon: Globe,   label: 'Topics',    value: '20+' },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Icon className="w-4 h-4" style={{ color: 'var(--eco-bright)' }} strokeWidth={1.8} />
            <span className="text-xl font-bold font-serif" style={{ color: '#E8F5EC' }}>{value}</span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-8 px-1">
        {['🌿 Eco Tips', '♻️ Zero Waste', '🌱 Plant-Based', '🌡️ Climate', '✊ Activism', '🏆 Challenges'].map(tag => (
          <span
            key={tag}
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Divider with label */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>Latest Stories</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
    </div>
  );
}

// ── Post Card ──────────────────────────────────────────────────────────────────
function PostCard({ blog, index }: { blog: Blog; index: number }) {
  const { user } = useAuthStore();
  const router   = useRouter();
  const [liked,  setLiked]  = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [likes,  setLikes]  = useState(blog._count.likes);
  const [liking, setLiking] = useState(false);

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
    const url = `${window.location.origin}/blogs/${blog.slug}`;
    if (navigator.share) navigator.share({ title: blog.title, url }).catch(() => {});
    else navigator.clipboard.writeText(url).catch(() => {});
  };

  return (
    <article
      className="rounded-2xl overflow-hidden mb-4 animate-slide-up"
      style={{
        background:     'var(--bg-card)',
        border:         '1px solid var(--border)',
        animationDelay: `${index * 0.055}s`,
        transition:     'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(74,222,128,0.15)';
        el.style.transform   = 'translateY(-1px)';
        el.style.boxShadow   = '0 8px 32px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border)';
        el.style.transform   = '';
        el.style.boxShadow   = '';
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
            <p className="text-sm font-semibold leading-tight transition-colors group-hover:text-eco-400" style={{ color: '#DFF0E3' }}>
              {blog.author.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {blog.category && (
                <Link href={`/categories/${blog.category.slug}`} className="hover:text-eco-400 transition-colors">
                  {blog.category.name}
                </Link>
              )}
              {blog.category ? ' · ' : ''}
              {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        <button className="p-1 rounded-full transition-colors" style={{ color: 'var(--text-faint)' }}>
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
            className="text-base font-semibold leading-snug line-clamp-2 mb-1 transition-colors hover:text-eco-400"
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all group"
            style={{ color: liked ? '#F87171' : 'var(--text-faint)' }}
          >
            <Heart
              style={{ width: 18, height: 18, fill: liked ? '#F87171' : 'none' }}
              strokeWidth={liked ? 0 : 1.7}
              className="transition-all group-hover:text-red-400"
            />
            <span className="text-xs font-medium group-hover:text-red-400">{likes > 0 ? likes : ''}</span>
          </button>

          <Link
            href={`/blogs/${blog.slug}#comments`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all group"
            style={{ color: 'var(--text-faint)' }}
          >
            <MessageCircle style={{ width: 18, height: 18 }} strokeWidth={1.7} className="group-hover:text-eco-400 transition-colors" />
            <span className="text-xs font-medium group-hover:text-eco-400">
              {blog._count.comments > 0 ? blog._count.comments : ''}
            </span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center px-2.5 py-1.5 rounded-full transition-all group"
            style={{ color: 'var(--text-faint)' }}
          >
            <Share2 style={{ width: 18, height: 18 }} strokeWidth={1.7} className="group-hover:text-eco-400 transition-colors" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{blog.readTime} min</span>
          <button
            onClick={async () => {
              if (!user) { router.push('/login'); return; }
              const next = !saved;
              setSaved(next);
              try { await api.post(`/blogs/${blog.id}/bookmark`); }
              catch { setSaved(!next); }
            }}
            className="flex items-center px-2.5 py-1.5 rounded-full transition-all group"
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

// ── Main ──────────────────────────────────────────────────────────────────────
type FeedTab = 'forYou' | 'following';

const PAGE_SIZE = 10;

export default function HomeContent() {
  const { user } = useAuthStore();
  const [tab,            setTab]           = useState<FeedTab>('forYou');
  const [blogs,          setBlogs]         = useState<Blog[]>([]);
  const [categories,     setCategories]    = useState<Category[]>([]);
  const [loading,        setLoading]       = useState(true);
  const [loadingMore,    setLoadingMore]   = useState(false);
  const [hasMore,        setHasMore]       = useState(true);
  const [page,           setPage]          = useState(1);

  // Following tab state
  const [followBlogs,    setFollowBlogs]   = useState<Blog[]>([]);
  const [followLoading,  setFollowLoading] = useState(false);
  const [followLoaded,   setFollowLoaded]  = useState(false);
  const [followPage,     setFollowPage]    = useState(1);
  const [followHasMore,  setFollowHasMore] = useState(true);
  const [followLoadMore, setFollowLoadMore]= useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    Promise.all([
      api.get('/blogs', { params: { limit: PAGE_SIZE, page: 1 } }).catch(() => ({ data: { blogs: [] } })),
      api.get('/categories').catch(() => ({ data: [] })),
    ]).then(([bRes, cRes]) => {
      const newBlogs = (bRes.data as any).blogs || [];
      setBlogs(newBlogs);
      setHasMore(newBlogs.length === PAGE_SIZE);
      setCategories(((cRes.data as any[]) || []).slice(0, 12));
    }).finally(() => setLoading(false));
  }, []);

  // Load more (for-you tab)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || tab !== 'forYou') return;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const { data } = await api.get('/blogs', { params: { limit: PAGE_SIZE, page: next } });
      const newBlogs = (data as any).blogs || [];
      setBlogs(prev => [...prev, ...newBlogs]);
      setPage(next);
      setHasMore(newBlogs.length === PAGE_SIZE);
    } catch {} finally { setLoadingMore(false); }
  }, [loadingMore, hasMore, tab, page]);

  // Load more (following tab)
  const loadMoreFollowing = useCallback(async () => {
    if (followLoadMore || !followHasMore || tab !== 'following') return;
    setFollowLoadMore(true);
    const next = followPage + 1;
    try {
      const { data } = await api.get('/blogs/following', { params: { limit: PAGE_SIZE, page: next } });
      const newBlogs = (data as any).blogs || [];
      setFollowBlogs(prev => [...prev, ...newBlogs]);
      setFollowPage(next);
      setFollowHasMore(newBlogs.length === PAGE_SIZE);
    } catch {} finally { setFollowLoadMore(false); }
  }, [followLoadMore, followHasMore, tab, followPage]);

  // IntersectionObserver sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return;
        if (tab === 'forYou') loadMore();
        else loadMoreFollowing();
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, loadMoreFollowing, tab]);

  // Following tab initial load
  const handleFollowingTab = () => {
    setTab('following');
    if (followLoaded || !user) return;
    setFollowLoading(true);
    api.get('/blogs/following', { params: { limit: PAGE_SIZE, page: 1 } })
      .then(r => {
        const newBlogs = (r.data as any).blogs || [];
        setFollowBlogs(newBlogs);
        setFollowHasMore(newBlogs.length === PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => { setFollowLoading(false); setFollowLoaded(true); });
  };

  const feed        = tab === 'forYou' ? blogs : followBlogs;
  const feedLoading = tab === 'forYou' ? loading : followLoading;
  const isLoadingMore = tab === 'forYou' ? loadingMore : followLoadMore;
  const feedHasMore   = tab === 'forYou' ? hasMore : followHasMore;

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">

      {/* Guest landing (shows above the feed for non-logged-in users) */}
      {!user && !loading && <GuestLanding />}

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
                <span
                  className="text-[11px] font-medium truncate w-14 text-center transition-colors group-hover:text-eco-400"
                  style={{ color: 'var(--text-muted)' }}
                >
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

      {/* Feed tabs (auth only) */}
      {user && (
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          {([
            { key: 'forYou',    label: 'For You',   icon: Sparkles, onClick: () => setTab('forYou') },
            { key: 'following', label: 'Following', icon: Users,    onClick: handleFollowingTab },
          ] as const).map(({ key, label, icon: Icon, onClick }) => (
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
      ) : feed.length === 0 && user ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌱</div>
          <h3 className="text-base font-semibold mb-1.5" style={{ color: '#E8F5EC' }}>No stories yet</h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Be the first to share an eco story.
          </p>
          <Link href="/blogs/new" className="btn-primary">Write a Story</Link>
        </div>
      ) : (
        <>
          {feed.map((blog, i) => <PostCard key={blog.id} blog={blog} index={i} />)}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more spinner */}
          {isLoadingMore && (
            <div className="flex justify-center py-6">
              <div
                className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--border-eco)', borderTopColor: 'var(--eco-bright)' }}
              />
            </div>
          )}

          {/* End of feed */}
          {!feedHasMore && feed.length > 0 && (
            <div className="text-center pt-2 pb-8">
              <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>You're all caught up 🌿</p>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full transition-all"
                style={{ color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                Explore all stories
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
