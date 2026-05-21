'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PenSquare, Tag, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const items = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/blogs', icon: Compass, label: 'Explore' },
  { href: '/blogs/new', icon: PenSquare, label: 'Write', auth: true },
  { href: '/categories', icon: Tag, label: 'Topics' },
  { href: '/dashboard', icon: User, label: 'Profile', auth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const visible = items.filter(({ auth }) => !auth || user);

  // Hide on pages that have their own full-screen layout
  const hidden = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
  if (hidden.some(p => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-14">
        {visible.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors
                ${active ? 'text-forest-600' : 'text-gray-400 hover:text-forest-600'}`}>
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
