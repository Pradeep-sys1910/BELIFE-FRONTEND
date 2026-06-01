'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; username?: string; avatar?: string };
}

interface Thread {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  views: number;
  createdAt: string;
  author: { id: string; name: string; username?: string; avatar?: string };
  replies: Reply[];
  _count: { votes: number };
}

const CAT_META: Record<string, { label: string; emoji: string }> = {
  GENERAL:           { label: 'General',          emoji: '💬' },
  QUESTIONS:         { label: 'Questions',         emoji: '❓' },
  ZERO_WASTE:        { label: 'Zero Waste',        emoji: '♻️' },
  CLIMATE:           { label: 'Climate',           emoji: '🌡️' },
  PLANT_BASED:       { label: 'Plant-Based',       emoji: '🌱' },
  ACTIVISM:          { label: 'Activism',          emoji: '✊' },
  SUSTAINABLE_LIVING:{ label: 'Sustainable Living',emoji: '🏡' },
};

function UserAvatar({ name, avatar, size = 36 }: { name: string; avatar?: string; size?: number }) {
  const s = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };
  if (avatar) return <img src={avatar} alt={name} style={{ ...s, objectFit: 'cover' }} />;
  return (
    <div style={{ ...s, background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
      className="flex items-center justify-center text-white font-bold text-sm shrink-0">
      {name[0].toUpperCase()}
    </div>
  );
}

export default function ThreadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [thread,     setThread]     = useState<Thread | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [reply,      setReply]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voted,      setVoted]      = useState(false);
  const [voteCount,  setVoteCount]  = useState(0);

  const load = async () => {
    try {
      const { data } = await api.get(`/forum/threads/${id}`);
      setThread(data);
      setVoteCount(data._count.votes);
    } catch {
      setThread(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleVote = async () => {
    if (!user) { router.push('/login'); return; }
    const wasVoted = voted;
    setVoted(!wasVoted);
    setVoteCount(n => wasVoted ? n - 1 : n + 1);
    try {
      const { data } = await api.post(`/forum/threads/${id}/vote`);
      setVoted(data.voted);
      setVoteCount(data.count);
    } catch {
      setVoted(wasVoted);
      setVoteCount(n => wasVoted ? n + 1 : n - 1);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/forum/threads/${id}/replies`, { content: reply.trim() });
      setReply('');
      await load();
      toast.success('Reply posted!');
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      await api.delete(`/forum/replies/${replyId}`);
      setThread(prev => prev ? { ...prev, replies: prev.replies.filter(r => r.id !== replyId) } : prev);
    } catch {
      toast.error('Failed to delete reply');
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Delete this thread?')) return;
    try {
      await api.delete(`/forum/threads/${id}`);
      toast.success('Thread deleted');
      router.push('/forum');
    } catch {
      toast.error('Failed to delete thread');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        <div className="skeleton h-4 w-28 rounded-full mb-6" />
        <div className="skeleton h-8 w-4/5 rounded-lg mb-4" />
        <div className="skeleton h-4 w-40 rounded mb-8" />
        {[1,2,3,4,5].map(i => <div key={i} className={`skeleton h-4 rounded mb-3 ${i % 3 === 0 ? 'w-2/3' : 'w-full'}`} />)}
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Thread not found</p>
        <Link href="/forum" className="text-sm font-semibold hover:underline" style={{ color: 'var(--eco-bright)' }}>← Back to Forum</Link>
      </div>
    );
  }

  const cat = CAT_META[thread.category];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 animate-fade-in">

      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm transition"
          style={{ color: 'var(--text-faint)' }}>
          <ArrowLeft className="w-4 h-4" /> Forum
        </button>
        {user?.id === thread.author.id && (
          <button onClick={handleDeleteThread}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 transition">
            <Trash2 className="w-3.5 h-3.5" /> Delete thread
          </button>
        )}
      </div>

      {/* Thread */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Category badge */}
        {cat && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full mb-4"
            style={{ background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}>
            {cat.emoji} {cat.label}
          </span>
        )}

        <h1 className="text-xl font-semibold leading-snug mb-5" style={{ color: 'var(--text)' }}>{thread.title}</h1>

        {/* Author row */}
        <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <UserAvatar name={thread.author.name} avatar={thread.author.avatar} size={36} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{thread.author.name}</p>
            <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
              <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{thread.views} views</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed whitespace-pre-line mb-6" style={{ color: 'var(--text-muted)' }}>
          {thread.content}
        </p>

        {/* Vote */}
        <button onClick={handleVote}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
          style={voted
            ? { background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }
            : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
          }>
          <ThumbsUp className="w-4 h-4" style={{ fill: voted ? 'var(--eco-bright)' : 'none' }} strokeWidth={voted ? 0 : 1.8} />
          {voteCount} {voteCount === 1 ? 'upvote' : 'upvotes'}
        </button>
      </div>

      {/* Replies */}
      <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
        {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
      </h2>

      <div className="space-y-3 mb-8">
        {thread.replies.map(r => (
          <div key={r.id} className="flex items-start gap-3">
            <UserAvatar name={r.author.name} avatar={r.author.avatar} size={32} />
            <div className="flex-1 rounded-xl px-4 py-3"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.author.name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {user?.id === r.author.id && (
                  <button onClick={() => handleDeleteReply(r.id)} className="transition"
                    style={{ color: 'var(--text-faint)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>
                {r.content}
              </p>
            </div>
          </div>
        ))}

        {thread.replies.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-faint)' }}>
            No replies yet. Be the first to respond! 👇
          </div>
        )}
      </div>

      {/* Reply form */}
      {user ? (
        <form onSubmit={handleReply}>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>Your Reply</label>
          <textarea rows={4}
            placeholder="Share your thoughts…"
            value={reply}
            onChange={e => setReply(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all resize-none mb-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <button type="submit" disabled={submitting || !reply.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'var(--eco)', color: '#050C07' }}>
            {submitting ? 'Posting…' : 'Post Reply'}
          </button>
        </form>
      ) : (
        <div className="rounded-xl px-5 py-4 text-sm text-center"
          style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--eco-bright)' }}>Sign in</Link>
          <span style={{ color: 'var(--text-muted)' }}> to join the discussion</span>
        </div>
      )}
    </div>
  );
}
