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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Groups</h1>
          <p className="text-sm text-gray-400 mt-0.5">Find your eco tribe</p>
        </div>
        {user && (
          <Link href="/groups/new"
            className="flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            New Group
          </Link>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 focus:bg-white transition-all"
        />
      </form>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-7">
        {Object.entries(CAT_META).map(([key, { label, emoji }]) => (
          <button key={key} onClick={() => setCategory(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${category === key
                ? 'bg-forest-800 text-white border-forest-800'
                : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300 hover:text-forest-700'}`}>
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="border border-gray-100 rounded-2xl p-5 shadow-card">
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
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No groups found</p>
          {user && (
            <Link href="/groups/new" className="text-forest-700 text-sm font-semibold hover:underline mt-2 inline-block">
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
                className="border border-gray-100 rounded-2xl p-5 shadow-card hover:border-forest-200 hover:shadow-md transition-all duration-200 group block">
                {/* Icon / image */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-forest-100 to-forest-200 flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                  {g.image
                    ? <img src={g.image} alt={g.name} className="w-full h-full rounded-xl object-cover" />
                    : cat?.emoji}
                </div>

                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{g.name}</h3>
                {g.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{g.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {g._count.members} {g._count.members === 1 ? 'member' : 'members'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    g.category === 'CLIMATE' ? 'bg-orange-50 text-orange-600' :
                    g.category === 'ZERO_WASTE' ? 'bg-emerald-50 text-emerald-700' :
                    g.category === 'PLANT_BASED' ? 'bg-green-50 text-green-700' :
                    g.category === 'ACTIVISM' ? 'bg-purple-50 text-purple-700' :
                    g.category === 'SUSTAINABLE_LIVING' ? 'bg-forest-50 text-forest-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
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
