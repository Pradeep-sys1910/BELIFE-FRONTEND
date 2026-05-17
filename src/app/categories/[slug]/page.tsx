'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';

interface Category {
  id: string; name: string; slug: string; description?: string; icon?: string;
  blogs: { id: string; title: string; slug: string; excerpt: string; image: string; readTime: number; createdAt: string; author: { name: string }; }[];
}

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/categories/${slug}`)
      .then(({ data }) => setCategory(data))
      .catch(() => setCategory(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-cream-50 flex items-center justify-center text-forest-500">Loading...</div>;
  if (!category) return <div className="min-h-screen bg-cream-50 flex items-center justify-center"><div className="text-center"><p className="text-xl font-serif text-forest-700 mb-4">Category not found</p><Link href="/categories" className="btn-primary">All Categories</Link></div></div>;

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="bg-white border-b border-cream-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-forest-700">BeLife</Link>
          <div className="flex gap-4 items-center">
            <Link href="/categories" className="text-forest-600 hover:text-forest-800 text-sm">Categories</Link>
            {user ? <Link href="/dashboard" className="btn-primary text-sm">Dashboard</Link> : <Link href="/login" className="btn-primary text-sm">Sign In</Link>}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">{category.icon || '🌿'}</div>
          <h1 className="font-serif text-4xl text-forest-700 mb-2">{category.name}</h1>
          {category.description && <p className="text-forest-500">{category.description}</p>}
        </div>

        {category.blogs.length === 0 ? (
          <div className="text-center py-16 text-forest-500">No stories in this category yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {category.blogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`} className="card-blog group">
                <div className="h-48 overflow-hidden bg-forest-100">
                  {blog.image && <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="p-6">
                  <h2 className="font-serif text-xl text-forest-700 mb-2 group-hover:text-forest-500 transition">{blog.title}</h2>
                  <p className="text-forest-500 text-sm line-clamp-2 mb-4">{blog.excerpt}</p>
                  <div className="flex justify-between text-xs text-forest-400">
                    <span>{blog.author?.name} · {blog.readTime} min</span>
                    <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
