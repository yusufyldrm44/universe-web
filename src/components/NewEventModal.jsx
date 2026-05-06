import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { createEvent } from '../services/eventService';

const CATEGORIES = [
  { value: 'community', label: 'Topluluk' },
  { value: 'event', label: 'Etkinlik' },
  { value: 'career', label: 'Kariyer' },
  { value: 'sport', label: 'Spor' },
  { value: 'other', label: 'Diğer' },
];

export default function NewEventModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState('event');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      event_date: eventDate,
      category,
    };

    setLoading(true);
    try {
      await createEvent(payload);
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Etkinlik oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200 p-8 text-center animate-fade-in-up">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <span className="text-amber-600 text-xl font-bold">!</span>
          </div>
          <h3 className="mt-4 font-serif text-xl text-stone-900">Etkinliğiniz gönderildi.</h3>
          <p className="mt-2 text-sm text-stone-500 leading-relaxed">
            Etkinliğiniz admin onayına gönderildi. Onaylandıktan sonra yayına girecek.
          </p>
          <button
            type="button"
            onClick={onSuccess}
            className="mt-6 w-full py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] animate-fade-in-up">
        {/* Başlık */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-stone-200 flex-shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-stone-500">YENİ ETKİNLİK</p>
            <h2 className="mt-1 font-serif text-2xl text-stone-900 leading-tight">Etkinlik oluştur.</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-7 py-6 space-y-5 flex-1">

          {/* Kategori */}
          <div>
            <p className="text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2.5">
              Kategori
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    category === c.value
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500 hover:text-stone-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Başlık */}
          <div>
            <label htmlFor="ev-title" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
              Başlık <span className="normal-case tracking-normal text-stone-400">(zorunlu)</span>
            </label>
            <input
              ref={titleRef}
              id="ev-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Etkinliğin adı"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
            />
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="ev-desc" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
              Açıklama
            </label>
            <textarea
              id="ev-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Etkinlik hakkında kısa bilgi..."
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition resize-none"
            />
          </div>

          {/* Konum + Tarih */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ev-location" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                Konum <span className="normal-case tracking-normal text-stone-400">(zorunlu)</span>
              </label>
              <input
                id="ev-location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mühendislik Fak. B201"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
              />
            </div>
            <div>
              <label htmlFor="ev-date" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                Tarih & Saat <span className="normal-case tracking-normal text-stone-400">(zorunlu)</span>
              </label>
              <input
                id="ev-date"
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
              />
            </div>
          </div>

          {/* Hata */}
          {error && (
            <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Aksiyonlar */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-stone-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-stone-800 active:bg-stone-950 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Oluşturuluyor…</>
              ) : (
                'Oluştur'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
