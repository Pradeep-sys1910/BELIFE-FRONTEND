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
    <nav className="hidden md:flex bg-white border-r border-gray-100 fixed left-0 top-0 h-screen w-[244px] flex-col py-6 px-3 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center px-2 pb-6">
        <Image src="/logo.png" alt="BeLife" width={160} height={60} className="object-contain" priority />
      </Link>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-0.5">
        {navItems.map(({ href, icon: Icon, label, auth }) => {
          if (auth && !user) return null;
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] group
                ${active
                  ? 'bg-forest-50 text-forest-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-normal'}`}>
              <Icon className={`w-5 h-5 transition-colors ${active ? 'text-forest-600' : 'text-gray-400 group-hover:text-gray-600'}`} strokeWidth={active ? 2 : 1.5} />
              <span className="text-sm">{label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-forest-500" />}
            </Link>
          );
        })}
      </div>

      {/* User section */}
      <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-gray-100">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                <span className="text-xs text-gray-400 truncate">{user.email}</span>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 text-sm w-full group">
              <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" strokeWidth={1.5} />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            <Link href="/register"
              className="w-full text-center bg-forest-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-700 transition-all duration-200 shadow-sm hover:shadow-md">
              Join BeLife
            </Link>
            <Link href="/login"
              className="w-full text-center text-forest-700 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-50 transition-all duration-200 border border-forest-200">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
