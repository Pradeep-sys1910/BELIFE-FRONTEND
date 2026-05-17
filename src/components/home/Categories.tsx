'use client';

import { Leaf, TreePine, Recycle, Sun, Droplet, Bike } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { name: 'Sustainable Living', icon: Leaf, count: 24, slug: 'sustainable-living' },
  { name: 'Eco Travel', icon: TreePine, count: 18, slug: 'eco-travel' },
  { name: 'Recycling', icon: Recycle, count: 15, slug: 'recycling' },
  { name: 'Renewable Energy', icon: Sun, count: 12, slug: 'renewable-energy' },
  { name: 'Water Conservation', icon: Droplet, count: 9, slug: 'water-conservation' },
  { name: 'Green Transport', icon: Bike, count: 7, slug: 'green-transport' },
];

export default function Categories() {
  return (
    <section className="py-20 bg-cream-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl text-forest-700 mb-3">Explore Categories</h2>
          <p className="text-forest-500">Discover topics that resonate with your sustainable journey</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/categories/${cat.slug}`} className="bg-cream-50 p-6 rounded-2xl text-center hover:shadow-lg hover:-translate-y-1 transition-all group">
              <cat.icon className="w-10 h-10 text-forest-600 mx-auto mb-3 group-hover:scale-110 transition" />
              <h3 className="font-medium text-forest-700 text-sm mb-1">{cat.name}</h3>
              <p className="text-xs text-forest-400">{cat.count} articles</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}