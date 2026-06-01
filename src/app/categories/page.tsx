'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  _count: { blogs: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-24">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Categories</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Explore topics that match your sustainable journey</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl p-8 animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="skeleton w-10 h-10 rounded-full mb-4" />
              <div className="skeleton h-5 w-3/4 rounded mb-2" />
              <div className="skeleton h-3 w-full rounded mb-1" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No categories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}
              className="card-blog group rounded-2xl p-8 block transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-4xl mb-4">{cat.icon || '🌿'}</div>
              <h2 className="font-serif text-xl font-semibold mb-2 transition-colors"
                style={{ color: 'var(--text)' }}>
                {cat.name}
              </h2>
              {cat.description && (
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {cat.description}
                </p>
              )}
              <span className="text-xs" style={{ color: 'var(--eco-bright)' }}>
                {cat._count.blogs} {cat._count.blogs === 1 ? 'story' : 'stories'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
