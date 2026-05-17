'use client';

import Link from 'next/link';
import { Leaf, ArrowRight, Heart, MessageCircle, Bookmark, TrendingUp } from 'lucide-react';

const categories = [
  { name: 'Sustainable', icon: '🌱', slug: 'sustainable-living' },
  { name: 'Eco Travel', icon: '✈️', slug: 'eco-travel' },
  { name: 'Recycling', icon: '♻️', slug: 'recycling' },
  { name: 'Energy', icon: '⚡', slug: 'renewable-energy' },
  { name: 'Water', icon: '💧', slug: 'water-conservation' },
  { name: 'Transport', icon: '🚲', slug: 'green-transport' },
  { name: 'Food', icon: '🥗', slug: 'sustainable-food' },
  { name: 'Fashion', icon: '👗', slug: 'eco-fashion' },
];

const featured = [
  { title: 'How to Build a Zero-Waste Kitchen', cat: 'Sustainable Living', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600', time: '5 min read' },
  { title: '10 Eco-Friendly Travel Tips for 2026', cat: 'Eco Travel', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600', time: '7 min read' },
  { title: "Solar Power: A Beginner's Guide", cat: 'Renewable Energy', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600', time: '4 min read' },
];

export default function HomeContent() {
  return (
    <div className="min-h-screen bg-cream-50 pb-20 md:pb-0">

      {/* Hero */}
      <section className="bg-gradient-to-br from-forest-700 via-forest-600 to-forest-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
            <Leaf className="w-4 h-4" />
            <span>Live Sustainably · Inspire Naturally</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Stories for a<br />
            <span className="text-forest-200">Greener World</span>
          </h1>
          <p className="text-forest-100 text-lg mb-8 max-w-lg mx-auto">
            Discover mindful living, eco-tips, and stories from a community that cares about the planet.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/blogs" className="bg-white text-forest-700 px-6 py-3 rounded-full font-semibold hover:bg-forest-50 transition flex items-center gap-2">
              Explore Stories <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/register" className="border border-white/40 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition">
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* Stories-style category scroll */}
      <section className="bg-white border-b border-cream-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="flex flex-col items-center gap-1.5 shrink-0 group">
                <div className="story-ring">
                  <div className="w-14 h-14 rounded-full bg-cream-50 flex items-center justify-center text-2xl border-2 border-white">
                    {cat.icon}
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium group-hover:text-forest-600 transition">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending bar */}
      <section className="bg-white border-b border-cream-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 text-forest-500" />
            <span>Trending this week</span>
          </div>
          <Link href="/blogs" className="text-forest-600 font-medium text-xs hover:underline">See all</Link>
        </div>
      </section>

      {/* Feed cards */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((post, i) => (
            <Link key={i} href="/blogs" className="card-blog group">
              <div className="relative h-52 overflow-hidden">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 badge bg-white/90 text-forest-700 shadow-sm">{post.cat}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-forest-600 transition leading-snug">{post.title}</h3>
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs">{post.time}</span>
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 hover:text-red-500 transition cursor-pointer" />
                    <MessageCircle className="w-4 h-4 hover:text-forest-500 transition cursor-pointer" />
                    <Bookmark className="w-4 h-4 hover:text-forest-500 transition cursor-pointer" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/blogs" className="btn-primary px-8 py-3 rounded-full text-base">
            View All Stories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-5xl mx-auto px-4 py-4 pb-8">
        <div className="bg-gradient-to-r from-forest-700 to-forest-500 rounded-2xl p-8 text-center text-white">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Join 10,000+ Eco Readers</h2>
          <p className="text-forest-100 mb-6 text-sm">Weekly sustainability stories delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input type="email" placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm" />
            <button className="bg-white text-forest-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-forest-50 transition text-sm shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-forest-600" />
            <span className="font-serif font-bold text-forest-700">BeLife</span>
            <span className="text-gray-400">· Made for the planet 🌍</span>
          </div>
          <div className="flex gap-6 text-gray-500">
            <Link href="/blogs" className="hover:text-forest-600 transition">Blogs</Link>
            <Link href="/categories" className="hover:text-forest-600 transition">Topics</Link>
            <Link href="/register" className="hover:text-forest-600 transition">Join</Link>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} BeLife</p>
        </div>
      </footer>
    </div>
  );
}
