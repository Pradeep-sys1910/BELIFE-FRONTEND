'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  _count: { blogs: number };
}

export default function CategoriesPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="bg-white border-b border-cream-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-forest-700">BeLife</Link>
          <div className="flex items-center gap-4">
            <Link href="/blogs" className="text-forest-600 hover:text-forest-800 text-sm">Blogs</Link>
            {user ? <Link href="/dashboard" className="btn-primary text-sm">Dashboard</Link> : <Link href="/login" className="btn-primary text-sm">Sign In</Link>}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-forest-700 mb-3">Categories</h1>
          <p className="text-forest-500">Explore topics that match your sustainable journey</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-forest-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-forest-500 text-lg">No categories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}
                className="bg-white rounded-2xl p-8 border border-cream-200 hover:shadow-lg hover:border-forest-300 transition-all group">
                <div className="text-4xl mb-4">{cat.icon || '🌿'}</div>
                <h2 className="font-serif text-xl text-forest-700 mb-2 group-hover:text-forest-500 transition">{cat.name}</h2>
                {cat.description && <p className="text-forest-500 text-sm mb-4">{cat.description}</p>}
                <span className="text-xs text-forest-400">{cat._count.blogs} {cat._count.blogs === 1 ? 'story' : 'stories'}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
