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

const CAT_META: Record<string, { label: string; emoji: string; color: string }> = {
  GENERAL:           { label: 'General',          emoji: '💬', color: 'bg-gray-100 text-gray-600' },
  QUESTIONS:         { label: 'Questions',         emoji: '❓', color: 'bg-blue-50 text-blue-600' },
  ZERO_WASTE:        { label: 'Zero Waste',        emoji: '♻️', color: 'bg-emerald-50 text-emerald-700' },
  CLIMATE:           { label: 'Climate',           emoji: '🌡️', color: 'bg-orange-50 text-orange-700' },
  PLANT_BASED:       { label: 'Plant-Based',       emoji: '🌱', color: 'bg-green-50 text-green-700' },
  ACTIVISM:          { label: 'Activism',          emoji: '✊', color: 'bg-purple-50 text-purple-700' },
  SUSTAINABLE_LIVING:{ label: 'Sustainable Living',emoji: '🏡', color: 'bg-forest-50 text-forest-700' },
};

function UserAvatar({ name, avatar, size = 36 }: { name: string; avatar?: string; size?: number }) {
  const s = { width: size, height: size, borderRadius: '50%' };
  if (avatar) return <img src={avatar} alt={name} style={{ ...s, objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{ ...s, flexShrink: 0 }} className="bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white font-bold text-sm">
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
  const [memberRole, setMemberRole] = useState<string | null>(null);
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
      setMemberRole(data.role);
    } catch {}
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (group) loadMembership(group.id);
  }, [group, loadMembership]);

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
    if (!user || !group) return;
    if (!postContent.trim()) return;
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
        <p className="text-gray-500 text-sm">Group not found</p>
        <Link href="/groups" className="text-forest-700 text-sm font-semibold hover:underline">← Back to Groups</Link>
      </div>
    );
  }

  const cat = CAT_META[group.category];
  const canPost = isMember || user?.id === group.creator.id;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 animate-fade-in">

      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Groups
      </button>

      {/* Group header */}
      <div className="border border-gray-100 rounded-2xl p-6 mb-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-forest-100 to-forest-200 flex items-center justify-center text-3xl shrink-0">
              {group.image
                ? <img src={group.image} alt={group.name} className="w-full h-full rounded-2xl object-cover" />
                : cat?.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
                {group.privacy === 'PRIVATE' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">🔒 Private</span>
                )}
              </div>
              {cat && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.color}`}>
                  {cat.emoji} {cat.label}
                </span>
              )}
            </div>
          </div>

          {user?.id !== group.creator.id && (
            <button onClick={handleJoin} disabled={joining}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 shrink-0
                ${isMember
                  ? 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                  : 'bg-forest-800 text-white border-forest-800 hover:bg-forest-900'}`}>
              {joining ? '…' : isMember ? 'Leave' : 'Join'}
            </button>
          )}
        </div>

        {group.description && (
          <p className="text-sm text-gray-600 leading-relaxed mt-4">{group.description}</p>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 focus:bg-white transition-all duration-200 resize-none pr-12"
              />
              <button type="submit" disabled={submitting || !postContent.trim()}
                className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-forest-800 hover:bg-forest-900 text-white disabled:opacity-40 transition-all active:scale-95">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      ) : !user ? (
        <div className="bg-forest-50 border border-forest-100 rounded-xl px-5 py-4 text-sm text-center mb-6">
          <Link href="/login" className="text-forest-700 font-semibold hover:underline">Sign in</Link>
          <span className="text-gray-500"> and join to post</span>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm text-center mb-6 text-gray-500">
          Join this group to post
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No posts yet. {canPost ? 'Be the first to post!' : 'Join to start posting.'}
          </div>
        ) : posts.map(post => (
          <div key={post.id} className="border border-gray-100 rounded-2xl p-5 shadow-card">
            <div className="flex items-start gap-3 mb-3">
              <UserAvatar name={post.author.name} avatar={post.author.avatar} size={36} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                    {user?.id === post.author.id && (
                      <button onClick={() => handleDeletePost(post.id)} className="text-gray-300 hover:text-red-400 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">{post.content}</p>

            <button onClick={() => handleLike(post)}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-all
                ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
              <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-red-500' : ''}`} strokeWidth={likedPosts.has(post.id) ? 0 : 1.8} />
              {post._count.likes + (likedPosts.has(post.id) ? 1 : 0)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
