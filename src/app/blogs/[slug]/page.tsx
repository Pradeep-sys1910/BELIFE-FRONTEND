'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, MessageCircle, ArrowLeft, Clock, Eye, Share2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  readTime: number;
  views: number;
  tags: string[];
  createdAt: string;
  author: { id: string; name: string; avatar?: string; bio?: string };
  category: { name: string; slug: string };
  comments: { id: string; content: string; createdAt: string; author: { id: string; name: string; avatar?: string } }[];
  _count: { likes: number };
}

function Avatar({ name, avatar, size = 36 }: { name: string; avatar?: string; size?: number }) {
  const s = { width: size, height: size, borderRadius: '50%' };
  if (avatar) return <img src={avatar} alt={name} style={{ ...s, objectFit: 'cover' }} />;
  return (
    <div style={{ ...s, background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
      className="flex items-center justify-center text-white font-bold text-sm shrink-0">
      {name[0].toUpperCase()}
    </div>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    api.get(`/blogs/${slug}`)
      .then(({ data }) => {
        setBlog(data);
        setLikeCount(data._count.likes);
      })
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (!user) { router.push('/login'); return; }
    if (liking || !blog) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(n => wasLiked ? n - 1 : n + 1);
    setLiking(true);
    try {
      const { data } = await api.post(`/blogs/${blog.id}/like`);
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch {
      setLiked(wasLiked);
      setLikeCount(n => wasLiked ? n + 1 : n - 1);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: blog?.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to comment'); return; }
    setSubmitting(true);
    try {
      await api.post(`/blogs/${blog?.id}/comments`, { content: comment });
      setComment('');
      const { data } = await api.get(`/blogs/${slug}`);
      setBlog(data);
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/blogs/${blog!.id}`);
      toast.success('Post deleted');
      router.push('/');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/blogs/${blog!.id}/comments/${commentId}`);
      setBlog(prev => prev ? { ...prev, comments: prev.comments.filter(c => c.id !== commentId) } : prev);
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        <div className="skeleton h-4 w-28 rounded-full mb-8" />
        <div className="skeleton h-9 w-4/5 rounded-lg mb-3" />
        <div className="skeleton h-9 w-2/3 rounded-lg mb-5" />
        <div className="skeleton h-5 w-full rounded-lg mb-2" />
        <div className="skeleton h-5 w-4/5 rounded-lg mb-7" />
        <div className="flex items-center gap-3 mb-7 pb-7" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="skeleton w-11 h-11 rounded-full shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-4 w-36 rounded mb-2" />
            <div className="skeleton h-3 w-52 rounded" />
          </div>
        </div>
        <div className="skeleton w-full aspect-video rounded-2xl mb-8" />
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className={`skeleton h-4 rounded mb-3 ${i % 4 === 0 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl font-serif mb-2" style={{ color: 'var(--text)' }}>Story not found</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-faint)' }}>It may have been removed or the link is wrong.</p>
          <Link href="/" className="btn-primary">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-2xl mx-auto px-4 pt-6 pb-28 md:pb-12">

      {/* Back + category */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm transition"
          style={{ color: 'var(--text-faint)' }}>
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span style={{ color: 'var(--border)' }}>·</span>
        <Link href={`/categories/${blog.category?.slug}`}
          className="text-xs font-medium px-3 py-1 rounded-full transition"
          style={{ color: 'var(--eco-bright)', background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
          {blog.category?.name}
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight mb-5"
        style={{ color: 'var(--text)' }}>
        {blog.title}
      </h1>

      {/* Excerpt */}
      {blog.excerpt && (
        <p className="text-base leading-relaxed mb-6 font-normal" style={{ color: 'var(--text-muted)' }}>{blog.excerpt}</p>
      )}

      {/* Author + meta */}
      <div className="flex items-start justify-between gap-4 mb-7 pb-7"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <Avatar name={blog.author?.name} avatar={blog.author?.avatar} size={40} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{blog.author?.name}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs mt-0.5"
              style={{ color: 'var(--text-faint)' }}>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime} min read</span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.views} views</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleLike}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full transition text-sm font-medium"
            style={{ color: liked ? '#F87171' : 'var(--text-faint)', background: liked ? 'rgba(248,113,113,0.1)' : 'transparent' }}>
            <Heart className="w-5 h-5" style={{ fill: liked ? '#F87171' : 'none' }} strokeWidth={liked ? 0 : 1.8} />
            <span>{likeCount}</span>
          </button>
          <button onClick={handleShare}
            className="p-2 rounded-full transition"
            style={{ color: 'var(--text-faint)' }}>
            <Share2 className="w-5 h-5" strokeWidth={1.8} />
          </button>
          {user?.id === blog.author?.id && (
            <button onClick={handleDeleteBlog}
              className="p-2 rounded-full transition"
              style={{ color: 'var(--text-faint)' }}>
              <Trash2 className="w-5 h-5" strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      {/* Cover image */}
      {blog.image && (
        <div className="w-full rounded-2xl overflow-hidden aspect-video mb-8"
          style={{ background: 'var(--bg-elevated)' }}>
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Markdown content */}
      <div className="prose prose-base max-w-none mb-10
        prose-headings:font-serif
        prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-4
        prose-code:rounded prose-code:px-1
        prose-img:rounded-xl"
        style={{ color: 'var(--text)' } as React.CSSProperties}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {blog.content}
        </ReactMarkdown>
      </div>

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          {blog.tags.map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author card */}
      <div className="rounded-2xl p-6 mb-10"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--text-faint)' }}>Written by</p>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-full p-[2px] shrink-0"
            style={{ background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}>
            {blog.author?.avatar
              ? <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
              : <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white"
                  style={{ background: '#0F4C25' }}>
                  {blog.author?.name[0].toUpperCase()}
                </div>
            }
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>{blog.author?.name}</p>
            {blog.author?.bio && (
              <p className="text-sm mt-0.5 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {blog.author.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div id="comments">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <MessageCircle className="w-5 h-5" style={{ color: 'var(--text-faint)' }} strokeWidth={1.5} />
          {blog.comments?.length || 0} Comments
        </h2>

        {user ? (
          <form onSubmit={submitComment} className="mb-7">
            <div className="flex items-start gap-3">
              <Avatar name={user.name} avatar={user.avatar} size={32} />
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <button type="submit" disabled={submitting}
                  className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60"
                  style={{ background: 'var(--eco)', color: '#050C07' }}>
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-xl px-5 py-4 mb-7 text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--eco-bright)' }}>Sign in</Link> to leave a comment.
          </div>
        )}

        <div className="space-y-4">
          {blog.comments?.map(c => (
            <div key={c.id} className="flex items-start gap-3">
              <Avatar name={c.author.name} avatar={c.author.avatar} size={32} />
              <div className="flex-1 rounded-xl px-4 py-3"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{c.author.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                    {user?.id === c.author.id && (
                      <button onClick={() => handleDeleteComment(c.id)} className="transition"
                        style={{ color: 'var(--text-faint)' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
