'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trophy, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const CATEGORIES = ['ALL','GENERAL','ZERO_WASTE','CLIMATE','PLANT_BASED','ACTIVISM','SUSTAINABLE_LIVING'];
const CAT_LABELS: Record<string,string> = {
  ALL:'All', GENERAL:'General', ZERO_WASTE:'Zero Waste', CLIMATE:'Climate',
  PLANT_BASED:'Plant Based', ACTIVISM:'Activism', SUSTAINABLE_LIVING:'Sustainable Living',
};

interface Challenge {
  id: string; title: string; prompt: string; description?: string;
  category: string; status: string; endsAt?: string; createdAt: string;
  creator: { id: string; name: string; username?: string; avatar?: string };
  _count: { submissions: number };
}

export default function ChallengesPage() {
  const { user }    = useAuthStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [cat,       setCat]       = useState('ALL');

  const load = (c = 'ALL') => {
    setLoading(true);
    const params: any = { status: 'ACTIVE' };
    if (c !== 'ALL') params.category = c;
    api.get('/challenges', { params })
      .then(r => setChallenges((r.data as any).challenges || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(cat); }, [cat]);

  return (
    <div className="max-w-[960px] mx-auto px-4 pt-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Writing Challenges</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Pick a prompt, write your response, get voted on.
          </p>
        </div>
        {user && (
          <Link href="/challenges/new" className="btn-primary">
            <Plus className="w-4 h-4" /> New Challenge
          </Link>
        )}
      </div>

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
            <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="skeleton h-4 w-3/4 rounded mb-3" />
              <div className="skeleton h-3 w-full rounded mb-1.5" />
              <div className="skeleton h-3 w-5/6 rounded" />
            </div>
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-24">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>No challenges yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Create the first writing challenge for the community.</p>
          {user && <Link href="/challenges/new" className="btn-primary">Create Challenge</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((c, i) => (
            <Link key={c.id} href={`/challenges/${c.id}`}
              className="rounded-2xl p-5 group transition-all duration-300 animate-slide-up"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}>
                  {CAT_LABELS[c.category]}
                </span>
                {c.endsAt && (
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(c.endsAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold mb-2 group-hover:text-eco-400 transition-colors"
                style={{ color: 'var(--text)' }}>{c.title}</h3>
              <p className="text-xs line-clamp-3 mb-4" style={{ color: 'var(--text-muted)' }}>{c.prompt}</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-faint)' }}>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> {c._count.submissions} submissions
                </span>
                <span>by {c.creator.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
