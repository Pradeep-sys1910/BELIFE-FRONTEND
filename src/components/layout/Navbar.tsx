'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/dashboard">
          <Image src="/logo.png" alt="BeLife" width={140} height={52} className="object-contain" priority />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          <Link href="/" className="text-forest-700 font-medium border-b-2 border-forest-600 pb-1">Home</Link>
          <Link href="/blogs" className="text-forest-700 hover:text-forest-500 transition">Blog</Link>
          <Link href="/categories" className="text-forest-700 hover:text-forest-500 transition">Categories</Link>
          <Link href="/about" className="text-forest-700 hover:text-forest-500 transition">About</Link>
          <Link href="/contact" className="text-forest-700 hover:text-forest-500 transition">Contact</Link>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button className="p-2 hover:bg-cream-100 rounded-full transition">
            <Search className="w-5 h-5 text-forest-700" />
          </button>
          {user ? (
            <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2.5 border border-forest-700 rounded-lg text-forest-700 hover:bg-forest-700 hover:text-cream-50 transition">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary">Subscribe</Link>
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden">
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-cream-50 border-t border-cream-200 px-6 py-6 space-y-4">
          <Link href="/" className="block">Home</Link>
          <Link href="/blogs" className="block">Blog</Link>
          <Link href="/categories" className="block">Categories</Link>
          <Link href="/about" className="block">About</Link>
          <Link href="/login" className="block btn-primary text-center">Sign In</Link>
        </div>
      )}
    </nav>
  );
}