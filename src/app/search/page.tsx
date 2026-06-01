'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface UserResult {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
}

interface BlogResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  readTime: number;
  createdAt: string;
  author: { name: string; username?: string; avatar?: string };
  _count: { likes: number; comments: number };
}

type Tab = 'all' | 'people' | 'stories';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState<Tab>('all');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [blogs, setBlogs] = useState<BlogResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setUsers([]); setBlogs([]); return; }
    setLoading(true);
    try {
      const [uRes, bRes] = await Promise.all([
        api.get('/users/search', { params: { q } }).catch(() => ({ data: [] })),
        api.get('/blogs', { params: { search: q, limit: 10 } }).catch(() => ({ data: { blogs: [] } })),
      ]);
      setUsers(uRes.data);
      setBlogs(bRes.data.blogs || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    runSearch(q);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const startDM = (userId: string) => {
    if (!user) { router.push('/login'); return; }
    router.push(`/messages?with=${userId}`);
  };

  const showUsers = tab === 'all' || tab === 'people';
  const showBlogs = tab === 'all' || tab === 'stories';
  const hasResults = users.length > 0 || blogs.length > 0;

  return (
    <div className="max-w-[630px] mx-auto px-4 pt-6 pb-24">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-faint)' }} />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search people or stories..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm outline-none transition-all duration-200"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
      </form>

      {/* Tabs */}
      {query.trim() && (
        <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
          {(['all', 'people', 'stories'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px"
              style={{
                borderBottomColor: tab === t ? 'var(--eco-bright)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-faint)',
              }}>
              {t}
              {t === 'people'  && users.length > 0 && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{users.length}</span>}
              {t === 'stories' && blogs.length > 0  && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{blogs.length}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="skeleton w-11 h-11 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-3.5 rounded w-32 mb-2" />
                <div className="skeleton h-2.5 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && query.trim() && !hasResults && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>No results for "{query}"</p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Try a different name or keyword</p>
        </div>
      )}

      {/* No query */}
      {!query.trim() && (
        <div className="text-center py-20">
          <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Search for people or stories</p>
        </div>
      )}

      {/* People results */}
      {!loading && showUsers && users.length > 0 && (
        <div className="mb-6">
          {tab === 'all' && <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>People</p>}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {users.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 transition"
                style={{
                  background: 'var(--bg-card)',
                  borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                <Link href={u.username ? `/profile/${u.username}` : '#'} className="shrink-0">
                  {u.avatar
                    ? <img src={u.avatar} alt={u.name} className="w-11 h-11 rounded-full object-cover" />
                    : <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
                        style={{ background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}>
                        {u.name[0].toUpperCase()}
                      </div>
                  }
                </Link>
                <Link href={u.username ? `/profile/${u.username}` : '#'} className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{u.name}</p>
                  {u.username && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>@{u.username}</p>}
                  {u.bio && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{u.bio}</p>}
                </Link>
                {user && user.id !== u.id && (
                  <button onClick={() => startDM(u.id)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition shrink-0"
                    style={{ color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}>
                    <MessageCircle className="w-3.5 h-3.5" />
                    Message
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stories results */}
      {!loading && showBlogs && blogs.length > 0 && (
        <div>
          {tab === 'all' && <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>Stories</p>}
          <div className="space-y-3">
            {blogs.map(blog => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`}
                className="flex gap-3 p-4 rounded-2xl transition group"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {blog.image && (
                  <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-elevated)' }}>
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: 'var(--text)' }}>
                    {blog.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                    {blog.author.name} · {blog.readTime} min · {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-faint)' }}>
                    <span>❤️ {blog._count.likes}</span>
                    <span>💬 {blog._count.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
