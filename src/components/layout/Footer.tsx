'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-800 text-cream-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
        <div>
          <Link href="/dashboard" className="inline-block mb-4">
            <Image src="/logo.png" alt="BeLife" width={110} height={40} className="object-contain" />
          </Link>
          <p className="text-sm opacity-80 mb-6">Living in harmony with nature, one story at a time.</p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 bg-forest-600 rounded-full flex items-center justify-center hover:bg-sage-400 transition">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-4 text-cream-50">Explore</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/blogs">All Blogs</Link></li>
            <li><Link href="/categories">Categories</Link></li>
            <li><Link href="/authors">Authors</Link></li>
            <li><Link href="/about">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-4 text-cream-50">Resources</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/guides">Guides</Link></li>
            <li><Link href="/podcasts">Podcasts</Link></li>
            <li><Link href="/community">Community</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-4 text-cream-50">Legal</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-forest-600 pt-6 text-center text-sm opacity-70">
        © {new Date().getFullYear()} BeLife. Made with 🌿 for the planet.
      </div>
    </footer>
  );
}