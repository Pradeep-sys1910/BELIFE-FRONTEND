'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Compass, PenSquare, MessageCircle, User, MoreHorizontal, X,
  Users, UsersRound, Megaphone, Trophy, Lightbulb, Tag, Bookmark, Bell,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const HIDE_ON = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

const MORE_ITEMS = [
  { href: '/forum',         icon: Users,      label: 'Forum' },
  { href: '/groups',        icon: UsersRound, label: 'Groups' },
  { href: '/campaigns',     icon: Megaphone,  label: 'Campaigns' },
  { href: '/challenges',    icon: Trophy,     label: 'Challenges' },
  { href: '/thoughts',      icon: Lightbulb,  label: 'Thoughts' },
  { href: '/categories',    icon: Tag,        label: 'Topics' },
  { href: '/bookmarks',     icon: Bookmark,   label: 'Saved',         auth: true },
  { href: '/notifications', icon: Bell,       label: 'Notifications', auth: true },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs,   setUnreadMsgs]   = useState(0);
  const [drawerOpen,   setDrawerOpen]   = useState(false);

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
    return () => clearInterval(t);
  }, [user]);

  if (HIDE_ON.some(p => pathname.startsWith(p))) return null;

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const isMoreActive = MORE_ITEMS.some(item => isActive(item.href));

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background:     'var(--bg-sidebar)',
          borderTop:      '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
          paddingBottom:  'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around h-14">

          {/* Home */}
          <Link href="/"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
            style={{ color: pathname === '/' ? 'var(--eco-bright)' : 'var(--text-faint)' }}>
            <Home className="w-[22px] h-[22px]" strokeWidth={pathname === '/' ? 2.3 : 1.5} />
            <span className="text-[9px] font-semibold tracking-wide">Home</span>
          </Link>

          {/* Explore */}
          <Link href="/blogs"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
            style={{ color: isActive('/blogs') ? 'var(--eco-bright)' : 'var(--text-faint)' }}>
            <Compass className="w-[22px] h-[22px]" strokeWidth={isActive('/blogs') ? 2.3 : 1.5} />
            <span className="text-[9px] font-semibold tracking-wide">Explore</span>
          </Link>

          {/* Write — centre CTA (auth only) */}
          {user && (
            <Link href="/blogs/new"
              className="flex flex-col items-center justify-center flex-1 h-full active:scale-90 transition-transform">
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center -mt-3 shadow-lg"
                style={{ background: 'var(--eco)', boxShadow: '0 4px 20px rgba(34,197,94,0.35)' }}
              >
                <PenSquare className="w-5 h-5" style={{ color: '#050C07' }} strokeWidth={2.3} />
              </span>
            </Link>
          )}

          {/* Messages (auth) */}
          {user && (
            <Link href="/messages"
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
              style={{ color: isActive('/messages') ? 'var(--eco-bright)' : 'var(--text-faint)' }}>
              <span className="relative">
                <MessageCircle className="w-[22px] h-[22px]" strokeWidth={isActive('/messages') ? 2.3 : 1.5} />
                {unreadMsgs > 0 && (
                  <span
                    className="absolute -top-0.5 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                    style={{ background: '#22C55E', color: '#050C07' }}
                  >
                    {unreadMsgs > 9 ? '9+' : unreadMsgs}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-semibold tracking-wide">Messages</span>
            </Link>
          )}

          {/* More */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
            style={{ color: isMoreActive ? 'var(--eco-bright)' : 'var(--text-faint)' }}
          >
            <MoreHorizontal className="w-[22px] h-[22px]" strokeWidth={isMoreActive ? 2.3 : 1.5} />
            <span className="text-[9px] font-semibold tracking-wide">More</span>
          </button>

          {/* Sign in (guest) */}
          {!user && (
            <Link href="/login"
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
              style={{ color: 'var(--text-faint)' }}>
              <User className="w-[22px] h-[22px]" strokeWidth={1.5} />
              <span className="text-[9px] font-semibold tracking-wide">Sign In</span>
            </Link>
          )}

          {/* Profile (auth) */}
          {user && (
            <Link href="/dashboard"
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
              style={{ color: isActive('/dashboard') ? 'var(--eco-bright)' : 'var(--text-faint)' }}>
              <span className="relative">
                <User className="w-[22px] h-[22px]" strokeWidth={isActive('/dashboard') ? 2.3 : 1.5} />
                {unreadNotifs > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ background: 'var(--eco)', boxShadow: '0 0 6px var(--eco)' }}
                  />
                )}
              </span>
              <span className="text-[9px] font-semibold tracking-wide">Profile</span>
            </Link>
          )}

        </div>
      </nav>

      {/* ── More Drawer ──────────────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            style={{
              background: 'var(--bg-card)',
              borderTop:  '1px solid var(--border)',
              animation:  'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>More</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-3">
              {MORE_ITEMS.map(({ href, icon: Icon, label, ...rest }) => {
                const auth = (rest as any).auth as boolean | undefined;
                if (auth && !user) return null;
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl transition-all duration-200 active:scale-95"
                    style={{
                      background: active ? 'var(--eco-dim)'  : 'var(--bg-elevated)',
                      border:     active ? '1px solid var(--border-eco)' : '1px solid var(--border)',
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: active ? 'var(--eco-bright)' : 'var(--text-muted)' }}
                      strokeWidth={active ? 2.2 : 1.6}
                    />
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: active ? 'var(--eco-bright)' : 'var(--text-muted)' }}
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Auth CTAs for guests */}
            {!user && (
              <div className="flex gap-3 mt-5">
                <Link
                  href="/register"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 text-center py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
                  style={{ background: 'var(--eco)', color: '#050C07' }}
                >
                  Join BeLife
                </Link>
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 text-center py-3 rounded-2xl text-sm font-medium transition-all active:scale-95"
                  style={{ color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
