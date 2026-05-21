'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const FACTS = [
  { text: "The Amazon rainforest produces 20% of the world's oxygen.", author: "Nature Fact" },
  { text: "A single tree can absorb up to 48 pounds of carbon dioxide per year.", author: "Nature Fact" },
  { text: "The ocean produces over half of the world's oxygen.", author: "Nature Fact" },
  { text: "Bees pollinate one-third of all the food we eat.", author: "Nature Fact" },
  { text: "Over 1 million species face extinction due to human activity.", author: "Nature Fact" },
  { text: "Plastic takes up to 1,000 years to decompose in a landfill.", author: "Nature Fact" },
  { text: "Every year, 8 million metric tons of plastic end up in our oceans.", author: "Nature Fact" },
  { text: "Recycling one aluminum can saves enough energy to power a TV for 3 hours.", author: "Nature Fact" },
  { text: "The Earth loses 18.7 million acres of forests per year — 27 soccer fields per minute.", author: "Nature Fact" },
  { text: "Switching to a plant-based diet can reduce your carbon footprint by up to 73%.", author: "Nature Fact" },
  { text: "The Great Pacific Garbage Patch is twice the size of Texas.", author: "Nature Fact" },
  { text: "Coral reefs support 25% of all marine life despite covering less than 1% of the ocean floor.", author: "Nature Fact" },
  { text: "The world's soil holds more carbon than all plants and the atmosphere combined.", author: "Nature Fact" },
  { text: "The Arctic is warming nearly 4 times faster than the rest of the planet.", author: "Nature Fact" },
  { text: "Bamboo can grow up to 3 feet in a single day.", author: "Nature Fact" },
  { text: "Seagrass meadows absorb carbon 35 times faster than tropical rainforests.", author: "Nature Fact" },
  { text: "Mangrove forests store up to 4 times more carbon than tropical forests.", author: "Nature Fact" },
  { text: "One in three bites of food humans eat depends on pollinators.", author: "Nature Fact" },
  { text: "The Sahara Desert was once a lush, green landscape just 5,000 years ago.", author: "Nature Fact" },
  { text: "Only 3% of the Earth's water is fresh, and two-thirds of that is frozen.", author: "Nature Fact" },
  { text: "The number of wild animals has declined by 68% since 1970.", author: "Nature Fact" },
  { text: "Restoring just 15% of ecosystems could prevent 60% of expected species extinctions.", author: "Nature Fact" },
  { text: "Oceans absorb about 30% of the CO₂ humans produce each year.", author: "Nature Fact" },
  { text: "It takes 2,700 liters of water to make just one cotton T-shirt.", author: "Nature Fact" },
  { text: "Urban trees can reduce city temperatures by up to 8°C.", author: "Nature Fact" },
  { text: "The fashion industry is responsible for 10% of annual global carbon emissions.", author: "Nature Fact" },
  { text: "Every minute, the equivalent of a garbage truck of plastic is dumped into the ocean.", author: "Nature Fact" },
  { text: "Air pollution causes 7 million premature deaths annually worldwide.", author: "Nature Fact" },
  { text: "Over 150 plastic bottles end up in our oceans every second.", author: "Nature Fact" },
  { text: "Eating locally grown food can reduce your carbon footprint by 10–20%.", author: "Nature Fact" },
  { text: "Lichens are among the oldest living organisms — some are over 9,000 years old.", author: "Nature Fact" },
  { text: "The world's largest organism is a fungal network in Oregon spanning 2,385 acres.", author: "Nature Fact" },
  { text: "Trees communicate with each other through underground fungal networks.", author: "Nature Fact" },
  { text: "Some trees release chemicals to warn neighbouring plants of insect attacks.", author: "Nature Fact" },
  { text: "The blue whale's heart is so large a human could crawl through its arteries.", author: "Nature Fact" },
  { text: "A single beehive can pollinate up to 300 million flowers a day.", author: "Nature Fact" },
  { text: "Monarch butterflies migrate up to 3,000 miles to reach their wintering grounds.", author: "Nature Fact" },
  { text: "Wolves can transform entire ecosystems through trophic cascades.", author: "Nature Fact" },
  { text: "Spending just 20 minutes in nature can lower stress hormone levels.", author: "Nature Fact" },
  { text: "Forest bathing (Shinrin-yoku) has been shown to reduce blood pressure and anxiety.", author: "Nature Fact" },
  { text: "Time in green spaces improves attention, memory, and creative thinking.", author: "Nature Fact" },
  { text: "Nature exposure boosts immune function through phytoncides released by trees.", author: "Nature Fact" },
  { text: "People who live near green spaces live longer, healthier lives.", author: "Nature Fact" },
  { text: "A 90-minute nature walk can reduce activity in brain regions linked to depression.", author: "Nature Fact" },
  { text: "Plants in a room can increase productivity by 15% and reduce stress.", author: "Nature Fact" },
  { text: "The scent of rain on dry earth — petrichor — is caused by a compound called geosmin.", author: "Nature Fact" },
  { text: "A single oak tree can support over 500 species of insects, birds, and mammals.", author: "Nature Fact" },
  { text: "Kelp forests grow up to 2 feet per day and rival rainforests in biodiversity.", author: "Nature Fact" },
  { text: "Some plants can detect sounds — like running water — through their roots.", author: "Nature Fact" },
  { text: "The wood frog can survive being completely frozen in winter and thaw back to life.", author: "Nature Fact" },
  { text: "Migratory birds use the Earth's magnetic field as a compass for navigation.", author: "Nature Fact" },
  { text: "A mature beech tree can release 20,000 gallons of water into the air in a single summer.", author: "Nature Fact" },
  { text: "The world's oldest living tree is a bristlecone pine over 5,000 years old.", author: "Nature Fact" },
  { text: "Living a car-free life can save 2.4 tons of CO₂ emissions per year.", author: "Nature Fact" },
  { text: "Eating one less beef meal a week saves the equivalent of driving 348 miles.", author: "Nature Fact" },
  { text: "Reducing food waste by half could cut global emissions by 1.5 gigatons per year.", author: "Nature Fact" },
  { text: "Washing clothes in cold water reduces energy use by up to 90%.", author: "Nature Fact" },
  { text: "Line-drying clothes instead of using a dryer can save 700 lbs of CO₂ a year.", author: "Nature Fact" },
  { text: "Low-flow showerheads can save up to 750 gallons of water per month.", author: "Nature Fact" },
  { text: "Replacing 5 car trips a week with cycling saves 1,000 lbs of CO₂ annually.", author: "Nature Fact" },
  { text: "Peatlands cover only 3% of land but store twice as much carbon as all forests combined.", author: "Nature Fact" },
  { text: "Iceland generates nearly 100% of its electricity from renewable sources.", author: "Nature Fact" },
  { text: "Costa Rica runs on renewable energy for over 300 days per year.", author: "Nature Fact" },
  { text: "Indigenous peoples protect 80% of the world's remaining biodiversity.", author: "Nature Fact" },
  { text: "Green roofs can reduce city stormwater runoff by up to 75%.", author: "Nature Fact" },
  { text: "Circular economy practices could eliminate 45% of global greenhouse gas emissions.", author: "Nature Fact" },
  { text: "Nature-based solutions could provide 37% of the mitigation needed by 2030.", author: "Nature Fact" },
  { text: "Renewable energy could provide 90% of global electricity by 2050.", author: "Nature Fact" },
  { text: "Solar energy is the most abundant energy resource on Earth.", author: "Nature Fact" },
  { text: "Wind power is the fastest-growing source of energy in the world.", author: "Nature Fact" },
  { text: "More than half of the world's wetlands have been lost since 1900.", author: "Nature Fact" },
  { text: "Over 90% of the world's seabirds have plastic in their stomachs.", author: "Nature Fact" },
  { text: "Planting trees is one of the cheapest ways to remove CO₂ from the atmosphere.", author: "Nature Fact" },
  { text: "Forests cover 31% of the Earth's land area and are home to 80% of land species.", author: "Nature Fact" },
  { text: "The deep ocean is the largest habitat on Earth, yet 95% remains unexplored.", author: "Nature Fact" },
  { text: "Mosses and lichens can survive in extreme environments including Antarctica.", author: "Nature Fact" },
  { text: "Dolphins sleep with one eye open to stay alert to predators.", author: "Nature Fact" },
  { text: "Organic farming uses 45% less energy than conventional farming.", author: "Nature Fact" },
  { text: "Walking instead of driving for short trips can reduce emissions by 75%.", author: "Nature Fact" },
  { text: "Buying secondhand clothing extends garment life and cuts fashion's carbon impact.", author: "Nature Fact" },
  { text: "Natural light exposure during the day improves sleep quality at night.", author: "Nature Fact" },
  { text: "Gardening for 30 minutes burns the same calories as cycling for the same time.", author: "Nature Fact" },
  { text: "Composting organic waste can significantly reduce landfill methane emissions.", author: "Nature Fact" },
  { text: "The first Earth Day in 1970 mobilised 20 million Americans for environmental action.", author: "Nature Fact" },
  { text: "Over 190 countries signed the Paris Agreement to combat climate change.", author: "Nature Fact" },
  { text: "Nature-based tourism generates $600 billion annually and supports millions of jobs.", author: "Nature Fact" },
  { text: "About 2 billion people lack access to safe drinking water.", author: "Nature Fact" },
  { text: "Walking barefoot on soil — earthing — may reduce inflammation in the body.", author: "Nature Fact" },
  { text: "Swimming in natural water bodies has been shown to improve mood and reduce anxiety.", author: "Nature Fact" },
  { text: "The Amazon basin is home to the largest collection of living plant and animal species.", author: "Nature Fact" },
  { text: "Installing solar panels can eliminate 3–4 tons of carbon emissions annually.", author: "Nature Fact" },
  { text: "In the last 50 years, ocean temperatures have risen by 0.6°C.", author: "Nature Fact" },
  { text: "A sustainable diet can reduce greenhouse gas emissions by up to 50%.", author: "Nature Fact" },
  { text: "Turning off lights when leaving a room can cut household energy use by 10%.", author: "Nature Fact" },
  { text: "Electric vehicles produce 50% less carbon over their lifetime than gas-powered cars.", author: "Nature Fact" },
  { text: "Human activity has altered 75% of Earth's land surface since pre-industrial times.", author: "Nature Fact" },
  { text: "A reusable bag must be used 173 times to offset its own environmental production cost.", author: "Nature Fact" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [fact] = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnverified(false);
    try {
      const { data } = await api.post('/auth/login', form);
      setUser(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setUnverified(true);
      } else {
        toast.error(err.response?.data?.message || 'Sign in failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      toast.success('Verification email sent — check your inbox.');
      setUnverified(false);
    } catch {
      toast.error('Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex w-[460px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #091810 0%, #112A1C 45%, #1E4530 100%)' }}>
        {/* Decorative glow */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(62,122,90,0.25) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(62,122,90,0.15) 0%, transparent 70%)' }} />

        <Link href="/" className="relative z-10">
          <Image src="/logo.png" alt="BeLife" width={120} height={44} className="object-contain" priority />
        </Link>

        <div className="relative z-10">
          <div className="w-8 h-0.5 bg-forest-500 mb-6 rounded-full" />
          <blockquote className="text-white/90 text-xl font-serif leading-relaxed mb-5">
            "{fact.text}"
          </blockquote>
          <p className="text-forest-400 text-sm font-medium">— {fact.author}</p>
        </div>

        <p className="text-forest-700 text-xs relative z-10">© {new Date().getFullYear()} BeLife</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[360px] animate-fade-in">

          <Link href="/" className="inline-block mb-10 lg:hidden">
            <Image src="/logo.png" alt="BeLife" width={110} height={40} className="object-contain" priority />
          </Link>

          <div className="mb-8">
            <h1 className="text-[26px] font-semibold text-gray-900 tracking-tight leading-tight">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1.5">Sign in to continue to BeLife</p>
          </div>

          {unverified && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-sm font-semibold text-amber-900 mb-1">Email not verified</p>
              <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                Check your inbox for a verification link, or request a new one.
              </p>
              <button onClick={handleResend} disabled={resending}
                className="text-xs font-semibold text-amber-800 underline underline-offset-2 disabled:opacity-60">
                {resending ? 'Sending...' : 'Resend verification email →'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
              <input type="email" required placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 focus:bg-white transition-all duration-200" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-forest-600 hover:text-forest-700 font-medium transition-colors">Forgot?</Link>
              </div>
              <input type="password" required placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 focus:bg-white transition-all duration-200" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-forest-800 hover:bg-forest-900 text-white py-3 rounded-xl text-sm font-semibold
                         transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md mt-1
                         active:scale-[0.98]">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            New to BeLife?{' '}
            <Link href="/register" className="text-forest-700 font-semibold hover:text-forest-800 transition-colors">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
