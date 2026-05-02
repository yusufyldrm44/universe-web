import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Share2 } from 'lucide-react';
import { useAuthStore } from '../services/authStore';
import { getListingById } from '../services/listingService';
import { formatDateLong, formatPrice, imgUrl } from '../utils/fp';

const TYPE_LABEL = {
  item: 'Eşya',
  house: 'Ev',
  roommate: 'Ev Arkadaşı',
  job: 'İş',
};

const TYPE_COLOR = {
  item: 'text-stone-600 bg-stone-100',
  house: 'text-amber-700 bg-amber-50',
  roommate: 'text-sky-700 bg-sky-50',
  job: 'text-emerald-700 bg-emerald-50',
};

const CONDITION_LABEL = { new: 'Sıfır', used: 'Az Kullanılmış', worn: 'Yıpranmış' };
const WORK_TYPE_LABEL = { onsite: 'Yerinde', remote: 'Uzaktan', hybrid: 'Hibrit' };
const GENDER_LABEL = { any: 'Farketmez', male: 'Erkek', female: 'Kadın' };
const SMOKING_LABEL = { yes: 'Evet', no: 'Hayır', any: 'Farketmez' };

const initialsOf = (name) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-3.5 border-b border-stone-100 flex items-start justify-between gap-4">
      <span className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 whitespace-nowrap">
        {label}
      </span>
      <span className="text-sm text-stone-800 text-right">{value}</span>
    </div>
  );
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getListingById(id)
      .then((data) => {
        if (!cancelled) {
          setListing(data.listing ?? data);
          setActivePhoto(0);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || 'İlan yüklenemedi.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="text-stone-900">
        <Back />
        <div className="mt-8 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-4 text-sm">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const images = Array.isArray(listing.images) ? listing.images : [];
  const extraData = listing.extra_data
    ? (typeof listing.extra_data === 'string'
        ? JSON.parse(listing.extra_data)
        : listing.extra_data)
    : {};
  const colorClass = TYPE_COLOR[listing.type] ?? 'text-stone-600 bg-stone-100';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: listing.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <div className="text-stone-900">
      {/* Geri + meta */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <Back />
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {TYPE_LABEL[listing.type] ?? listing.type}
          </span>
          <span className="text-xs text-stone-400">
            {formatDateLong(listing.created_at)}
          </span>
        </div>
      </div>

      {/* Fotoğraf galerisi */}
      <div className="mt-8">
        {images.length > 0 ? (
          <>
            <div className="w-full h-80 md:h-[26rem] rounded-xl overflow-hidden bg-stone-100">
              <img
                src={imgUrl(images[activePhoto])}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhoto(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === activePhoto ? 'border-stone-700' : 'border-transparent'
                    }`}
                  >
                    <img src={imgUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-64 rounded-xl bg-stone-100 flex items-center justify-center">
            <span className="text-stone-300 text-sm">Fotoğraf eklenmemiş</span>
          </div>
        )}
      </div>

      {/* Ana içerik grid */}
      <div className="mt-10 grid grid-cols-12 gap-x-10 lg:gap-x-14 gap-y-10">
        {/* Sol — detaylar */}
        <div className="col-span-12 lg:col-span-8">
          <h1 className="font-serif font-normal text-stone-900 text-3xl md:text-4xl leading-tight tracking-tight">
            {listing.title}
          </h1>

          {listing.city && (
            <p className="mt-3 flex items-center gap-1.5 text-stone-500 text-sm">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              {listing.city}
            </p>
          )}

          <p className="mt-6 text-stone-700 leading-relaxed text-base whitespace-pre-wrap">
            {listing.description}
          </p>

          {/* Detay tablosu */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <p className="text-[11px] tracking-[0.22em] uppercase text-stone-500 font-medium mb-4">
              Detaylar
            </p>
            <div>
              <DetailRow label="Kategori" value={TYPE_LABEL[listing.type]} />
              <DetailRow label="Şehir" value={listing.city} />
              <DetailRow label="Üniversite" value={listing.university} />
              {listing.condition && (
                <DetailRow label="Durum" value={CONDITION_LABEL[listing.condition] ?? listing.condition} />
              )}
              {extraData.work_type && (
                <DetailRow label="Çalışma şekli" value={WORK_TYPE_LABEL[extraData.work_type]} />
              )}
              {extraData.hours_per_week && (
                <DetailRow label="Saat / Hafta" value={`${extraData.hours_per_week} saat`} />
              )}
              {extraData.gender_pref && (
                <DetailRow label="Cinsiyet tercihi" value={GENDER_LABEL[extraData.gender_pref]} />
              )}
              {extraData.smoking && (
                <DetailRow label="Sigara" value={SMOKING_LABEL[extraData.smoking]} />
              )}
              <DetailRow label="İlan tarihi" value={formatDateLong(listing.created_at)} />
            </div>
          </div>
        </div>

        {/* Sağ — fiyat + ilan sahibi (sticky) */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            {/* Fiyat kutusu */}
            {listing.price != null && (
              <div className="bg-white rounded-xl border border-stone-200 p-5">
                <p className="text-[11px] tracking-[0.22em] uppercase text-stone-500">Fiyat</p>
                <p className="mt-2 font-serif text-4xl text-stone-900 leading-none">
                  {formatPrice(listing.price)}
                </p>
              </div>
            )}

            {/* İlan sahibi kartı */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
              <p className="text-[11px] tracking-[0.22em] uppercase text-stone-500">İlan Sahibi</p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-stone-900 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                  {initialsOf(listing.full_name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900 text-sm truncate">
                    {listing.full_name || 'Kullanıcı'}
                  </p>
                  {listing.university && (
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {listing.university}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/messages')}
                  disabled={user?.id === listing.user_id}
                  className="w-full py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 active:bg-stone-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Mesaj Gönder
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-stone-300 text-stone-700 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
                  İlanı Paylaş
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Back() {
  return (
    <Link
      to="/listings"
      className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
      İlanlara dön
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="text-stone-900 animate-pulse">
      <div className="h-4 w-28 bg-stone-200 rounded" />
      <div className="mt-8 w-full h-80 bg-stone-200 rounded-xl" />
      <div className="mt-10 grid grid-cols-12 gap-x-10 gap-y-10">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="h-8 w-2/3 bg-stone-200 rounded" />
          <div className="h-4 w-1/4 bg-stone-200 rounded" />
          <div className="mt-6 space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-stone-100 rounded" />)}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="h-24 bg-stone-200 rounded-xl" />
          <div className="h-48 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
