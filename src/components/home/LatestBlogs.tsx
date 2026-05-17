'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Leaf } from 'lucide-react';

const mockBlogs = [
  {
    slug: '10-simple-habits',
    title: '10 Simple Habits for a More Sustainable Life',
    excerpt: 'Small changes, big impact. Start your journey to a greener lifestyle today.',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600',
    category: 'Sustainable Living',
    date: 'May 18, 2024',
    readTime: '5 min read',
  },
  {
    slug: 'eco-friendly-travel',
    title: 'Eco-Friendly Travel: See the World, Protect It',
    excerpt: 'Explore responsibly and leave only footprints. Tips for mindful travelers.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
    category: 'Eco Travel',
    date: 'May 15, 2024',
    readTime: '6 min read',
  },
  {
    slug: 'kitchen-garden',
    title: 'How to Start Your Own Kitchen Garden',
    excerpt: "Grow fresh, eat healthy. A beginner's guide to gardening at home.",
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    category: 'Green Living',
    date: 'May 12, 2024',
    readTime: '4 min read',
  },
  {
    slug: 'protecting-forests',
    title: 'The Importance of Protecting Our Forests',
    excerpt: "Forests are the lungs of our planet. Here's how we can protect them.",
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
    category: 'Sustainability',
    date: 'May 10, 2024',
    readTime: '7 min read',
  },
];

export default function LatestBlogs() {
  return (
    <section className="py-20 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-forest-600" />
            <h2 className="text-2xl font-serif text-forest-700">Latest from the Blog</h2>
          </div>
          <Link href="/blogs" className="flex items-center gap-2 text-forest-600 hover:gap-3 transition-all">
            View All Posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockBlogs.map((blog) => (
            <Link href={`/blogs/${blog.slug}`} key={blog.slug} className="card-blog group">
              <div className="relative h-48 overflow-hidden">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <span className="absolute top-4 left-4 bg-cream-50 text-forest-700 text-xs px-3 py-1 rounded-full font-medium">
                  {blog.category}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl text-forest-700 mb-2 group-hover:text-forest-500 transition leading-tight">
                  {blog.title}
                </h3>
                <p className="text-sm text-forest-500 mb-4 line-clamp-2">{blog.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-forest-400 pt-4 border-t border-cream-200">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {blog.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}