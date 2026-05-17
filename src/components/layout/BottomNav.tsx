'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, User, Compass } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const items = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/blogs', icon: Search, label: 'Explore' },
  { href: '/blogs/new', icon: PlusSquare, label: 'Post', auth: true },
  { href: '/categories', icon: Compass, label: 'Topics' },
  { href: '/dashboard', icon: User, label: 'Profile', auth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <nav className="bottom-nav">
      {items.map(({ href, icon: Icon, label, auth }) => {
        if (auth && !user) return null;
        const active = pathname === href;
        return (
          <Link key={href} href={auth && !user ? '/login' : href}
            className={`bottom-nav-item ${active ? 'active' : ''}`}>
            <Icon className={`w-6 h-6 ${active ? 'fill-forest-600 text-forest-600' : ''}`} strokeWidth={active ? 2.5 : 1.5} />
            <span className="text-[10px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
