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

export default function NewGroupPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('GENERAL');
  const [privacy,     setPrivacy]     = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [loading,     setLoading]     = useState(false);

  if (!user) { router.push('/login'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Group name is required'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/groups', { name, description, category, privacy });
      toast.success('Group created!');
      router.push(`/groups/${data.slug}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' };
  const labelStyle = { color: 'var(--text-muted)' };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 animate-fade-in">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm transition mb-6"
        style={{ color: 'var(--text-faint)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Groups
      </button>

      <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: 'var(--text)' }}>Create a Group</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-faint)' }}>Build a space for your eco community</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>Group Name</label>
          <input
            type="text" required
            placeholder="e.g. Zero Waste Chennai"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={80}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all"
            style={inputStyle}
          />
          <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-faint)' }}>{name.length}/80</p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>Description</label>
          <textarea rows={4}
            placeholder="What is this group about?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all resize-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>Category</label>
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
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>Privacy</label>
          <div className="flex gap-3">
            {(['PUBLIC', 'PRIVATE'] as const).map(p => (
              <button type="button" key={p} onClick={() => setPrivacy(p)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={privacy === p
                  ? { background: 'var(--eco)', color: '#050C07', border: '1px solid transparent' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }>
                {p === 'PUBLIC' ? '🌍 Public' : '🔒 Private'}
                <p className="text-xs font-normal mt-0.5" style={{ color: privacy === p ? 'rgba(5,12,7,0.7)' : 'var(--text-faint)' }}>
                  {p === 'PUBLIC' ? 'Anyone can join' : 'Invite only'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: 'var(--eco)', color: '#050C07' }}>
          {loading ? 'Creating…' : 'Create Group'}
        </button>
      </form>
    </div>
  );
}
