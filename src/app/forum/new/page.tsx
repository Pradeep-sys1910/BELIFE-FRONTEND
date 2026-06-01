'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const CATEGORIES = [
  { value: 'GENERAL',           label: 'General',            emoji: '💬' },
  { value: 'QUESTIONS',         label: 'Questions & Help',   emoji: '❓' },
  { value: 'ZERO_WASTE',        label: 'Zero Waste',         emoji: '♻️' },
  { value: 'CLIMATE',           label: 'Climate',            emoji: '🌡️' },
  { value: 'PLANT_BASED',       label: 'Plant-Based',        emoji: '🌱' },
  { value: 'ACTIVISM',          label: 'Activism',           emoji: '✊' },
  { value: 'SUSTAINABLE_LIVING',label: 'Sustainable Living', emoji: '🏡' },
];

export default function NewThreadPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title,    setTitle]    = useState('');
  const [content,  setContent]  = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [loading,  setLoading]  = useState(false);

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

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 animate-fade-in">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm transition mb-6"
        style={{ color: 'var(--text-faint)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Forum
      </button>

      <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: 'var(--text)' }}>New Discussion</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-faint)' }}>Start a conversation with the BeLife community</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>Category</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button type="button" key={c.value} onClick={() => setCategory(c.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={category === c.value
                  ? { background: 'var(--eco)', color: '#050C07', border: '1px solid transparent' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>Title</label>
          <input
            type="text" required
            placeholder="What do you want to discuss?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={150}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all"
            style={inputStyle}
          />
          <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-faint)' }}>{title.length}/150</p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>Content</label>
          <textarea required rows={8}
            placeholder="Share your thoughts, ask a question, or start a debate…"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all resize-none"
            style={inputStyle}
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: 'var(--eco)', color: '#050C07' }}>
          {loading ? 'Posting…' : 'Post Thread'}
        </button>
      </form>
    </div>
  );
}
