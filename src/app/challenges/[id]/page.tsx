'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, ThumbsUp, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Author { id: string; name: string; username?: string; avatar?: string }
interface Submission {
  id: string; content: string; createdAt: string;
  author: Author;
  _count: { votes: number };
}
interface Challenge {
  id: string; title: string; prompt: string; description?: string;
  category: string; status: string; endsAt?: string; createdAt: string;
  creator: Author;
  _count: { submissions: number };
  submissions: Submission[];
}

function Avatar({ name, avatar, size = 32 }: { name: string; avatar?: string; size?: number }) {
  const s: React.CSSProperties = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };
  if (avatar) return <img src={avatar} alt={name} style={{ ...s, objectFit: 'cover' }} />;
  return (
    <div style={{ ...s, background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
      className="flex items-center justify-center text-white text-xs font-bold">
      {name[0].toUpperCase()}
    </div>
  );
}

export default function ChallengeDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { user } = useAuthStore();
  const [challenge,  setChallenge]  = useState<Challenge | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [draft,      setDraft]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voted,      setVoted]      = useState<Set<string>>(new Set());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    api.get(`/challenges/${id}`)
      .then(r => {
        setChallenge(r.data as Challenge);
        if (user) {
          const already = (r.data as Challenge).submissions.some(s => s.author.id === user.id);
          setHasSubmitted(already);
        }
      })
      .catch(() => setChallenge(null))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/challenges/${id}/submit`, { content: draft });
      setChallenge(c => c ? { ...c, submissions: [data as Submission, ...c.submissions], _count: { submissions: c._count.submissions + 1 } } : c);
      setDraft('');
      setHasSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const handleVote = async (subId: string) => {
    if (!user) { router.push('/login'); return; }
    const wasVoted = voted.has(subId);
    setVoted(v => { const n = new Set(v); wasVoted ? n.delete(subId) : n.add(subId); return n; });
    setChallenge(c => c ? {
      ...c,
      submissions: c.submissions.map(s => s.id === subId
        ? { ...s, _count: { votes: s._count.votes + (wasVoted ? -1 : 1) } }
        : s),
    } : c);
    try {
      await api.post(`/challenges/${id}/submissions/${subId}/vote`);
    } catch {
      setVoted(v => { const n = new Set(v); wasVoted ? n.add(subId) : n.delete(subId); return n; });
    }
  };

  const handleDeleteSub = async (subId: string) => {
    if (!confirm('Delete your submission?')) return;
    try {
      await api.delete(`/challenges/${id}/submissions/${subId}`);
      setChallenge(c => c ? { ...c, submissions: c.submissions.filter(s => s.id !== subId), _count: { submissions: c._count.submissions - 1 } } : c);
      setHasSubmitted(false);
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return (
    <div className="max-w-[720px] mx-auto px-4 pt-8 pb-24">
      <div className="skeleton h-6 w-1/2 rounded mb-4" />
      <div className="skeleton h-4 w-full rounded mb-2" />
      <div className="skeleton h-4 w-3/4 rounded" />
    </div>
  );

  if (!challenge) return (
    <div className="max-w-[720px] mx-auto px-4 pt-24 text-center">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Challenge not found.</p>
    </div>
  );

  const sorted = [...challenge.submissions].sort((a, b) => b._count.votes - a._count.votes);

  return (
    <div className="max-w-[720px] mx-auto px-4 pt-8 pb-24">
      <Link href="/challenges" className="inline-flex items-center gap-2 text-sm mb-5 transition-colors"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Challenges
      </Link>

      {/* Header */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{challenge.title}</h1>
          {challenge.endsAt && (
            <span className="flex items-center gap-1 text-xs shrink-0" style={{ color: 'var(--text-faint)' }}>
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(challenge.endsAt), { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="p-4 rounded-xl mb-3" style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
          <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--eco-bright)' }}>
            ✍️ {challenge.prompt}
          </p>
        </div>
        {challenge.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{challenge.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: 'var(--text-faint)' }}>
          <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {challenge._count.submissions} submissions</span>
          <span>by {challenge.creator.name}</span>
        </div>
      </div>

      {/* Submit form */}
      {user && challenge.status === 'ACTIVE' && !hasSubmitted && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-4 mb-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Your submission</h3>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} required rows={6}
            placeholder="Write your response to the prompt..."
            className="w-full resize-none text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 mb-3"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }} />
          <button type="submit" disabled={!draft.trim() || submitting}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40"
            style={{ background: 'var(--eco)', color: '#050C07' }}>
            {submitting ? 'Submitting…' : 'Submit Entry'}
          </button>
        </form>
      )}

      {/* Submissions */}
      {sorted.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Submissions <span className="text-sm font-normal" style={{ color: 'var(--text-faint)' }}>({sorted.length})</span>
          </h2>
          <div className="space-y-4">
            {sorted.map((sub, rank) => (
              <div key={sub.id} className="rounded-2xl p-4"
                style={{ background: 'var(--bg-card)', border: `1px solid ${rank === 0 && sub._count.votes > 0 ? 'var(--border-eco)' : 'var(--border)'}` }}>
                <div className="flex items-center gap-3 mb-3">
                  {rank === 0 && sub._count.votes > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{ background: 'var(--eco)', color: '#050C07' }}>
                      🏆 Top
                    </span>
                  )}
                  <Avatar name={sub.author.name} avatar={sub.author.avatar} size={30} />
                  <Link href={sub.author.username ? `/profile/${sub.author.username}` : '#'}
                    className="text-sm font-semibold hover:underline" style={{ color: 'var(--text)' }}>
                    {sub.author.name}
                  </Link>
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}>
                    {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3" style={{ color: 'var(--text-muted)' }}>
                  {sub.content}
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleVote(sub.id)}
                    className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                    style={{ color: voted.has(sub.id) ? 'var(--eco-bright)' : 'var(--text-faint)' }}>
                    <ThumbsUp style={{ width: 14, height: 14 }} strokeWidth={voted.has(sub.id) ? 2.5 : 1.5} />
                    {sub._count.votes} {sub._count.votes === 1 ? 'vote' : 'votes'}
                  </button>
                  {user?.id === sub.author.id && (
                    <button onClick={() => handleDeleteSub(sub.id)}
                      className="flex items-center gap-1 text-xs hover:text-red-400 transition-colors"
                      style={{ color: 'var(--text-faint)' }}>
                      <Trash2 style={{ width: 12, height: 12 }} /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
