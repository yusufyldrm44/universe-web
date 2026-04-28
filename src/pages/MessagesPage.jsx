import { Construction, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Mesajlar</h1>
          <p className="mt-2 text-slate-500 max-w-xl">
            Topluluğunla anlık mesajlaş, gruplar oluştur ve önemli sohbetleri
            sabitle.
          </p>
        </div>
        <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-amber-50 text-warning items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
      </header>

      <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-12 md:p-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
          <Construction className="w-8 h-8" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-primary-dark">
          Yapım aşamasında
        </h2>
        <p className="mt-2 text-slate-500 max-w-md mx-auto">
          Gerçek zamanlı sohbet (Socket.io) ile mesajlaşma yakında burada
          olacak.
        </p>
        <p className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          Bu modül hafta planına göre eklenecek.
        </p>
      </div>
    </div>
  );
}
