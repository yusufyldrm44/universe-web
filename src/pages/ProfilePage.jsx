import { useAuthStore } from '../services/authStore';

const initialsOf = (name) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const fullName = user?.full_name || 'Kullanıcı';
  const subtitle =
    [user?.department, user?.university].filter(Boolean).join(' · ') ||
    'Üniversite bilgisi henüz eklenmedi.';

  const rows = [
    { label: 'E-POSTA', value: user?.university_email || '—' },
    { label: 'ÜNİVERSİTE', value: user?.university || '—' },
    { label: 'BÖLÜM', value: user?.department || '—' },
    { label: 'KAYIT TARİHİ', value: 'Nisan 2026' },
  ];

  return (
    <div className="text-stone-900">
      {/* Başlık bloğu */}
      <header className="pb-10 lg:pb-14 border-b border-stone-200">
        <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">
          PROFİL · ÜYE 2026&apos;DAN BERİ
        </p>
        <h1 className="mt-8 lg:mt-10 font-serif font-normal text-stone-900 text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
          {fullName}.
        </h1>
        <p className="mt-5 lg:mt-7 font-serif italic text-stone-500 text-lg md:text-xl lg:text-2xl">
          {subtitle}
        </p>
      </header>

      {/* Editoryal grid */}
      <section className="mt-14 lg:mt-20 grid grid-cols-12 gap-x-10 lg:gap-x-12 gap-y-14">
        {/* Sol: tipografik avatar */}
        <div className="col-span-12 lg:col-span-5">
          <p
            aria-hidden
            className="font-serif font-normal text-stone-300 leading-none tracking-tight text-[10rem] md:text-[14rem] lg:text-[200px] select-none"
          >
            {initialsOf(user?.full_name)}
          </p>
          <div className="mt-8 pt-6 border-t border-stone-200 space-y-2">
            <p className="text-[11px] tracking-[0.22em] uppercase text-stone-500">
              Aktif kullanıcı
            </p>
            <p className="text-[11px] tracking-[0.22em] uppercase text-stone-400">
              0 ilan · 0 etkinlik
            </p>
          </div>
        </div>

        {/* Sağ: künye */}
        <div className="col-span-12 lg:col-span-7">
          <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">
            KÜNYE
          </p>
          <dl className="mt-6 lg:mt-8">
            {rows.map((row, idx) => (
              <div
                key={row.label}
                className={`py-6 lg:py-7 ${
                  idx === 0 ? 'border-t border-stone-200' : ''
                } border-b border-stone-200`}
              >
                <dt className="text-[10px] tracking-[0.22em] uppercase text-stone-500">
                  {row.label}
                </dt>
                <dd className="mt-3 font-serif text-2xl lg:text-3xl text-stone-900 leading-snug break-words">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Alt not */}
      <footer className="mt-20 lg:mt-24 pt-8 border-t border-stone-200">
        <p className="font-serif italic text-stone-500 text-sm lg:text-base">
          Profil düzenleme yakında.
        </p>
      </footer>
    </div>
  );
}
