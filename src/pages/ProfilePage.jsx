import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, Loader2, Pencil, X } from 'lucide-react';
import { useAuthStore } from '../services/authStore';
import { getAvatarUrl, getMe, updateProfile, uploadAvatar } from '../services/userService';

const initialsOf = (name) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'U';

function fmtMemberSince(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });
}

// ─── Toast notification ───────────────────────────────────────────────────────

function Toast({ type, message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  const isSuccess = type === 'success';
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border animate-fade-in-up ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {message}
    </div>
  );
}

// ─── Avatar section ───────────────────────────────────────────────────────────

function AvatarSection({ user, onAvatarUpdate }) {
  const [hovering, setHovering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  const avatarSrc = preview ?? getAvatarUrl(user?.avatar_url);
  const memberSince = fmtMemberSince(user?.created_at);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Sadece resim dosyası yükleyebilirsiniz.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Dosya boyutu 2 MB\'yi geçemez.' });
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const result = await uploadAvatar(file);
      useAuthStore.getState().updateUser({ avatar_url: result.avatar_url });
      onAvatarUpdate(result.avatar_url);
      setToast({ type: 'success', message: 'Fotoğraf güncellendi.' });
    } catch (err) {
      setPreview(null);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Yükleme başarısız.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div
        className="relative w-40 h-40 cursor-pointer select-none"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={user?.full_name}
            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="w-40 h-40 rounded-full bg-stone-900 flex items-center justify-center border-4 border-white shadow-md">
            <span className="font-serif text-white text-5xl font-normal leading-none">
              {initialsOf(user?.full_name)}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center gap-1 transition-opacity ${
            hovering && !uploading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
          <span className="text-white text-xs font-medium">Değiştir</span>
        </div>

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Meta */}
      <div className="space-y-1">
        <p className="font-semibold text-stone-900 text-lg leading-tight">
          {user?.full_name || 'Kullanıcı'}
        </p>
        {user?.university && (
          <p className="text-sm text-stone-500">{user.university}</p>
        )}
        {user?.department && (
          <p className="text-xs text-stone-400">{user.department}</p>
        )}
        {memberSince && (
          <p className="text-xs text-stone-400 pt-1">
            {memberSince}&apos;dan beri üye
          </p>
        )}
      </div>

      {toast && (
        <Toast type={toast.type} message={toast.message} onDone={() => setToast(null)} />
      )}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, muted }) {
  return (
    <div className="py-4 border-b border-stone-100">
      <p className="text-[10px] tracking-[0.18em] uppercase text-stone-400 font-medium">{label}</p>
      <p className={`mt-1.5 text-sm ${muted ? 'text-stone-400 italic' : 'text-stone-900'}`}>
        {value || <span className="italic text-stone-400">—</span>}
      </p>
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const storeUser = useAuthStore((s) => s.user);

  const [user, setUser] = useState(storeUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', department: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Load fresh profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMe();
        setUser(data);
        useAuthStore.getState().updateUser(data);
      } catch (err) {
        setToast({ type: 'error', message: err?.response?.data?.message || 'Profil yüklenemedi.' });
      }
    };
    loadProfile();
  }, []);

  const startEdit = () => {
    setForm({
      full_name: user?.full_name || '',
      department: user?.department || '',
      bio: user?.bio || '',
    });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        full_name: form.full_name.trim(),
        department: form.department.trim(),
        bio: form.bio.trim(),
      });
      useAuthStore.getState().updateUser(updated);
      setUser((prev) => ({ ...prev, ...updated }));
      setEditing(false);
      setToast({ type: 'success', message: 'Profil güncellendi.' });
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Güncelleme başarısız.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = (avatarUrl) => {
    setUser((prev) => ({ ...prev, avatar_url: avatarUrl }));
  };

  const subtitle = [user?.department, user?.university].filter(Boolean).join(' · ');

  return (
    <div className="text-stone-900">
      {/* Page header */}
      <header className="pb-10 lg:pb-12 border-b border-stone-200">
        <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">PROFİL</p>
        <h1 className="mt-8 font-serif font-normal text-stone-900 text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
          {user?.full_name || 'Kullanıcı'}.
        </h1>
        {subtitle && (
          <p className="mt-5 font-serif italic text-stone-500 text-lg md:text-xl">
            {subtitle}
          </p>
        )}
      </header>

      {/* Toast (global) */}
      {toast && (
        <div className="mt-6">
          <Toast type={toast.type} message={toast.message} onDone={() => setToast(null)} />
        </div>
      )}

      {/* Two-column grid */}
      <section className="mt-12 lg:mt-14 grid grid-cols-12 gap-x-10 lg:gap-x-14 gap-y-10">
        {/* Left — avatar */}
        <div className="col-span-12 lg:col-span-4">
          <AvatarSection user={user} onAvatarUpdate={handleAvatarUpdate} />
        </div>

        {/* Right — info / form */}
        <div className="col-span-12 lg:col-span-8">
          {editing ? (
            /* ── Edit mode ── */
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] tracking-[0.22em] uppercase text-stone-500 font-medium">
                  BİLGİLERİ DÜZENLE
                </p>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-stone-400 hover:text-stone-700 transition-colors"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Ad Soyad */}
              <div>
                <label htmlFor="pf-name" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                  Ad Soyad
                </label>
                <input
                  id="pf-name"
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
                />
              </div>

              {/* E-posta — disabled */}
              <div>
                <label htmlFor="pf-email" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                  E-posta
                  <span className="normal-case tracking-normal text-stone-400 ml-1">(değiştirilemez)</span>
                </label>
                <input
                  id="pf-email"
                  type="email"
                  disabled
                  value={user?.university_email || ''}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-stone-400 text-sm bg-stone-50 cursor-not-allowed"
                />
              </div>

              {/* Üniversite — disabled */}
              <div>
                <label htmlFor="pf-uni" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                  Üniversite
                  <span className="normal-case tracking-normal text-stone-400 ml-1">(değiştirilemez)</span>
                </label>
                <input
                  id="pf-uni"
                  type="text"
                  disabled
                  value={user?.university || ''}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-stone-400 text-sm bg-stone-50 cursor-not-allowed"
                />
              </div>

              {/* Bölüm */}
              <div>
                <label htmlFor="pf-dept" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                  Bölüm
                </label>
                <input
                  id="pf-dept"
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  placeholder="Bilgisayar Mühendisliği"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
                />
              </div>

              {/* Biyografi */}
              <div>
                <label htmlFor="pf-bio" className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
                  Biyografi
                  <span className="normal-case tracking-normal text-stone-400 ml-1">(opsiyonel)</span>
                </label>
                <textarea
                  id="pf-bio"
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Kendinizden kısaca bahsedin..."
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 active:bg-stone-950 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-50 disabled:opacity-50 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            /* ── View mode ── */
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] tracking-[0.22em] uppercase text-stone-500 font-medium">
                  BİLGİLER
                </p>
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Düzenle
                </button>
              </div>

              <div className="mt-4">
                <InfoRow label="Ad Soyad" value={user?.full_name} />
                <InfoRow label="E-posta" value={user?.university_email} />
                <InfoRow label="Üniversite" value={user?.university} />
                <InfoRow label="Bölüm" value={user?.department} />
                <div className="py-4 border-b border-stone-100">
                  <p className="text-[10px] tracking-[0.18em] uppercase text-stone-400 font-medium">
                    Biyografi
                  </p>
                  {user?.bio ? (
                    <p className="mt-1.5 text-sm text-stone-900 leading-relaxed whitespace-pre-wrap">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-sm italic text-stone-400">
                      Henüz biyografi eklenmedi.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
