'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const CATEGORIES = ['GENERAL','ZERO_WASTE','CLIMATE','PLANT_BASED','ACTIVISM','SUSTAINABLE_LIVING'];
const CAT_LABELS: Record<string,string> = {
  GENERAL:'General', ZERO_WASTE:'Zero Waste', CLIMATE:'Climate',
  PLANT_BASED:'Plant Based', ACTIVISM:'Activism', SUSTAINABLE_LIVING:'Sustainable Living',
};

export default function NewChallengePage() {
  const router   = useRouter();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: '', prompt: '', description: '', category: 'GENERAL', endsAt: '',
  });
  const [loading, setLoading] = useState(false);

  if (!user) { router.push('/login'); return null; }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200";
  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' };
  const labelCls  = "block text-xs font-semibold uppercase tracking-wider mb-2";
  const labelStyle = { color: 'var(--text-faint)' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/challenges', {
        ...form,
        endsAt: form.endsAt || undefined,
      });
      router.push(`/challenges/${(data as any).id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create challenge');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-8 pb-24">
      <Link href="/challenges" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Challenges
      </Link>
      <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Create a Challenge</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelCls} style={labelStyle}>Challenge Title</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} required maxLength={120}
            placeholder="e.g. Write a haiku about ocean plastic"
            className={inputCls} style={inputStyle} />
        </div>

        <div>
          <label className={labelCls} style={labelStyle}>The Prompt</label>
          <textarea value={form.prompt} onChange={e => set('prompt', e.target.value)} required rows={4}
            placeholder="Describe exactly what participants should write about..."
            className={inputCls + ' resize-none'} style={inputStyle} />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>
            Be specific — the best prompts inspire the best writing.
          </p>
        </div>

        <div>
          <label className={labelCls} style={labelStyle}>Description (optional)</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            placeholder="Any extra context, rules, or inspiration..."
            className={inputCls + ' resize-none'} style={inputStyle} />
        </div>

        <div>
          <label className={labelCls} style={labelStyle}>Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => set('category', c)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={form.category === c
                  ? { background: 'var(--eco)', color: '#050C07' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {CAT_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls} style={labelStyle}>Deadline (optional)</label>
          <input type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)}
            className={inputCls} style={{ ...inputStyle, colorScheme: 'dark' }} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'var(--eco)', color: '#050C07' }}>
          {loading ? 'Creating…' : 'Create Challenge'}
        </button>
      </form>
    </div>
  );
}
