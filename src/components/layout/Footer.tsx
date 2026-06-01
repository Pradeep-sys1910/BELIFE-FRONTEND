'use client';

import Link from 'next/link';
import Image from 'next/image';

const links = {
  explore: [
    { href: '/blogs', label: 'All Stories' },
    { href: '/categories', label: 'Topics' },
    { href: '/search', label: 'Search' },
    { href: '/about', label: 'About Us' },
  ],
  account: [
    { href: '/register', label: 'Join BeLife' },
    { href: '/login', label: 'Sign In' },
    { href: '/blogs/new', label: 'Write a Story' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(160deg, #091810 0%, #0D2018 50%, #0A1A14 100%)' }}>
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-8">

        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.07]">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="BeLife" width={130} height={54} className="object-contain" />
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-[200px]">
              Sustainable living stories, one post at a time.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">Explore</p>
            <ul className="space-y-2.5">
              {links.explore.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/55 hover:text-white/90 transition-colors duration-150">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">Account</p>
            <ul className="space-y-2.5">
              {links.account.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/55 hover:text-white/90 transition-colors duration-150">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
              {links.legal.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/55 hover:text-white/90 transition-colors duration-150">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} BeLife. All rights reserved.</p>
          <p className="text-xs text-white/20">Made with care for the planet.</p>
        </div>
      </div>
    </footer>
  );
}
