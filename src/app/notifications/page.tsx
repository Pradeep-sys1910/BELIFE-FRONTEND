'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

const TYPE_ICON: Record<string, string> = {
  FOLLOW: '👤', LIKE: '❤️', COMMENT: '💬',
  CAMPAIGN_SUPPORT: '📣', CHALLENGE_SUBMISSION: '✍️',
};

export default function NotificationsPage() {
  const router    = useRouter();
  const { user }  = useAuthStore();
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.fresh('/notifications')
      .then(r => {
        setNotifs((r.data as any).notifications || []);
        api.post('/notifications/read-all').catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Notifications</h1>
        {notifs.some(n => !n.read) && (
          <button
            onClick={() => {
              api.post('/notifications/read-all').catch(() => {});
              setNotifs(ns => ns.map(n => ({ ...n, read: true })));
            }}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: 'var(--eco-bright)' }}
          >
            <Check className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex gap-3 p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="skeleton w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-3/4 rounded" />
                <div className="skeleton h-2.5 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-24">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>All caught up</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Notifications for likes, comments, and follows will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div
              key={n.id}
              className="flex items-start gap-3 p-4 rounded-2xl transition-all duration-200"
              style={{
                background:  n.read ? 'var(--bg-card)' : 'var(--eco-dim)',
                border:      `1px solid ${n.read ? 'var(--border)' : 'var(--border-eco)'}`,
              }}
            >
              <div className="relative shrink-0">
                {n.actor.avatar ? (
                  <img src={n.actor.avatar} alt={n.actor.name}
                    className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
                  >
                    {n.actor.name[0].toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none">
                  {TYPE_ICON[n.type] || '🔔'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>
                  <Link
                    href={n.actor.username ? `/profile/${n.actor.username}` : '#'}
                    className="font-semibold hover:underline"
                  >
                    {n.actor.name}
                  </Link>
                  {' '}{TYPE_MSG[n.type] || 'interacted with you'}
                  {n.blog && (
                    <>
                      {' — '}
                      <Link
                        href={`/blogs/${n.blog.slug}`}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--eco-bright)' }}
                      >
                        {n.blog.title}
                      </Link>
                    </>
                  )}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--eco)' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
