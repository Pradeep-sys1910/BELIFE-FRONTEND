'use client';

import Link from 'next/link';

export default function HomeContent() {
  return (
    <main className="min-h-screen bg-cream-50">
      {/* Navbar */}
      <nav className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-3xl font-serif font-bold text-forest-700">BeLife</Link>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2.5 border border-forest-700 rounded-lg text-forest-700 hover:bg-forest-700 hover:text-cream-50 transition">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary">Join Us</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="heading-serif text-6xl lg:text-7xl font-bold mb-6">
          Stories: Nature.<br />Living: Better.
        </h1>
        <p className="text-lg text-forest-500 mb-10 max-w-xl mx-auto leading-relaxed">
          BeLife is your digital sanctuary for mindful living, green choices, and a better planet.
        </p>
        <Link href="/blogs" className="btn-primary text-lg px-8 py-4">
          Explore Blogs
        </Link>
      </section>

      {/* Categories */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl text-forest-700 mb-3">Explore Categories</h2>
          <p className="text-forest-500 mb-12">Discover topics that resonate with your sustainable journey</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['Sustainable Living', 'Eco Travel', 'Recycling', 'Renewable Energy', 'Water Conservation', 'Green Transport'].map((cat) => (
              <div key={cat} className="bg-cream-50 p-6 rounded-2xl text-center hover:shadow-lg transition-all">
                <h3 className="font-medium text-forest-700">{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-forest-700 rounded-3xl p-12 text-center">
          <h2 className="font-serif text-4xl text-cream-50 mb-3">Join Our Green Community</h2>
          <p className="text-cream-100 mb-8">Get weekly insights on sustainable living delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-lg bg-cream-50 text-forest-700 focus:outline-none focus:ring-2 focus:ring-sage-400" />
            <button className="bg-cream-50 text-forest-700 px-6 py-3 rounded-lg font-medium hover:bg-cream-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-800 text-cream-100 py-10 text-center">
        <p className="text-3xl font-serif font-bold text-cream-50 mb-3">BeLife</p>
        <p className="text-sm opacity-70 mb-4">Living in harmony with nature, one story at a time.</p>
        <div className="flex justify-center gap-6 text-sm opacity-80 mb-6">
          <Link href="/blogs">Blogs</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <p className="text-xs opacity-50">© {new Date().getFullYear()} BeLife. Made with 🌿 for the planet.</p>
      </footer>
    </main>
  );
}
