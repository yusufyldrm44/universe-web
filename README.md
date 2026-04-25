# UniVerse Web

UniVerse'in web arayüzü. Üniversite topluluklarının ilan, etkinlik ve mesajlaşma platformu.

## Stack

- **React 19** + **Vite** — UI ve geliştirme sunucusu
- **TailwindCSS** — stil
- **Zustand** — global state (auth)
- **Ramda** — fonksiyonel veri pipeline'ları (`src/utils/fp.js`)
- **Axios** — HTTP istemcisi (JWT interceptor)
- **Socket.io Client** — gerçek zamanlı mesajlaşma
- **React Router** — sayfa yönlendirme

## Kurulum

1. Bağımlılıkları yükle:

   ```bash
   npm install
   ```

2. Ortam değişkenlerini ayarla:

   ```bash
   cp .env.example .env
   ```

   `.env` içinde backend URL'sini düzenle (varsayılan `http://localhost:5000/api`).

3. Backend'in (`http://localhost:5000`) çalıştığından emin ol.

4. Geliştirme sunucusunu başlat:

   ```bash
   npm run dev
   ```

   Uygulama varsayılan olarak `http://localhost:5173` adresinde açılır.

## Komutlar

| Komut             | Açıklama                          |
| ----------------- | --------------------------------- |
| `npm run dev`     | Geliştirme sunucusunu başlatır    |
| `npm run build`   | Üretim için derler (`dist/`)      |
| `npm run preview` | Derlenen çıktıyı yerel önizler    |
| `npm run lint`    | ESLint çalıştırır                 |

## Klasör Yapısı

```
src/
├─ pages/        # Sayfa bileşenleri (Login, Register, Home, Listings, ...)
├─ components/   # Paylaşılan UI bileşenleri (Layout, ...)
├─ services/     # api.js (axios), authStore.js (zustand)
├─ utils/        # fp.js — Ramda tabanlı filtre/sıralama pipeline'ı
├─ styles/       # Tailwind direktifleri ve global stiller
├─ App.jsx       # Router + PrivateRoute
└─ main.jsx      # Giriş noktası
```

## Auth Akışı

- Token ve kullanıcı bilgisi `localStorage` üzerinde tutulur.
- `axios` interceptor'ı her isteğe `Authorization: Bearer <token>` header'ı ekler.
- 401 cevabında token otomatik temizlenir.
- Token yoksa `PrivateRoute` kullanıcıyı `/login` sayfasına yönlendirir.

## Tema

Ana renk: `#1A3C5E` (Tailwind'de `primary` olarak tanımlı).
