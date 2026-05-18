'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Bookmark, Send, MoreHorizontal, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';

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

const TRENDING_TOPICS = [
  { name: 'Zero Waste', slug: 'zero-waste' },
  { name: 'Sustainable Food', slug: 'sustainable-food' },
  { name: 'Climate Action', slug: 'climate-action' },
  { name: 'Green Home', slug: 'green-home' },
  { name: 'Eco Travel', slug: 'eco-travel' },
];

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
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(blog._count.likes);

  const handleLike = () => {
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
  };

  return (
    <article className="border-b border-gray-200 pb-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Avatar name={blog.author.name} avatar={blog.author.avatar} size={8} />
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{blog.author.name}</p>
            <p className="text-xs text-gray-500">
              {blog.category.name} · {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      {blog.image && (
        <Link href={`/blogs/${blog.slug}`}>
          <div className="w-full rounded-sm overflow-hidden bg-gray-100 aspect-[4/3] mb-3">
            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
          </div>
        </Link>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="text-gray-700 hover:text-red-500 transition active:scale-125 duration-150">
            <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} strokeWidth={liked ? 0 : 1.5} />
          </button>
          <Link href={`/blogs/${blog.slug}#comments`} className="text-gray-700 hover:text-forest-600 transition">
            <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
          </Link>
          <button className="text-gray-700 hover:text-forest-600 transition">
            <Send className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
        <button onClick={() => setSaved(s => !s)} className="text-gray-700 hover:text-forest-600 transition">
          <Bookmark className={`w-6 h-6 ${saved ? 'fill-forest-600 text-forest-600' : ''}`} strokeWidth={saved ? 0 : 1.5} />
        </button>
      </div>

      {/* Likes */}
      <p className="text-sm font-semibold text-gray-900 mb-1">{likes.toLocaleString()} likes</p>

      {/* Caption */}
      <div className="text-sm text-gray-900">
        <span className="font-semibold mr-1">{blog.author.name}</span>
        <Link href={`/blogs/${blog.slug}`} className="text-gray-700 hover:text-forest-600 transition line-clamp-2">
          {blog.title}
        </Link>
      </div>

      {/* Comments preview */}
      {blog._count.comments > 0 && (
        <Link href={`/blogs/${blog.slug}#comments`} className="text-sm text-gray-400 mt-1 block hover:text-gray-600 transition">
          View all {blog._count.comments} comments
        </Link>
      )}

      {/* Read time */}
      <p className="text-xs text-gray-400 mt-1">{blog.readTime} min read</p>
    </article>
  );
}

export default function HomeContent() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/blogs', { params: { limit: 10 } }).catch(() => ({ data: { blogs: [] } })),
      api.get('/categories').catch(() => ({ data: [] })),
    ]).then(([blogsRes, catsRes]) => {
      setBlogs(blogsRes.data.blogs || []);
      setCategories(catsRes.data.slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex justify-center min-h-screen bg-white">
      {/* Feed column */}
      <div className="w-full max-w-[630px] px-4 pt-6">

        {/* Stories / Category scroll */}
        {categories.length > 0 && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mb-4 border-b border-gray-200">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-forest-400 to-forest-600">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl border-2 border-white">
                    {cat.icon}
                  </div>
                </div>
                <span className="text-xs text-gray-700 font-medium truncate w-16 text-center group-hover:text-forest-600 transition">
                  {cat.name.split(' ')[0]}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse border-b border-gray-200 pb-6 mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-24 mb-1" />
                    <div className="h-2 bg-gray-200 rounded w-16" />
                  </div>
                </div>
                <div className="w-full aspect-[4/3] bg-gray-200 rounded mb-3" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-2">No stories yet</p>
            <p className="text-sm mb-4">Be the first to share a sustainable story!</p>
            <Link href="/blogs/new" className="btn-primary">Write a Story</Link>
          </div>
        ) : (
          <div>
            {blogs.map(blog => <PostCard key={blog.id} blog={blog} />)}
            <div className="text-center py-8">
              <Link href="/blogs" className="text-sm font-semibold text-forest-600 hover:underline">
                View all stories →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar — desktop only */}
      <aside className="hidden lg:block w-[320px] pt-6 px-6 sticky top-0 h-screen overflow-y-auto shrink-0">
        {/* Trending topics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-forest-500" />
              Trending Topics
            </span>
            <Link href="/categories" className="text-xs font-semibold text-forest-600 hover:underline">See all</Link>
          </div>
          <div className="flex flex-col gap-2">
            {TRENDING_TOPICS.map(topic => (
              <Link key={topic.slug} href={`/categories/${topic.slug}`}
                className="flex items-center justify-between py-1.5 hover:text-forest-600 transition group">
                <span className="text-sm text-gray-900 group-hover:text-forest-600">{topic.name}</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div className="text-xs text-gray-400 leading-relaxed">
          <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2">
            <Link href="/blogs" className="hover:underline">Explore</Link>
            <span>·</span>
            <Link href="/categories" className="hover:underline">Topics</Link>
            <span>·</span>
            <Link href="/register" className="hover:underline">Join</Link>
            <span>·</span>
            <Link href="/dashboard" className="hover:underline">Profile</Link>
          </div>
          <p>© {new Date().getFullYear()} BeLife · Made for the planet 🌍</p>
        </div>
      </aside>
    </div>
  );
}
