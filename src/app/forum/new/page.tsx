'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const CATEGORIES = [
  { value: 'GENERAL',          label: 'General',            emoji: '💬' },
  { value: 'QUESTIONS',        label: 'Questions & Help',   emoji: '❓' },
  { value: 'ZERO_WASTE',       label: 'Zero Waste',         emoji: '♻️' },
  { value: 'CLIMATE',          label: 'Climate',            emoji: '🌡️' },
  { value: 'PLANT_BASED',      label: 'Plant-Based',        emoji: '🌱' },
  { value: 'ACTIVISM',         label: 'Activism',           emoji: '✊' },
  { value: 'SUSTAINABLE_LIVING', label: 'Sustainable Living', emoji: '🏡' },
];

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 focus:bg-white transition-all duration-200";

export default function NewThreadPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [loading, setLoading] = useState(false);

  if (!user) { router.push('/login'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast.error('Title and content are required'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/forum/threads', { title, content, category });
      toast.success('Thread posted!');
      router.push(`/forum/${data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post thread');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 animate-fade-in">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Forum
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">New Discussion</h1>
      <p className="text-sm text-gray-400 mb-8">Start a conversation with the BeLife community</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button type="button" key={c.value} onClick={() => setCategory(c.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${category === c.value
                    ? 'bg-forest-800 text-white border-forest-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300 hover:text-forest-700'}`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title</label>
          <input
            type="text"
            required
            placeholder="What do you want to discuss?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={150}
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1.5 text-right">{title.length}/150</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</label>
          <textarea
            required
            rows={8}
            placeholder="Share your thoughts, ask a question, or start a debate…"
            value={content}
            onChange={e => setContent(e.target.value)}
            className={inputCls + ' resize-none'}
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-forest-800 hover:bg-forest-900 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]">
          {loading ? 'Posting…' : 'Post Thread'}
        </button>
      </form>
    </div>
  );
}
