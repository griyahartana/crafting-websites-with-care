# BidanKita

BidanKita adalah aplikasi web mobile-first untuk pendampingan kehamilan. Aplikasi ini membantu ibu hamil mencari bidan, membuat janji kunjungan, melakukan chat konsultasi, melihat pengingat, dan memantau perkembangan kehamilan dalam satu pengalaman yang ringan dan nyaman dipakai dari layar HP.

Live site:

- Production: https://bidanktitik.my.id
- Cloudflare Pages project: `bidanktitik`

## Fitur Utama

- Landing page responsif dengan CTA menuju aplikasi.
- Onboarding mobile untuk masuk ke aplikasi.
- Beranda aplikasi dengan ringkasan usia kehamilan, pencarian, aksi cepat, dan artikel.
- Cari Bidan dengan daftar bidan, rating, spesialisasi, jarak, dan tombol buat janji.
- Chat konsultasi bidan dengan tampilan percakapan mobile.
- Janji Kunjungan interaktif:
  - Popup/bottom sheet untuk membuat janji baru.
  - Kalender berbahasa Indonesia.
  - Pilihan layanan, bidan, dan slot jam.
  - Slot yang sudah terpakai otomatis terkunci.
  - Popup sukses setelah janji dibuat.
  - Jadwal baru muncul di daftar Jadwal Mendatang.
- Tracking kehamilan dengan progress, pengingat, statistik pertumbuhan, dan grafik.
- Profil pengguna dengan menu catatan, favorit, pengaturan, dan bantuan.
- PWA install prompt sederhana untuk Android/iOS.

## Fokus Mobile

Project ini dirapikan agar kompatibel dengan berbagai layar mobile:

- App shell memakai tinggi viewport modern (`100dvh`, `100svh`) agar bottom navigation tetap terlihat.
- Konten halaman scroll di area tengah, bukan mendorong navigasi bawah.
- Bottom navigation memakai safe area untuk perangkat dengan gesture bar.
- Popup janji memakai pola bottom sheet pada mobile dan modal tengah pada layar lebih besar.
- Kalender, tombol, kartu, dan grid dibuat compact agar aman di layar kecil.
- Form dalam popup bisa discroll, sementara tombol aksi tetap mudah dijangkau.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui dan Radix UI
- lucide-react
- date-fns
- Cloudflare Pages

## Struktur Folder

```text
src/
  assets/              Gambar dan ilustrasi aplikasi
  components/
    app/               Layout aplikasi mobile
    ui/                Komponen UI berbasis shadcn/Radix
  hooks/               Custom hooks
  lib/                 Utility shared
  pages/
    Index.tsx          Landing page
    app/               Halaman aplikasi mobile
```

## Menjalankan Lokal

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka aplikasi:

```text
http://127.0.0.1:5173
```

Jika memakai port lain dari Vite, ikuti URL yang muncul di terminal.

## Script

```bash
npm run dev       # Menjalankan Vite dev server
npm run build     # Build production ke folder dist
npm run preview   # Preview hasil build
npm run lint      # Cek lint
npm run test      # Jalankan test Vitest
```

Catatan: lint saat ini dapat menampilkan warning bawaan komponen shadcn tentang Fast Refresh, tetapi tidak ada error blocking.

## Build Production

```bash
npm run build
```

Output production akan dibuat di:

```text
dist/
```

## Deploy ke Cloudflare Pages

Project ini dideploy ke Cloudflare Pages dengan Wrangler.

Deploy production:

```bash
npx wrangler pages deploy dist --project-name bidanktitik --branch main --commit-dirty true
```

Custom domain yang aktif:

```text
https://bidanktitik.my.id
```

DNS Cloudflare:

- Type: `CNAME`
- Name: `bidanktitik.my.id`
- Target: `bidanktitik.pages.dev`
- Proxied: aktif

## Catatan Pengembangan

- Pertahankan pendekatan mobile-first untuk setiap halaman aplikasi.
- Hindari membuat elemen besar yang menghalangi bottom navigation.
- Untuk halaman yang panjang, gunakan scroll di area konten, bukan scroll keseluruhan app frame.
- Untuk flow form penting di mobile, gunakan bottom sheet atau modal dengan tinggi terbatas dan konten internal scroll.
- Setelah perubahan UI, cek minimal halaman berikut:
  - `/app`
  - `/app/cari-bidan`
  - `/app/kunjungan`
  - `/app/tracking`
  - `/app/profil`

## Status Terakhir

- Build production berhasil.
- Cloudflare Pages aktif.
- Domain production aktif di `bidanktitik.my.id`.
- Halaman janji kunjungan sudah memakai popup interaktif dan responsif untuk mobile.
