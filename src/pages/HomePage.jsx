import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '../services/authStore';

const FEATURED = {
  category: 'TOPLULUK',
  title: 'Yapay Zeka Topluluğu açılış toplantısı',
  excerpt:
    'Bahar dönemiyle birlikte yeniden bir araya gelen topluluk, yıl boyu sürecek atölye ve seminer programını paylaşacak. Tüm fakültelerden katılımcı bekleniyor.',
  date: '02 Mayıs · Cuma · 18:00',
  location: 'Mühendislik Fakültesi, B201',
  to: '/events',
};

const MORE = [
  { title: 'Bahar Şenliği konseri', meta: '08 Mayıs · Açık Hava' },
  { title: 'Kariyer Günleri 2026', meta: '15 Mayıs · Kongre Merkezi' },
  { title: 'Felsefe Kulübü okuma grubu', meta: '03 Mayıs · Edebiyat Fak.' },
  { title: 'Bilim Olimpiyatı kayıtları', meta: 'Son tarih · 11 Mayıs' },
];

const TICKER = [
  'Bahar şenliği',
  'Kariyer günleri',
  'Yapay zeka topluluğu',
  'Mezuniyet töreni',
  'Bilim olimpiyatı',
  'Müzik kulübü dinletisi',
  'Spor turnuvası',
  'Kütüphane gece ışıkları',
];

const CULTURE = [
  { label: 'Müzik', meta: '4 yeni etkinlik' },
  { label: 'Tiyatro', meta: 'Bu hafta sahne' },
  { label: 'Spor', meta: 'Turnuva kayıtları' },
  { label: 'Edebiyat', meta: 'Okuma grubu' },
];

const PULSE = [
  { value: '128', label: 'İLAN', delta: '+%23 bu hafta' },
  { value: '9', label: 'ETKİNLİK', delta: 'Önümüzdeki 7 gün' },
  { value: '4', label: 'YENİ MESAJ', delta: 'Son 24 saat' },
];

const dateline = (university) => {
  const now = new Date();
  const weekday = now.toLocaleDateString('tr-TR', { weekday: 'long' });
  const day = now.toLocaleDateString('tr-TR', { day: 'numeric' });
  const month = now.toLocaleDateString('tr-TR', { month: 'long' });
  const year = now.getFullYear();
  const place = (university || 'Kampüs').trim();
  return `${weekday} · ${day} ${month} ${year} · ${place}`.toUpperCase();
};

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const firstName = (user?.full_name || '').split(' ')[0] || '';
  const headline = useMemo(() => dateline(user?.university), [user?.university]);

  const subtitle = firstName
    ? `${firstName} için derlenmiş seçkiler.`
    : 'Bu sayının seçkileri.';

  return (
    <div className="text-stone-900 space-y-20 lg:space-y-28">
      {/* BLOK 1 — EDITORIAL HERO */}
      <section className="grid grid-cols-12 gap-x-10 pb-12 lg:pb-16 border-b border-stone-200">
        <div className="col-span-12 lg:col-span-10">
          <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">
            {headline}
          </p>
          <h1 className="mt-8 lg:mt-10 font-serif font-normal text-stone-900 text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.02] tracking-tight max-w-5xl">
            Bu hafta kampüste
            <br />
            neler oluyor.
          </h1>
          <p className="mt-6 lg:mt-8 font-serif italic text-stone-500 text-lg md:text-xl lg:text-2xl">
            {subtitle}
          </p>
        </div>
        <div className="hidden lg:flex col-span-2 items-end justify-end">
          <div className="flex flex-col items-end gap-3 text-stone-400">
            <span className="block w-px h-20 bg-stone-300" />
            <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.22em] uppercase">
              <ArrowDown className="w-3 h-3" strokeWidth={1.5} />
              Aşağı kaydır
            </span>
          </div>
        </div>
      </section>

      {/* BLOK 2 + 3 — ÖNE ÇIKAN + DAHA */}
      <section className="grid grid-cols-12 gap-x-12 lg:gap-x-16 gap-y-14">
        {/* Öne çıkan */}
        <article className="col-span-12 lg:col-span-8 relative">
          <div className="absolute inset-0 -mx-8 lg:-mx-12 -my-8 lg:-my-12 bg-stone-100/60 rounded-sm pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-stone-500 font-medium">
              <span className="block w-6 h-px bg-stone-400" />
              ÖNE ÇIKAN
            </div>

            <p className="mt-8 text-[11px] tracking-[0.22em] uppercase text-stone-500">
              {FEATURED.category}
            </p>

            <h2 className="mt-4 font-serif font-normal text-stone-900 text-3xl md:text-4xl lg:text-5xl leading-[1.1] max-w-3xl">
              {FEATURED.title}
            </h2>

            <p className="mt-6 lg:mt-8 text-stone-600 leading-relaxed text-base lg:text-lg max-w-2xl">
              {FEATURED.excerpt}
            </p>

            <div className="mt-10 pt-6 border-t border-stone-300/70 flex items-end justify-between gap-6 flex-wrap">
              <div className="text-sm lg:text-base text-stone-600 space-y-0.5">
                <p className="font-medium text-stone-800">{FEATURED.date}</p>
                <p className="text-stone-500">{FEATURED.location}</p>
              </div>
              <Link
                to={FEATURED.to}
                className="group inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-stone-900 font-medium border-b border-stone-900 pb-1 hover:gap-3 transition-all"
              >
                Oku
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </article>

        {/* Daha */}
        <aside className="col-span-12 lg:col-span-4">
          <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">
            DAHA
          </p>
          <ul className="mt-6 lg:mt-8">
            {MORE.map((item, idx) => (
              <li
                key={item.title}
                className={`group cursor-pointer py-5 ${
                  idx === 0 ? '' : 'border-t border-stone-200'
                }`}
              >
                <h3 className="font-serif text-lg lg:text-xl text-stone-900 leading-snug group-hover:underline decoration-stone-400 underline-offset-4">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs lg:text-sm text-stone-500 tracking-wide">
                  {item.meta}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* BLOK 4 — DAR ŞERİT (full-width breakout) */}
      <section className="-mx-8 lg:-mx-16 border-y border-stone-200 overflow-hidden">
        <div className="py-5 group">
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
            {[...TICKER, ...TICKER].map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className="flex items-center text-stone-600 font-serif text-base md:text-lg lg:text-xl whitespace-nowrap"
              >
                <span className="mx-10 text-stone-300" aria-hidden>
                  ·
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* BLOK 5 + 6 + 7 */}
      <section className="grid grid-cols-12 gap-x-10 lg:gap-x-14 gap-y-14">
        {/* Kültür & Topluluk */}
        <div className="col-span-12 lg:col-span-4">
          <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">
            KÜLTÜR & TOPLULUK
          </p>
          <ul className="mt-6 lg:mt-8">
            {CULTURE.map((c, idx) => (
              <li
                key={c.label}
                className={`group flex items-start justify-between gap-3 py-4 lg:py-5 cursor-pointer ${
                  idx === 0 ? '' : 'border-t border-stone-200'
                }`}
              >
                <div>
                  <p className="font-serif text-lg lg:text-xl text-stone-900 group-hover:underline decoration-stone-400 underline-offset-4">
                    {c.label}
                  </p>
                  <p className="text-xs lg:text-sm text-stone-500 mt-1">
                    {c.meta}
                  </p>
                </div>
                <ArrowUpRight
                  className="w-4 h-4 lg:w-5 lg:h-5 text-stone-400 mt-1 group-hover:text-stone-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={1.5}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Big quote */}
        <figure className="col-span-12 lg:col-span-4 flex flex-col justify-center lg:px-10 lg:border-x lg:border-stone-200">
          <span
            aria-hidden
            className="font-serif text-stone-300 text-7xl lg:text-8xl leading-none -mb-6"
          >
            &ldquo;
          </span>
          <blockquote className="font-serif text-stone-900 text-3xl md:text-4xl lg:text-5xl leading-[1.15]">
            İlanlar bu hafta yüzde yirmi üç arttı —{' '}
            <span className="text-stone-500">
              yurt değişimi ve ders kitabı paylaşımı yine başı çekiyor.
            </span>
          </blockquote>
          <figcaption className="mt-8 text-xs tracking-[0.22em] uppercase text-stone-500">
            UniVerse Haftalık · Sayı 14
          </figcaption>
        </figure>

        {/* Kampüs Nabzı */}
        <div className="col-span-12 lg:col-span-4">
          <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">
            KAMPÜS NABZI
          </p>
          <dl className="mt-6 lg:mt-8 divide-y divide-stone-200">
            {PULSE.map((p) => (
              <div key={p.label} className="py-6 first:pt-0">
                <dt className="text-[10px] tracking-[0.22em] uppercase text-stone-500">
                  {p.label}
                </dt>
                <dd className="mt-2 font-serif text-5xl lg:text-6xl text-stone-900 leading-none">
                  {p.value}
                </dd>
                <p className="mt-3 text-xs lg:text-sm text-stone-500">
                  {p.delta}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Kapanış imzası */}
      <footer className="pt-10 border-t border-stone-200 flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-stone-400">
        <span>UniVerse Haftalık</span>
        <span>Sayı 14 · İlkbahar</span>
      </footer>
    </div>
  );
}
