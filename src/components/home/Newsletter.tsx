'use client';

import { useState } from 'react';
import { Leaf, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('🌱 Welcome to BeLife! Check your inbox.');
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto bg-forest-700 rounded-3xl p-12 text-center relative overflow-hidden">
        <Leaf className="absolute top-4 left-4 w-20 h-20 text-forest-600 opacity-30" />
        <Leaf className="absolute bottom-4 right-4 w-32 h-32 text-forest-600 opacity-30 rotate-180" />
        
        <Mail className="w-12 h-12 text-cream-50 mx-auto mb-4" />
        <h2 className="font-serif text-4xl text-cream-50 mb-3">Join Our Green Community</h2>
        <p className="text-cream-100 mb-8 max-w-lg mx-auto">
          Get weekly insights on sustainable living delivered straight to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-5 py-3 rounded-lg bg-cream-50 text-forest-700 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
          <button type="submit" disabled={loading} className="bg-cream-50 text-forest-700 px-6 py-3 rounded-lg font-medium hover:bg-cream-100 transition disabled:opacity-50">
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}