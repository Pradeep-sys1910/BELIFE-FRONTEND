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

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 focus:bg-white transition-all duration-200";

export default function NewGroupPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 animate-fade-in">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Groups
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">Create a Group</h1>
      <p className="text-sm text-gray-400 mb-8">Build a space for your eco community</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Group Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Zero Waste Chennai"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={80}
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1.5 text-right">{name.length}/80</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
          <textarea
            rows={4}
            placeholder="What is this group about?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={inputCls + ' resize-none'}
          />
        </div>

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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Privacy</label>
          <div className="flex gap-3">
            {(['PUBLIC', 'PRIVATE'] as const).map(p => (
              <button type="button" key={p} onClick={() => setPrivacy(p)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all
                  ${privacy === p
                    ? 'bg-forest-800 text-white border-forest-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'}`}>
                {p === 'PUBLIC' ? '🌍 Public' : '🔒 Private'}
                <p className={`text-xs font-normal mt-0.5 ${privacy === p ? 'text-white/70' : 'text-gray-400'}`}>
                  {p === 'PUBLIC' ? 'Anyone can join' : 'Invite only'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-forest-800 hover:bg-forest-900 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]">
          {loading ? 'Creating…' : 'Create Group'}
        </button>
      </form>
    </div>
  );
}
