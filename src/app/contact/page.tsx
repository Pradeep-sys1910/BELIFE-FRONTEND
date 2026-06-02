'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/" className="text-sm font-medium transition-colors" style={{ color: 'var(--eco-bright)' }}>
          ← Back to BeLife
        </Link>
        <h1 className="text-4xl font-serif font-bold mt-4 mb-2" style={{ color: 'var(--text)' }}>Contact Us</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>We read every message — usually respond within 24 hours.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
            <Mail className="w-5 h-5" style={{ color: 'var(--eco-bright)' }} />
          </div>
          <div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text)' }}>Email</p>
            <a href="mailto:support@belife.site" className="text-sm hover:underline" style={{ color: 'var(--eco-bright)' }}>
              support@belife.site
            </a>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
            <MessageSquare className="w-5 h-5" style={{ color: 'var(--eco-bright)' }} />
          </div>
          <div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text)' }}>Response time</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Within 24 hours on weekdays</p>
          </div>
        </div>
      </div>

      {sent ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
          <div className="text-4xl mb-3">🌿</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Message received!</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Thanks for reaching out. We'll get back to you at <strong style={{ color: 'var(--text)' }}>{form.email}</strong>.
          </p>
          <Link href="/" className="text-sm hover:underline" style={{ color: 'var(--eco-bright)' }}>Back to home</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Name</label>
              <input type="text" required placeholder="Your name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input type="email" required placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
            <input type="text" required placeholder="What's this about?"
              value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Message</label>
            <textarea required rows={5} placeholder="Tell us what's on your mind..."
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              className="input resize-none" />
          </div>
          <button type="submit" disabled={sending} className="btn-primary">
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}

      <div className="mt-10 pt-8 flex gap-6 text-sm" style={{ borderTop: '1px solid var(--border)' }}>
        <Link href="/about" className="transition-colors hover:underline" style={{ color: 'var(--text-faint)' }}>About Us</Link>
        <Link href="/privacy" className="transition-colors hover:underline" style={{ color: 'var(--text-faint)' }}>Privacy Policy</Link>
        <Link href="/terms" className="transition-colors hover:underline" style={{ color: 'var(--text-faint)' }}>Terms of Service</Link>
      </div>
    </div>
  );
}
