import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, MapPin, Plus, RotateCcw } from 'lucide-react';
import { getEvents, joinEvent } from '../services/eventService';
import NewEventModal from '../components/NewEventModal';
import {
  filterThisMonthEvents,
  filterThisWeekEvents,
  filterUpcomingEvents,
  sortByDate,
} from '../utils/fp';

// ─── Joined state (localStorage) ────────────────────────────────────────────

const JOINED_KEY = 'uv_joined_events';

const loadJoined = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(JOINED_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const persistJoined = (set) => {
  localStorage.setItem(JOINED_KEY, JSON.stringify([...set]));
};

// ─── Date helpers ────────────────────────────────────────────────────────────

const formatEventDate = (dateStr) => {
  if (!dateStr) return {};
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('tr-TR', { month: 'long' }),
    dayName: date.toLocaleDateString('tr-TR', { weekday: 'long' }),
    time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    full: date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
};

// ─── Filter config ───────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'upcoming', label: 'Yaklaşan' },
  { value: 'week', label: 'Bu Hafta' },
  { value: 'month', label: 'Bu Ay' },
];

const applyFilter = (filter, events) => {
  let result = events;
  if (filter === 'upcoming') result = filterUpcomingEvents(events);
  else if (filter === 'week') result = filterThisWeekEvents(events);
  else if (filter === 'month') result = filterThisMonthEvents(events);
  return sortByDate(result);
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonFeatured() {
  return (
    <div className="rounded-xl bg-stone-200 h-48 animate-pulse" />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3 animate-pulse">
      <div className="h-10 w-14 bg-stone-100 rounded-lg" />
      <div className="h-5 w-3/4 bg-stone-100 rounded" />
      <div className="h-4 w-full bg-stone-100 rounded" />
      <div className="h-4 w-1/2 bg-stone-100 rounded" />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [joined, setJoined] = useState(loadJoined);
  const [joiningId, setJoiningId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getEvents()
      .then((data) => {
        if (!cancelled) setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || 'Etkinlikler yüklenemedi.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshKey]);

  const filtered = useMemo(
    () => applyFilter(activeFilter, events),
    [activeFilter, events]
  );

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  const handleJoin = async (id) => {
    if (joined.has(id)) return;
    setJoiningId(id);
    try {
      await joinEvent(id);
      setJoined((prev) => {
        const next = new Set(prev);
        next.add(id);
        persistJoined(next);
        return next;
      });
    } catch {
      // sessizce geç
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="text-stone-900">
      {/* Sayfa başlığı */}
      <header className="pb-10 lg:pb-12 border-b border-stone-200">
        <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">
          ETKİNLİKLER
        </p>
        <h1 className="mt-8 font-serif font-normal text-stone-900 text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
          Kampüs etkinlikleri.
        </h1>
        <p className="mt-5 font-serif italic text-stone-500 text-lg md:text-xl lg:text-2xl">
          Topluluklar, seminerler, sosyal etkinlikler — hepsi burada.
        </p>
      </header>

      {/* Filtre & yeni etkinlik */}
      <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                activeFilter === f.value
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 active:bg-stone-950 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Yeni Etkinlik
        </button>
      </div>

      {/* İçerik */}
      <div className="mt-8 lg:mt-10 space-y-6">
        {/* Hata */}
        {error && !loading && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-4 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={bumpRefresh}
              className="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tekrar dene
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <>
            <SkeletonFeatured />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        )}

        {/* Boş durum */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 py-20 px-6 text-center">
            <p className="font-serif text-stone-400 text-xl md:text-2xl">
              Henüz etkinlik yok.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              İlk etkinliği sen oluştur
            </button>
          </div>
        )}

        {/* Öne çıkan etkinlik */}
        {!loading && !error && featured && (
          <FeaturedCard
            event={featured}
            joined={joined.has(featured.id)}
            joining={joiningId === featured.id}
            onJoin={() => handleJoin(featured.id)}
          />
        )}

        {/* Diğer etkinlikler */}
        {!loading && !error && rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                joined={joined.has(event.id)}
                joining={joiningId === event.id}
                onJoin={() => handleJoin(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <NewEventModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); bumpRefresh(); }}
        />
      )}
    </div>
  );
}

// ─── Öne çıkan kart (koyu) ───────────────────────────────────────────────────

function FeaturedCard({ event, joined, joining, onJoin }) {
  const d = formatEventDate(event.event_date);

  return (
    <article className="bg-stone-900 text-white rounded-xl p-7 md:p-10 grid grid-cols-12 gap-6 md:gap-10 items-center">
      {/* Tarih bloğu */}
      <div className="col-span-12 md:col-span-3 flex md:flex-col items-center md:items-start gap-3 md:gap-0">
        <div className="text-6xl md:text-8xl font-serif font-normal leading-none text-white/90">
          {d.day}
        </div>
        <div className="md:mt-2">
          <p className="text-white/60 text-sm tracking-wide uppercase">{d.month}</p>
          {d.dayName && (
            <p className="text-white/40 text-xs tracking-wider uppercase mt-0.5">{d.dayName}</p>
          )}
        </div>
      </div>

      {/* İçerik */}
      <div className="col-span-12 md:col-span-9 space-y-4">
        <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/50">
          <span className="block w-5 h-px bg-white/40" />
          ÖNE ÇIKAN
        </div>
        <h2 className="font-serif font-normal text-white text-2xl md:text-3xl leading-snug">
          {event.title}
        </h2>
        {event.description && (
          <p className="text-white/60 text-sm md:text-base leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="flex items-center gap-4 flex-wrap">
          {event.location && (
            <span className="flex items-center gap-1.5 text-white/60 text-sm">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              {event.location}
            </span>
          )}
          {d.time && (
            <span className="text-white/60 text-sm">{d.time}</span>
          )}
        </div>
        <div>
          <JoinButton joined={joined} joining={joining} onJoin={onJoin} dark />
        </div>
      </div>
    </article>
  );
}

// ─── Normal etkinlik kartı ───────────────────────────────────────────────────

function EventCard({ event, joined, joining, onJoin }) {
  const d = formatEventDate(event.event_date);

  return (
    <article className="group flex flex-col bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Tarih rozeti */}
      <div className="inline-flex flex-col items-center justify-center w-12 h-14 bg-stone-900 text-white rounded-lg flex-shrink-0">
        <span className="text-xl font-serif font-normal leading-none">{d.day}</span>
        <span className="text-[10px] tracking-wide uppercase text-white/70 mt-0.5">
          {d.month?.slice(0, 3)}
        </span>
      </div>

      {/* İçerik */}
      <h2 className="mt-4 font-semibold text-stone-900 text-base leading-snug">
        {event.title}
      </h2>

      {event.description && (
        <p className="mt-1.5 text-stone-500 text-sm leading-relaxed line-clamp-2 flex-1">
          {event.description}
        </p>
      )}

      {/* Meta */}
      <div className="mt-4 space-y-1">
        {event.location && (
          <p className="flex items-center gap-1.5 text-stone-500 text-xs">
            <MapPin className="w-3 h-3" strokeWidth={1.5} />
            {event.location}
          </p>
        )}
        {d.time && (
          <p className="text-stone-400 text-xs">{d.dayName} · {d.time}</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
        <JoinButton joined={joined} joining={joining} onJoin={onJoin} />
        {event.university && (
          <span className="text-xs text-stone-400 truncate">{event.university}</span>
        )}
      </div>
    </article>
  );
}

// ─── Katıl butonu ────────────────────────────────────────────────────────────

function JoinButton({ joined, joining, onJoin, dark = false }) {
  if (joined) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
          dark ? 'text-emerald-400' : 'text-emerald-600'
        }`}
      >
        Katılıyorum
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onJoin}
      disabled={joining}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        dark
          ? 'text-white/80 hover:text-white border-b border-white/30 hover:border-white pb-px'
          : 'text-stone-900 border-b border-stone-400 hover:border-stone-900 pb-px'
      }`}
    >
      {joining ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        'Katıl'
      )}
    </button>
  );
}
