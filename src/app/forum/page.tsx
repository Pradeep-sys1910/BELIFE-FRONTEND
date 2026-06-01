'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenSquare, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

type Category = 'ALL' | 'GENERAL' | 'ZERO_WASTE' | 'CLIMATE' | 'PLANT_BASED' | 'ACTIVISM' | 'SUSTAINABLE_LIVING' | 'QUESTIONS';
type Sort = 'latest' | 'popular';

interface Thread {
  id: string;
  title: string;
  category: string;
  pinned: boolean;
  views: number;
  createdAt: string;
  author: { id: string; name: string; username?: string; avatar?: string };
  _count: { replies: number; votes: number };
}

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'ALL',               label: 'All',               emoji: '🌍' },
  { value: 'GENERAL',           label: 'General',           emoji: '💬' },
  { value: 'QUESTIONS',         label: 'Questions',         emoji: '❓' },
  { value: 'ZERO_WASTE',        label: 'Zero Waste',        emoji: '♻️' },
  { value: 'CLIMATE',           label: 'Climate',           emoji: '🌡️' },
  { value: 'PLANT_BASED',       label: 'Plant-Based',       emoji: '🌱' },
  { value: 'ACTIVISM',          label: 'Activism',          emoji: '✊' },
  { value: 'SUSTAINABLE_LIVING',label: 'Sustainable Living',emoji: '🏡' },
];

function ThreadSkeleton() {
  return (
    <div className="flex items-start gap-4 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="skeleton w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1">
        <div className="skeleton h-4 w-3/4 rounded mb-2" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export default function ForumPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('ALL');
  const [sort, setSort] = useState<Sort>('latest');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/forum/threads', {
        params: { category: category === 'ALL' ? undefined : category, sort, search: search || undefined },
      });
      setThreads(data.threads);
      setTotal(data.total);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [category, sort, search]);

  useEffect(() => {
    const t = setTimeout(fetch, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetch, search]);

  const catLabel = (cat: string) => CATEGORIES.find(c => c.value === cat);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-24">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Community Forum</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>{total} discussions · eco writers &amp; activists</p>
        </div>
        {user ? (
          <Link href="/forum/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--eco)', color: '#050C07' }}>
            <PenSquare className="w-4 h-4" />
            New Thread
          </Link>
        ) : (
          <Link href="/login"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}>
            Sign in to post
          </Link>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search discussions…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all mb-4"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={category === c.value
              ? { background: 'var(--eco)', color: '#050C07', border: '1px solid transparent' }
              : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
            }>
            <span>{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {([['latest', 'Latest', Clock], ['popular', 'Popular', TrendingUp]] as const).map(([val, label, Icon]) => (
          <button key={val} onClick={() => setSort(val)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={sort === val
              ? { background: 'var(--eco-dim)', color: 'var(--eco-bright)' }
              : { color: 'var(--text-muted)' }
            }>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Thread list */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <ThreadSkeleton key={i} />)
        ) : threads.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🌿</p>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>No discussions yet</p>
            <p className="text-xs mb-5" style={{ color: 'var(--text-faint)' }}>Be the first to start a conversation</p>
            {user && (
              <Link href="/forum/new" className="text-sm font-semibold hover:underline" style={{ color: 'var(--eco-bright)' }}>
                Start a thread →
              </Link>
            )}
          </div>
        ) : (
          threads.map((thread, i) => {
            const cat = catLabel(thread.category);
            return (
              <Link key={thread.id} href={`/forum/${thread.id}`}
                className="flex items-start gap-4 px-5 py-4 transition-colors group block"
                style={{
                  borderBottom: i !== threads.length - 1 ? '1px solid var(--border)' : undefined,
                }}>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}>
                  {thread.author.name[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {thread.pinned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--eco-dim)', color: 'var(--eco-bright)' }}>
                        📌 Pinned
                      </span>
                    )}
                    {cat && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {cat.emoji} {cat.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold leading-snug mb-1.5 line-clamp-2 transition-colors"
                    style={{ color: 'var(--text)' }}>
                    {thread.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-faint)' }}>
                    <span>{thread.author.name}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                    <span>·</span>
                    <span>💬 {thread._count.replies}</span>
                    <span>·</span>
                    <span>👍 {thread._count.votes}</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 shrink-0 mt-1 transition-colors" style={{ color: 'var(--text-faint)' }} />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
