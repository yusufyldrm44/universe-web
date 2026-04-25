import { useAuthStore } from '../services/authStore';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <section className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">
          Hoş geldin{user?.full_name ? `, ${user.full_name}` : ''} 👋
        </h1>
        <p className="mt-2 text-slate-600">
          UniVerse'e hoş geldin. Üniversite topluluğunla buluş, ilanları
          keşfet ve etkinlikleri takip et.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'İlanlar', desc: 'Kitap, eşya, oda paylaşımı.' },
          { title: 'Etkinlikler', desc: 'Kampüsteki son etkinlikler.' },
          { title: 'Mesajlar', desc: 'Topluluğunla iletişimde kal.' },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <h2 className="font-semibold text-primary">{card.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
