'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import NotificationBell from './NotificationBell';

const HIDE_ON = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/blogs/new'];

export default function MobileHeader() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (HIDE_ON.some(p => pathname.startsWith(p))) return null;

  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
      style={{
        height: '52px',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <Link href="/">
        <Image src="/logo.png" alt="BeLife" width={90} height={38} className="object-contain" priority />
      </Link>

      <div className="flex items-center">
        {user
          ? <NotificationBell />
          : (
            <Link href="/login"
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ background: 'var(--eco)', color: '#050C07' }}>
              Sign In
            </Link>
          )
        }
      </div>
    </header>
  );
}
