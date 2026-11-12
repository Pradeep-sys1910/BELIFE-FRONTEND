'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Compass, Search, Tag, PenSquare, User, LogOut,
  MessageCircle, Settings, Users, UsersRound,
  Bell, Lightbulb, Megaphone, Trophy, Bookmark,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  auth?: boolean;
  badge?: 'notifs' | 'msgs';
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { href: '/', icon: Home, label: 'Home' },
      { href: '/blogs', icon: Compass, label: 'Explore' },
      { href: '/blogs/new', icon: PenSquare, label: 'Create', auth: true },
    ],
  },
  {
    label: 'Discover',
    items: [
      { href: '/search', icon: Search, label: 'Search' },
      { href: '/categories', icon: Tag, label: 'Topics' },
      { href: '/thoughts', icon: Lightbulb, label: 'Thoughts' },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/forum', icon: Users, label: 'Forum' },
      { href: '/groups', icon: UsersRound, label: 'Groups' },
      { href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
      { href: '/challenges', icon: Trophy, label: 'Challenges' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { href: '/bookmarks', icon: Bookmark, label: 'Saved', auth: true },
      { href: '/notifications', icon: Bell, label: 'Notifications', auth: true, badge: 'notifs' },
      { href: '/messages', icon: MessageCircle, label: 'Messages', auth: true, badge: 'msgs' },
      { href: '/dashboard', icon: User, label: 'Profile', auth: true },
      { href: '/settings', icon: Settings, label: 'Settings', auth: true },
    ],
  },
];

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
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar">
        {navGroups.map(({ label: groupLabel, items }) => {
          const visibleItems = items.filter(item => !item.auth || user);
          if (visibleItems.length === 0) return null;

          return (
            <section key={groupLabel} aria-label={`${groupLabel} navigation`}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-faint)' }}>
                {groupLabel}
              </p>
              <div className="flex flex-col gap-0.5">
                {visibleItems.map(({ href, icon: Icon, label, badge }) => {
                  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                  const count = badge === 'notifs' ? unreadNotifs : badge === 'msgs' ? unreadMsgs : 0;

                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                      style={{
                        background: active ? 'var(--eco-dim)' : undefined,
                        color: active ? 'var(--eco-bright)' : 'var(--text-muted)',
                      }}
                    >
                      <Icon className="relative z-10 h-5 w-5 shrink-0" strokeWidth={active ? 2 : 1.7} />
                      <span className="relative z-10">{label}</span>
                      {count > 0 && (
                        <span
                          className="relative z-10 ml-auto min-w-5 rounded-full px-1 text-center text-[10px] font-bold"
                          style={{ background: 'var(--eco)', color: '#07110B' }}
                        >
                          {count > 9 ? '9+' : count}
                        </span>
                      )}
                      <span
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                        style={{ background: active ? undefined : 'var(--bg-hover)' }}
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>
            </section>
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
