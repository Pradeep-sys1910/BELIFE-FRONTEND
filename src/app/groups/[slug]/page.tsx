'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Heart, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface GroupPost {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; username?: string; avatar?: string };
  _count: { likes: number };
}

interface Group {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  category: string;
  privacy: string;
  createdAt: string;
  creator: { id: string; name: string; avatar?: string };
  _count: { members: number; posts: number };
  posts: GroupPost[];
}

const CAT_META: Record<string, { label: string; emoji: string }> = {
  GENERAL:            { label: 'General',           emoji: '💬' },
  QUESTIONS:          { label: 'Questions',          emoji: '❓' },
  ZERO_WASTE:         { label: 'Zero Waste',         emoji: '♻️' },
  CLIMATE:            { label: 'Climate',            emoji: '🌡️' },
  PLANT_BASED:        { label: 'Plant-Based',        emoji: '🌱' },
  ACTIVISM:           { label: 'Activism',           emoji: '✊' },
  SUSTAINABLE_LIVING: { label: 'Sustainable Living', emoji: '🏡' },
};

function UserAvatar({ name, avatar, size = 36 }: { name: string; avatar?: string; size?: number }) {
  const s = { width: size, height: size, borderRadius: '50%' };
  if (avatar) return <img src={avatar} alt={name} style={{ ...s, objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{ ...s, flexShrink: 0, background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
      className="flex items-center justify-center text-white font-bold text-sm">
      {name[0].toUpperCase()}
    </div>
  );
}

export default function GroupDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [joining, setJoining] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/groups/${slug}`);
      setGroup(data);
      setPosts(data.posts);
      setMemberCount(data._count.members);
    } catch {
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const loadMembership = useCallback(async (groupId: string) => {
    if (!user) return;
    try {
      const { data } = await api.get(`/groups/${groupId}/membership`);
      setIsMember(data.isMember);
    } catch {}
  }, [user]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (group) loadMembership(group.id); }, [group, loadMembership]);

  const handleJoin = async () => {
    if (!user) { router.push('/login'); return; }
    if (!group) return;
    setJoining(true);
    const wasIn = isMember;
    setIsMember(!wasIn);
    setMemberCount(n => wasIn ? n - 1 : n + 1);
    try {
      const { data } = await api.post(`/groups/${group.id}/join`);
      setIsMember(data.joined);
      setMemberCount(data.count);
    } catch {
      setIsMember(wasIn);
      setMemberCount(n => wasIn ? n + 1 : n - 1);
      toast.error('Failed to update membership');
    } finally {
      setJoining(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !group || !postContent.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/groups/${group.id}/posts`, { content: postContent.trim() });
      setPosts(prev => [data, ...prev]);
      setPostContent('');
      toast.success('Posted!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!group) return;
    try {
      await api.delete(`/groups/${group.id}/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleLike = async (post: GroupPost) => {
    if (!user) { router.push('/login'); return; }
    if (!group) return;
    const wasLiked = likedPosts.has(post.id);
    setLikedPosts(prev => {
      const next = new Set(prev);
      wasLiked ? next.delete(post.id) : next.add(post.id);
      return next;
    });
    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? { ...p, _count: { likes: wasLiked ? p._count.likes - 1 : p._count.likes + 1 } }
        : p
    ));
    try {
      await api.post(`/groups/${group.id}/posts/${post.id}/like`);
    } catch {
      setLikedPosts(prev => {
        const next = new Set(prev);
        wasLiked ? next.add(post.id) : next.delete(post.id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        <div className="skeleton h-4 w-28 rounded-full mb-6" />
        <div className="skeleton h-32 rounded-2xl mb-6" />
        {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl mb-3" />)}
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Group not found</p>
        <Link href="/groups" className="text-sm font-semibold hover:underline" style={{ color: 'var(--eco-bright)' }}>
          ← Back to Groups
        </Link>
      </div>
    );
  }

  const cat = CAT_META[group.category];
  const canPost = isMember || user?.id === group.creator.id;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 animate-fade-in">

      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-faint)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}>
        <ArrowLeft className="w-4 h-4" /> Groups
      </button>

      {/* Group header */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
              {group.image
                ? <img src={group.image} alt={group.name} className="w-full h-full rounded-2xl object-cover" />
                : cat?.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{group.name}</h1>
                {group.privacy === 'PRIVATE' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)' }}>
                    🔒 Private
                  </span>
                )}
              </div>
              {cat && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}>
                  {cat.emoji} {cat.label}
                </span>
              )}
            </div>
          </div>

          {user?.id !== group.creator.id && (
            <button onClick={handleJoin} disabled={joining}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0"
              style={isMember
                ? { border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' }
                : { background: 'var(--eco)', color: '#050C07', border: '1px solid transparent' }}>
              {joining ? '…' : isMember ? 'Leave' : 'Join'}
            </button>
          )}
        </div>

        {group.description && (
          <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--text-muted)' }}>
            {group.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-faint)' }}>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{memberCount} members</span>
          <span>{group._count.posts} posts</span>
          <span>Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Post form */}
      {canPost ? (
        <form onSubmit={handlePost} className="mb-6">
          <div className="flex items-start gap-3">
            <UserAvatar name={user!.name} avatar={user!.avatar} size={36} />
            <div className="flex-1 relative">
              <textarea
                rows={3}
                placeholder={`Share something with ${group.name}…`}
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none pr-12 transition-all duration-200 focus:outline-none"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.08)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--input-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button type="submit" disabled={submitting || !postContent.trim()}
                className="absolute right-3 bottom-3 p-1.5 rounded-lg text-[#050C07] disabled:opacity-40 transition-all active:scale-95"
                style={{ background: 'var(--eco)' }}>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      ) : !user ? (
        <div className="rounded-xl px-5 py-4 text-sm text-center mb-6"
          style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--eco-bright)' }}>Sign in</Link>
          <span style={{ color: 'var(--text-muted)' }}> and join to post</span>
        </div>
      ) : (
        <div className="rounded-xl px-5 py-4 text-sm text-center mb-6"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          Join this group to post
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-faint)' }}>
            No posts yet. {canPost ? 'Be the first to post!' : 'Join to start posting.'}
          </div>
        ) : posts.map(post => (
          <div key={post.id} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start gap-3 mb-3">
              <UserAvatar name={post.author.name} avatar={post.author.avatar} size={36} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{post.author.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                    {user?.id === post.author.id && (
                      <button onClick={() => handleDeletePost(post.id)} className="transition-colors"
                        style={{ color: 'var(--text-faint)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-line mb-3" style={{ color: 'var(--text-muted)' }}>
              {post.content}
            </p>

            <button onClick={() => handleLike(post)}
              className="flex items-center gap-1.5 text-xs font-semibold transition-all"
              style={{ color: likedPosts.has(post.id) ? '#F87171' : 'var(--text-faint)' }}>
              <Heart className="w-4 h-4" style={{ fill: likedPosts.has(post.id) ? '#F87171' : 'none' }}
                strokeWidth={likedPosts.has(post.id) ? 0 : 1.8} />
              {post._count.likes + (likedPosts.has(post.id) ? 1 : 0)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
