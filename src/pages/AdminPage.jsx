import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import {
  approveListing,
  approveEvent,
  getPendingEvents,
  getPendingListings,
  rejectEvent,
  rejectListing,
} from '../services/adminService';
import { formatDate, formatDateLong, formatPrice } from '../utils/fp';

const TYPE_LABEL = {
  item: 'Eşya',
  house: 'Ev',
  roommate: 'Ev Arkadaşı',
  job: 'İş',
  internship: 'Staj',
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-stone-100 rounded-full" />
            <div className="h-5 w-24 bg-stone-100 rounded-full" />
          </div>
          <div className="h-5 w-2/3 bg-stone-100 rounded" />
          <div className="h-4 w-full bg-stone-100 rounded" />
          <div className="h-4 w-3/4 bg-stone-100 rounded" />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className="h-9 w-20 bg-stone-100 rounded-xl" />
          <div className="h-9 w-20 bg-stone-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stone-200 py-16 px-6 text-center">
      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" strokeWidth={1.5} />
      <p className="mt-4 font-serif text-stone-500 text-xl">Bekleyen içerik yok.</p>
      <p className="mt-1 text-sm text-stone-400">Tüm içerikler incelendi.</p>
    </div>
  );
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function ActionButtons({ id, actingId, onApprove, onReject }) {
  const busy = actingId === `approve-${id}` || actingId === `reject-${id}`;

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        type="button"
        onClick={onApprove}
        disabled={busy}
        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {actingId === `approve-${id}` ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : null}
        Onayla
      </button>
      <button
        type="button"
        onClick={onReject}
        disabled={busy}
        className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {actingId === `reject-${id}` ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : null}
        Reddet
      </button>
    </div>
  );
}

// ─── Pending listings tab ────────────────────────────────────────────────────

function PendingListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPendingListings()
      .then((data) => { if (!cancelled) setItems(Array.isArray(data) ? data : []); })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || 'Yüklenemedi.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [refreshKey]);

  const act = async (id, action, fn) => {
    setActingId(`${action}-${id}`);
    try {
      await fn(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      // sessizce geç
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-4 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="flex-1">{error}</p>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Tekrar dene
        </button>
      </div>
    );
  }

  if (items.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-start justify-between gap-6">
            {/* Bilgiler */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600">
                  {TYPE_LABEL[item.type] ?? item.type}
                </span>
                <span className="text-stone-400">{formatDate(item.created_at)}</span>
                {item.city && (
                  <span className="text-stone-400">{item.city}</span>
                )}
              </div>
              <h3 className="mt-3 font-semibold text-stone-900 text-base leading-snug">
                {item.title}
              </h3>
              <p className="mt-1.5 text-stone-500 text-sm leading-relaxed line-clamp-2">
                {item.description}
              </p>
              <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-stone-500">
                {item.price ? (
                  <span className="font-semibold text-stone-800">{formatPrice(item.price)}</span>
                ) : null}
                <span>{item.full_name || item.owner_name || '—'}</span>
                {item.university && <span className="text-stone-400">{item.university}</span>}
              </div>
            </div>

            {/* Aksiyon butonları */}
            <ActionButtons
              id={item.id}
              actingId={actingId}
              onApprove={() => act(item.id, 'approve', approveListing)}
              onReject={() => act(item.id, 'reject', rejectListing)}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

// ─── Pending events tab ───────────────────────────────────────────────────────

function PendingEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPendingEvents()
      .then((data) => { if (!cancelled) setItems(Array.isArray(data) ? data : []); })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || 'Yüklenemedi.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [refreshKey]);

  const act = async (id, action, fn) => {
    setActingId(`${action}-${id}`);
    try {
      await fn(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      // sessizce geç
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-4 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="flex-1">{error}</p>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Tekrar dene
        </button>
      </div>
    );
  }

  if (items.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-start justify-between gap-6">
            {/* Bilgiler */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-medium bg-sky-50 text-sky-700">
                  Etkinlik
                </span>
                <span className="text-stone-400">{formatDate(item.created_at)}</span>
              </div>
              <h3 className="mt-3 font-semibold text-stone-900 text-base leading-snug">
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-1.5 text-stone-500 text-sm leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-stone-500">
                {item.location && <span>{item.location}</span>}
                {item.event_date && (
                  <span className="font-medium text-stone-700">{formatDateLong(item.event_date)}</span>
                )}
                <span>{item.full_name || '—'}</span>
                {item.university && <span className="text-stone-400">{item.university}</span>}
              </div>
            </div>

            {/* Aksiyon butonları */}
            <ActionButtons
              id={item.id}
              actingId={actingId}
              onApprove={() => act(item.id, 'approve', approveEvent)}
              onReject={() => act(item.id, 'reject', rejectEvent)}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

const TABS = [
  { value: 'listings', label: 'Bekleyen İlanlar' },
  { value: 'events', label: 'Bekleyen Etkinlikler' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('listings');

  return (
    <div className="text-stone-900">
      {/* Sayfa başlığı */}
      <header className="pb-10 lg:pb-12 border-b border-stone-200">
        <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">
          YÖNETİM PANELİ
        </p>
        <h1 className="mt-8 font-serif font-normal text-stone-900 text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
          Admin Paneli.
        </h1>
        <p className="mt-5 font-serif italic text-stone-500 text-lg md:text-xl">
          Bekleyen içerikleri incele, onayla veya reddet.
        </p>
      </header>

      {/* Sekmeler */}
      <div className="mt-8 lg:mt-10 border-b border-stone-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.value
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* İçerik */}
      <div className="mt-8 lg:mt-10">
        {activeTab === 'listings' && <PendingListings />}
        {activeTab === 'events' && <PendingEvents />}
      </div>
    </div>
  );
}
