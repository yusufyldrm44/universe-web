import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '../services/authStore';
import { deleteListing, getListings } from '../services/listingService';
import NewListingModal from '../components/NewListingModal';
import { applyListingFilters, formatDate, formatPrice, imgUrl } from '../utils/fp';

const TYPES = [
  { value: 'all', label: 'Tümü' },
  { value: 'item', label: 'Eşya' },
  { value: 'house', label: 'Ev' },
  { value: 'roommate', label: 'Ev Arkadaşı' },
  { value: 'job', label: 'İş' },
];

const TYPE_COLOR = {
  item: 'text-stone-600 bg-stone-100',
  house: 'text-amber-700 bg-amber-50',
  roommate: 'text-sky-700 bg-sky-50',
  job: 'text-emerald-700 bg-emerald-50',
};

const TYPE_LABEL = {
  item: 'Eşya',
  house: 'Ev',
  roommate: 'Ev Arkadaşı',
  job: 'İş',
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-stone-100" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-stone-100 rounded-full" />
          <div className="h-4 w-16 bg-stone-100 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-stone-100 rounded" />
        <div className="h-4 w-full bg-stone-100 rounded" />
        <div className="h-4 w-2/3 bg-stone-100 rounded" />
        <div className="flex justify-between pt-2 border-t border-stone-100">
          <div className="h-5 w-24 bg-stone-100 rounded" />
          <div className="h-4 w-28 bg-stone-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const user = useAuthStore((s) => s.user);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');
  const [myUniversityOnly, setMyUniversityOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCity(cityFilter), 400);
    return () => clearTimeout(t);
  }, [cityFilter]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (activeType !== 'all') params.type = activeType;
        if (debouncedCity.trim()) params.city = debouncedCity.trim();
        if (myUniversityOnly && user?.university) params.university = user.university;
        const data = await getListings(params);
        if (!cancelled) setListings(Array.isArray(data) ? data : (data?.listings ?? []));
      } catch (err) {
        if (!cancelled)
          setError(
            err?.response?.data?.message || err?.message || 'İlanlar yüklenemedi.'
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [activeType, refreshKey, debouncedCity, myUniversityOnly, user?.university]);

  const filtered = useMemo(
    () => applyListingFilters({ search: debouncedSearch })(listings),
    [listings, debouncedSearch]
  );

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      // sessizce geç
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="text-stone-900">
      {/* Sayfa başlığı */}
      <header className="pb-10 lg:pb-12 border-b border-stone-200">
        <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">
          İLANLAR
        </p>
        <h1 className="mt-8 font-serif font-normal text-stone-900 text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
          Kampüs ilanları.
        </h1>
        <p className="mt-5 font-serif italic text-stone-500 text-lg md:text-xl lg:text-2xl">
          Eşya, ev, ev arkadaşı, part-time iş — hepsi burada.
        </p>
      </header>

      {/* Filtre & arama barı */}
      <div className="mt-8 lg:mt-10 space-y-3">
        {/* Üst satır: kategori + yeni ilan */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setActiveType(t.value)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                  activeType === t.value
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 active:bg-stone-950 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Yeni İlan
          </button>
        </div>

        {/* Alt satır: arama + şehir + üniversite toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İlan ara..."
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 bg-white transition"
            />
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Şehir filtrele..."
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 bg-white transition"
            />
          </div>
          {user?.university && (
            <button
              type="button"
              onClick={() => setMyUniversityOnly((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-colors whitespace-nowrap ${
                myUniversityOnly
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800'
              }`}
            >
              Sadece üniversitem
            </button>
          )}
        </div>
      </div>

      {/* İçerik alanı */}
      <div className="mt-8 lg:mt-10">
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

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 py-20 px-6 text-center">
            <p className="font-serif text-stone-400 text-xl md:text-2xl">
              {debouncedSearch
                ? `"${debouncedSearch}" için sonuç bulunamadı.`
                : 'Bu kategoride henüz ilan yok.'}
            </p>
            {!debouncedSearch && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                İlk ilanı sen ver
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isOwner={user?.id === listing.user_id}
                deleting={deletingId === listing.id}
                onDelete={(e) => { e.preventDefault(); handleDelete(listing.id); }}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <NewListingModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); bumpRefresh(); }}
        />
      )}
    </div>
  );
}

function ListingCard({ listing, isOwner, deleting, onDelete }) {
  const colorClass = TYPE_COLOR[listing.type] ?? 'text-stone-600 bg-stone-100';
  const coverUrl = listing.images?.[0] ? imgUrl(listing.images[0]) : null;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Fotoğraf */}
      <div className="h-48 bg-stone-100 flex-shrink-0 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-stone-300" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-xs">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${colorClass}`}>
            {TYPE_LABEL[listing.type] ?? listing.type}
          </span>
          <span className="text-stone-400">{formatDate(listing.created_at)}</span>
        </div>

        <h2 className="mt-3 font-semibold text-stone-900 text-base leading-snug">
          {listing.title}
        </h2>

        <p className="mt-1.5 text-stone-500 text-sm leading-relaxed line-clamp-2 flex-1">
          {listing.description}
        </p>

        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <span className="font-semibold text-stone-900 text-sm">
            {listing.price ? formatPrice(listing.price) : null}
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-stone-400 truncate">
              {listing.full_name || listing.university || ''}
            </span>
            {isOwner && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                aria-label="İlanı sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
