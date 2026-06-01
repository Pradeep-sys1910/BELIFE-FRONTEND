'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Group {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  category: string;
  createdAt: string;
  creator: { id: string; name: string; avatar?: string };
  _count: { members: number; posts: number };
}

const CAT_META: Record<string, { label: string; emoji: string }> = {
  ALL:               { label: 'All',              emoji: '🌿' },
  GENERAL:           { label: 'General',           emoji: '💬' },
  QUESTIONS:         { label: 'Questions',         emoji: '❓' },
  ZERO_WASTE:        { label: 'Zero Waste',        emoji: '♻️' },
  CLIMATE:           { label: 'Climate',           emoji: '🌡️' },
  PLANT_BASED:       { label: 'Plant-Based',       emoji: '🌱' },
  ACTIVISM:          { label: 'Activism',          emoji: '✊' },
  SUSTAINABLE_LIVING:{ label: 'Sustainable Living',emoji: '🏡' },
};

export default function GroupsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (category !== 'ALL') params.category = category;
      if (query) params.search = query;
      const { data } = await api.get('/groups', { params });
      setGroups(data.groups);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [category, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Groups</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>Find your eco tribe</p>
        </div>
        {user && (
          <Link href="/groups/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--eco)', color: '#050C07' }}>
            <Plus className="w-4 h-4" />
            New Group
          </Link>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
      </form>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-7">
        {Object.entries(CAT_META).map(([key, { label, emoji }]) => (
          <button key={key} onClick={() => setCategory(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={category === key
              ? { background: 'var(--eco)', color: '#050C07', border: '1px solid transparent' }
              : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
            }>
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="skeleton w-12 h-12 rounded-xl mb-4" />
              <div className="skeleton h-4 w-3/4 rounded mb-2" />
              <div className="skeleton h-3 w-full rounded mb-1" />
              <div className="skeleton h-3 w-2/3 rounded mb-4" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No groups found</p>
          {user && (
            <Link href="/groups/new" className="text-sm font-semibold hover:underline mt-2 inline-block" style={{ color: 'var(--eco-bright)' }}>
              Create the first one
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => {
            const cat = CAT_META[g.category];
            return (
              <Link key={g.id} href={`/groups/${g.slug}`}
                className="rounded-2xl p-5 transition-all duration-200 group block card-blog"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {/* Icon / image */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform"
                  style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
                  {g.image
                    ? <img src={g.image} alt={g.name} className="w-full h-full rounded-xl object-cover" />
                    : cat?.emoji}
                </div>

                <h3 className="font-semibold text-sm mb-1 line-clamp-1" style={{ color: 'var(--text)' }}>{g.name}</h3>
                {g.description && (
                  <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>{g.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
                    <Users className="w-3 h-3" />
                    {g._count.members} {g._count.members === 1 ? 'member' : 'members'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)' }}>
                    {cat?.emoji} {cat?.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
