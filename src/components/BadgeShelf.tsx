'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Badge {
  key: string;
  emoji: string;
  color: string;
  label: string;
  desc: string;
  earned: boolean;
}

/** Horizontal shelf of achievement badges (earned highlighted, locked greyed). */
export default function BadgeShelf({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    let alive = true;
    api.get(`/users/${userId}/badges`)
      .then(r => { if (alive) setBadges((r.data as { badges: Badge[] }).badges || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [userId]);

  if (badges.length === 0) return null;
  const earned = badges.filter(b => b.earned).length;

  return (
    <div className="mb-8">
      <p className="text-xs font-bold mb-3" style={{ color: 'var(--text)', letterSpacing: '0.3px' }}>
        Secure Rewards · {earned}/{badges.length}
      </p>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {badges.map(b => (
          <div
            key={b.key}
            title={b.desc}
            className="flex flex-col items-center gap-1.5 shrink-0 rounded-xl px-2 py-3 w-[78px]"
            style={b.earned
              ? { background: b.color + '14', border: `1px solid ${b.color}55` }
              : { background: 'var(--bg-card)', border: '1px solid var(--border)', opacity: 0.5 }}
          >
            <span className="text-2xl">{b.emoji}</span>
            <span
              className="text-[10px] font-bold text-center leading-tight truncate w-full"
              style={{ color: b.earned ? b.color : 'var(--text-faint)' }}
            >
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
