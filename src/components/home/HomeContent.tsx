'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Bookmark, Send, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  readTime: number;
  createdAt: string;
  author: { name: string; avatar?: string };
  category: { name: string; slug: string };
  _count: { likes: number; comments: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

function Avatar({ name, avatar, size = 8 }: { name: string; avatar?: string; size?: number }) {
  if (avatar) {
    return <img src={avatar} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />;
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white font-bold text-sm shrink-0`}>
      {name[0].toUpperCase()}
    </div>
  );
}

function PostCard({ blog }: { blog: Blog }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(blog._count.likes);

  const handleLike = () => {
    if (!user) { router.push('/login'); return; }
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
  };

  const handleSave = () => {
    if (!user) { router.push('/login'); return; }
    setSaved(s => !s);
  };

  return (
    <article className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link href={`/profile/${blog.author.name}`} className="flex items-center gap-2.5 group">
          <Avatar name={blog.author.name} avatar={blog.author.avatar} size={9} />
          <div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-forest-600 transition leading-tight">{blog.author.name}</p>
            <p className="text-xs text-gray-400">
              <Link href={`/categories/${blog.category.slug}`} className="hover:text-forest-500 transition">{blog.category.name}</Link>
              {' · '}{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        <button className="text-gray-300 hover:text-gray-500 transition p-1 rounded-full hover:bg-gray-50">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      {blog.image && (
        <Link href={`/blogs/${blog.slug}`}>
          <div className="w-full overflow-hidden bg-gray-100 aspect-[16/9]">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
            />
          </div>
        </Link>
      )}

      {/* Title + excerpt */}
      <div className="px-4 pt-3 pb-2">
        <Link href={`/blogs/${blog.slug}`}>
          <h2 className="text-base font-semibold text-gray-900 leading-snug hover:text-forest-700 transition line-clamp-2 mb-1">
            {blog.title}
          </h2>
          {blog.excerpt && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
          )}
        </Link>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between px-4 pb-4 pt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-red-50 transition group"
          >
            <Heart
              className={`w-5 h-5 transition group-hover:text-red-500 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              strokeWidth={liked ? 0 : 1.8}
            />
            <span className={`text-xs font-medium ${liked ? 'text-red-500' : 'text-gray-400'}`}>{likes > 0 ? likes : ''}</span>
          </button>
          <Link
            href={`/blogs/${blog.slug}#comments`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-forest-50 transition group"
          >
            <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-forest-600 transition" strokeWidth={1.8} />
            <span className="text-xs font-medium text-gray-400 group-hover:text-forest-600">
              {blog._count.comments > 0 ? blog._count.comments : ''}
            </span>
          </Link>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-forest-50 transition group">
            <Send className="w-5 h-5 text-gray-400 group-hover:text-forest-600 transition" strokeWidth={1.8} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300">{blog.readTime} min read</span>
          <button onClick={handleSave} className="flex items-center px-2.5 py-1.5 rounded-full hover:bg-forest-50 transition group">
            <Bookmark
              className={`w-5 h-5 transition group-hover:text-forest-600 ${saved ? 'fill-forest-600 text-forest-600' : 'text-gray-400'}`}
              strokeWidth={saved ? 0 : 1.8}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-5 animate-pulse">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-28 mb-1.5" />
          <div className="h-2 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="w-full aspect-[16/9] bg-gray-200" />
      <div className="px-4 pt-3 pb-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-full mb-1" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function HomeContent() {
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/blogs', { params: { limit: 10 } }).catch(() => ({ data: { blogs: [] } })),
      api.get('/categories').catch(() => ({ data: [] })),
    ]).then(([blogsRes, catsRes]) => {
      setBlogs(blogsRes.data.blogs || []);
      setCategories(catsRes.data.slice(0, 12));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[630px] mx-auto px-4 pt-6 pb-12">

      {/* Stories / Category scroll */}
      {categories.length > 0 && (
        <div className="relative mb-6">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
                <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-forest-400 to-forest-600 group-hover:from-forest-500 group-hover:to-forest-700 transition-all duration-200">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl">
                    {cat.icon}
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium truncate w-16 text-center group-hover:text-forest-600 transition">
                  {cat.name.split(' ')[0]}
                </span>
              </Link>
            ))}
          </div>
          {/* Right fade to indicate more items */}
          <div className="absolute top-0 right-0 h-[calc(100%-12px)] w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 mb-6" />

      {/* Feed */}
      {loading ? (
        <div>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Be the first to share a story about sustainable living, eco tips, or green inspiration.
          </p>
          {user ? (
            <Link href="/blogs/new" className="btn-primary">Write a Story</Link>
          ) : (
            <Link href="/register" className="btn-primary">Join & Write</Link>
          )}
        </div>
      ) : (
        <>
          {blogs.map(blog => <PostCard key={blog.id} blog={blog} />)}
          <div className="text-center pt-4 pb-8">
            <Link href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-forest-600 hover:text-forest-700 border border-forest-200 hover:border-forest-400 px-6 py-2.5 rounded-full transition-all duration-200">
              Explore all stories
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
