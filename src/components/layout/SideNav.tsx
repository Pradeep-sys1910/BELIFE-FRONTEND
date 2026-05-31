'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Compass, Tag, PenSquare, User, LogOut,
  MessageCircle, Settings, Users, UsersRound,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/',           icon: Home,        label: 'Home' },
  { href: '/blogs',      icon: Compass,     label: 'Explore' },
  { href: '/categories', icon: Tag,         label: 'Topics' },
  { href: '/forum',      icon: Users,       label: 'Forum' },
  { href: '/groups',     icon: UsersRound,  label: 'Groups' },
  { href: '/messages',   icon: MessageCircle, label: 'Messages', auth: true },
  { href: '/blogs/new',  icon: PenSquare,   label: 'Write',    auth: true },
  { href: '/dashboard',  icon: User,        label: 'Profile',  auth: true },
  { href: '/settings',   icon: Settings,    label: 'Settings', auth: true },
];

export default function SideNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <nav
      className="hidden md:flex fixed left-0 top-0 h-screen w-[244px] flex-col py-5 px-3 z-50"
      style={{ background: '#060D08', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center px-2 pb-6 group">
        <Image src="/logo.png" alt="BeLife" width={148} height={54} className="object-contain" priority />
      </Link>

      {/* Nav links */}
      <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto no-scrollbar">
        {navItems.map(({ href, icon: Icon, label, auth }) => {
          if (auth && !user) return null;
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.97] group relative"
              style={{
                background:  active ? 'rgba(34,197,94,0.10)' : undefined,
                color:       active ? '#4ADE80' : '#5A7860',
              }}
            >
              {/* Hover layer */}
              <span
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: active ? undefined : 'rgba(255,255,255,0.04)' }}
                aria-hidden
              />

              <Icon
                className="w-5 h-5 relative z-10 transition-colors duration-200"
                style={{ color: active ? '#4ADE80' : undefined }}
                strokeWidth={active ? 2.2 : 1.6}
              />
              <span
                className="text-sm font-medium relative z-10 transition-colors duration-200 group-hover:text-[#DFF0E3]"
                style={{ color: active ? '#4ADE80' : undefined }}
              >
                {label}
              </span>
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full relative z-10"
                  style={{ background: '#4ADE80', boxShadow: '0 0 6px rgba(74,222,128,0.6)' }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* User section */}
      <div
        className="flex flex-col gap-1 mt-2 pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              {user.avatar ? (
                <img
                  src={user.avatar} alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  style={{ border: '1px solid rgba(74,222,128,0.3)' }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #22C55E 0%, #0F4C25 100%)' }}
                >
                  {user.name[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate" style={{ color: '#DFF0E3' }}>
                  {user.name}
                </span>
                <span className="text-xs truncate" style={{ color: '#3A5640' }}>
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm w-full group"
              style={{ color: '#3A5640' }}
            >
              <span
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'rgba(239,68,68,0.07)' }}
                aria-hidden
              />
              <LogOut
                className="w-4 h-4 relative z-10 transition-colors duration-200 group-hover:text-red-400"
                strokeWidth={1.5}
              />
              <span className="relative z-10 transition-colors duration-200 group-hover:text-red-400">
                Log out
              </span>
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            <Link
              href="/register"
              className="w-full text-center py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95"
              style={{ background: '#22C55E', color: '#050C07' }}
            >
              Join BeLife
            </Link>
            <Link
              href="/login"
              className="w-full text-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                color:  '#4ADE80',
                border: '1px solid rgba(74,222,128,0.18)',
              }}
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
