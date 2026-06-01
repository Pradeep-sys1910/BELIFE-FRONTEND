'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Leaf } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const TOPICS = [
  { key: 'CLIMATE',           label: 'Climate',           emoji: '🌍' },
  { key: 'ZERO_WASTE',        label: 'Zero Waste',        emoji: '♻️' },
  { key: 'PLANT_BASED',       label: 'Plant Based',       emoji: '🥦' },
  { key: 'ACTIVISM',          label: 'Activism',          emoji: '✊' },
  { key: 'SUSTAINABLE_LIVING',label: 'Sustainable Living',emoji: '🌿' },
  { key: 'GENERAL',           label: 'Eco Stories',       emoji: '📖' },
];

interface SuggestedUser {
  id: string; name: string; username?: string; avatar?: string; bio?: string;
  _count: { followers: number; blogs: number };
}

function Avatar({ name, avatar, size = 44 }: { name: string; avatar?: string; size?: number }) {
  const s: React.CSSProperties = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };
  if (avatar) return <img src={avatar} alt={name} style={{ ...s, objectFit: 'cover' }} />;
  return (
    <div style={{ ...s, background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
      className="flex items-center justify-center text-white font-bold text-sm shrink-0">
      {name[0].toUpperCase()}
    </div>
  );
}

export default function OnboardingPage() {
  const router     = useRouter();
  const { user, updateUser } = useAuthStore();
  const [step,          setStep]          = useState(1);
  const [topics,        setTopics]        = useState<string[]>([]);
  const [suggested,     setSuggested]     = useState<SuggestedUser[]>([]);
  const [following,     setFollowing]     = useState<Set<string>>(new Set());
  const [loadingSuggest,setLoadingSuggest]= useState(false);
  const [finishing,     setFinishing]     = useState(false);

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.onboarded) { router.replace('/'); return; }
  }, [user]);

  const goToStep2 = () => {
    setStep(2);
    setLoadingSuggest(true);
    api.get('/users/suggested')
      .then(r => setSuggested(r.data as SuggestedUser[]))
      .catch(() => {})
      .finally(() => setLoadingSuggest(false));
  };

  const toggleFollow = (id: string) =>
    setFollowing(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const finish = async () => {
    setFinishing(true);
    try {
      const { data } = await api.post('/users/onboard', { followIds: [...following] });
      updateUser({ onboarded: true });
      router.replace('/');
    } catch {
      updateUser({ onboarded: true });
      router.replace('/');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg)' }}>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-10">
        {[1, 2].map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={step >= n
                ? { background: 'var(--eco)', color: '#050C07' }
                : { background: 'var(--bg-elevated)', color: 'var(--text-faint)', border: '1px solid var(--border)' }}>
              {step > n ? <Check className="w-3.5 h-3.5" /> : n}
            </div>
            {n < 2 && <div className="w-8 h-px" style={{ background: step > n ? 'var(--eco)' : 'var(--border)' }} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Pick topics ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
              style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
              <Leaf className="w-7 h-7" style={{ color: 'var(--eco-bright)' }} />
            </div>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Welcome, {user.name.split(' ')[0]}! 🌱
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Pick the topics you care about — we'll personalise your feed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {TOPICS.map(t => {
              const selected = topics.includes(t.key);
              return (
                <button key={t.key} onClick={() => setTopics(s => s.includes(t.key) ? s.filter(x => x !== t.key) : [...s, t.key])}
                  className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 active:scale-95"
                  style={{
                    background: selected ? 'var(--eco-dim)' : 'var(--bg-card)',
                    border: `1px solid ${selected ? 'var(--border-eco)' : 'var(--border)'}`,
                  }}>
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: selected ? 'var(--eco-bright)' : 'var(--text)' }}>
                    {t.label}
                  </span>
                  {selected && (
                    <Check className="w-4 h-4 ml-auto shrink-0" style={{ color: 'var(--eco-bright)' }} />
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={goToStep2}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
            style={{ background: 'var(--eco)', color: '#050C07' }}>
            Next <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={finish}
            className="w-full mt-3 text-sm py-2 transition-colors"
            style={{ color: 'var(--text-faint)' }}>
            Skip for now
          </button>
        </div>
      )}

      {/* ── Step 2: Follow people ───────────────────────────────────── */}
      {step === 2 && (
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Follow some eco-writers 👇
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Their stories will appear in your Following feed.
            </p>
          </div>

          {loadingSuggest ? (
            <div className="space-y-3 mb-8">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl animate-pulse"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="skeleton w-11 h-11 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-32 rounded" />
                    <div className="skeleton h-3 w-48 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggested.length === 0 ? (
            <div className="text-center py-10 mb-8">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No other members yet — you're among the first! 🌱
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-8 max-h-[420px] overflow-y-auto pr-1">
              {suggested.map(u => {
                const isFollowing = following.has(u.id);
                return (
                  <div key={u.id} className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
                    style={{ background: 'var(--bg-card)', border: `1px solid ${isFollowing ? 'var(--border-eco)' : 'var(--border)'}` }}>
                    <Avatar name={u.name} avatar={u.avatar} size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{u.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
                        {u._count.blogs} post{u._count.blogs !== 1 ? 's' : ''} · {u._count.followers} follower{u._count.followers !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button onClick={() => toggleFollow(u.id)}
                      className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95"
                      style={isFollowing
                        ? { background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }
                        : { background: 'var(--eco)', color: '#050C07' }}>
                      {isFollowing ? '✓ Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={finish} disabled={finishing}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'var(--eco)', color: '#050C07' }}>
            {finishing ? 'Setting up…' : 'Start exploring 🌿'}
          </button>
        </div>
      )}
    </div>
  );
}
