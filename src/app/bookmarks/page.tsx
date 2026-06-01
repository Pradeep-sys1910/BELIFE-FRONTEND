'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, Heart, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Blog {
  id: string; title: string; slug: string; excerpt: string; image?: string;
  readTime: number; createdAt: string;
  author:   { name: string; username?: string; avatar?: string };
  category: { name: string; slug: string } | null;
  _count:   { likes: number; comments: number };
}

export default function BookmarksPage() {
  const router   = useRouter();
  const { user } = useAuthStore();
  const [blogs,   setBlogs]   = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/bookmarks')
      .then(r => setBlogs((r.data as any).bookmarks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const removeBookmark = async (blogId: string) => {
    await api.post(`/blogs/${blogId}/bookmark`).catch(() => {});
    setBlogs(b => b.filter(x => x.id !== blogId));
  };

  if (!user) return null;

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-8 pb-24">
      <div className="flex items-center gap-3 mb-7">
        <Bookmark className="w-5 h-5" style={{ color: 'var(--eco-bright)' }} />
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Saved Posts</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex gap-3">
                <div className="skeleton w-20 h-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-full" />
                  <div className="skeleton h-3 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-faint)' }} />
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>No saved posts yet</p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-faint)' }}>Tap the bookmark icon on any post to save it here.</p>
          <Link href="/" className="text-sm font-semibold" style={{ color: 'var(--eco-bright)' }}>Browse posts →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map(blog => (
            <div key={blog.id} className="rounded-2xl p-4 transition-all duration-200"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex gap-3">
                {blog.image && (
                  <Link href={`/blogs/${blog.slug}`}>
                    <img src={blog.image} alt={blog.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/blogs/${blog.slug}`}>
                    <h2 className="text-sm font-semibold leading-snug line-clamp-2 mb-1"
                      style={{ color: 'var(--text)' }}>{blog.title}</h2>
                    {blog.excerpt && (
                      <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>{blog.excerpt}</p>
                    )}
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-faint)' }}>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{blog._count.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{blog._count.comments}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime}m</span>
                    </div>
                    <button onClick={() => removeBookmark(blog.id)}
                      className="p-1.5 rounded-full transition-colors"
                      style={{ color: '#4ADE80' }}
                      title="Remove bookmark">
                      <Bookmark className="w-4 h-4" style={{ fill: '#4ADE80' }} strokeWidth={0} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
