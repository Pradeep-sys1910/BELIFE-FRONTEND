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

const labelCls = "block text-xs font-semibold uppercase tracking-wider mb-2";
const fieldStyle = { color: 'var(--text-faint)' };

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className={labelCls} style={fieldStyle}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  );
}

export default function NewCampaignPage() {
  const router   = useRouter();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: '', description: '', goal: '', image: '',
    category: 'GENERAL', targetCount: '100',
  });
  const [loading, setLoading] = useState(false);

  if (!user) { router.push('/login'); return null; }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200";
  const inputStyle = {
    background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/campaigns', {
        ...form,
        targetCount: parseInt(form.targetCount) || 100,
      });
      router.push(`/campaigns/${(data as any).slug}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create campaign');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-8 pb-24">
      <Link href="/campaigns" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </Link>
      <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Start a Campaign</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Campaign title">
          <input value={form.title} onChange={e => set('title', e.target.value)} required maxLength={120}
            placeholder="e.g. Plant 1000 Trees in Chennai" className={inputCls} style={inputStyle} />
        </Field>

        <Field label="Your goal" hint="One sentence — what change do you want to create?">
          <input value={form.goal} onChange={e => set('goal', e.target.value)} required maxLength={200}
            placeholder="e.g. Restore the city's green cover by planting 1000 native trees"
            className={inputCls} style={inputStyle} />
        </Field>

        <Field label="Description">
          <textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={5}
            placeholder="Tell people why this campaign matters..."
            className={inputCls + ' resize-none'} style={inputStyle} />
        </Field>

        <Field label="Category">
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
        </Field>

        <Field label="Support target" hint="How many supporters are you aiming for?">
          <input type="number" min={1} max={1000000} value={form.targetCount}
            onChange={e => set('targetCount', e.target.value)}
            className={inputCls} style={inputStyle} />
        </Field>

        <Field label="Cover image URL" hint="Optional — paste a direct image link">
          <input value={form.image} onChange={e => set('image', e.target.value)}
            placeholder="https://..." className={inputCls} style={inputStyle} />
        </Field>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'var(--eco)', color: '#050C07' }}>
          {loading ? 'Creating…' : 'Launch Campaign'}
        </button>
      </form>
    </div>
  );
}
