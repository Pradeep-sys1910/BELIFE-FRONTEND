'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  author: { name: string; avatar?: string };
  category: { name: string; slug: string };
  _count: { likes: number; comments: number };
}

export default function BlogsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
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
    <div className="min-h-screen bg-cream-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-cream-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-forest-700">BeLife</Link>
          <div className="flex items-center gap-4">
            <Link href="/categories" className="text-forest-600 hover:text-forest-800 text-sm">Categories</Link>
            {user ? (
              <>
                <Link href="/blogs/new" className="btn-primary text-sm">Write</Link>
                <Link href="/dashboard" className="text-forest-600 hover:text-forest-800 text-sm">Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-forest-600 hover:text-forest-800 text-sm">Sign In</Link>
                <Link href="/register" className="btn-primary text-sm">Join Us</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-forest-700 mb-3">All Stories</h1>
          <p className="text-forest-500">Discover mindful living through every story</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 max-w-lg mx-auto mb-12">
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>

        {/* Blogs Grid */}
        {loading ? (
          <div className="text-center py-20 text-forest-500">Loading stories...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-forest-500 text-lg mb-4">No blogs yet.</p>
            {user && <Link href="/blogs/new" className="btn-primary">Write the first one</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`} className="card-blog group">
                <div className="h-52 overflow-hidden bg-forest-100">
                  {blog.image && (
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs text-forest-500 bg-cream-100 px-3 py-1 rounded-full">{blog.category?.name}</span>
                  <h2 className="font-serif text-xl text-forest-700 mt-3 mb-2 group-hover:text-forest-500 transition">{blog.title}</h2>
                  <p className="text-forest-500 text-sm line-clamp-2 mb-4">{blog.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-forest-400">
                    <span>{blog.author?.name} · {blog.readTime} min read</span>
                    <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition ${page === p ? 'bg-forest-700 text-cream-50' : 'bg-white text-forest-700 border border-cream-200 hover:border-forest-500'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
