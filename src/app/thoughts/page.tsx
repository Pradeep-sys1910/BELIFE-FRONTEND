'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, Sparkles, Users, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Author { id: string; name: string; username?: string; avatar?: string }
interface Thought {
  id: string; content: string; createdAt: string;
  author: Author;
  _count: { likes: number };
}

function Avatar({ name, avatar, size = 36 }: { name: string; avatar?: string; size?: number }) {
  const s: React.CSSProperties = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };
  if (avatar) return <img src={avatar} alt={name} style={{ ...s, objectFit: 'cover' }} />;
  return (
    <div style={{ ...s, background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
      className="flex items-center justify-center text-white font-bold text-sm">
      {name[0].toUpperCase()}
    </div>
  );
}

function ThoughtCard({ thought, onDelete, currentUserId }: {
  thought: Thought; onDelete: (id: string) => void; currentUserId?: string;
}) {
  const router = useRouter();
  const [liked,  setLiked]  = useState(false);
  const [likes,  setLikes]  = useState(thought._count.likes);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) { router.push('/login'); return; }
    if (liking) return;
    const was = liked;
    setLiked(!was); setLikes(n => was ? n - 1 : n + 1); setLiking(true);
    try {
      const { data } = await api.post(`/thoughts/${thought.id}/like`);
      setLiked((data as any).liked); setLikes((data as any).count);
    } catch { setLiked(was); setLikes(n => was ? n + 1 : n - 1); }
    finally { setLiking(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this thought?')) return;
    try {
      await api.delete(`/thoughts/${thought.id}`);
      onDelete(thought.id);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="rounded-2xl p-4 transition-all duration-200"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex gap-3">
        <Link href={thought.author.username ? `/profile/${thought.author.username}` : '#'}>
          <Avatar name={thought.author.name} avatar={thought.author.avatar} size={38} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <Link href={thought.author.username ? `/profile/${thought.author.username}` : '#'}
              className="text-sm font-semibold hover:underline" style={{ color: 'var(--text)' }}>
              {thought.author.name}
              {thought.author.username && (
                <span className="font-normal ml-1.5" style={{ color: 'var(--text-faint)' }}>
                  @{thought.author.username}
                </span>
              )}
            </Link>
            <span className="text-xs shrink-0" style={{ color: 'var(--text-faint)' }}>
              {formatDistanceToNow(new Date(thought.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
            {thought.content}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={handleLike}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors group"
              style={{ color: liked ? '#F87171' : 'var(--text-faint)' }}>
              <Heart style={{ width: 15, height: 15, fill: liked ? '#F87171' : 'none' }}
                strokeWidth={liked ? 0 : 1.8} className="group-hover:text-red-400 transition-colors" />
              {likes > 0 ? likes : 'Like'}
            </button>
            {currentUserId === thought.author.id && (
              <button onClick={handleDelete}
                className="flex items-center gap-1 text-xs transition-colors hover:text-red-400"
                style={{ color: 'var(--text-faint)' }}>
                <Trash2 style={{ width: 13, height: 13 }} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = 'forYou' | 'following';

export default function ThoughtsPage() {
  const { user } = useAuthStore();
  const router   = useRouter();
  const [tab,          setTab]          = useState<Tab>('forYou');
  const [thoughts,     setThoughts]     = useState<Thought[]>([]);
  const [followThoughts, setFollowThoughts] = useState<Thought[]>([]);
  const [followLoaded, setFollowLoaded] = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [followLoading,setFollowLoading]= useState(false);
  const [draft,        setDraft]        = useState('');
  const [posting,      setPosting]      = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.get('/thoughts').then(r => setThoughts((r.data as any).thoughts || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleFollowTab = () => {
    setTab('following');
    if (followLoaded || !user) return;
    setFollowLoading(true);
    api.get('/thoughts/following').then(r => setFollowThoughts((r.data as any).thoughts || []))
      .catch(() => {}).finally(() => { setFollowLoading(false); setFollowLoaded(true); });
  };

  const handlePost = async () => {
    if (!user) { router.push('/login'); return; }
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post('/thoughts', { content: draft.trim() });
      setThoughts(prev => [data as Thought, ...prev]);
      setDraft('');
      if (textRef.current) textRef.current.style.height = 'auto';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally { setPosting(false); }
  };

  const handleDelete = (id: string) => {
    setThoughts(ts => ts.filter(t => t.id !== id));
    setFollowThoughts(ts => ts.filter(t => t.id !== id));
  };

  const feed        = tab === 'forYou' ? thoughts : followThoughts;
  const feedLoading = tab === 'forYou' ? loading  : followLoading;
  const remaining   = 280 - draft.length;

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-8 pb-24">
      <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Quick Thoughts</h1>

      {/* Compose */}
      {user && (
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex gap-3">
            <Avatar name={user.name} avatar={user.avatar} size={38} />
            <div className="flex-1">
              <textarea
                ref={textRef}
                value={draft}
                onChange={e => {
                  if (e.target.value.length <= 280) {
                    setDraft(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }
                }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost(); }}
                placeholder="Share an eco thought… (280 chars)"
                rows={2}
                className="w-full resize-none text-sm leading-relaxed outline-none bg-transparent"
                style={{ color: 'var(--text)' }}
              />
              <div className="flex items-center justify-between mt-2 pt-2"
                style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: remaining < 20 ? '#F87171' : 'var(--text-faint)' }}>
                  {remaining} left
                </span>
                <button
                  onClick={handlePost} disabled={!draft.trim() || posting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-40"
                  style={{ background: 'var(--eco)', color: '#050C07' }}
                >
                  <Send className="w-3 h-3" />
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {user && (
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'var(--bg-elevated)' }}>
          {[
            { key: 'forYou',    label: 'For You',   icon: Sparkles, onClick: () => setTab('forYou') },
            { key: 'following', label: 'Following', icon: Users,    onClick: handleFollowTab },
          ].map(({ key, label, icon: Icon, onClick }) => (
            <button key={key} onClick={onClick}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={tab === key
                ? { background: 'var(--bg-card)', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }
                : { color: 'var(--text-faint)' }}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      )}

      {/* Feed */}
      {feedLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex gap-3">
                <div className="skeleton w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-28 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">💭</div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            {tab === 'following' ? 'No thoughts from people you follow yet' : 'No thoughts yet'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {tab === 'following' ? 'Follow more eco-writers to see their thoughts here.' : 'Be the first to share one above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((t, i) => (
            <div key={t.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <ThoughtCard thought={t} onDelete={handleDelete} currentUserId={user?.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
