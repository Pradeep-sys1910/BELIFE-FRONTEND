'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Category {
  id: string; name: string; slug: string; description?: string; icon?: string;
  blogs: {
    id: string; title: string; slug: string; excerpt: string; image: string;
    readTime: number; createdAt: string; author: { name: string };
  }[];
}

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/categories/${slug}`)
      .then(({ data }) => setCategory(data))
      .catch(() => setCategory(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-24">
      <div className="skeleton h-4 w-24 rounded mb-8" />
      <div className="skeleton h-12 w-12 rounded-full mx-auto mb-4" />
      <div className="skeleton h-8 w-48 rounded mx-auto mb-3" />
      <div className="skeleton h-4 w-64 rounded mx-auto mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="skeleton h-48 w-full" style={{ borderRadius: 0 }} />
            <div className="p-6 space-y-2">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!category) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-xl font-serif mb-4" style={{ color: 'var(--text)' }}>Category not found</p>
        <Link href="/categories" className="btn-primary">All Categories</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-24">

      <Link href="/categories"
        className="inline-flex items-center gap-1.5 text-sm mb-8 transition"
        style={{ color: 'var(--text-faint)' }}>
        <ArrowLeft className="w-4 h-4" /> All Categories
      </Link>

      <div className="text-center mb-12">
        <div className="text-5xl mb-4">{category.icon || '🌿'}</div>
        <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: 'var(--text)' }}>{category.name}</h1>
        {category.description && (
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>{category.description}</p>
        )}
        <p className="text-sm mt-2" style={{ color: 'var(--eco-bright)' }}>
          {category.blogs.length} {category.blogs.length === 1 ? 'story' : 'stories'}
        </p>
      </div>

      {category.blogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>No stories in this category yet.</p>
          <Link href="/blogs/new" className="mt-4 inline-block text-sm font-semibold hover:underline"
            style={{ color: 'var(--eco-bright)' }}>Be the first to write one →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.blogs.map((blog) => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`}
              className="card-blog group rounded-2xl overflow-hidden block"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="h-48 overflow-hidden" style={{ background: 'var(--eco-dim)' }}>
                {blog.image
                  ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                }
              </div>
              <div className="p-6">
                <h2 className="font-serif text-lg font-semibold mb-2 line-clamp-2 transition-colors"
                  style={{ color: 'var(--text)' }}>
                  {blog.title}
                </h2>
                <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>{blog.excerpt}</p>
                <div className="flex justify-between text-xs" style={{ color: 'var(--text-faint)' }}>
                  <span>{blog.author?.name} · {blog.readTime} min</span>
                  <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
