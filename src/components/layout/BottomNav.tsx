'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PenSquare, MessageCircle, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const HIDE_ON = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export default function BottomNav() {
  const pathname  = usePathname();
  const { user }  = useAuthStore();
  const [unreadNotifs,  setUnreadNotifs]  = useState(0);
  const [unreadMsgs,    setUnreadMsgs]    = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = () => {
      api.get('/notifications/unread-count').then(r => setUnreadNotifs(r.data.count || 0)).catch(() => {});
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

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background:    'var(--bg-sidebar)',
        borderTop:     '1px solid var(--border)',
        backdropFilter:'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-14">

        {/* Home */}
        <Link href="/" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
          style={{ color: isActive('/') && pathname === '/' ? 'var(--eco-bright)' : 'var(--text-faint)' }}>
          <Home className="w-[22px] h-[22px]" strokeWidth={isActive('/') && pathname === '/' ? 2.3 : 1.5} />
          <span className="text-[9px] font-semibold tracking-wide">Home</span>
        </Link>

        {/* Explore */}
        <Link href="/blogs" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
          style={{ color: isActive('/blogs') ? 'var(--eco-bright)' : 'var(--text-faint)' }}>
          <Compass className="w-[22px] h-[22px]" strokeWidth={isActive('/blogs') ? 2.3 : 1.5} />
          <span className="text-[9px] font-semibold tracking-wide">Explore</span>
        </Link>

        {/* Write — centre CTA */}
        {user && (
          <Link href="/blogs/new"
            className="flex flex-col items-center justify-center flex-1 h-full active:scale-90 transition-transform">
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center -mt-3 shadow-lg"
              style={{ background: 'var(--eco)', boxShadow: '0 4px 20px rgba(34,197,94,0.35)' }}>
              <PenSquare className="w-5 h-5" style={{ color: '#050C07' }} strokeWidth={2.3} />
            </span>
          </Link>
        )}

        {/* Messages */}
        {user && (
          <Link href="/messages" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
            style={{ color: isActive('/messages') ? 'var(--eco-bright)' : 'var(--text-faint)' }}>
            <span className="relative">
              <MessageCircle className="w-[22px] h-[22px]" strokeWidth={isActive('/messages') ? 2.3 : 1.5} />
              {unreadMsgs > 0 && (
                <span className="absolute -top-0.5 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                  style={{ background: '#22C55E', color: '#050C07' }}>
                  {unreadMsgs > 9 ? '9+' : unreadMsgs}
                </span>
              )}
            </span>
            <span className="text-[9px] font-semibold tracking-wide">Messages</span>
          </Link>
        )}

        {/* Profile */}
        <Link href="/dashboard" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
          style={{ color: isActive('/dashboard') ? 'var(--eco-bright)' : 'var(--text-faint)' }}>
          <span className="relative">
            <User className="w-[22px] h-[22px]" strokeWidth={isActive('/dashboard') ? 2.3 : 1.5} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--eco)', boxShadow: '0 0 6px var(--eco)' }} />
            )}
          </span>
          <span className="text-[9px] font-semibold tracking-wide">Profile</span>
        </Link>

        {/* Logged-out: show sign in */}
        {!user && (
          <Link href="/login" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform"
            style={{ color: 'var(--text-faint)' }}>
            <User className="w-[22px] h-[22px]" strokeWidth={1.5} />
            <span className="text-[9px] font-semibold tracking-wide">Sign In</span>
          </Link>
        )}

      </div>
    </nav>
  );
}
