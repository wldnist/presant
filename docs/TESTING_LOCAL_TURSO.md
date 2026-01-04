# Testing Turso di Lokal

Panduan untuk test database Turso di development lokal sebelum deploy ke Vercel.

## Langkah 1: Setup Environment Variables

1. **Buat file `.env.local` di root project:**
   ```bash
   # Di root project (sama level dengan package.json)
   touch .env.local
   ```

2. **Isi file `.env.local` dengan:**
   ```env
   TURSO_DATABASE_URL=libsql://presant-xxxxx.turso.io
   TURSO_AUTH_TOKEN=your-auth-token-here
   ```
   
   Ganti dengan:
   - `TURSO_DATABASE_URL` = Database URL dari Turso dashboard
   - `TURSO_AUTH_TOKEN` = Auth Token dari Turso dashboard

3. **Pastikan file `.env.local` sudah di-ignore oleh Git:**
   - File ini sudah otomatis di-ignore (ada di `.gitignore`)
   - Jangan commit file ini ke Git!

## Langkah 2: Run Migrations

Setelah environment variables di-set, jalankan migrations:

```bash
npm run db:migrate
```

Ini akan membuat semua tabel di database Turso.

**Output yang diharapkan:**
```
Applying migration: 001_initial_schema.sql
Migration 001_initial_schema applied successfully
```

## Langkah 3: Seed Data (Optional)

Untuk development, seed data default:

```bash
npm run db:seed
```

Ini akan membuat:
- User default (username: `admin`, password: `admin`)
- Sample participants
- Sample master events
- Sample event instances

## Langkah 4: Test Aplikasi

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Buka browser:**
   - http://localhost:3000

3. **Test login:**
   - Username: `admin`
   - Password: `admin`

4. **Cek data di Turso Dashboard:**
   - Buka https://turso.tech
   - Klik database `presant`
   - Buka tab "Data" untuk melihat tabel dan data

## Verifikasi

### Cek apakah menggunakan Turso:

1. **Cek console log saat start:**
   - Jika menggunakan Turso, tidak ada error tentang better-sqlite3
   - Jika ada error "TURSO_DATABASE_URL is not set", pastikan `.env.local` sudah benar

2. **Test CRUD operations:**
   - Buat participant baru
   - Cek di Turso dashboard apakah data muncul
   - Edit/delete data
   - Cek apakah perubahan tersimpan

### Cek di Turso Dashboard:

1. Buka https://turso.tech
2. Login dan pilih database `presant`
3. Tab "Data" → pilih tabel (misalnya: `participants`)
4. Data yang dibuat di aplikasi lokal seharusnya muncul di sini

## Troubleshooting

### Error: "TURSO_DATABASE_URL is not set"

**Solusi:**
- Pastikan file `.env.local` ada di root project
- Pastikan format benar: `TURSO_DATABASE_URL=libsql://...` (tanpa spasi di sekitar `=`)
- Restart development server setelah membuat/mengubah `.env.local`

### Error: "Authentication failed"

**Solusi:**
- Pastikan `TURSO_AUTH_TOKEN` benar
- Generate token baru di Turso dashboard jika perlu
- Pastikan token tidak ada spasi di awal/akhir

### Error saat migration: "Database not available"

**Solusi:**
- Pastikan `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` sudah di-set
- Cek koneksi internet (Turso memerlukan koneksi internet)
- Cek apakah database masih aktif di Turso dashboard

### Data tidak muncul di Turso dashboard

**Solusi:**
- Refresh halaman dashboard
- Pastikan menggunakan database yang benar
- Cek console log untuk error
- Pastikan migrations sudah berjalan (`npm run db:migrate`)

## Switch antara Turso dan Local SQLite

### Menggunakan Turso (untuk test production):
```env
# .env.local
TURSO_DATABASE_URL=libsql://presant-xxxxx.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### Menggunakan Local SQLite (untuk development offline):
```env
# .env.local
# Comment atau hapus TURSO_DATABASE_URL
# TURSO_DATABASE_URL=
DATABASE_PATH=./data/presant.db
```

Atau hapus file `.env.local` untuk menggunakan default (local SQLite).

## Catatan Penting

1. **Jangan commit `.env.local` ke Git!**
   - File ini sudah di-ignore
   - Jangan share token ke publik

2. **Token Security:**
   - Jangan hardcode token di code
   - Gunakan environment variables
   - Generate token baru jika token ter-expose

3. **Development vs Production:**
   - Lokal: bisa pakai Turso atau local SQLite
   - Vercel: wajib pakai Turso (karena better-sqlite3 tidak support)

4. **Data Persistence:**
   - Data di Turso tersimpan di cloud (persistent)
   - Data di local SQLite hanya di komputer lokal

## Next Steps

Setelah test di lokal berhasil:
1. Setup environment variables di Vercel
2. Deploy ulang aplikasi
3. Test di production

Lihat `docs/TURSO_QUICK_START.md` untuk setup di Vercel.

