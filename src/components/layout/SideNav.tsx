'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, Tag, PenSquare, User, LogOut, MessageCircle, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/blogs', icon: Compass, label: 'Explore' },
  { href: '/categories', icon: Tag, label: 'Topics' },
  { href: '/messages', icon: MessageCircle, label: 'Messages', auth: true },
  { href: '/blogs/new', icon: PenSquare, label: 'Write', auth: true },
  { href: '/dashboard', icon: User, label: 'Profile', auth: true },
  { href: '/settings', icon: Settings, label: 'Settings', auth: true },
];

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <nav className="hidden md:flex bg-white border-r border-gray-200 fixed left-0 top-0 h-screen w-[244px] flex-col py-8 px-4 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center px-3 pb-8">
        <Image src="/logo.png" alt="BeLife" width={160} height={60} className="object-contain" priority />
      </Link>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-1">
        {navItems.map(({ href, icon: Icon, label, auth }) => {
          if (auth && !user) return null;
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-200 active:scale-95
                ${active ? 'font-bold text-gray-900' : 'font-normal text-gray-700 hover:bg-gray-50'}`}>
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* User section */}
      <div className="flex flex-col gap-1 mt-auto">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                <span className="text-xs text-gray-500 truncate">{user.email}</span>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-4 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-all duration-200 text-sm w-full">
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 px-2">
            <Link href="/register"
              className="w-full text-center bg-forest-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-forest-700 transition">
              Join BeLife
            </Link>
            <Link href="/login"
              className="w-full text-center text-forest-600 py-2 rounded-lg text-sm font-medium hover:bg-forest-50 transition border border-forest-200">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
