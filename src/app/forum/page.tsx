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
  { value: 'ALL',              label: 'All',               emoji: '🌍' },
  { value: 'GENERAL',         label: 'General',            emoji: '💬' },
  { value: 'QUESTIONS',       label: 'Questions',          emoji: '❓' },
  { value: 'ZERO_WASTE',      label: 'Zero Waste',         emoji: '♻️' },
  { value: 'CLIMATE',         label: 'Climate',            emoji: '🌡️' },
  { value: 'PLANT_BASED',     label: 'Plant-Based',        emoji: '🌱' },
  { value: 'ACTIVISM',        label: 'Activism',           emoji: '✊' },
  { value: 'SUSTAINABLE_LIVING', label: 'Sustainable Living', emoji: '🏡' },
];

const CAT_COLORS: Record<string, string> = {
  GENERAL:           'bg-gray-100 text-gray-600',
  QUESTIONS:         'bg-blue-50 text-blue-600',
  ZERO_WASTE:        'bg-emerald-50 text-emerald-700',
  CLIMATE:           'bg-orange-50 text-orange-700',
  PLANT_BASED:       'bg-green-50 text-green-700',
  ACTIVISM:          'bg-purple-50 text-purple-700',
  SUSTAINABLE_LIVING:'bg-forest-50 text-forest-700',
};

function ThreadSkeleton() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Community Forum</h1>
          <p className="text-sm text-gray-400 mt-1">{total} discussions · eco writers &amp; activists</p>
        </div>
        {user ? (
          <Link href="/forum/new"
            className="flex items-center gap-2 bg-forest-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-900 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
            <PenSquare className="w-4 h-4" />
            New Thread
          </Link>
        ) : (
          <Link href="/login"
            className="flex items-center gap-2 border border-forest-200 text-forest-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-50 transition-all">
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
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 focus:bg-white transition-all mb-4"
      />

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${category === c.value
                ? 'bg-forest-800 text-white border-forest-800'
                : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300 hover:text-forest-700'}`}>
            <span>{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-100 pb-4">
        {([['latest', 'Latest', Clock], ['popular', 'Popular', TrendingUp]] as const).map(([val, label, Icon]) => (
          <button key={val} onClick={() => setSort(val)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${sort === val ? 'bg-forest-50 text-forest-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Thread list */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-card">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <ThreadSkeleton key={i} />)
        ) : threads.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🌿</p>
            <p className="text-sm font-medium text-gray-600 mb-1">No discussions yet</p>
            <p className="text-xs text-gray-400 mb-5">Be the first to start a conversation</p>
            {user && (
              <Link href="/forum/new" className="text-sm text-forest-700 font-semibold hover:underline">
                Start a thread →
              </Link>
            )}
          </div>
        ) : (
          threads.map((thread, i) => {
            const cat = catLabel(thread.category);
            return (
              <Link key={thread.id} href={`/forum/${thread.id}`}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group
                  ${i !== threads.length - 1 ? 'border-b border-gray-100' : ''}`}>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {thread.author.name[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {thread.pinned && (
                      <span className="text-[10px] font-bold text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full">📌 Pinned</span>
                    )}
                    {cat && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[thread.category] || 'bg-gray-100 text-gray-600'}`}>
                        {cat.emoji} {cat.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug mb-1.5 group-hover:text-forest-700 transition-colors line-clamp-2">
                    {thread.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{thread.author.name}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                    <span>·</span>
                    <span>💬 {thread._count.replies}</span>
                    <span>·</span>
                    <span>👍 {thread._count.votes}</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-1" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
