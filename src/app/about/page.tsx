import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About BeLife',
  description: 'Learn about BeLife — a community platform for sustainable living stories.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/" className="text-sm text-forest-600 hover:underline">← Back to BeLife</Link>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mt-4 mb-2">About BeLife</h1>
        <p className="text-sm text-gray-500">Built from scratch · Launched 2026</p>
      </div>

      <div className="space-y-10 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-3">What is BeLife?</h2>
          <p>
            BeLife is a community-driven blogging platform for people who care about the planet.
            We built it as a space for writers, thinkers, and everyday humans to share stories about
            sustainable living, eco-conscious choices, nature, and a greener way of life.
          </p>
          <p className="mt-3">
            No algorithms deciding what you see. No ads cluttering your feed. Just honest stories
            from real people who want to live better — and inspire others to do the same.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-3">Our Mission</h2>
          <p>
            We believe small stories create big change. BeLife exists to make sustainable living
            feel achievable, relatable, and worth sharing. Whether you're composting for the first
            time or living completely off-grid — your story belongs here.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-3">Your Content, Your Rights</h2>
          <p>
            Everything you write on BeLife is yours. We don't claim ownership of your content,
            we don't sell your data, and we don't run ads. If you delete your account, your content
            is gone — permanently. That's a promise.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-3">Who Built This?</h2>
          <p>
            BeLife was built by <strong>Pradeep Parthasarathy</strong> — from zero. Full auth system,
            real-time messaging, email flows, SEO, legal pages, branding, and deployment. Every single
            line written with care for the community it would serve.
          </p>
          <p className="mt-3">
            Got feedback or ideas? We'd love to hear from you.{' '}
            <Link href="/contact" className="text-forest-600 hover:underline font-medium">Reach out →</Link>
          </p>
        </section>

        <section className="bg-forest-50 border border-forest-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-forest-800 mb-2">Join the community</h3>
          <p className="text-sm text-forest-700 mb-4">
            Share your first story. Read someone else's. Be part of something greener.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/register" className="bg-forest-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-forest-700 transition">
              Create Account
            </Link>
            <Link href="/blogs" className="border border-forest-300 text-forest-700 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-forest-100 transition">
              Browse Stories
            </Link>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-sm text-gray-500">
        <Link href="/contact" className="hover:text-forest-600 transition">Contact Us</Link>
        <Link href="/privacy" className="hover:text-forest-600 transition">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-forest-600 transition">Terms of Service</Link>
      </div>
    </div>
  );
}
