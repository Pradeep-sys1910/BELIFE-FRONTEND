'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  readTime: number;
  createdAt: string;
  author: { name: string; username?: string; avatar?: string };
  category: { name: string; slug: string } | null;
  _count: { likes: number; comments: number };
}

function BlogCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="flex justify-between pt-1">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function BlogsPage() {
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBlogs = async (p = 1, q = '') => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 9 };
      if (q) params.search = q;
      const { data } = await api.get('/blogs', { params });
      setBlogs(data.blogs);
      setTotalPages(data.pages);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(page, search); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs(1, search);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-24">

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-serif text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>All Stories</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Discover mindful living through every story</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8 animate-fade-in stagger-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          {search && (
            <button type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
              style={{ color: 'var(--eco-bright)' }}>
              Search
            </button>
          )}
        </div>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <BlogCardSkeleton key={i} />)}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <div className="text-5xl mb-4">🌱</div>
          <p className="font-medium mb-1" style={{ color: 'var(--text-muted)' }}>No stories found</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-faint)' }}>
            {search ? `Nothing matched "${search}"` : 'Be the first to share a story'}
          </p>
          {user && <Link href="/blogs/new" className="btn-primary">Write the first one</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogs.map((blog, i) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.slug}`}
              className={`card-blog group animate-slide-up stagger-${Math.min(i + 1, 6)} overflow-hidden rounded-2xl block`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="h-44 overflow-hidden" style={{ background: 'var(--eco-dim)' }}>
                {blog.image
                  ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                }
              </div>
              <div className="p-5">
                {blog.category && (
                  <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-3"
                    style={{ color: 'var(--eco-bright)', background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
                    {blog.category.name}
                  </span>
                )}
                <h2 className="font-serif text-base font-semibold leading-snug mb-1.5 line-clamp-2 transition-colors"
                  style={{ color: 'var(--text)' }}>
                  {blog.title}
                </h2>
                <p className="text-xs line-clamp-2 mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs pt-3"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text-faint)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{blog.author?.name}</span>
                  <span>{blog.readTime} min · {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center gap-2 mt-10 animate-fade-in">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
              style={page === p
                ? { background: 'var(--eco)', color: '#050C07' }
                : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
