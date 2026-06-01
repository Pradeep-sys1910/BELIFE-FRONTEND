'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PenSquare, Lightbulb, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const items = [
  { href: '/',          icon: Home,      label: 'Home' },
  { href: '/blogs',     icon: Compass,   label: 'Explore' },
  { href: '/blogs/new', icon: PenSquare, label: 'Write',    auth: true },
  { href: '/thoughts',  icon: Lightbulb, label: 'Thoughts' },
  { href: '/dashboard', icon: User,      label: 'Profile',  auth: true },
];

const HIDE_ON = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export default function BottomNav() {
  const pathname = usePathname();
  const { user }  = useAuthStore();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count || 0)).catch(() => {});
    const t = setInterval(() => {
      api.get('/notifications/unread-count').then(r => setUnread(r.data.count || 0)).catch(() => {});
    }, 30_000);
    return () => clearInterval(t);
  }, [user]);

  if (HIDE_ON.some(p => pathname.startsWith(p))) return null;

  const visible = items.filter(({ auth }) => !auth || user);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around"
      style={{
        height:       'calc(56px + env(safe-area-inset-bottom))',
        paddingBottom:'env(safe-area-inset-bottom)',
        background:   'var(--bg-sidebar)',
        borderTop:    '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {visible.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200"
            style={{ color: active ? 'var(--eco-bright)' : 'var(--text-faint)' }}
          >
            {href === '/blogs/new' ? (
              <span
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--eco)', boxShadow: '0 0 14px var(--eco-dim)' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#050C07' }} strokeWidth={2.2} />
              </span>
            ) : (
              <>
                <span className="relative">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.5} />
                  {href === '/dashboard' && unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{ background: 'var(--eco)', boxShadow: '0 0 4px var(--eco)' }} />
                  )}
                </span>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
