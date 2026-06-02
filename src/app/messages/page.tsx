'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Lock, ArrowLeft, SquarePen, X, Check, CheckCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';

interface OtherUser { id: string; name: string; username?: string; avatar?: string; }
interface Message { id: string; content: string; senderId: string; createdAt: string; isRead: boolean; status?: 'sending' | 'sent' | 'failed'; }
interface Conversation {
  id: string;
  other: OtherUser;
  lastMessage: { content: string; createdAt: string; isRead: boolean; isMine: boolean } | null;
}

function Avatar({ user, size = 40 }: { user: OtherUser; size?: number }) {
  const s = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };
  if (user.avatar) return <img src={user.avatar} alt={user.name} style={{ ...s, objectFit: 'cover' }} />;
  return (
    <div style={{ ...s, background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}
      className="flex items-center justify-center text-white font-bold text-sm shrink-0">
      {user.name[0].toUpperCase()}
    </div>
  );
}

function MessagesContent() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [active, setActive] = useState<{ conv: Conversation; messages: Message[] } | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<OtherUser[]>([]);
  const [searching, setSearching] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const openConv = useCallback(async (conv: Conversation) => {
    const { data } = await api.get(`/messages/${conv.other.id}`);
    setActive({ conv, messages: data.messages });
    setShowList(false);
  }, []);

  const openDMWith = useCallback((target: OtherUser, existingConvs?: Conversation[]) => {
    setShowCompose(false);
    setUserSearch('');
    setUserResults([]);
    const list = existingConvs || convs;
    const existing = list.find(c => c.other.id === target.id);
    if (existing) { openConv(existing); return; }
    setActive({ conv: { id: `new-${target.id}`, other: target, lastMessage: null }, messages: [] });
    setShowList(false);
  }, [convs, openConv]);

  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) { setUserResults([]); return; }
    setSearching(true);
    try {
      const { data } = await api.get('/users/search', { params: { q } });
      setUserResults(data.filter((u: OtherUser) => u.id !== user?.id));
    } finally {
      setSearching(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/messages').then(r => {
      const convList = r.data;
      setConvs(convList);
      const withId = searchParams.get('with');
      if (withId) {
        const existing = convList.find((c: Conversation) => c.other.id === withId);
        if (existing) { openConv(existing); return; }
        api.get(`/users/by-id/${withId}`)
          .then(res => openDMWith(res.data, convList))
          .catch(() => {});
      }
    }).catch(() => {});

    const sock = getSocket(token || '');
    sock.on('new_message', (msg: Message) => {
      setActive(prev => {
        if (!prev || prev.conv.other.id !== msg.senderId) return prev;
        if (prev.messages.some(m => m.id === msg.id)) return prev; // dedupe
        return { ...prev, messages: [...prev.messages, msg] };
      });
      setConvs(prev => {
        const exists = prev.find(c => c.other.id === msg.senderId);
        if (!exists) {
          // First message from someone new — pull the fresh conversation list.
          api.fresh('/messages').then(r => setConvs(r.data)).catch(() => {});
          return prev;
        }
        return prev.map(c => c.other.id === msg.senderId
          ? { ...c, lastMessage: { content: msg.content, createdAt: msg.createdAt, isRead: false, isMine: false } }
          : c);
      });
    });

    // Live read receipts: flip our outgoing bubbles to "read" when the other side opens the chat.
    sock.on('messages_read', ({ readerId }: { readerId: string }) => {
      setActive(prev => {
        if (!prev || prev.conv.other.id !== readerId) return prev;
        return { ...prev, messages: prev.messages.map(m => m.senderId === readerId ? m : { ...m, isRead: true }) };
      });
    });

    return () => { sock.off('new_message'); sock.off('messages_read'); };
  }, [user]);

  // Safety-net poll: even if the socket drops (mobile networks, sleeping dyno),
  // the open conversation refreshes every few seconds so messages still arrive.
  useEffect(() => {
    const otherId = active?.conv.other.id;
    if (!otherId) return;
    const t = setInterval(async () => {
      try {
        const { data } = await api.fresh(`/messages/${otherId}`);
        const incoming: Message[] = data.messages || [];
        setActive(prev => {
          if (!prev || prev.conv.other.id !== otherId) return prev;
          const have = new Set(prev.messages.map(m => m.id));
          const fresh = incoming.filter(m => !have.has(m.id));
          if (fresh.length === 0) return prev;
          const merged = [...prev.messages, ...fresh].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return { ...prev, messages: merged };
        });
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [active?.conv.other.id]);

  // Keep the conversation list reasonably fresh as a fallback to socket updates.
  useEffect(() => {
    if (!user) return;
    const t = setInterval(() => {
      api.fresh('/messages').then(r => setConvs(r.data)).catch(() => {});
    }, 12000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages]);

  const sendMsg = async () => {
    const content = text.trim();
    if (!content || !active || !user) return;
    const otherId = active.conv.other.id;
    const tempId  = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Optimistic: show the message instantly so sending feels instant.
    const optimistic: Message = {
      id: tempId, content, senderId: user.id,
      createdAt: new Date().toISOString(), isRead: false, status: 'sending',
    };
    setActive(prev => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev);
    setText('');
    setSending(true);

    try {
      const { data } = await api.post(`/messages/${otherId}`, { content });
      // Swap the optimistic bubble for the confirmed server message.
      setActive(prev => prev
        ? { ...prev, messages: prev.messages.map(m => m.id === tempId ? { ...data, status: 'sent' } : m) }
        : prev);
      setConvs(prev => {
        const exists  = prev.find(c => c.other.id === otherId);
        const updated = { ...active.conv, id: data.conversationId || active.conv.id, lastMessage: { content, createdAt: data.createdAt, isRead: true, isMine: true } };
        if (exists) return prev.map(c => c.other.id === otherId ? updated : c);
        return [updated, ...prev];
      });
      api.invalidate('/messages'); // refresh cached list/threads elsewhere
    } catch {
      // Mark the bubble failed so the user knows to retry instead of silently losing it.
      setActive(prev => prev
        ? { ...prev, messages: prev.messages.map(m => m.id === tempId ? { ...m, status: 'failed' } : m) }
        : prev);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className="flex fixed inset-x-0 top-[52px] bottom-[calc(64px_+_env(safe-area-inset-bottom))] z-30 md:static md:z-auto md:inset-auto md:h-screen"
      style={{ background: 'var(--bg)' }}
    >
      {/* Conversation list */}
      <div className={`${showList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[360px]`}
        style={{ borderRight: '1px solid var(--border)' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold" style={{ color: 'var(--text)' }}>{user.name}</h1>
              <Lock className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
            </div>
            <button onClick={() => { setShowCompose(s => !s); setUserSearch(''); setUserResults([]); }}
              className="p-1.5 rounded-lg transition"
              style={{ color: 'var(--text-muted)' }}>
              {showCompose ? <X className="w-5 h-5" /> : <SquarePen className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Messages are encrypted end-to-end</p>

          {showCompose && (
            <div className="mt-3">
              <input
                autoFocus
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search people to message..."
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
              {searching && <p className="text-xs mt-2 px-1" style={{ color: 'var(--text-faint)' }}>Searching...</p>}
              {userResults.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {userResults.map(u => (
                    <button key={u.id} onClick={() => openDMWith(u)}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition text-left"
                      style={{ color: 'var(--text)' }}>
                      <Avatar user={u} size={32} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</p>
                        {u.username && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>@{u.username}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!searching && userSearch.trim() && userResults.length === 0 && (
                <p className="text-xs mt-2 px-1" style={{ color: 'var(--text-faint)' }}>No users found</p>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {convs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>No messages yet</p>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Find an author and start a conversation</p>
            </div>
          ) : (
            convs.map(conv => (
              <button key={conv.id} onClick={() => openConv(conv)}
                className="w-full flex items-center gap-3 px-4 py-3 transition text-left"
                style={{
                  background: active?.conv.id === conv.id ? 'var(--bg-elevated)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}>
                <Avatar user={conv.other} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{conv.other.name}</p>
                    {conv.lastMessage && (
                      <span className="text-xs shrink-0 ml-2" style={{ color: 'var(--text-faint)' }}>
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs truncate mt-0.5"
                      style={{
                        color: !conv.lastMessage.isRead && !conv.lastMessage.isMine ? 'var(--text)' : 'var(--text-faint)',
                        fontWeight: !conv.lastMessage.isRead && !conv.lastMessage.isMine ? 600 : 400,
                      }}>
                      {conv.lastMessage.isMine ? 'You: ' : ''}{conv.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat thread */}
      {active ? (
        <div className={`${!showList ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0`}>
          {/* Chat header */}
          <div className="px-4 py-3 flex items-center gap-3"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setShowList(true)} className="md:hidden mr-1"
              style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar user={active.conv.other} size={36} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{active.conv.other.name}</p>
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
                <Lock className="w-3 h-3" /> Encrypted
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
            {active.messages.map(msg => {
              const mine = msg.senderId === user.id;
              return (
                <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[70%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      ...(mine
                        ? { background: 'var(--eco)', color: '#050C07', borderBottomRightRadius: 4 }
                        : { background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }),
                      opacity: msg.status === 'sending' ? 0.6 : 1,
                    }}>
                    {msg.content}
                    <div className="flex items-center gap-1 mt-1"
                      style={{ justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <span className="text-[10px]"
                        style={{ color: msg.status === 'failed' ? '#F87171' : mine ? 'rgba(5,12,7,0.6)' : 'var(--text-faint)' }}>
                        {msg.status === 'sending' ? 'Sending…'
                          : msg.status === 'failed' ? 'Failed to send — check connection'
                          : formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                      {mine && msg.status !== 'failed' && (
                        msg.status === 'sending'
                          ? <Clock className="w-3 h-3" style={{ color: 'rgba(5,12,7,0.55)' }} />
                          : msg.isRead
                            ? <CheckCheck className="w-3.5 h-3.5" style={{ color: '#E8F5EC' }} aria-label="Read" />
                            : <Check className="w-3.5 h-3.5" style={{ color: 'rgba(5,12,7,0.55)' }} aria-label="Sent" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 flex items-center gap-2"
            style={{ borderTop: '1px solid var(--border)' }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
              placeholder="Message..."
              className="flex-1 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
            <button onClick={sendMsg} disabled={!text.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition shrink-0"
              style={{ background: 'var(--eco)', color: '#050C07' }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-2">
          <Lock className="w-10 h-10 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Select a conversation</p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Messages are AES-256 encrypted</p>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesContent />
    </Suspense>
  );
}
