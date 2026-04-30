# BidanKita

BidanKita adalah aplikasi web mobile-first untuk pendampingan kehamilan bersama Bidan Titik. Aplikasi ini menyediakan pengalaman customer untuk chat, membuat janji kunjungan, mencatat kehamilan, dan melihat profil; serta pengalaman admin/bidan untuk mengelola customer, chat, profil bidan, dan janji kunjungan.

Live site:

- Production: https://bidanktitik.my.id
- Cloudflare Pages project: `bidanktitik`
- Database: Cloudflare D1 `bidankita-db`

## Fitur Utama

- Landing page responsif dengan CTA menuju aplikasi.
- Login dan registrasi customer berbasis session token.
- Admin demo untuk mengelola data bidan dan customer.
- Beranda aplikasi dengan sapaan sesuai nama akun yang sedang login.
- Profil customer dan bidan dengan dukungan upload foto profil.
- Chat customer-bidan tersimpan di Cloudflare D1.
- Inbox admin/bidan untuk melihat percakapan customer.
- Admin CRUD customer:
  - tambah customer,
  - edit nama dan email,
  - ganti password,
  - hapus customer.
- Admin CRUD bidan utama:
  - nama Bidan Titik,
  - email,
  - password opsional,
  - spesialisasi,
  - klinik,
  - jarak/status layanan,
  - rating dan jumlah ulasan.
- Janji kunjungan berbasis database:
  - customer bisa membuat janji,
  - admin/bidan bisa melihat nama customer yang membuat janji,
  - admin/bidan bisa membuat, mengedit, dan menghapus janji,
  - admin/bidan bisa memilih status `Akan datang`, `Sudah ditangani`, atau `Dibatalkan`,
  - admin/bidan bisa menekan tombol cepat `Sudah ditangani`,
  - customer melihat status selesai sebagai `Sudah ditangani`.
- Kalender kunjungan berbahasa Indonesia dengan slot jam.
- Tampilan mobile responsif dengan bottom navigation dan safe area.
- PWA metadata dasar untuk pengalaman mobile.

## Akun Demo

Customer:

```text
Email: ayu@example.test
Password: ibu123
```

Admin:

```text
Email: admin@bidankita.test
Password: admin123
```

Catatan: data demo dibuat oleh seed backend jika database masih kosong.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui dan Radix UI
- lucide-react
- date-fns
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare D1
- Wrangler

## Struktur Folder

```text
src/
  assets/              Gambar dan ilustrasi aplikasi
  components/
    app/               Layout aplikasi mobile
    ui/                Komponen UI shadcn/Radix
  hooks/               Custom hooks
  lib/
    api.ts             Client API, session storage, dan type shared
  pages/
    Auth.tsx           Login dan register
    Index.tsx          Landing page
    app/               Halaman aplikasi mobile

functions/
  api/
    [[path]].ts        Cloudflare Pages Function untuk auth, admin, chat, profil, dan appointment

migrations/
  0001_init.sql        Schema awal user/session/bidan/chat
  0002_add_user_avatar.sql
  0003_add_appointments.sql

docs/
  appointment-admin.md Dokumentasi fitur janji kunjungan dan admin/bidan

CHANGELOG/
  2026-04-30.md        Catatan perubahan
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

Jika memakai port lain dari Vite, ikuti URL yang muncul di terminal. Saat app berjalan di `localhost` atau `127.0.0.1`, client API otomatis memakai backend production `https://bidanktitik.my.id` agar fitur Cloudflare D1 tetap bisa diuji dari lokal.

## Script

```bash
npm run dev       # Menjalankan Vite dev server
npm run build     # Build production ke folder dist
npm run preview   # Preview hasil build
npm run lint      # Cek lint
npm run test      # Jalankan test Vitest
```

Catatan: `npm run lint` saat ini dapat menampilkan warning Fast Refresh dari komponen shadcn/ui, tetapi tidak ada error blocking.

## Build dan Verifikasi

Build frontend:

```bash
npm run build
```

Compile Cloudflare Functions:

```bash
npx wrangler pages functions build functions
```

Output production dibuat di:

```text
dist/
```

## Deploy ke Cloudflare Pages

Project ini dideploy ke Cloudflare Pages dengan Wrangler.

```bash
npm run build
npx wrangler pages deploy dist --project-name bidanktitik --branch main --commit-dirty=true
```

Custom domain aktif:

```text
https://bidanktitik.my.id
```

Konfigurasi Cloudflare ada di `wrangler.jsonc`, termasuk binding D1:

```text
Binding: DB
Database: bidankita-db
Migrations: migrations/
```

## Dokumentasi Tambahan

- [Dokumentasi janji kunjungan dan admin/bidan](docs/appointment-admin.md)
- [Changelog 2026-04-30](CHANGELOG/2026-04-30.md)

## Checklist Manual Setelah Perubahan

- Login customer `ayu@example.test`.
- Login admin `admin@bidankita.test`.
- Buka `/app/kunjungan`.
- Pastikan admin/bidan melihat nama customer pada janji.
- Buat janji baru dari admin atau customer.
- Edit status janji menjadi `Sudah ditangani`.
- Coba tombol cepat `Sudah ditangani`.
- Pastikan customer melihat status `Sudah ditangani`.
- Jalankan `npm run build`.
- Jalankan `npx wrangler pages functions build functions`.

## Status Terakhir

- Build production berhasil.
- Cloudflare Pages aktif.
- Domain production aktif di `bidanktitik.my.id`.
- Backend Cloudflare D1 aktif untuk auth, admin, chat, profil, dan janji kunjungan.
- Fitur appointment CRUD admin/bidan sudah aktif.
- Tombol cepat `Sudah ditangani` sudah tersedia untuk admin/bidan.
