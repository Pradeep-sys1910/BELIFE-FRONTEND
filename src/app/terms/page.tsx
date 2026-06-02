import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'BeLife Terms of Service — read before using the platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/" className="text-sm font-medium hover:underline" style={{ color: 'var(--eco-bright)' }}>← Back to BeLife</Link>
        <h1 className="text-4xl font-serif font-bold mt-4 mb-2" style={{ color: 'var(--text)' }}>Terms of Service</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: May 21, 2026 · Effective immediately</p>
      </div>

      <div className="max-w-none space-y-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>

        <section>
          <p>
            Welcome to <strong>BeLife</strong> ("we", "our", "us", "the Platform"). By accessing or using
            <strong> www.belife.site</strong> or any associated mobile application, you ("User", "you") agree
            to be legally bound by these Terms of Service ("Terms"). If you do not agree, you must stop using
            the Platform immediately.
          </p>
          <p className="mt-3">
            We reserve the right to update these Terms at any time. Continued use after changes constitutes
            acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>1. Eligibility</h2>
          <p>
            You must be at least 13 years of age to use BeLife. By using the Platform, you represent and
            warrant that you meet this age requirement and that all information you provide is accurate,
            current, and complete.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>2. User Accounts</h2>
          <p>
            You are solely responsible for maintaining the confidentiality of your account credentials.
            You are fully responsible for all activity that occurs under your account. BeLife will not be
            held liable for any loss or damage arising from your failure to protect your login information.
          </p>
          <p className="mt-3">
            We reserve the right to suspend or permanently terminate any account at our sole discretion,
            without notice or liability, for any reason including but not limited to violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>3. User-Generated Content — Ownership</h2>
          <p>
            <strong>You retain full ownership of all content you post</strong>, including but not limited to
            blog posts, comments, images, and messages ("User Content"). BeLife does not claim ownership of,
            and has no rights over, any content you publish on the Platform.
          </p>
          <p className="mt-3">
            You are solely responsible for the content you post. By publishing content on BeLife, you
            confirm that you own the rights to that content or have the necessary permissions to share it,
            and that it does not infringe the rights of any third party.
          </p>
          <p className="mt-3">
            If you delete your account or your content, BeLife will remove it from the Platform. BeLife
            does not retain any rights to your content after deletion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Prohibited Content & Conduct</h2>
          <p>You agree not to post, share, or engage in any content or behaviour that:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Is false, misleading, defamatory, or fraudulent</li>
            <li>Infringes any intellectual property, privacy, or proprietary rights</li>
            <li>Is unlawful, threatening, abusive, harassing, or discriminatory</li>
            <li>Contains malware, spam, or unauthorised advertising</li>
            <li>Violates any applicable local, national, or international law or regulation</li>
            <li>Attempts to gain unauthorised access to the Platform or its systems</li>
          </ul>
          <p className="mt-3">
            BeLife reserves the right to remove any content and suspend any user that violates these
            guidelines, without prior notice and without liability to you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>5. Intellectual Property of BeLife</h2>
          <p>
            All Platform software, design, trademarks, logos, graphics, and other materials created by or
            for BeLife are the exclusive property of BeLife and are protected by applicable intellectual
            property laws. You may not reproduce, distribute, or create derivative works from Platform
            materials without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>6. Disclaimer of Warranties</h2>
          <p>
            <strong>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED</strong>, including but not limited to warranties of merchantability, fitness
            for a particular purpose, non-infringement, or uninterrupted service. BeLife does not warrant
            that the Platform will be error-free, secure, or available at all times.
          </p>
          <p className="mt-3">
            BeLife makes no representations or warranties regarding the accuracy, reliability, completeness,
            or timeliness of any content posted by users. You rely on any information on the Platform
            entirely at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>7. Limitation of Liability</h2>
          <p>
            <strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BELIFE, ITS FOUNDERS, OFFICERS,
            EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES</strong>, including but not
            limited to loss of profits, data, goodwill, use, or other intangible losses, arising out of or
            in connection with:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your use of or inability to use the Platform</li>
            <li>Any content posted by users on the Platform</li>
            <li>Unauthorised access to or alteration of your data</li>
            <li>Any third-party conduct or content on the Platform</li>
            <li>Any bugs, viruses, or harmful components transmitted through the Platform</li>
            <li>Any errors or omissions in any content on the Platform</li>
          </ul>
          <p className="mt-3">
            In no event shall BeLife's total aggregate liability exceed the amount you paid to BeLife in
            the twelve (12) months preceding the claim, or INR 100 (whichever is lower), even if BeLife
            has been advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>8. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless BeLife and its affiliates, officers, agents,
            and employees from and against any claims, liabilities, damages, losses, and expenses (including
            legal fees) arising out of or in any way connected with your access to or use of the Platform,
            your User Content, or your violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>9. Third-Party Services</h2>
          <p>
            The Platform may contain links to third-party websites or integrate third-party services. BeLife
            has no control over and assumes no responsibility for the content, privacy policies, or
            practices of any third-party websites or services. We strongly advise you to read the terms and
            privacy policies of any third-party services you use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>10. Termination</h2>
          <p>
            We may terminate or suspend your access immediately, without prior notice or liability, for
            any reason whatsoever, including breach of these Terms. Upon termination, your right to use the
            Platform ceases immediately. Provisions that by their nature should survive termination shall
            survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of
            liability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without
            regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject
            to the exclusive jurisdiction of the courts located in India.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>12. Contact</h2>
          <p>
            For any questions regarding these Terms, please contact us at{' '}
            <a href="mailto:support@belife.site" className="hover:underline" style={{ color: 'var(--eco-bright)' }}>support@belife.site</a>.
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 flex gap-6 text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-faint)' }}>
        <Link href="/privacy" className="hover:underline transition">Privacy Policy</Link>
        <Link href="/" className="hover:underline transition">Back to Home</Link>
      </div>
    </div>
  );
}
