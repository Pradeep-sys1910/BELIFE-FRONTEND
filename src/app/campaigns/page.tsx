'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Target, Users } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const CATEGORIES = ['ALL','GENERAL','ZERO_WASTE','CLIMATE','PLANT_BASED','ACTIVISM','SUSTAINABLE_LIVING'];
const CAT_LABELS: Record<string,string> = {
  ALL:'All', GENERAL:'General', ZERO_WASTE:'Zero Waste', CLIMATE:'Climate',
  PLANT_BASED:'Plant Based', ACTIVISM:'Activism', SUSTAINABLE_LIVING:'Sustainable Living',
};

interface Campaign {
  id: string; title: string; slug: string; description: string; goal: string;
  image?: string; category: string; status: string; targetCount: number;
  createdAt: string;
  creator: { id: string; name: string; username?: string; avatar?: string };
  _count: { supporters: number };
}

function progressPct(supporters: number, target: number) {
  return Math.min(100, Math.round((supporters / target) * 100));
}

export default function CampaignsPage() {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [cat,       setCat]       = useState('ALL');

  const load = (c = 'ALL') => {
    setLoading(true);
    const params: any = { status: 'ACTIVE', limit: 12 };
    if (c !== 'ALL') params.category = c;
    api.get('/campaigns', { params })
      .then(r => setCampaigns((r.data as any).campaigns || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(cat); }, [cat]);

  return (
    <div className="max-w-[960px] mx-auto px-4 pt-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Campaigns</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Real eco-actions, real change. Join a movement.
          </p>
        </div>
        {user && (
          <Link href="/campaigns/new" className="btn-primary">
            <Plus className="w-4 h-4" /> New Campaign
          </Link>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={cat === c
              ? { background: 'var(--eco)', color: '#050C07' }
              : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="skeleton h-40 w-full" style={{ borderRadius: 0 }} />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-2 w-full rounded-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-3">📣</div>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>No campaigns yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Start a movement for something you care about.</p>
          {user && <Link href="/campaigns/new" className="btn-primary">Start Campaign</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c, i) => {
            const pct = progressPct(c._count.supporters, c.targetCount);
            return (
              <Link key={c.id} href={`/campaigns/${c.slug}`}
                className="rounded-2xl overflow-hidden group transition-all duration-300 animate-slide-up"
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  animationDelay: `${i * 0.05}s`,
                }}>
                <div className="h-40 overflow-hidden relative" style={{ background: 'var(--bg-elevated)' }}>
                  {c.image
                    ? <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-5xl">📣</div>}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: 'var(--eco)', color: '#050C07' }}>
                    {CAT_LABELS[c.category]}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold line-clamp-2 mb-1" style={{ color: 'var(--text)' }}>{c.title}</h3>
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>{c.goal}</p>
                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--eco-bright)' }}>{pct}%</span>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
                        <Users className="w-3 h-3" /> {c._count.supporters} / {c.targetCount}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: 'var(--eco)' }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
