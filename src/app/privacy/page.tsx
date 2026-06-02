import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'BeLife Privacy Policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/" className="text-sm font-medium hover:underline" style={{ color: 'var(--eco-bright)' }}>← Back to BeLife</Link>
        <h1 className="text-4xl font-serif font-bold mt-4 mb-2" style={{ color: 'var(--text)' }}>Privacy Policy</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: May 21, 2026 · Effective immediately</p>
      </div>

      <div className="max-w-none space-y-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>

        <section>
          <p>
            BeLife ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, store, and share information when you use <strong>www.belife.site</strong>
            ("the Platform"). By using the Platform, you consent to the practices described in this policy.
          </p>
          <p className="mt-3">
            We reserve the right to update this Privacy Policy at any time. We will notify you of material
            changes by updating the date above. Continued use of the Platform after changes constitutes
            your acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>1. Information We Collect</h2>
          <p><strong>Information you provide directly:</strong></p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Name, username, email address, and password when you register</li>
            <li>Profile information such as bio and avatar image</li>
            <li>Content you post — blog articles, comments, and messages</li>
            <li>Communications you send to us</li>
          </ul>
          <p className="mt-4"><strong>Information collected automatically:</strong></p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>IP address and general location data</li>
            <li>Browser type, device type, and operating system</li>
            <li>Pages visited, time spent, and referring URLs</li>
            <li>Log data and error reports</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Create and manage your account</li>
            <li>Provide, maintain, and improve the Platform</li>
            <li>Send transactional emails (verification, password reset, welcome emails)</li>
            <li>Send newsletter updates if you have subscribed (you may unsubscribe at any time)</li>
            <li>Monitor and enforce our Terms of Service</li>
            <li>Detect and prevent fraud, abuse, or security incidents</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-3">
            We do not use your data for automated decision-making or profiling that produces legal or
            significant effects on you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>3. User Content & Public Information</h2>
          <p>
            Blog posts, comments, and profile information you choose to make public on BeLife are visible
            to all visitors of the Platform. Please exercise caution about what personal information you
            include in publicly visible content. BeLife is not responsible for any information you
            voluntarily disclose publicly on the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Sharing of Information</h2>
          <p>
            <strong>We do not sell, rent, or trade your personal information to third parties.</strong>
          </p>
          <p className="mt-3">We may share your information only in the following circumstances:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Service Providers:</strong> We use trusted third-party services to operate the Platform, including Neon (database), Render (server hosting), Vercel (frontend hosting), Brevo (email delivery), and Cloudflare R2 (file storage). These providers have access to your data only to perform their specific functions and are contractually obligated to protect it.</li>
            <li><strong>Legal Compliance:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders, government agencies).</li>
            <li><strong>Business Transfers:</strong> If BeLife is involved in a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction.</li>
            <li><strong>Protection of Rights:</strong> We may disclose information where we believe it is necessary to investigate, prevent, or take action regarding illegal activities, suspected fraud, or situations involving potential threats to safety.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>5. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active or as necessary to provide
            services. If you delete your account, we will delete or anonymise your personal data within a
            reasonable time, except where we are required to retain it by law or for legitimate business
            purposes (e.g., dispute resolution, fraud prevention).
          </p>
          <p className="mt-3">
            Publicly posted content (blogs, comments) may remain visible in cached or archived form even
            after deletion, as described in our Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>6. Data Security</h2>
          <p>
            We implement industry-standard security measures including password hashing (bcrypt), JWT
            authentication, HTTPS encryption, and access controls to protect your personal information.
            However, <strong>no method of transmission over the internet or electronic storage is 100%
            secure</strong>. We cannot guarantee absolute security and are not liable for unauthorised
            access, disclosure, or loss of your data beyond what is within our reasonable control.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>7. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to maintain your session and improve your
            experience. We use an authentication token stored in your browser to keep you logged in. You
            can configure your browser to refuse cookies, but this may affect the functionality of the
            Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>8. Children's Privacy</h2>
          <p>
            BeLife is not directed to children under the age of 13. We do not knowingly collect personal
            information from children under 13. If we discover that a child under 13 has provided us with
            personal information, we will delete it immediately. If you believe a child has provided us
            with their data, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>9. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to or restrict how we process your data</li>
            <li>Withdraw consent at any time (where processing is based on consent)</li>
            <li>Data portability — receive your data in a structured, machine-readable format</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:support@belife.site" className="hover:underline" style={{ color: 'var(--eco-bright)' }}>support@belife.site</a>.
            We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>10. Disclaimer of Liability for User Content</h2>
          <p>
            BeLife is a user-generated content platform. We do not review, verify, or endorse any content
            posted by users. <strong>We are not responsible or liable for any user content, including any
            errors, inaccuracies, defamatory statements, or privacy violations contained therein.</strong>
            Users are solely responsible for the content they post and any consequences arising from it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>11. Third-Party Links</h2>
          <p>
            The Platform may contain links to external websites. We have no control over and are not
            responsible for the privacy practices or content of those sites. We encourage you to review
            the privacy policies of any external sites you visit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>12. Governing Law</h2>
          <p>
            This Privacy Policy is governed by the laws of India. Any disputes relating to this policy
            shall be subject to the exclusive jurisdiction of courts in India.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>13. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:
          </p>
          <div className="mt-3 p-4 rounded-lg" style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
            <p className="font-medium" style={{ color: 'var(--text)' }}>BeLife</p>
            <p>Email: <a href="mailto:support@belife.site" className="hover:underline" style={{ color: 'var(--eco-bright)' }}>support@belife.site</a></p>
            <p>Website: <a href="https://www.belife.site" className="hover:underline" style={{ color: 'var(--eco-bright)' }}>www.belife.site</a></p>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 flex gap-6 text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-faint)' }}>
        <Link href="/terms" className="hover:underline transition">Terms of Service</Link>
        <Link href="/" className="hover:underline transition">Back to Home</Link>
      </div>
    </div>
  );
}
