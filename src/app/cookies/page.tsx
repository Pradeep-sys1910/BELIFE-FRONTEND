import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'BeLife Cookie Policy — how we use cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/" className="text-sm text-forest-600 hover:underline">← Back to BeLife</Link>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mt-4 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500">Last updated: May 21, 2026 · Effective immediately</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <p>
            This Cookie Policy explains how <strong>BeLife</strong> ("we", "our", "us") uses cookies
            and similar technologies when you visit <strong>www.belife.site</strong>. By using the
            Platform, you consent to our use of cookies as described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help
            the website remember information about your visit — like whether you're logged in —
            so you don't have to re-enter it on every page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Cookies</h2>
          <p>BeLife uses cookies strictly for functional purposes:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>
              <strong>Authentication token</strong> — We store your JWT (JSON Web Token) in a cookie
              to keep you logged in across sessions. This cookie expires after 7 days and is essential
              for the platform to function.
            </li>
            <li>
              <strong>Session state</strong> — To maintain your logged-in session as you navigate
              between pages.
            </li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> use advertising cookies, tracking cookies, or any third-party
            analytics cookies that follow you across the web.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Third-Party Cookies</h2>
          <p>
            BeLife does not directly set third-party tracking cookies. However, our infrastructure
            providers (Vercel, Cloudflare) may set their own cookies for security and performance
            purposes. These are strictly technical and not used for advertising or profiling.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Managing Cookies</h2>
          <p>
            You can control cookies through your browser settings. Most browsers allow you to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>View what cookies are stored</li>
            <li>Delete all or specific cookies</li>
            <li>Block cookies from specific sites</li>
            <li>Block all third-party cookies</li>
          </ul>
          <p className="mt-3">
            Please note that disabling cookies on BeLife will prevent you from staying logged in.
            The platform requires the authentication cookie to function properly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data We Do Not Collect</h2>
          <p>
            We do <strong>not</strong> use cookies to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Track your browsing activity across other websites</li>
            <li>Build advertising profiles</li>
            <li>Sell or share your data with third-party advertisers</li>
            <li>Run A/B tests or behavioural experiments without your knowledge</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact</h2>
          <p>
            If you have questions about our use of cookies, contact us at{' '}
            <a href="mailto:support@belife.site" className="text-forest-600 hover:underline">
              support@belife.site
            </a>.
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-sm text-gray-500">
        <Link href="/privacy" className="hover:text-forest-600 transition">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-forest-600 transition">Terms of Service</Link>
        <Link href="/" className="hover:text-forest-600 transition">Back to Home</Link>
      </div>
    </div>
  );
}
