'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Compass, Search, Tag, PenSquare, User, LogOut,
  MessageCircle, Settings, Users, UsersRound,
  Bell, Lightbulb, Megaphone, Trophy, Bookmark,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const navItems = [
  { href: '/',               icon: Home,          label: 'Home' },
  { href: '/blogs',          icon: Compass,       label: 'Explore' },
  { href: '/search',         icon: Search,        label: 'Search' },
  { href: '/thoughts',       icon: Lightbulb,     label: 'Thoughts' },
  { href: '/categories',     icon: Tag,           label: 'Topics' },
  { href: '/forum',          icon: Users,         label: 'Forum' },
  { href: '/groups',         icon: UsersRound,    label: 'Groups' },
  { href: '/campaigns',      icon: Megaphone,     label: 'Campaigns' },
  { href: '/challenges',     icon: Trophy,        label: 'Challenges' },
  { href: '/bookmarks',      icon: Bookmark,      label: 'Saved',          auth: true },
  { href: '/notifications',  icon: Bell,          label: 'Notifications',  auth: true, badge: 'notifs' },
  { href: '/messages',       icon: MessageCircle, label: 'Messages',       auth: true, badge: 'msgs' },
  { href: '/blogs/new',      icon: PenSquare,     label: 'Write',          auth: true },
  { href: '/dashboard',      icon: User,          label: 'Profile',        auth: true },
  { href: '/settings',       icon: Settings,      label: 'Settings',       auth: true },
] as const;

export default function SideNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs,   setUnreadMsgs]   = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCounts = () => {
      api.get('/notifications/unread-count').then(r => setUnreadNotifs((r.data as any).count || 0)).catch(() => {});
      api.get('/messages').then(r => {
        const convs = r.data as { lastMessage?: { isRead: boolean; isMine: boolean } }[];
        setUnreadMsgs(convs.filter(c => c.lastMessage && !c.lastMessage.isRead && !c.lastMessage.isMine).length);
      }).catch(() => {});
    };
    fetchCounts();
    const t = setInterval(fetchCounts, 30_000);
    window.addEventListener('belife:unread-refresh', fetchCounts);
    return () => { clearInterval(t); window.removeEventListener('belife:unread-refresh', fetchCounts); };
  }, [user]);

  return (
    <nav
      className="hidden md:flex fixed left-0 top-0 h-screen w-[244px] flex-col py-5 px-3 z-50"
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center px-2 pb-5">
        <Image src="/logo.png" alt="BeLife" width={160} height={66} className="object-contain" priority />
      </Link>

      {/* Nav links */}
      <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto no-scrollbar">
        {navItems.map(({ href, icon: Icon, label, ...rest }) => {
          const auth  = (rest as any).auth;
          const badge = (rest as any).badge as 'notifs' | 'msgs' | undefined;
          if (auth && !user) return null;
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          const count  = badge === 'notifs' ? unreadNotifs : badge === 'msgs' ? unreadMsgs : 0;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.97] group relative"
              style={{
                background: active ? 'var(--eco-dim)'    : undefined,
                color:      active ? 'var(--eco-bright)' : 'var(--text-muted)',
              }}
            >
              <span
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: active ? undefined : 'var(--bg-hover)' }}
                aria-hidden
              />
              <span className="relative z-10">
                <Icon
                  className="w-5 h-5 transition-colors duration-200"
                  style={{ color: active ? 'var(--eco-bright)' : undefined }}
                  strokeWidth={active ? 2.2 : 1.6}
                />
                {count > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                    style={{ background: '#22C55E', color: '#050C07' }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </span>
              <span
                className="text-sm font-medium relative z-10 transition-colors duration-200 group-hover:text-[var(--text)]"
                style={{ color: active ? 'var(--eco-bright)' : undefined }}
              >
                {label}
              </span>
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full relative z-10"
                  style={{ background: 'var(--eco-bright)', boxShadow: '0 0 6px var(--eco)' }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Theme toggle */}
      <div className="mt-2 mb-2 px-1">
        <ThemeToggle />
      </div>

      {/* User section */}
      <div className="flex flex-col gap-1 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  style={{ border: '1.5px solid var(--eco-dim)' }} />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #22C55E 0%, #0F4C25 100%)' }}
                >
                  {user.name[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                  {user.name}
                </span>
                <span className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => { logout(); router.push('/'); }}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm w-full group"
              style={{ color: 'var(--text-faint)' }}
            >
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'rgba(239,68,68,0.07)' }} aria-hidden />
              <LogOut className="w-4 h-4 relative z-10 group-hover:text-red-400 transition-colors" strokeWidth={1.5} />
              <span className="relative z-10 group-hover:text-red-400 transition-colors">Log out</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            <Link href="/register"
              className="w-full text-center py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95"
              style={{ background: 'var(--eco)', color: '#050C07' }}>
              Join BeLife
            </Link>
            <Link href="/login"
              className="w-full text-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}>
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
