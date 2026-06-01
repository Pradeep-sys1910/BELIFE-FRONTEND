'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Target, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Campaign {
  id: string; title: string; slug: string; description: string; goal: string;
  image?: string; category: string; status: string; targetCount: number; createdAt: string;
  creator: { id: string; name: string; username?: string; avatar?: string };
  _count: { supporters: number };
  updates: { id: string; content: string; createdAt: string }[];
}

export default function CampaignDetailPage() {
  const { slug }  = useParams<{ slug: string }>();
  const router    = useRouter();
  const { user }  = useAuthStore();
  const [campaign,    setCampaign]    = useState<Campaign | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [supporting,  setSupporting]  = useState(false);
  const [suppLoading, setSuppLoading] = useState(false);
  const [updateText,  setUpdateText]  = useState('');
  const [posting,     setPosting]     = useState(false);

  useEffect(() => {
    api.get(`/campaigns/${slug}`)
      .then(r => { setCampaign(r.data as Campaign); })
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!user || !campaign) return;
    api.get(`/campaigns/${campaign.id}/support-status`)
      .then(r => setSupporting((r.data as any).supporting))
      .catch(() => {});
  }, [user, campaign]);

  const handleSupport = async () => {
    if (!user) { router.push('/login'); return; }
    if (!campaign || suppLoading) return;
    const was = supporting;
    setSupporting(!was);
    setCampaign(c => c ? { ...c, _count: { supporters: c._count.supporters + (was ? -1 : 1) } } : c);
    setSuppLoading(true);
    try {
      const { data } = await api.post(`/campaigns/${campaign.id}/support`);
      setSupporting((data as any).supporting);
      setCampaign(c => c ? { ...c, _count: { supporters: (data as any).count } } : c);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error');
      setSupporting(was);
      setCampaign(c => c ? { ...c, _count: { supporters: c._count.supporters + (was ? 1 : -1) } } : c);
    } finally { setSuppLoading(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim() || !campaign) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/campaigns/${campaign.id}/updates`, { content: updateText });
      setCampaign(c => c ? { ...c, updates: [data as any, ...c.updates] } : c);
      setUpdateText('');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setPosting(false); }
  };

  if (loading) return (
    <div className="max-w-[720px] mx-auto px-4 pt-8 pb-24">
      <div className="skeleton h-64 w-full rounded-2xl mb-6" />
      <div className="skeleton h-8 w-2/3 rounded mb-3" />
      <div className="skeleton h-4 w-full rounded mb-2" />
      <div className="skeleton h-4 w-3/4 rounded" />
    </div>
  );

  if (!campaign) return (
    <div className="max-w-[720px] mx-auto px-4 pt-24 text-center">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Campaign not found.</p>
      <Link href="/campaigns" className="text-sm mt-4 inline-block" style={{ color: 'var(--eco-bright)' }}>← Campaigns</Link>
    </div>
  );

  const pct = Math.min(100, Math.round((campaign._count.supporters / campaign.targetCount) * 100));
  const isCreator = user?.id === campaign.creator.id;

  return (
    <div className="max-w-[720px] mx-auto px-4 pt-8 pb-24">
      <Link href="/campaigns" className="inline-flex items-center gap-2 text-sm mb-5 transition-colors"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Campaigns
      </Link>

      {campaign.image && (
        <div className="w-full h-64 rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--bg-elevated)' }}>
          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>{campaign.title}</h1>

      <div className="flex items-center gap-3 mb-5">
        <Link href={campaign.creator.username ? `/profile/${campaign.creator.username}` : '#'}
          className="flex items-center gap-2 group">
          {campaign.creator.avatar ? (
            <img src={campaign.creator.avatar} alt={campaign.creator.name}
              className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}>
              {campaign.creator.name[0]}
            </div>
          )}
          <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--text-muted)' }}>
            {campaign.creator.name}
          </span>
        </Link>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Progress */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold" style={{ color: 'var(--eco-bright)' }}>
              {campaign._count.supporters}
            </span>
            <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>
              / {campaign.targetCount} supporters
            </span>
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--eco)' }}>{pct}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: 'var(--bg-elevated)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #22C55E, #4ADE80)' }} />
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{campaign.goal}</p>
        </div>
        <button onClick={handleSupport} disabled={suppLoading}
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          style={supporting
            ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
            : { background: 'var(--eco)', color: '#050C07' }}>
          {supporting ? '✓ Supporting' : 'Support this Campaign'}
        </button>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>About this campaign</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>
          {campaign.description}
        </p>
      </div>

      {/* Creator update form */}
      {isCreator && (
        <form onSubmit={handleUpdate} className="mb-6 rounded-2xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Post an update</h3>
          <textarea value={updateText} onChange={e => setUpdateText(e.target.value)} rows={3}
            placeholder="Share progress with your supporters..."
            className="w-full resize-none text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }} />
          <button type="submit" disabled={!updateText.trim() || posting}
            className="mt-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-40"
            style={{ background: 'var(--eco)', color: '#050C07' }}>
            {posting ? 'Posting…' : 'Post Update'}
          </button>
        </form>
      )}

      {/* Updates */}
      {campaign.updates.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Updates</h2>
          <div className="space-y-3">
            {campaign.updates.map(u => (
              <div key={u.id} className="rounded-2xl p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2" style={{ color: 'var(--text)' }}>
                  {u.content}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
