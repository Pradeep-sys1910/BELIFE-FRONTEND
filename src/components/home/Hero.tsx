'use client';

import Link from 'next/link';
import { Play, Leaf, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-cream-50">
      {/* Floating leaves */}
      <Leaf className="absolute top-32 left-10 w-16 h-16 text-forest-400 opacity-40 animate-float" />
      <Leaf className="absolute top-1/2 left-1/3 w-10 h-10 text-forest-500 opacity-50 animate-float" style={{ animationDelay: '2s' }} />
      <Leaf className="absolute top-40 right-1/4 w-12 h-12 text-forest-400 opacity-60 animate-float" style={{ animationDelay: '4s' }} />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-cream-100 px-4 py-2 rounded-full mb-8">
            <Sprout className="w-4 h-4 text-forest-600" />
            <span className="text-sm text-forest-700 font-medium">Live Sustainably. Inspire Naturally.</span>
          </div>

          <h1 className="heading-serif text-6xl lg:text-7xl font-bold mb-6">
            Stories: Nature.<br />
            Living: <span className="relative">
              Better.
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10">
                <path d="M0,5 Q100,0 200,5" stroke="#5A7A3F" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-lg text-forest-500 mb-10 max-w-md leading-relaxed">
            BeLife is your digital sanctuary for mindful living, green choices, and a better planet.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/blogs" className="btn-primary group">
              Explore Blogs
              <Leaf className="w-4 h-4 group-hover:rotate-12 transition" />
            </Link>
            <button className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-full border-2 border-forest-700 flex items-center justify-center hover:bg-forest-700 hover:text-cream-50 transition">
                <Play className="w-4 h-4 ml-0.5" />
              </span>
              <span className="text-forest-700 font-medium">Our Mission</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="rounded-l-[100px] overflow-hidden h-[600px] bg-gradient-to-br from-forest-600 to-forest-800 relative">
            <img 
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=800" 
              alt="Forest"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 right-8 bg-forest-700 text-cream-50 p-6 rounded-2xl max-w-xs">
              <div className="w-12 h-12 bg-cream-50 rounded-full flex items-center justify-center mb-3">
                <Leaf className="w-6 h-6 text-forest-600" />
              </div>
              <h3 className="font-serif text-xl mb-2">Small Choices, Big Impact</h3>
              <p className="text-sm opacity-90">Practical tips for sustainable living that make a difference.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}