'use client';

import { useEffect, useState, useCallback } from 'react';
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

export default function SearchPage() {
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search people or stories..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:bg-white transition"
          />
        </div>
      </form>

      {/* Tabs */}
      {query.trim() && (
        <div className="flex gap-1 mb-6 border-b border-gray-100">
          {(['all', 'people', 'stories'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px
                ${tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t}
              {t === 'people' && users.length > 0 && <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{users.length}</span>}
              {t === 'stories' && blogs.length > 0 && <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{blogs.length}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-2.5 bg-gray-200 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && query.trim() && !hasResults && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-600 font-medium">No results for "{query}"</p>
          <p className="text-sm text-gray-400 mt-1">Try a different name or keyword</p>
        </div>
      )}

      {/* No query */}
      {!query.trim() && (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">Search for people or stories</p>
        </div>
      )}

      {/* People results */}
      {!loading && showUsers && users.length > 0 && (
        <div className="mb-6">
          {tab === 'all' && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">People</p>}
          <div className="space-y-1">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                <Link href={u.username ? `/profile/${u.username}` : '#'} className="shrink-0">
                  {u.avatar
                    ? <img src={u.avatar} alt={u.name} className="w-11 h-11 rounded-full object-cover" />
                    : <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white font-bold text-base">
                        {u.name[0].toUpperCase()}
                      </div>
                  }
                </Link>
                <Link href={u.username ? `/profile/${u.username}` : '#'} className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                  {u.username && <p className="text-xs text-gray-400">@{u.username}</p>}
                  {u.bio && <p className="text-xs text-gray-500 truncate mt-0.5">{u.bio}</p>}
                </Link>
                {user && user.id !== u.id && (
                  <button onClick={() => startDM(u.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-forest-600 border border-forest-200 px-3 py-1.5 rounded-full hover:bg-forest-50 transition shrink-0">
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
          {tab === 'all' && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Stories</p>}
          <div className="space-y-3">
            {blogs.map(blog => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`}
                className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                {blog.image && (
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-forest-700 transition">
                    {blog.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {blog.author.name} · {blog.readTime} min · {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
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
