'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Lock, ArrowLeft, SquarePen, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';

interface OtherUser { id: string; name: string; username?: string; avatar?: string; }
interface Message { id: string; content: string; senderId: string; createdAt: string; isRead: boolean; }
interface Conversation {
  id: string;
  other: OtherUser;
  lastMessage: { content: string; createdAt: string; isRead: boolean; isMine: boolean } | null;
}

function Avatar({ user, size = 10 }: { user: OtherUser; size?: number }) {
  if (user.avatar) return <img src={user.avatar} alt={user.name} className={`w-${size} h-${size} rounded-full object-cover`} />;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white font-bold shrink-0`}>
      {user.name[0].toUpperCase()}
    </div>
  );
}

export default function MessagesPage() {
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

  const openDMWith = async (target: OtherUser) => {
    setShowCompose(false);
    setUserSearch('');
    setUserResults([]);
    const existing = convs.find(c => c.other.id === target.id);
    if (existing) { openConv(existing); return; }
    const fakeConv: Conversation = {
      id: `new-${target.id}`,
      other: target,
      lastMessage: null,
    };
    setActive({ conv: fakeConv, messages: [] });
    setShowList(false);
  };

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/messages').then(r => {
      const convList = r.data;
      setConvs(convList);
      const withId = searchParams.get('with');
      if (withId) {
        const existing = convList.find((c: Conversation) => c.other.id === withId);
        if (existing) openConv(existing);
        else {
          api.get('/users/search', { params: { q: withId } })
            .then(res => {
              const target = res.data.find((u: OtherUser) => u.id === withId);
              if (target) openDMWith(target);
            }).catch(() => {});
        }
      }
    }).catch(() => {});

    const sock = getSocket(token || '');
    sock.on('new_message', (msg: Message) => {
      setActive(prev => {
        if (!prev) return prev;
        if (prev.conv.other.id === msg.senderId) {
          return { ...prev, messages: [...prev.messages, msg] };
        }
        return prev;
      });
      setConvs(prev => prev.map(c =>
        c.other.id === msg.senderId
          ? { ...c, lastMessage: { content: msg.content, createdAt: msg.createdAt, isRead: false, isMine: false } }
          : c
      ));
    });
    return () => { sock.off('new_message'); };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages]);

  const openConv = async (conv: Conversation) => {
    const { data } = await api.get(`/messages/${conv.other.id}`);
    setActive({ conv, messages: data.messages });
    setShowList(false);
  };

  const sendMsg = async () => {
    if (!text.trim() || !active || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${active.conv.other.id}`, { content: text.trim() });
      setActive(prev => prev ? { ...prev, messages: [...prev.messages, data] } : prev);
      setConvs(prev => {
        const exists = prev.find(c => c.other.id === active.conv.other.id);
        const updated = { ...active.conv, id: data.conversationId || active.conv.id, lastMessage: { content: text.trim(), createdAt: data.createdAt, isRead: true, isMine: true } };
        if (exists) return prev.map(c => c.other.id === active.conv.other.id ? updated : c);
        return [updated, ...prev];
      });
      setText('');
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-48px)] md:h-screen bg-white">
      {/* Conversation list */}
      <div className={`${showList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[360px] border-r border-gray-200`}>
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900">{user.name}</h1>
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <button onClick={() => { setShowCompose(s => !s); setUserSearch(''); setUserResults([]); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-900">
              {showCompose ? <X className="w-5 h-5" /> : <SquarePen className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Messages are encrypted end-to-end</p>

          {showCompose && (
            <div className="mt-3">
              <input
                autoFocus
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search people to message..."
                className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              {searching && <p className="text-xs text-gray-400 mt-2 px-1">Searching...</p>}
              {userResults.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {userResults.map(u => (
                    <button key={u.id} onClick={() => openDMWith(u)}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition text-left">
                      {u.avatar
                        ? <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        : <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name[0].toUpperCase()}
                          </div>
                      }
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        {u.username && <p className="text-xs text-gray-400">@{u.username}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!searching && userSearch.trim() && userResults.length === 0 && (
                <p className="text-xs text-gray-400 mt-2 px-1">No users found</p>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {convs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 px-4">
              <p className="text-sm font-medium mb-1">No messages yet</p>
              <p className="text-xs">Find an author and start a conversation</p>
            </div>
          ) : (
            convs.map(conv => (
              <button key={conv.id} onClick={() => openConv(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left
                  ${active?.conv.id === conv.id ? 'bg-gray-50' : ''}`}>
                <Avatar user={conv.other} size={12} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-semibold text-gray-900 truncate">{conv.other.name}</p>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className={`text-xs truncate mt-0.5 ${!conv.lastMessage.isRead && !conv.lastMessage.isMine ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
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
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
            <button onClick={() => setShowList(true)} className="md:hidden text-gray-500 mr-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar user={active.conv.other} size={9} />
            <div>
              <p className="text-sm font-semibold text-gray-900">{active.conv.other.name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
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
                  <div className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed
                    ${mine ? 'bg-forest-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                    {msg.content}
                    <p className={`text-[10px] mt-1 ${mine ? 'text-forest-200' : 'text-gray-400'}`}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
              placeholder="Message..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
            <button onClick={sendMsg} disabled={!text.trim() || sending}
              className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-forest-700 transition shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 flex-col gap-2">
          <Lock className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-medium">Select a conversation</p>
          <p className="text-xs">Messages are AES-256 encrypted</p>
        </div>
      )}
    </div>
  );
}
