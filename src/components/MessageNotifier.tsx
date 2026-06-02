'use client';

/**
 * App-wide message notifications. Mounted once in the root layout.
 *  - On login: surfaces a toast if you have unread messages.
 *  - Live: toasts (and fires a browser notification when the tab is backgrounded)
 *    whenever a message arrives while you're anywhere except the messenger.
 *  - Tells the nav badges to refresh instantly via a `belife:unread-refresh` event.
 */

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import api from '@/lib/api';

interface IncomingMessage {
  senderId: string;
  content: string;
  sender?: { id: string; name: string; avatar?: string };
}

export default function MessageNotifier() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  // On login — greet with unread count + (gently) ask for notification permission.
  useEffect(() => {
    if (!user) return;

    api.fresh('/messages').then(r => {
      const convs = (r.data as { lastMessage?: { isRead: boolean; isMine: boolean } }[]) || [];
      const unread = convs.filter(c => c.lastMessage && !c.lastMessage.isRead && !c.lastMessage.isMine).length;
      if (unread > 0 && !pathRef.current.startsWith('/messages')) {
        toast(
          (t) => (
            <button
              onClick={() => { toast.dismiss(t.id); router.push('/messages'); }}
              style={{ textAlign: 'left', fontWeight: 600 }}
            >
              💬 You have {unread} unread message{unread > 1 ? 's' : ''}
            </button>
          ),
          { icon: '🌿', duration: 5000 }
        );
      }
    }).catch(() => {});

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      timer = setTimeout(() => { Notification.requestPermission().catch(() => {}); }, 4000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [user?.id]);

  // Live incoming-message notifications, app-wide.
  useEffect(() => {
    if (!user || !token) return;
    const sock = getSocket(token);

    const onMsg = (msg: IncomingMessage) => {
      // Always refresh the nav badge immediately.
      window.dispatchEvent(new CustomEvent('belife:unread-refresh'));

      // Inside the messenger, the page itself handles display — don't double-notify.
      if (pathRef.current.startsWith('/messages')) return;

      const name = msg?.sender?.name || 'New message';
      const preview = (msg?.content || '').slice(0, 80);

      toast(
        (t) => (
          <button
            onClick={() => { toast.dismiss(t.id); router.push(`/messages?with=${msg.senderId}`); }}
            style={{ textAlign: 'left' }}
          >
            <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{preview}</div>
          </button>
        ),
        { icon: '💬', duration: 5000 }
      );

      // Browser notification — shows even when the tab is in the background.
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        try {
          const n = new Notification(name, { body: preview, icon: '/favicon.jpg', tag: `msg-${msg.senderId}` });
          n.onclick = () => { window.focus(); router.push(`/messages?with=${msg.senderId}`); n.close(); };
        } catch {}
      }
    };

    sock.on('new_message', onMsg);
    return () => { sock.off('new_message', onMsg); };
  }, [user?.id, token]);

  return null;
}
