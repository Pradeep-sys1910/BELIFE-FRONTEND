'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal,
  Leaf, ArrowRight, PenLine,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Blog {
  id: string; title: string; slug: string; excerpt: string; image: string;
  readTime: number; createdAt: string; intent?: string;
  isLiked?: boolean; isBookmarked?: boolean;
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
  const [stats, setStats] = useState<{ stories: number; members: number; topics: number } | null>(null);

  useEffect(() => {
    api.get('/stats')
      .then(r => setStats(r.data as any))
      .catch(() => {});
  }, []);

  const fmt = (n?: number) => (n == null ? '—' : n.toLocaleString());

  return (
    <div>
      <section className="home-guest-hero">
        <div className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--eco-bright)' }}>
          <Leaf className="h-4 w-4" />
          The BeLife community
        </div>
        <h1>Stories for a greener world</h1>
        <p>A community sharing practical ideas for sustainable living, climate action, and mindful choices.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/register" className="btn-primary">
            Join BeLife
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/blogs" className="btn-secondary">Browse stories</Link>
        </div>
        {stats && (
          <p className="home-social-proof">
            {fmt(stats.stories)} stories <span aria-hidden="true">·</span> {fmt(stats.members)} members <span aria-hidden="true">·</span> {fmt(stats.topics)} topics
          </p>
        )}
      </section>
    </div>
  );
}

// ── Post Card ──────────────────────────────────────────────────────────────────
function PostCard({ blog }: { blog: Blog }) {
  const { user } = useAuthStore();
  const router   = useRouter();
  const [liked,  setLiked]  = useState(Boolean(blog.isLiked));
  const [saved,  setSaved]  = useState(Boolean(blog.isBookmarked));
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
    <article className="home-story-card">
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
        <button onClick={handleShare} aria-label="Share post"
          className="p-1 rounded-full transition-colors hover:text-eco-400" style={{ color: 'var(--text-faint)' }}>
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Cover image */}
      {blog.image && (
        <Link href={`/blogs/${blog.slug}`}>
          <div className="w-full aspect-[16/9] overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <img
              src={blog.image} alt={blog.title}
              className="home-story-image object-cover"
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
            style={{ color: 'var(--text)' }}
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
  // Fresh seed per mount → feed order varies each visit instead of identical newest-first.
  const seedRef = useRef(Math.random().toString(36).slice(2));
  const feedSnapshotRef = useRef<string | null>(null);
  const forYouModeRef = useRef(false);

  // Load the authenticated recommendation feed or the public discovery feed.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setBlogs([]);
    setPage(1);
    setHasMore(true);
    setFollowBlogs([]);
    setFollowPage(1);
    setFollowHasMore(true);
    setFollowLoaded(false);
    feedSnapshotRef.current = null;
    forYouModeRef.current = Boolean(user);

    const params = { limit: PAGE_SIZE, page: 1 };
    const request = user
      ? api.privateGet('/blogs/for-you', { params }).catch(() => {
          if (active) forYouModeRef.current = false;
          return api.get('/blogs', { params: { ...params, seed: seedRef.current } });
        })
      : api.get('/blogs', { params: { ...params, seed: seedRef.current } });

    request
      .then(r => {
        if (!active) return;
        const response = r.data as any;
        const newBlogs = response.blogs || [];
        feedSnapshotRef.current = response.snapshot || null;
        setBlogs(newBlogs);
        setHasMore(newBlogs.length === PAGE_SIZE);
      })
      .catch(() => {
        if (active) {
          setBlogs([]);
          setHasMore(false);
        }
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    api.get('/categories')
      .then(r => setCategories(((r.data as any[]) || []).slice(0, 12)))
      .catch(() => {});
  }, []);

  // Load more (for-you tab)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || tab !== 'forYou') return;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const useRecommendations = Boolean(user) && forYouModeRef.current;
      const params = useRecommendations
        ? { limit: PAGE_SIZE, page: next, ...(feedSnapshotRef.current ? { snapshot: feedSnapshotRef.current } : {}) }
        : { limit: PAGE_SIZE, page: next, seed: seedRef.current };
      const { data } = useRecommendations
        ? await api.privateGet('/blogs/for-you', { params })
        : await api.get('/blogs', { params });
      const newBlogs = (data as any).blogs || [];
      setBlogs(prev => {
        const existingIds = new Set(prev.map(blog => blog.id));
        return [...prev, ...newBlogs.filter((blog: Blog) => !existingIds.has(blog.id))];
      });
      setPage(next);
      setHasMore(newBlogs.length === PAGE_SIZE);
    } catch { setHasMore(false); } finally { setLoadingMore(false); }
  }, [loadingMore, hasMore, tab, page, user?.id]);

  // Load more (following tab)
  const loadMoreFollowing = useCallback(async () => {
    if (followLoadMore || !followHasMore || tab !== 'following') return;
    setFollowLoadMore(true);
    const next = followPage + 1;
    try {
      const { data } = await api.privateGet('/blogs/following', { params: { limit: PAGE_SIZE, page: next } });
      const newBlogs = (data as any).blogs || [];
      setFollowBlogs(prev => [...prev, ...newBlogs]);
      setFollowPage(next);
      setFollowHasMore(newBlogs.length === PAGE_SIZE);
    } catch { setFollowHasMore(false); } finally { setFollowLoadMore(false); }
  }, [followLoadMore, followHasMore, tab, followPage, user?.id]);

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
    api.privateGet('/blogs/following', { params: { limit: PAGE_SIZE, page: 1 } })
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
    <div className="home-page max-w-[640px] mx-auto px-4 pt-6 pb-16">

      {/* Guest landing (shows above the feed for non-logged-in users) */}
      {!user && !loading && <GuestLanding />}

      {user && (
        <>
          <header className="home-welcome">
            <div>
              <p className="home-welcome-label">YOUR COMMUNITY</p>
              <h1 className="home-welcome-title">Welcome back, {user.name.split(' ')[0]}</h1>
            </div>
          </header>

          <section className="home-hero" aria-labelledby="home-hero-title">
            <p className="home-welcome-label">A place for ideas that matter</p>
            <h2 id="home-hero-title">Small choices. Real change.</h2>
            <p>Share what you are learning, find people who care, and turn everyday ideas into action.</p>
            <Link href="/categories" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--eco-bright)' }}>
              Explore topics <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <Link href="/blogs/new" className="home-compose">
            <Avatar name={user.name} avatar={user.avatar} />
            <span className="home-compose-label">What would you like to share today?</span>
            <span className="home-compose-action inline-flex items-center gap-2"><PenLine className="h-4 w-4" /><span className="hidden sm:inline">Write</span></span>
          </Link>

          <div className="home-section-head">
            <h2>From your community</h2>
            <Link href="/blogs">Browse stories <ArrowRight className="inline h-3.5 w-3.5" /></Link>
          </div>
        </>
      )}

      {!user && !loading && categories.length > 0 && (
        <nav className="home-topic-list" aria-label="Browse story topics">
          {categories.slice(0, 6).map(category => (
            <Link key={category.slug} href={`/categories/${category.slug}`}>
              {category.icon} {category.name}
            </Link>
          ))}
        </nav>
      )}

      {!user && !loading && (
        <div className="home-section-head">
          <h2>Latest stories</h2>
          <Link href="/blogs">Explore all <ArrowRight className="inline h-3.5 w-3.5" /></Link>
        </div>
      )}

      {/* Feed tabs (auth only) */}
      {user && (
        <div className="home-feed-tabs" role="group" aria-label="Choose your feed">
          {([
            { key: 'forYou', label: 'For You', onClick: () => setTab('forYou') },
            { key: 'following', label: 'Following', onClick: handleFollowingTab },
          ] as const).map(({ key, label, onClick }) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              aria-pressed={tab === key}
              className="home-feed-tab"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Feed */}
      {feedLoading ? (
        <>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</>
      ) : tab === 'following' && feed.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🌿</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Following feed is empty</h3>
          <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            Follow eco-writers to see their stories here.{' '}
            <Link href="/blogs" className="text-eco-400 hover:underline">Explore stories →</Link>
          </p>
        </div>
      ) : feed.length === 0 && user ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌱</div>
          <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text)' }}>No stories yet</h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Be the first to share an eco story.
          </p>
          <Link href="/blogs/new" className="btn-primary">Write a Story</Link>
        </div>
      ) : (
        <>
          {feed.map(blog => <PostCard key={blog.id} blog={blog} />)}

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
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>You're all caught up</p>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full"
                style={{ color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}
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
