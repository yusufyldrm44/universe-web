import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, MessageSquare, Plus, Search, Send, X } from 'lucide-react';
import { useAuthStore } from '../services/authStore';
import {
  getMessages,
  getOrCreateRoom,
  getRooms,
  searchUsers,
  sendMessage,
} from '../services/messageService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initialsOf = (name) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

function fmtTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtGroupDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today - 86_400_000);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDay.getTime() === today.getTime()) return 'Bugün';
  if (msgDay.getTime() === yesterday.getTime()) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtLastMsg(msg) {
  if (!msg) return 'Henüz mesaj yok';
  return msg.content.length > 40 ? `${msg.content.slice(0, 40)}…` : msg.content;
}

function groupByDate(msgs) {
  const out = [];
  let lastDay = null;
  for (const m of msgs) {
    const day = new Date(m.created_at).toDateString();
    if (day !== lastDay) {
      out.push({ type: 'sep', date: m.created_at, key: `sep-${m.id}` });
      lastDay = day;
    }
    out.push({ type: 'msg', msg: m, key: m.id });
  }
  return out;
}

// ─── Room list item ───────────────────────────────────────────────────────────

function RoomItem({ room, isActive, onClick }) {
  const other = room.other_user ?? {};
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive ? 'bg-stone-100' : 'hover:bg-stone-50'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-stone-900 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
        {initialsOf(other.full_name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-stone-900 truncate">
            {other.full_name || 'Kullanıcı'}
          </p>
          {room.last_message && (
            <span className="text-[11px] text-stone-400 flex-shrink-0">
              {fmtTime(room.last_message.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <p className="text-xs text-stone-500 truncate flex-1">
            {fmtLastMsg(room.last_message)}
          </p>
          {room.unread_count > 0 && (
            <span className="w-2 h-2 rounded-full bg-stone-900 flex-shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}

// ─── User search modal ────────────────────────────────────────────────────────

function UserSearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      setLoading(true);
      searchUsers(query.trim())
        .then((data) => setResults(Array.isArray(data) ? data : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = async (user) => {
    setSelecting(user.id);
    try {
      const room = await getOrCreateRoom(user.id);
      onSelect({
        ...room,
        other_user: {
          id: user.id,
          full_name: user.full_name,
          university: user.university,
        },
      });
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-fade-in-up">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
          <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim veya üniversite ile ara..."
            className="flex-1 text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {loading && (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
            </div>
          )}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="py-8 text-center text-sm text-stone-400">Kullanıcı bulunamadı.</p>
          )}
          {!loading && query.trim().length < 2 && (
            <p className="py-8 text-center text-sm text-stone-400">En az 2 karakter girin.</p>
          )}
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              disabled={selecting === u.id}
              onClick={() => handleSelect(u)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-stone-900 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {initialsOf(u.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">{u.full_name}</p>
                {u.university && (
                  <p className="text-xs text-stone-500 truncate">{u.university}</p>
                )}
              </div>
              {selecting === u.id && <Loader2 className="w-4 h-4 animate-spin text-stone-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty chat state ─────────────────────────────────────────────────────────

function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
        <MessageSquare className="w-8 h-8 text-stone-300" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-serif text-stone-900 text-xl">Bir sohbet seç.</p>
        <p className="mt-1 text-sm text-stone-400">
          Soldaki listeden bir sohbet aç veya yeni bir konuşma başlat.
        </p>
      </div>
    </div>
  );
}

// ─── MessagesPage ─────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load rooms on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingRooms(true);
    getRooms()
      .then((data) => { if (!cancelled) setRooms(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingRooms(false); });
    return () => { cancelled = true; };
  }, []);

  // Open room from ?room= URL param once rooms are loaded
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (!roomId || loadingRooms) return;
    const found = rooms.find((r) => String(r.id) === String(roomId));
    if (found) {
      openRoom(found);
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, rooms, loadingRooms]);

  // Polling — refresh messages every 3 s while a room is open
  useEffect(() => {
    if (!activeRoom) return;
    const interval = setInterval(() => {
      getMessages(activeRoom.id)
        .then((data) => setMessages(Array.isArray(data) ? data : []))
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [activeRoom?.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openRoom = (room) => {
    setActiveRoom(room);
    setMessages([]);
    setLoadingMsgs(true);
    getMessages(room.id)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !activeRoom || sending) return;

    setInput('');
    setSending(true);

    const tempMsg = {
      id: `temp-${Date.now()}`,
      room_id: activeRoom.id,
      sender_id: user?.id,
      sender_name: user?.full_name,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await sendMessage(activeRoom.id, content);
      // Immediately sync with server to replace temp message
      const fresh = await getMessages(activeRoom.id);
      setMessages(Array.isArray(fresh) ? fresh : []);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleNewRoom = (room) => {
    setSearchOpen(false);
    setRooms((prev) => {
      if (prev.some((r) => r.id === room.id)) return prev;
      return [room, ...prev];
    });
    openRoom(room);
  };

  const grouped = groupByDate(messages);

  return (
    <>
      {searchOpen && (
        <UserSearchModal
          onClose={() => setSearchOpen(false)}
          onSelect={handleNewRoom}
        />
      )}

      {/* Break out of Layout padding to fill viewport below header (h-16 = 64px) */}
      <div
        className="-mx-8 lg:-mx-16 -mt-12 -mb-24 md:-mb-12 flex border-t border-stone-200 bg-white"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {/* ── Left panel ── */}
        <div className="w-72 xl:w-80 flex-shrink-0 border-r border-stone-200 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
            <h2 className="font-serif text-xl text-stone-900">Mesajlar</h2>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Yeni sohbet"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingRooms && (
              <div className="flex justify-center pt-8">
                <Loader2 className="w-5 h-5 animate-spin text-stone-300" />
              </div>
            )}
            {!loadingRooms && rooms.length === 0 && (
              <div className="px-4 pt-8 text-center">
                <p className="text-sm text-stone-400">Henüz mesajın yok.</p>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="mt-3 text-xs font-medium text-stone-600 underline underline-offset-2"
                >
                  Yeni sohbet başlat
                </button>
              </div>
            )}
            {rooms.map((room) => (
              <RoomItem
                key={room.id}
                room={room}
                isActive={activeRoom?.id === room.id}
                onClick={() => openRoom(room)}
              />
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeRoom ? (
            <EmptyChat />
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-200 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-stone-900 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                  {initialsOf(activeRoom.other_user?.full_name)}
                </div>
                <div>
                  <p className="font-semibold text-stone-900 text-sm leading-tight">
                    {activeRoom.other_user?.full_name || 'Kullanıcı'}
                  </p>
                  {activeRoom.other_user?.university && (
                    <p className="text-xs text-stone-500">
                      {activeRoom.other_user.university}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                {loadingMsgs && (
                  <div className="flex justify-center pt-8">
                    <Loader2 className="w-5 h-5 animate-spin text-stone-300" />
                  </div>
                )}
                {!loadingMsgs && messages.length === 0 && (
                  <div className="text-center pt-8">
                    <p className="text-sm text-stone-400">
                      Henüz mesaj yok. İlk mesajı sen gönder!
                    </p>
                  </div>
                )}

                {grouped.map((item) => {
                  if (item.type === 'sep') {
                    return (
                      <div key={item.key} className="flex items-center gap-3 py-3">
                        <div className="flex-1 h-px bg-stone-100" />
                        <span className="text-[11px] text-stone-400 font-medium">
                          {fmtGroupDate(item.date)}
                        </span>
                        <div className="flex-1 h-px bg-stone-100" />
                      </div>
                    );
                  }

                  const { msg } = item;
                  const isOwn = Number(msg.sender_id) === Number(user?.id);

                  return (
                    <div
                      key={item.key}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? 'bg-stone-900 text-white rounded-br-sm'
                            : 'bg-stone-100 text-stone-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isOwn ? 'text-stone-400 text-right' : 'text-stone-400'}`}>
                          {fmtTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex items-end gap-3 px-6 py-4 border-t border-stone-200 flex-shrink-0"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="Mesaj yaz..."
                  rows={1}
                  className="flex-1 resize-none px-4 py-2.5 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition max-h-32 overflow-y-auto"
                  style={{ fieldSizing: 'content' }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 flex items-center justify-center bg-stone-900 text-white rounded-xl hover:bg-stone-800 active:bg-stone-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
