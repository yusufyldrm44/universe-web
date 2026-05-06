import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, Upload, X } from 'lucide-react';
import { createListing } from '../services/listingService';

const TYPES = [
  { value: 'item', label: 'Eşya' },
  { value: 'house', label: 'Ev' },
  { value: 'roommate', label: 'Ev Arkadaşı' },
  { value: 'job', label: 'İş' },
  { value: 'internship', label: 'Staj' },
];

const PRICE_TYPES = new Set(['item', 'house']);
const MAX_PHOTOS = 8;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              value === opt.value
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500 hover:text-stone-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NewListingModal({ onClose, onSuccess }) {
  const [type, setType] = useState('item');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [condition, setCondition] = useState('');
  const [extraData, setExtraData] = useState({});
  const [photos, setPhotos] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Reset type-specific fields on type change
  const handleTypeChange = (t) => {
    setType(t);
    setCondition('');
    setExtraData({});
    if (!PRICE_TYPES.has(t)) setPrice('');
  };

  const setExtra = (key, val) =>
    setExtraData((prev) => ({ ...prev, [key]: val }));

  // Photo handling
  const addFiles = (fileList) => {
    const accepted = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/') && f.size <= MAX_SIZE)
      .slice(0, MAX_PHOTOS - photos.length);
    if (accepted.length) setPhotos((prev) => [...prev, ...accepted].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.append('type', type);
    fd.append('title', title.trim());
    fd.append('description', description.trim());
    if (PRICE_TYPES.has(type) && price) fd.append('price', Number(price));
    if (city.trim()) fd.append('city', city.trim());
    if (condition) fd.append('condition', condition);
    fd.append('extra_data', JSON.stringify(extraData));
    photos.forEach((p) => fd.append('images', p));

    setLoading(true);
    try {
      await createListing(fd);
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'İlan oluşturulamadı.');
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
          <h3 className="mt-4 font-serif text-xl text-stone-900">İlanınız gönderildi.</h3>
          <p className="mt-2 text-sm text-stone-500 leading-relaxed">
            İlanınız admin onayına gönderildi. Onaylandıktan sonra yayına girecek.
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
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] animate-fade-in-up">
        {/* Başlık — sabit */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-stone-200 flex-shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-stone-500">YENİ İLAN</p>
            <h2 className="mt-1 font-serif text-2xl text-stone-900 leading-tight">İlan ver.</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form — kaydırılabilir */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-7 py-6 space-y-5 flex-1">

          {/* Tür */}
          <ToggleGroup
            label="Tür"
            options={TYPES}
            value={type}
            onChange={handleTypeChange}
          />

          {/* Başlık */}
          <div>
            <label htmlFor="ml-title" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
              Başlık <span className="normal-case tracking-normal text-stone-400">(zorunlu)</span>
            </label>
            <input
              ref={titleRef}
              id="ml-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="İlanın kısaca ne hakkında?"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
            />
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="ml-desc" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
              Açıklama <span className="normal-case tracking-normal text-stone-400">(zorunlu)</span>
            </label>
            <textarea
              id="ml-desc"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detayları buraya yaz..."
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition resize-none"
            />
          </div>

          {/* Fotoğraf yükleme */}
          <div>
            <p className="text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
              Fotoğraflar{' '}
              <span className="normal-case tracking-normal text-stone-400">
                (maks. {MAX_PHOTOS} adet, her biri maks. 5 MB)
              </span>
            </p>
            {photos.length < MAX_PHOTOS && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-stone-500 bg-stone-50'
                    : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                <Upload className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
                <p className="text-sm text-stone-500">
                  Sürükle bırak veya <span className="font-medium text-stone-700">tıkla</span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>
            )}
            {photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* İki sütunlu ortak alanlar: Şehir + Fiyat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ml-city" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                Şehir
              </label>
              <input
                id="ml-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="İstanbul, Ankara..."
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
              />
            </div>
            {PRICE_TYPES.has(type) && (
              <div>
                <label htmlFor="ml-price" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                  Fiyat <span className="normal-case tracking-normal text-stone-400">(TL)</span>
                </label>
                <input
                  id="ml-price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
                />
              </div>
            )}
          </div>

          {/* Eşya: Durum */}
          {type === 'item' && (
            <ToggleGroup
              label="Durum"
              options={[
                { value: 'new', label: 'Sıfır' },
                { value: 'used', label: 'Az Kullanılmış' },
                { value: 'worn', label: 'Yıpranmış' },
              ]}
              value={condition}
              onChange={setCondition}
            />
          )}

          {/* Ev Arkadaşı: ek alanlar */}
          {type === 'roommate' && (
            <>
              <ToggleGroup
                label="Cinsiyet tercihi"
                options={[
                  { value: 'any', label: 'Farketmez' },
                  { value: 'male', label: 'Erkek' },
                  { value: 'female', label: 'Kadın' },
                ]}
                value={extraData.gender_pref ?? ''}
                onChange={(v) => setExtra('gender_pref', v)}
              />
              <ToggleGroup
                label="Sigara"
                options={[
                  { value: 'no', label: 'Hayır' },
                  { value: 'yes', label: 'Evet' },
                  { value: 'any', label: 'Farketmez' },
                ]}
                value={extraData.smoking ?? ''}
                onChange={(v) => setExtra('smoking', v)}
              />
            </>
          )}

          {/* İş: ek alanlar */}
          {type === 'job' && (
            <>
              <ToggleGroup
                label="Çalışma şekli"
                options={[
                  { value: 'onsite', label: 'Yerinde' },
                  { value: 'remote', label: 'Uzaktan' },
                  { value: 'hybrid', label: 'Hibrit' },
                ]}
                value={extraData.work_type ?? ''}
                onChange={(v) => setExtra('work_type', v)}
              />
              <div>
                <label htmlFor="ml-hours" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                  Saat / Hafta <span className="normal-case tracking-normal text-stone-400">(tahmini)</span>
                </label>
                <input
                  id="ml-hours"
                  type="number"
                  min="1"
                  max="60"
                  value={extraData.hours_per_week ?? ''}
                  onChange={(e) => setExtra('hours_per_week', e.target.value)}
                  placeholder="20"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
                />
              </div>
            </>
          )}

          {/* Staj: ek alanlar */}
          {type === 'internship' && (
            <>
              <div>
                <label htmlFor="ml-company" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                  Şirket / Kurum <span className="normal-case tracking-normal text-stone-400">(zorunlu)</span>
                </label>
                <input
                  id="ml-company"
                  type="text"
                  required
                  value={extraData.company_name ?? ''}
                  onChange={(e) => setExtra('company_name', e.target.value)}
                  placeholder="Şirket adı"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
                />
              </div>
              <div>
                <label htmlFor="ml-duration" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                  Süre <span className="normal-case tracking-normal text-stone-400">(ay)</span>
                </label>
                <input
                  id="ml-duration"
                  type="number"
                  min="1"
                  max="24"
                  value={extraData.duration_months ?? ''}
                  onChange={(e) => setExtra('duration_months', e.target.value)}
                  placeholder="3"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
                />
              </div>
              <ToggleGroup
                label="Ücretli mi?"
                options={[
                  { value: 'true', label: 'Evet' },
                  { value: 'false', label: 'Hayır' },
                ]}
                value={extraData.is_paid != null ? String(extraData.is_paid) : ''}
                onChange={(v) => setExtra('is_paid', v === 'true')}
              />
              <ToggleGroup
                label="Çalışma şekli"
                options={[
                  { value: 'onsite', label: 'Yerinde' },
                  { value: 'remote', label: 'Uzaktan' },
                  { value: 'hybrid', label: 'Hibrit' },
                ]}
                value={extraData.work_type ?? ''}
                onChange={(v) => setExtra('work_type', v)}
              />
            </>
          )}

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
                <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor…</>
              ) : (
                'Yayınla'
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
