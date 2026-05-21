'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, MessageCircle, ArrowLeft, Clock, Eye, Share2 } from 'lucide-react';
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
  author: { name: string; avatar?: string; bio?: string };
  category: { name: string; slug: string };
  comments: { id: string; content: string; createdAt: string; author: { name: string; avatar?: string } }[];
  _count: { likes: number };
}

function Avatar({ name, avatar, size = 9 }: { name: string; avatar?: string; size?: number }) {
  if (avatar) return <img src={avatar} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white font-bold text-sm shrink-0`}>
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-8" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
        <div className="w-full aspect-video bg-gray-200 rounded-2xl mb-8" />
        {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200 rounded mb-3" />)}
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl font-serif text-gray-700 mb-2">Story not found</p>
          <p className="text-gray-400 text-sm mb-6">It may have been removed or the link is wrong.</p>
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
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-gray-200">·</span>
        <Link href={`/categories/${blog.category?.slug}`}
          className="text-xs font-medium text-forest-600 bg-forest-50 px-3 py-1 rounded-full hover:bg-forest-100 transition">
          {blog.category?.name}
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 leading-tight mb-5">
        {blog.title}
      </h1>

      {/* Excerpt */}
      {blog.excerpt && (
        <p className="text-base text-gray-500 leading-relaxed mb-6 font-normal">{blog.excerpt}</p>
      )}

      {/* Author + meta */}
      <div className="flex items-start justify-between gap-4 mb-7 pb-7 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar name={blog.author?.name} avatar={blog.author?.avatar} size={10} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{blog.author?.name}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 mt-0.5">
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition text-sm font-medium
              ${liked ? 'bg-red-50 text-red-500' : 'hover:bg-gray-50 text-gray-400 hover:text-red-400'}`}>
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} strokeWidth={liked ? 0 : 1.8} />
            <span>{likeCount}</span>
          </button>
          <button onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition">
            <Share2 className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Cover image */}
      {blog.image && (
        <div className="w-full rounded-2xl overflow-hidden aspect-video mb-8 bg-gray-100">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Markdown content */}
      <div className="prose prose-base prose-gray max-w-none mb-10
        prose-headings:font-serif prose-headings:text-gray-900
        prose-p:text-gray-700 prose-p:leading-relaxed
        prose-a:text-forest-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900
        prose-blockquote:border-forest-400 prose-blockquote:text-gray-500
        prose-code:bg-gray-100 prose-code:text-forest-700 prose-code:rounded prose-code:px-1
        prose-img:rounded-xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {blog.content}
        </ReactMarkdown>
      </div>

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 pb-8 border-b border-gray-100">
          {blog.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Author card */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Avatar name={blog.author?.name} avatar={blog.author?.avatar} size={11} />
          <div>
            <p className="font-semibold text-gray-900">{blog.author?.name}</p>
            <p className="text-xs text-gray-400">Author</p>
          </div>
        </div>
        {blog.author?.bio && <p className="text-sm text-gray-600 leading-relaxed">{blog.author.bio}</p>}
      </div>

      {/* Comments */}
      <div id="comments">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          {blog.comments?.length || 0} Comments
        </h2>

        {user ? (
          <form onSubmit={submitComment} className="mb-7">
            <div className="flex items-start gap-3">
              <Avatar name={user.name} avatar={user.avatar} size={8} />
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent resize-none transition"
                />
                <button type="submit" disabled={submitting}
                  className="mt-2 bg-forest-700 hover:bg-forest-800 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60">
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 rounded-xl px-5 py-4 mb-7 text-sm text-gray-500">
            <Link href="/login" className="text-forest-600 font-semibold hover:underline">Sign in</Link> to leave a comment.
          </div>
        )}

        <div className="space-y-4">
          {blog.comments?.map(c => (
            <div key={c.id} className="flex items-start gap-3">
              <Avatar name={c.author.name} avatar={c.author.avatar} size={8} />
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">{c.author.name}</span>
                  <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
