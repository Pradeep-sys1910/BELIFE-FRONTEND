'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import FileUpload from '@/components/FileUpload';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; slug: string; }

export default function NewBlogPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', image: '', categoryId: '', tags: '', readTime: 5,
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const { data } = await api.post('/blogs', { ...form, tags, readTime: Number(form.readTime) });
      toast.success('Blog published! 🌿');
      router.push(`/blogs/${data.slug}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="bg-white border-b border-cream-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-forest-700">BeLife</Link>
          <Link href="/dashboard" className="text-forest-600 hover:text-forest-800 text-sm">Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl text-forest-700 mb-8">Write a Story</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Title *</label>
            <input
              type="text" required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Your story title..."
              className="w-full px-4 py-3 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Excerpt *</label>
            <textarea
              required rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="A short summary of your story..."
              className="w-full px-4 py-3 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Content *</label>
            <textarea
              required rows={14}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your story here..."
              className="w-full px-4 py-3 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Cover Image *</label>
            <FileUpload
              accept="image"
              label="Upload Cover Image"
              currentUrl={form.image}
              onUpload={(url) => setForm({ ...form, image: url })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-2">Category *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-2">Read Time (min)</label>
              <input
                type="number" min={1} max={60}
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="sustainability, eco-tips, nature"
              className="w-full px-4 py-3 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Publishing...' : 'Publish Story 🌿'}
            </button>
            <Link href="/dashboard" className="px-6 py-3 border border-cream-200 rounded-lg text-forest-600 hover:border-forest-400 transition">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
