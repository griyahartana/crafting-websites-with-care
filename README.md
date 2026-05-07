# LayerFarm OS

LayerFarm OS adalah aplikasi SaaS untuk manajemen peternakan ayam petelur. Aplikasi ini membantu pemilik dan operator farm memantau kandang/flock, produksi telur, pakan, kesehatan, keuangan, reminder operasional, dan laporan untuk pemilik atau investor.

Live site:

- Production: https://hartanafarm.my.id
- Cloudflare Pages: https://hartanafarm.pages.dev
- Cloudflare Pages project: `hartanafarm`

## Fitur Utama

- Dashboard performa farm dengan grafik produksi telur, konsumsi pakan, mortalitas, biaya harian, dan performa per kandang.
- Manajemen kandang/flock: umur ayam, strain, populasi awal, mati/afkir, populasi aktif, target produksi, dan jadwal afkir.
- Produksi telur harian: total telur, grading, telur retak, telur abnormal, mortalitas harian, dan catatan operator.
- Pakan dan konsumsi: pakan masuk, pakan terpakai, stok akhir, harga pakan, stok aman, dan FCR.
- Kesehatan dan vaksinasi: jadwal vaksin, obat, penyakit, kematian, status tindakan, dan histori treatment.
- Keuangan sederhana: biaya pakan, obat, tenaga kerja, penjualan telur, margin, dan estimasi laba rugi.
- Reminder otomatis untuk vaksin, stok pakan menipis, jadwal panen/afkir, mortalitas, dan penurunan produksi.
- Laporan harian, mingguan, bulanan, snapshot investor, export PDF via print browser, dan export Excel.
- PWA metadata dasar agar bisa dipasang di perangkat mobile.

## Akun Demo

Login SaaS saat ini memakai session lokal untuk membuka dashboard demo:

```text
Email: owner@hartanafarm.test
Password: farm12345
```

Data operasional demo tersimpan di `localStorage` browser dengan prefix `layerfarm.*`, sehingga aman untuk simulasi input tanpa database produksi.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui dan Radix UI
- lucide-react
- Recharts
- Cloudflare Pages
- Wrangler

## Struktur Folder

```text
src/
  components/
    ui/                Komponen UI shadcn/Radix
  lib/
    api.ts             Helper API/session untuk integrasi backend berikutnya
  pages/
    Index.tsx          Dashboard SaaS LayerFarm OS
    Auth.tsx           Login/register demo SaaS
    NotFound.tsx       Halaman 404

public/
  manifest.json        Metadata PWA LayerFarm OS

wrangler.jsonc         Konfigurasi Cloudflare Pages project hartanafarm
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

## Script

```bash
npm run dev                # Menjalankan Vite dev server
npm run build              # Build production ke folder dist
npm run preview            # Preview hasil build
npm run lint               # Cek lint
npm run test               # Jalankan test Vitest
npm run deploy:cloudflare  # Build dan deploy ke Cloudflare Pages hartanafarm
```

Catatan: `npm run lint` dapat menampilkan warning Fast Refresh dari komponen shadcn/ui bawaan, tetapi tidak ada error blocking.

## Deploy

Deploy production:

```bash
npm run deploy:cloudflare
```

Target Cloudflare:

- Project: `hartanafarm`
- Domain: `hartanafarm.my.id`
- Output: `dist`
