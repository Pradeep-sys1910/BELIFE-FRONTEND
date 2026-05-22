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

const CAT_META: Record<string, { label: string; emoji: string; color: string }> = {
  GENERAL:           { label: 'General',          emoji: '💬', color: 'bg-gray-100 text-gray-600' },
  QUESTIONS:         { label: 'Questions',         emoji: '❓', color: 'bg-blue-50 text-blue-600' },
  ZERO_WASTE:        { label: 'Zero Waste',        emoji: '♻️', color: 'bg-emerald-50 text-emerald-700' },
  CLIMATE:           { label: 'Climate',           emoji: '🌡️', color: 'bg-orange-50 text-orange-700' },
  PLANT_BASED:       { label: 'Plant-Based',       emoji: '🌱', color: 'bg-green-50 text-green-700' },
  ACTIVISM:          { label: 'Activism',          emoji: '✊', color: 'bg-purple-50 text-purple-700' },
  SUSTAINABLE_LIVING:{ label: 'Sustainable Living',emoji: '🏡', color: 'bg-forest-50 text-forest-700' },
};

function UserAvatar({ name, avatar, size = 9 }: { name: string; avatar?: string; size?: number }) {
  if (avatar) return <img src={avatar} alt={name} className={`w-${size} h-${size} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white font-bold text-sm shrink-0`}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default function ThreadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

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
        <p className="text-gray-500 text-sm">Thread not found</p>
        <Link href="/forum" className="text-forest-700 text-sm font-semibold hover:underline">← Back to Forum</Link>
      </div>
    );
  }

  const cat = CAT_META[thread.category];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 animate-fade-in">

      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition">
          <ArrowLeft className="w-4 h-4" /> Forum
        </button>
        {user?.id === thread.author.id && (
          <button onClick={handleDeleteThread}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition">
            <Trash2 className="w-3.5 h-3.5" /> Delete thread
          </button>
        )}
      </div>

      {/* Thread */}
      <div className="border border-gray-100 rounded-2xl p-6 mb-6 shadow-card">
        {/* Category badge */}
        {cat && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 ${cat.color}`}>
            {cat.emoji} {cat.label}
          </span>
        )}

        <h1 className="text-xl font-semibold text-gray-900 leading-snug mb-5">{thread.title}</h1>

        {/* Author row */}
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <UserAvatar name={thread.author.name} avatar={thread.author.avatar} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{thread.author.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{thread.views} views</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">{thread.content}</p>

        {/* Vote */}
        <button onClick={handleVote}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border
            ${voted ? 'bg-forest-50 border-forest-300 text-forest-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-forest-300 hover:text-forest-600'}`}>
          <ThumbsUp className={`w-4 h-4 ${voted ? 'fill-forest-500' : ''}`} strokeWidth={voted ? 0 : 1.8} />
          {voteCount} {voteCount === 1 ? 'upvote' : 'upvotes'}
        </button>
      </div>

      {/* Replies */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
      </h2>

      <div className="space-y-3 mb-8">
        {thread.replies.map(r => (
          <div key={r.id} className="flex items-start gap-3">
            <UserAvatar name={r.author.name} avatar={r.author.avatar} size={8} />
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{r.author.name}</span>
                  <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                </div>
                {user?.id === r.author.id && (
                  <button onClick={() => handleDeleteReply(r.id)} className="text-gray-300 hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{r.content}</p>
            </div>
          </div>
        ))}

        {thread.replies.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No replies yet. Be the first to respond! 👇
          </div>
        )}
      </div>

      {/* Reply form */}
      {user ? (
        <form onSubmit={handleReply}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Reply</label>
          <textarea
            rows={4}
            placeholder="Share your thoughts…"
            value={reply}
            onChange={e => setReply(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 focus:bg-white transition-all duration-200 resize-none mb-3"
          />
          <button type="submit" disabled={submitting || !reply.trim()}
            className="bg-forest-800 hover:bg-forest-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]">
            {submitting ? 'Posting…' : 'Post Reply'}
          </button>
        </form>
      ) : (
        <div className="bg-forest-50 border border-forest-100 rounded-xl px-5 py-4 text-sm text-center">
          <Link href="/login" className="text-forest-700 font-semibold hover:underline">Sign in</Link>
          <span className="text-gray-500"> to join the discussion</span>
        </div>
      )}
    </div>
  );
}
