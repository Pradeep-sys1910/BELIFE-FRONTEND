'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, PlusSquare, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

export default function TopNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/blogs?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <header className="top-nav">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="shrink-0">
          <Image src="/logo.png" alt="BeLife" width={100} height={36} className="object-contain" priority />
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-auto hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories..."
              className="w-full pl-9 pr-4 py-2 bg-cream-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Link href="/blogs/new" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-forest-600 transition px-2 py-1.5 rounded-lg hover:bg-forest-50">
                <PlusSquare className="w-5 h-5" />
                <span>New Post</span>
              </Link>
              <Link href="/dashboard">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white text-sm font-bold">
                  {user.name[0].toUpperCase()}
                </div>
              </Link>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition hidden md:block">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-forest-600 transition px-3 py-1.5">Sign In</Link>
              <Link href="/register" className="btn-primary text-sm">Join Us</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
