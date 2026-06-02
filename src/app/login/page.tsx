'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const FACTS = [
  "The Amazon rainforest produces 20% of the world's oxygen.",
  "A single tree can absorb 48 lbs of CO₂ per year.",
  "Seagrass meadows absorb carbon 35× faster than tropical rainforests.",
  "Indigenous peoples protect 80% of the world's remaining biodiversity.",
  "Trees communicate through underground fungal networks.",
  "Spending just 20 minutes in nature lowers stress hormone levels.",
  "Renewable energy could power 90% of global electricity by 2050.",
  "The Arctic is warming nearly 4× faster than the rest of the planet.",
  "Bamboo can grow up to 3 feet in a single day.",
  "Coral reefs support 25% of all marine life despite covering <1% of the ocean.",
  "One mature tree can provide a day's oxygen for up to four people.",
  "Recycling one aluminium can saves enough energy to run a TV for 3 hours.",
  "A single reusable bag can replace over 700 disposable plastic bags.",
  "Wetlands filter pollutants and store more carbon than any other land ecosystem.",
  "Honeybees pollinate about a third of everything we eat.",
  "The ocean generates over half of the oxygen we breathe.",
  "Composting can divert up to 30% of household waste from landfills.",
  "A dripping tap can waste over 5,000 litres of water a year.",
  "Glass can be recycled endlessly without losing quality.",
  "Forests cover 31% of the planet's land area.",
  "Solar power is now the cheapest source of electricity in history.",
  "A cotton T-shirt takes around 2,700 litres of water to produce.",
  "Earthworms can digest their own body weight in soil each day.",
  "Plastic can take up to 500 years to fully break down.",
  "Whales help fight climate change by storing carbon in their bodies.",
  "Mangroves protect coastlines and store 4× more carbon than rainforests.",
  "Switching off standby devices can cut home energy use by up to 10%.",
  "A swarm of bees can travel up to 5 km to find flowers.",
  "Around 1 billion people rely on wild-caught fish as their main protein.",
  "Peat bogs store twice as much carbon as all the world's forests.",
  "LED bulbs use up to 90% less energy than incandescent ones.",
  "The world's oldest known tree is over 4,800 years old.",
  "Cycling 10 km to work saves roughly 1,500 kg of CO₂ a year.",
  "A single hectare of trees can remove 6 tonnes of CO₂ a year.",
  "Soil holds three times more carbon than the atmosphere.",
  "Ladybirds can eat up to 5,000 aphids in their lifetime.",
  "Refilling one water bottle daily saves around 150 plastic bottles a year.",
  "Rainforests are home to more than half of all plant and animal species.",
  "Wind turbines can repay their carbon footprint in under 6 months.",
  "Food waste, if it were a country, would be the 3rd-largest emitter on Earth.",
  "A butterfly's lifespan inspires entire ecosystems to flourish.",
  "Kelp forests can grow up to half a metre in a single day.",
  "Turning your thermostat down 1°C can cut heating bills by about 10%.",
  "Sloths help spread seeds and support rainforest biodiversity.",
  "Over 3 trillion trees still grow on Earth — but we lose 10 billion a year.",
  "Beavers build wetlands that protect against both floods and droughts.",
  "A second-hand garment saves the water and carbon of making a new one.",
  "Fireflies glow with nearly 100% energy efficiency — almost no heat lost.",
  "Planting native flowers can double the pollinators in your garden.",
  "The Great Barrier Reef is the largest living structure on Earth.",
  "Walking instead of driving short trips can cut a car's emissions noticeably.",
  "Fungi recycle dead matter into the nutrients that feed new life.",
  "A single oak tree can support over 2,000 species of wildlife.",
  "Air-drying laundry instead of using a dryer saves about 2 kg of CO₂ per load.",
  "Octopuses, corals, and seagrass all quietly keep our oceans in balance.",
  "A single bee produces about a twelfth of a teaspoon of honey in its lifetime.",
  "Tropical rainforests recycle their own rainfall through evaporation.",
  "Recycling paper uses up to 70% less energy than making it from scratch.",
  "The world's soils could store an extra billion tonnes of carbon with better farming.",
  "Dragonflies have existed for over 300 million years.",
  "A reusable coffee cup pays back its footprint after about 20 uses.",
  "Tree roots can stretch wider than the canopy above them.",
  "Around 70% of Earth's fresh water is locked in ice and glaciers.",
  "Bats can eat thousands of insects in a single night, protecting crops.",
  "Old-growth forests keep absorbing carbon for centuries.",
  "Choosing tap over bottled water can cut that footprint by up to 1,000×.",
  "Moss can survive being completely dried out and then revive with rain.",
  "Urban trees can lower nearby air temperatures by several degrees.",
  "A healthy lawn of clover feeds pollinators and needs no fertiliser.",
  "Seabirds carry nutrients from ocean to land, fertilising whole ecosystems.",
  "Insulating a home well can cut its heating energy by a third or more.",
  "Coral polyps are tiny animals related to jellyfish.",
  "Eating one less beef meal a week meaningfully cuts your yearly emissions.",
  "Rivers carry nutrients that keep coastal fisheries alive.",
  "A mature beech tree can release hundreds of litres of water vapour a day.",
  "Recycling steel saves 74% of the energy needed to make it new.",
  "Some seeds can stay dormant in soil for decades, waiting for the right moment.",
  "Wolves reshaped entire valleys in Yellowstone just by returning.",
  "Carpooling with one other person halves your commute's carbon.",
  "Phytoplankton in the ocean produce roughly half of Earth's oxygen.",
  "A leaky toilet can quietly waste hundreds of litres of water a day.",
  "Lichens are a partnership between a fungus and an alga.",
  "Buying local, seasonal food cuts the emissions of long-distance transport.",
  "Termites recycle dead wood and enrich soil across the tropics.",
  "Switching one flight to a train can cut that trip's emissions by up to 90%.",
  "Snow reflects sunlight, helping keep the planet cool.",
  "A single cow pat can support dozens of insect species.",
  "Repairing instead of replacing electronics avoids hard-to-recycle e-waste.",
  "Frogs breathe partly through their skin, making them sensitive to pollution.",
  "Hedgerows act as wildlife highways across farmland.",
  "Unplugging chargers when idle trims a small but steady energy drain.",
  "Deep-sea ecosystems thrive with no sunlight at all.",
  "A cast-iron pan, cared for, can last over a hundred years.",
  "Owls' silent flight comes from the comb-like edges of their feathers.",
  "Rooftop gardens cool buildings and soak up rainwater.",
  "Soil bacteria can break down many pollutants naturally.",
  "Choosing a refurbished phone cuts most of a new one's carbon footprint.",
  "Tardigrades can survive the vacuum of space.",
  "Native plants need far less water than exotic ornamentals.",
  "A single mature kelp plant shelters hundreds of marine creatures.",
];

const inputCls = `
  w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none
  placeholder:text-[var(--text-faint)] text-[var(--text)]
`;
const inputStyle: React.CSSProperties = {
  background: 'var(--input-bg)',
  border:     '1px solid var(--input-border)',
};
const inputFocusStyle: React.CSSProperties = {
  borderColor: 'rgba(74,222,128,0.4)',
  background:  'var(--input-bg)',
  boxShadow:   '0 0 0 3px rgba(34,197,94,0.08)',
};

function Input({
  type = 'text', placeholder, value, onChange, required, autoComplete,
  suffix,
}: {
  type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean;
  autoComplete?: string; suffix?: React.ReactNode;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div className="relative">
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required={required}
        autoComplete={autoComplete}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        className={inputCls + (suffix ? ' pr-11' : '')}
        style={focus ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router      = useRouter();
  const { setUser } = useAuthStore();
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending,  setResending]  = useState(false);
  // Shuffle once, then cycle endlessly with a fade every 6s — feels infinite.
  const [deck] = useState(() => [...FACTS].sort(() => Math.random() - 0.5));
  const [factIdx, setFactIdx] = useState(0);
  const [factShow, setFactShow] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setFactShow(false);
      setTimeout(() => {
        setFactIdx(i => (i + 1) % deck.length);
        setFactShow(true);
      }, 450);
    }, 6000);
    return () => clearInterval(interval);
  }, [deck.length]);
  const fact = deck[factIdx];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setUnverified(false);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 403) setUnverified(true);
      else toast.error(err.response?.data?.message || 'Sign in failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent — check your inbox.');
      setUnverified(false);
    } catch { toast.error('Failed to resend. Try again.'); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── Left brand panel ────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[440px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(34,197,94,0.07) 0%, transparent 70%)',
        }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
        }} />

        <Link href="/" className="relative z-10">
          <Image src="/logo.png" alt="BeLife" width={140} height={58} className="object-contain" priority />
        </Link>

        <div className="relative z-10">
          <div className="w-8 h-0.5 mb-6 rounded-full" style={{ background: '#22C55E' }} />
          <blockquote
            className="text-xl font-serif leading-relaxed mb-4"
            style={{
              color: '#A8C8B0',
              opacity: factShow ? 1 : 0,
              transition: 'opacity 0.45s ease',
            }}
          >
            "{fact}"
          </blockquote>
          <p className="text-sm font-medium" style={{ color: 'var(--text-faint)' }}>— Nature Fact</p>
        </div>

        <p className="text-xs relative z-10" style={{ color: '#1E3A24' }}>
          © {new Date().getFullYear()} BeLife
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px] animate-fade-in">

          <Link href="/" className="inline-block mb-10 lg:hidden">
            <Image src="/logo.png" alt="BeLife" width={120} height={50} className="object-contain" priority />
          </Link>

          <div className="mb-8">
            <h1 className="text-[28px] font-semibold tracking-tight leading-tight" style={{ color: '#E8F5EC' }}>
              Welcome back
            </h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Sign in to continue to BeLife
            </p>
          </div>

          {unverified && (
            <div
              className="mb-6 p-4 rounded-2xl"
              style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: '#FDE68A' }}>Email not verified</p>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: '#CA8A04' }}>
                Check your inbox for a verification link, or request a new one.
              </p>
              <button
                onClick={handleResend} disabled={resending}
                className="text-xs font-semibold underline underline-offset-2 disabled:opacity-60 transition-opacity"
                style={{ color: '#FBBF24' }}
              >
                {resending ? 'Sending…' : 'Resend verification email →'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>
                Email
              </label>
              <Input
                type="email" placeholder="you@example.com"
                value={email} onChange={setEmail}
                required autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium transition-colors hover:text-eco-400" style={{ color: '#4ADE80' }}>
                  Forgot?
                </Link>
              </div>
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password} onChange={setPassword}
                required autoComplete="current-password"
                suffix={
                  <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}
                    style={{ color: 'var(--text-faint)' }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 mt-1 active:scale-[0.98] disabled:opacity-50"
              style={{ background: loading ? '#16A34A' : '#22C55E', color: '#050C07' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: 'var(--bg)', color: 'var(--text-faint)' }}>or</span>
            </div>
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            New to BeLife?{' '}
            <Link href="/register" className="font-semibold hover:text-eco-300 transition-colors" style={{ color: '#4ADE80' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
