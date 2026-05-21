'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface PublicUser {
  id: string;
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  readTime: number;
  createdAt: string;
  _count: { likes: number; comments: number };
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/users/${username}/profile`)
      .then(r => {
        setUser(r.data.user);
        setBlogs(r.data.blogs);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div className="max-w-[630px] mx-auto px-4 pt-12 pb-24 animate-pulse">
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="w-24 h-24 rounded-full bg-gray-200" />
        <div className="h-5 bg-gray-200 rounded w-40" />
        <div className="h-3 bg-gray-200 rounded w-56" />
      </div>
    </div>
  );

  if (notFound) return (
    <div className="max-w-[630px] mx-auto px-4 pt-24 pb-24 text-center">
      <div className="text-5xl mb-4">🌿</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
      <p className="text-sm text-gray-500 mb-6">This profile doesn't exist or may have been deleted.</p>
      <Link href="/" className="text-forest-600 text-sm hover:underline">← Back to Home</Link>
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-[630px] mx-auto px-4 pt-8 pb-24">

      {/* Profile header */}
      <header className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-10">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-[3px] bg-gradient-to-tr from-forest-400 to-forest-700 shrink-0">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
            : <div className="w-full h-full rounded-full bg-forest-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-white">
                {user.name[0].toUpperCase()}
              </div>
          }
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl font-semibold text-gray-900 mb-0.5">{user.name}</h1>
          {user.username && (
            <p className="text-sm text-gray-400 mb-3">@{user.username}</p>
          )}
          <ul className="flex gap-6 justify-center md:justify-start mb-3">
            <li className="text-sm">
              <span className="font-semibold text-gray-900">{blogs.length}</span>
              {' '}<span className="text-gray-500">posts</span>
            </li>
          </ul>
          {user.bio && (
            <p className="text-sm text-gray-700 whitespace-pre-line">{user.bio}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </p>
          {currentUser && currentUser.id !== user.id && (
            <button
              onClick={() => router.push(`/messages?with=${user.id}`)}
              className="mt-3 flex items-center gap-2 text-sm font-semibold text-forest-600 border border-forest-200 px-4 py-2 rounded-full hover:bg-forest-50 transition">
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
          )}
        </div>
      </header>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-6" />

      {/* Posts grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-sm font-medium">No posts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[3px]">
          {blogs.map(blog => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`}
              className="relative aspect-square bg-gray-100 overflow-hidden group">
              {blog.image
                ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : <div className="w-full h-full bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center">
                    <span className="text-3xl">🌿</span>
                  </div>
              }
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-semibold">
                <span>❤️ {blog._count.likes}</span>
                <span>💬 {blog._count.comments}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
