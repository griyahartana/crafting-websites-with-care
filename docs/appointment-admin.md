# Dokumentasi Janji Kunjungan dan Admin/Bidan

Dokumen ini menjelaskan alur fitur janji kunjungan, role yang terlibat, endpoint backend, database, dan checklist pengujian manual.

## Ringkasan

Fitur janji kunjungan memungkinkan customer membuat jadwal kunjungan dengan Bidan Titik. Admin dan bidan dapat melihat seluruh janji yang relevan, melihat nama customer, membuat janji untuk customer, mengedit jadwal, mengubah status, menghapus janji, dan menandai janji sebagai sudah ditangani lewat tombol cepat.

## Role dan Hak Akses

Customer:

- melihat janji miliknya sendiri,
- membuat janji baru untuk dirinya sendiri,
- melihat status kunjungan,
- melihat status selesai sebagai `Sudah ditangani`.

Bidan:

- melihat janji yang ditugaskan ke akun bidan tersebut,
- melihat nama customer pada kartu janji,
- membuat janji untuk customer,
- mengedit janji,
- menghapus janji,
- menandai janji sebagai `Sudah ditangani`.

Admin:

- melihat semua janji,
- melihat semua customer yang membuat janji,
- membuat janji untuk customer,
- mengedit janji,
- menghapus janji,
- menandai janji sebagai `Sudah ditangani`.

## Status Janji

Nilai status yang disimpan di database:

```text
Akan datang
Selesai
Dibatalkan
```

Label yang tampil di UI:

```text
Akan datang       -> Akan datang
Selesai           -> Sudah ditangani
Dibatalkan        -> Dibatalkan
```

Status `Selesai` tetap dipakai di database agar kompatibel dengan constraint D1. UI menerjemahkannya menjadi `Sudah ditangani` untuk bahasa yang lebih jelas bagi customer.

## Alur Customer

1. Customer login.
2. Customer membuka `/app/kunjungan`.
3. Customer menekan `Buat Janji Baru`.
4. Customer memilih tanggal, layanan, bidan, dan jam.
5. Customer menyimpan janji.
6. Janji muncul di `Jadwal Mendatang`.
7. Jika admin/bidan menandai janji sebagai selesai, customer melihat status `Sudah ditangani`.

## Alur Admin/Bidan

1. Admin atau bidan login.
2. Buka `/app/kunjungan`.
3. Halaman menampilkan judul `Kelola Janji`.
4. Kartu janji menampilkan:
   - layanan,
   - nama customer,
   - nama bidan,
   - tanggal dan jam,
   - tempat,
   - status,
   - tombol aksi.
5. Tombol `Tambah Janji Customer` membuka form pembuatan janji.
6. Tombol `Edit` membuka form edit janji.
7. Tombol `Hapus` menghapus janji setelah konfirmasi browser.
8. Tombol `Sudah ditangani` langsung mengubah status janji dari `Akan datang` menjadi `Selesai`.

## Database

Migration:

```text
migrations/0003_add_appointments.sql
```

Tabel:

```sql
appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  midwife_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  place TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('Klinik', 'Online')),
  status TEXT NOT NULL DEFAULT 'Akan datang' CHECK (status IN ('Akan datang', 'Selesai', 'Dibatalkan')),
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

Index:

```text
idx_appointments_customer
idx_appointments_midwife
idx_appointments_schedule
```

## Endpoint API

Semua endpoint berada di Cloudflare Pages Function:

```text
functions/api/[[path]].ts
```

Daftar endpoint:

```text
GET    /api/appointments
POST   /api/appointments
PATCH  /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
```

Payload create/update:

```json
{
  "customerId": 1,
  "midwifeId": 3,
  "title": "Kunjungan ANC",
  "date": "2026-04-30",
  "time": "09:30",
  "place": "Klinik Bidan Titik",
  "mode": "Klinik",
  "status": "Akan datang",
  "notes": "Catatan tambahan"
}
```

Untuk tombol cepat `Sudah ditangani`, frontend mengirim `PATCH` dengan status:

```json
{
  "status": "Selesai"
}
```

Payload tetap menyertakan field utama lain karena validasi update saat ini memakai validator form lengkap.

## File Frontend

Halaman utama:

```text
src/pages/app/Kunjungan.tsx
```

Type API:

```text
src/lib/api.ts
```

Komponen utama di halaman kunjungan:

- `Kunjungan`
- `AppointmentSection`
- `AppointmentCard`

## Checklist Pengujian Manual

Customer:

1. Login sebagai `ayu@example.test`.
2. Buka `/app/kunjungan`.
3. Buat janji baru.
4. Pastikan janji muncul di `Jadwal Mendatang`.

Admin:

1. Login sebagai `admin@bidankita.test`.
2. Buka `/app/kunjungan`.
3. Pastikan nama customer terlihat pada kartu janji.
4. Klik `Edit` dan ubah jadwal/status.
5. Klik `Sudah ditangani` pada janji yang masih `Akan datang`.
6. Pastikan janji pindah ke `Riwayat Kunjungan`.
7. Pastikan badge status berubah menjadi `Sudah ditangani`.

Build:

```bash
npm run build
npx wrangler pages functions build functions
```

Deploy:

```bash
npx wrangler pages deploy dist --project-name bidanktitik --branch main --commit-dirty=true
```
