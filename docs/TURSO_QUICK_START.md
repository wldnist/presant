# Turso Quick Start Guide

## Setup Cepat (5 menit)

### 1. Install Turso CLI

**Opsi A: Via npm (Recommended untuk Windows)**
```bash
npm install -g @libsql/client
```

**Opsi B: Download Binary Manual (jika npm tidak tersedia)**
1. Download dari: https://github.com/tursodatabase/turso-cli/releases
2. Extract dan tambahkan ke PATH

**Opsi C: Via Installer Script (mungkin diblokir antivirus)**
```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell) - mungkin diblokir antivirus
irm https://get.tur.so/install.ps1 | iex
```

**Catatan:** Jika installer script diblokir antivirus, gunakan Opsi A (npm) yang lebih aman.

### 2. Setup Database

**Opsi A: Via Web Dashboard (Paling Mudah - Recommended)**
1. Buka https://turso.tech dan daftar/login
2. Klik "Create Database" → beri nama `presant`
3. Setelah database dibuat, klik database tersebut
4. Di tab "Connect", copy:
   - **Database URL** (misalnya: `libsql://presant-xxxxx.turso.io`)
   - **Auth Token** (klik "Show" untuk melihat token)

**Opsi B: Via CLI (jika sudah install CLI)**
```bash
turso auth login
turso db create presant
turso db show presant
```

Copy **Database URL** dan **Auth Token** dari output.

### 3. Setup di Vercel

1. Buka Vercel Dashboard → Project → Settings → Environment Variables
2. Tambahkan:
   - `TURSO_DATABASE_URL` = Database URL dari step 2
   - `TURSO_AUTH_TOKEN` = Auth Token dari step 2
3. Deploy ulang

### 4. Run Migrations

Setelah deploy, migrations akan otomatis berjalan saat pertama kali API dipanggil.

Atau jalankan manual:
```bash
export TURSO_DATABASE_URL=libsql://...
export TURSO_AUTH_TOKEN=...
npm run db:migrate
npm run db:seed
```

## Selesai! 🎉

Aplikasi sekarang menggunakan Turso di Vercel dan SQLite lokal di development.

## Troubleshooting

**Error: "TURSO_DATABASE_URL is not set"**
- Pastikan environment variables sudah di-set di Vercel
- Deploy ulang setelah menambahkan variables

**Error: "Authentication failed"**
- Pastikan token benar
- Generate token baru: `turso db tokens create presant`

Lihat dokumentasi lengkap di `docs/TURSO_SETUP.md`

