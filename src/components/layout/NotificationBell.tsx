'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Actor { id: string; name: string; username?: string; avatar?: string }
interface Blog  { id: string; title: string; slug: string }
interface Notif {
  id: string; type: string; read: boolean; createdAt: string;
  actor: Actor; blog?: Blog;
}

const TYPE_MSG: Record<string, string> = {
  FOLLOW:               'started following you',
  LIKE:                 'liked your post',
  COMMENT:              'commented on your post',
  CAMPAIGN_SUPPORT:     'supported your campaign',
  CHALLENGE_SUBMISSION: 'submitted to your challenge',
};

export default function NotificationBell() {
  const { user }  = useAuthStore();
  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll unread count every 30s
  useEffect(() => {
    if (!user) return;
    const fetch = () =>
      api.fresh('/notifications/unread-count')
        .then(r => setUnread((r.data as any).count))
        .catch(() => {});
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openPanel = async () => {
    setOpen(o => !o);
    if (!open && user) {
      setLoading(true);
      try {
        const r = await api.fresh('/notifications');
        setNotifs((r.data as any).notifications || []);
        setUnread(0);
        // Mark all read silently
        api.post('/notifications/read-all').catch(() => {});
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={openPanel}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
        style={{ color: 'var(--text-muted)' }}
        title="Notifications"
      >
        <Bell className="w-5 h-5" strokeWidth={1.6} />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: '#22C55E', color: '#050C07' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute left-0 top-11 w-80 rounded-2xl overflow-hidden z-50 shadow-dropdown animate-scale-in"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Notifications</span>
            <Link
              href="/notifications"
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--eco-bright)' }}
              onClick={() => setOpen(false)}
            >
              See all
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-3 w-full rounded" />
                      <div className="skeleton h-2.5 w-20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No notifications yet</p>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors duration-200"
                  style={{
                    background: n.read ? undefined : 'var(--eco-dim)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {n.actor.avatar ? (
                    <img src={n.actor.avatar} alt={n.actor.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
                    >
                      {n.actor.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>
                      <span className="font-semibold">{n.actor.name}</span>
                      {' '}{TYPE_MSG[n.type] || 'interacted with you'}
                      {n.blog && (
                        <Link
                          href={`/blogs/${n.blog.slug}`}
                          className="ml-1 font-medium hover:underline line-clamp-1"
                          style={{ color: 'var(--eco-bright)' }}
                          onClick={() => setOpen(false)}
                        >
                          "{n.blog.title}"
                        </Link>
                      )}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: 'var(--eco)' }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
