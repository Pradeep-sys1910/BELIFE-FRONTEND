'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

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
  comments: { id: string; content: string; createdAt: string; author: { name: string } }[];
  _count: { likes: number };
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/blogs/${slug}`)
      .then(({ data }) => setBlog(data))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to comment'); return; }
    setSubmitting(true);
    try {
      await api.post(`/blogs/${blog?.id}/comments`, { content: comment });
      toast.success('Comment added!');
      setComment('');
      const { data } = await api.get(`/blogs/${slug}`);
      setBlog(data);
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-cream-50 flex items-center justify-center text-forest-500">Loading...</div>;
  if (!blog) return <div className="min-h-screen bg-cream-50 flex items-center justify-center"><div className="text-center"><p className="text-forest-700 text-xl font-serif mb-4">Blog not found</p><Link href="/blogs" className="btn-primary">Back to Blogs</Link></div></div>;

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="bg-white border-b border-cream-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-forest-700">BeLife</Link>
          <div className="flex items-center gap-4">
            <Link href="/blogs" className="text-forest-600 hover:text-forest-800 text-sm">All Blogs</Link>
            {user ? <Link href="/dashboard" className="btn-primary text-sm">Dashboard</Link> : <Link href="/login" className="btn-primary text-sm">Sign In</Link>}
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Category & Meta */}
        <div className="mb-6">
          <Link href={`/categories/${blog.category?.slug}`} className="text-xs text-forest-500 bg-cream-100 px-3 py-1 rounded-full hover:bg-cream-200 transition">
            {blog.category?.name}
          </Link>
        </div>

        <h1 className="font-serif text-4xl lg:text-5xl text-forest-700 leading-tight mb-6">{blog.title}</h1>

        <div className="flex items-center gap-4 text-sm text-forest-400 mb-8 pb-8 border-b border-cream-200">
          <span>By {blog.author?.name}</span>
          <span>·</span>
          <span>{blog.readTime} min read</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
          <span>·</span>
          <span>{blog.views} views</span>
        </div>

        {blog.image && (
          <img src={blog.image} alt={blog.title} className="w-full h-72 object-cover rounded-2xl mb-10" />
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none text-forest-700 leading-relaxed whitespace-pre-wrap mb-12">
          {blog.content}
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {blog.tags.map((tag) => (
              <span key={tag} className="text-xs bg-cream-100 text-forest-600 px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* Comments */}
        <div className="border-t border-cream-200 pt-10">
          <h2 className="font-serif text-2xl text-forest-700 mb-6">Comments ({blog.comments?.length || 0})</h2>

          {user && (
            <form onSubmit={submitComment} className="mb-8">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                required
                className="w-full px-4 py-3 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none mb-3"
              />
              <button type="submit" disabled={submitting} className="btn-primary text-sm">
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          )}

          {!user && (
            <p className="text-forest-500 text-sm mb-6"><Link href="/login" className="text-forest-700 underline">Sign in</Link> to leave a comment.</p>
          )}

          <div className="space-y-4">
            {blog.comments?.map((c) => (
              <div key={c.id} className="bg-white rounded-xl p-5 border border-cream-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-forest-700 text-sm">{c.author.name}</span>
                  <span className="text-xs text-forest-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-forest-600 text-sm">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
