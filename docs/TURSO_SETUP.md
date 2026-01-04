# Setup Turso Database untuk Vercel

## Langkah 1: Setup via Web Dashboard (Recommended - Tidak Perlu CLI)

**Cara termudah dan tidak perlu install CLI!**

1. **Daftar/Login:**
   - Buka https://turso.tech
   - Daftar atau login dengan GitHub/Google

2. **Buat Database:**
   - Klik "Create Database"
   - Beri nama: `presant`
   - Pilih region terdekat (misalnya: `Singapore` atau `Tokyo`)
   - Klik "Create"

3. **Dapatkan Connection Info:**
   - Setelah database dibuat, klik database tersebut
   - Buka tab "Connect"
   - Copy **Database URL** (format: `libsql://presant-xxxxx.turso.io`)
   - Klik "Show" pada Auth Token dan copy token tersebut

## Alternatif: Setup via CLI (Jika Perlu)

**Opsi A: Install via npm (Lebih Aman untuk Windows)**
```bash
npm install -g @libsql/client
```

**Opsi B: Install via Installer Script (Mungkin Diblokir Antivirus)**
```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell) - mungkin diblokir antivirus
irm https://get.tur.so/install.ps1 | iex
```

**Setelah CLI terinstall:**
```bash
# Login ke Turso
turso auth login

# Buat database baru
turso db create presant

# Dapatkan connection info
turso db show presant
```

Output akan menampilkan:
- Database URL (misalnya: `libsql://presant-xxxxx.turso.io`)
- Auth Token

**Catatan:** Jika installer script diblokir antivirus, gunakan Web Dashboard (Langkah 1) yang tidak perlu CLI sama sekali!

## Langkah 3: Setup Environment Variables di Vercel

1. Buka Vercel Dashboard → Project → Settings → Environment Variables
2. Tambahkan 2 environment variables:

   ```
   TURSO_DATABASE_URL=libsql://presant-xxxxx.turso.io
   TURSO_AUTH_TOKEN=your-auth-token-here
   ```

3. Klik "Save"

## Langkah 4: Run Migrations

Setelah environment variables di-set, migrations akan otomatis berjalan saat API route pertama kali dipanggil.

Atau jalankan manual (jika perlu):

```bash
# Set environment variables lokal dulu
export TURSO_DATABASE_URL=libsql://presant-xxxxx.turso.io
export TURSO_AUTH_TOKEN=your-auth-token-here

# Run migrations
npm run db:migrate
```

## Langkah 5: Seed Data (Optional)

```bash
npm run db:seed
```

## Verifikasi

1. Deploy ulang aplikasi di Vercel
2. Test login - seharusnya sudah tidak ada error
3. Cek Turso dashboard untuk melihat data

## Troubleshooting

### Error: "TURSO_DATABASE_URL is not set"
- Pastikan environment variables sudah di-set di Vercel
- Pastikan sudah di-deploy ulang setelah menambahkan environment variables

### Error: "Authentication failed"
- Pastikan `TURSO_AUTH_TOKEN` benar
- Generate token baru jika perlu: `turso db tokens create presant`

### Database kosong setelah deploy
- Run migrations: `npm run db:migrate` (dengan environment variables yang benar)
- Atau seed data: `npm run db:seed`

## Keuntungan Turso

- ✅ **Gratis tier**: 500 databases, 1GB storage, 1M rows/month
- ✅ **Fast**: Edge locations untuk low latency
- ✅ **Scalable**: Auto-scaling
- ✅ **SQLite compatible**: Syntax sama dengan SQLite
- ✅ **Easy maintenance**: Managed service, tidak perlu setup server

## Pricing

- **Free tier**: Cukup untuk development dan small production
- **Pro tier**: Mulai dari $29/month untuk production yang lebih besar

Lihat detail di [turso.tech/pricing](https://turso.tech/pricing)

