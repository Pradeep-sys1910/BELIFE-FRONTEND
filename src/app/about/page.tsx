import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About BeLife',
  description: 'Discover BeLife’s new direction: a travel-based reward system that helps people explore, earn meaningful badges, and share nature-inspired journeys.',
};

const journey = [
  {
    date: 'Jan 2026',
    title: 'The Idea',
    desc: 'Started with a simple question: why isn\'t there a clean, ad-free space for people who actually care about the planet to share their stories?',
  },
  {
    date: 'Feb 2026',
    title: 'Foundation Built',
    desc: 'Full authentication system — register, email verification, forgot password, reset password, account deletion with email confirmation. JWT auth, Neon PostgreSQL, Prisma ORM.',
  },
  {
    date: 'Mar 2026',
    title: 'The Platform Takes Shape',
    desc: 'Blog editor, categories, likes, comments, bookmarks, search, pagination. Cloudflare R2 for image storage. Custom branded email templates via Brevo.',
  },
  {
    date: 'Apr 2026',
    title: 'Community Features',
    desc: 'Real-time direct messaging with Socket.IO. Forum, Groups, Campaigns, and Challenges — turning BeLife from a blog into a full community platform.',
  },
  {
    date: 'May 2026',
    title: 'Launch',
    desc: 'Deployed on Vercel + Render. SEO, sitemap, robots.txt, Open Graph, legal pages (Terms & Privacy), Google Search Console verified. belife.site went live.',
  },
  {
    date: 'Jun 2026',
    title: 'Growing',
    desc: 'Mobile UX overhaul, dark mode across every page, notification system, onboarding flow, and continuous improvements based on real user feedback.',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">

      {/* Header */}
      <div className="mb-12">
        <Link href="/" className="text-sm font-medium transition-colors"
          style={{ color: 'var(--eco-bright)' }}>← Back to BeLife</Link>
        <h1 className="text-4xl font-serif font-bold mt-4 mb-2" style={{ color: 'var(--text)' }}>
          About BeLife
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
          Built from scratch · Launched 2026 · belife.site
        </p>
      </div>

      <div className="space-y-12" style={{ color: 'var(--text-muted)' }}>

        {/* What is BeLife becoming? */}
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: 'var(--text)' }}>
            What is BeLife becoming?
          </h2>
          <p className="leading-relaxed">
            BeLife started without a fixed blueprint. We were not sure exactly what it should become.
            But we found a clearer direction: a travel-based rewarding system that turns exploration
            into progress, discovery into purpose, and nature into something people can experience together.
          </p>
          <p className="mt-3 leading-relaxed">
            The idea is simple. People discover places, share experiences, earn badges for meaningful
            participation, and help others travel with more confidence, curiosity, and care.
          </p>
        </section>

        {/* Why badges matter */}
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Why badges matter
          </h2>
          <p className="leading-relaxed">
            Badges are not just rewards. They are a way to make travel feel more guided and more exciting.
            A user can earn recognition for exploring, documenting, participating, and helping the community
            discover what is worth seeing, doing, or preserving.
          </p>
          <ul className="mt-3 space-y-2 list-disc pl-5 leading-relaxed">
            <li>Rewards are tied to real contribution, not empty engagement.</li>
            <li>Badges help people discover destinations, stories, and experiences worth exploring.</li>
            <li>Picture availability and results can strengthen trust in the journey and the reward.</li>
          </ul>
        </section>

        {/* Secure by design */}
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Secure by design
          </h2>
          <p className="leading-relaxed">
            The reward system is being shaped with security in mind. Badge progress is calculated on the server,
            based on verified activity and profile visibility, so it is harder to manipulate and more trustworthy for everyone.
          </p>
        </section>

        {/* Our Mission */}
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Our Mission
          </h2>
          <p className="leading-relaxed">
            We believe small journeys create big change. BeLife exists to make exploration feel more meaningful,
            more rewarding, and more shared. Whether you are discovering a hidden trail, documenting a local moment,
            or inspiring someone else to travel with intention — your story belongs here.
          </p>
        </section>

        {/* Our Journey */}
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-6" style={{ color: 'var(--text)' }}>
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px"
              style={{ background: 'var(--border-eco)' }} />

            <div className="space-y-8">
              {journey.map((step, i) => (
                <div key={i} className="flex gap-5">
                  {/* Dot */}
                  <div className="relative shrink-0 mt-1">
                    <div className="w-3.5 h-3.5 rounded-full"
                      style={{ background: 'var(--eco)', boxShadow: '0 0 8px rgba(34,197,94,0.4)' }} />
                  </div>
                  {/* Content */}
                  <div className="pb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--eco-bright)' }}>
                      {step.date}
                    </span>
                    <h3 className="text-base font-semibold mt-0.5 mb-1" style={{ color: 'var(--text)' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: 'var(--text)' }}>
            What Powers BeLife
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              'Next.js 14', 'Express.js', 'PostgreSQL', 'Prisma', 'Socket.IO',
              'Tailwind CSS', 'Cloudflare R2', 'Brevo Email', 'Vercel', 'Render', 'Neon',
            ].map(tech => (
              <span key={tech} className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}>
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Your Content */}
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Your Content, Your Rights
          </h2>
          <p className="leading-relaxed">
            Everything you write on BeLife is yours. We don't claim ownership of your content,
            we don't sell your data, and we don't run ads. If you delete your account, your content
            is gone — permanently. That's a promise.
          </p>
        </section>

        {/* Who Built This */}
        <section>
          <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Who Built This?
          </h2>
          <p className="leading-relaxed">
            BeLife was built by <strong style={{ color: 'var(--text)' }}>Pradeep Parthasarathy</strong> — from zero.
            Full auth system, real-time messaging, email flows, SEO, legal pages, branding, and deployment.
            Every single line written with care for the community it would serve.
          </p>
          <p className="mt-3 leading-relaxed">
            Got feedback or ideas? We'd love to hear from you.{' '}
            <Link href="/contact" className="font-medium hover:underline" style={{ color: 'var(--eco-bright)' }}>
              Reach out →
            </Link>
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-6"
          style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
            Join the community
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Share your first story. Read someone else's. Be part of something greener.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/register" className="btn-primary text-sm">
              Create Account
            </Link>
            <Link href="/blogs" className="btn-secondary text-sm">
              Browse Stories
            </Link>
          </div>
        </section>

      </div>

      {/* Footer links */}
      <div className="mt-12 pt-8 flex gap-6 text-sm" style={{ borderTop: '1px solid var(--border)' }}>
        <Link href="/contact" className="transition-colors hover:text-eco-400" style={{ color: 'var(--text-faint)' }}>Contact Us</Link>
        <Link href="/privacy"  className="transition-colors hover:text-eco-400" style={{ color: 'var(--text-faint)' }}>Privacy Policy</Link>
        <Link href="/terms"    className="transition-colors hover:text-eco-400" style={{ color: 'var(--text-faint)' }}>Terms of Service</Link>
      </div>

    </div>
  );
}
