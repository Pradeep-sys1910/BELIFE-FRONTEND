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
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/" className="text-sm text-forest-600 hover:underline">← Back to BeLife</Link>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mt-4 mb-2">Contact Us</h1>
        <p className="text-sm text-gray-500">We read every message — usually respond within 24 hours.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-forest-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Email</p>
            <a href="mailto:support@belife.site" className="text-sm text-forest-600 hover:underline">
              support@belife.site
            </a>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-forest-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Response time</p>
            <p className="text-sm text-gray-500">Within 24 hours on weekdays</p>
          </div>
        </div>
      </div>

      {sent ? (
        <div className="bg-forest-50 border border-forest-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🌿</div>
          <h3 className="text-lg font-semibold text-forest-800 mb-2">Message received!</h3>
          <p className="text-sm text-forest-600 mb-4">Thanks for reaching out. We'll get back to you at <strong>{form.email}</strong>.</p>
          <Link href="/" className="text-sm text-forest-600 hover:underline">Back to home</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                type="text" required placeholder="Your name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email" required placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <input
              type="text" required placeholder="What's this about?"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea
              required rows={5} placeholder="Tell us what's on your mind..."
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
            />
          </div>
          <button
            type="submit" disabled={sending}
            className="flex items-center gap-2 bg-forest-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-forest-700 transition disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}

      <div className="mt-10 pt-8 border-t border-gray-200 flex gap-6 text-sm text-gray-500">
        <Link href="/about" className="hover:text-forest-600 transition">About Us</Link>
        <Link href="/privacy" className="hover:text-forest-600 transition">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-forest-600 transition">Terms of Service</Link>
      </div>
    </div>
  );
}
