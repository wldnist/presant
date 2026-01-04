# Deployment ke Vercel

## Masalah dengan SQLite File-Based di Vercel

SQLite file-based (`better-sqlite3`) **tidak cocok** untuk Vercel karena:

1. **Native Module**: `better-sqlite3` adalah native module yang perlu dikompilasi untuk platform spesifik
2. **Build Process**: Vercel menggunakan `--ignore-scripts` yang mencegah kompilasi native modules
3. **Filesystem**: Vercel menggunakan read-only filesystem (kecuali `/tmp` yang temporary)
4. **Stateless**: Serverless functions bersifat stateless, data di `/tmp` akan hilang setiap restart

## Solusi: Database Eksternal

Untuk production di Vercel, gunakan database eksternal:

### Opsi 1: Turso (SQLite Cloud) - **RECOMMENDED**

Turso adalah SQLite cloud yang kompatibel dengan kode yang ada.

**Setup:**
1. Daftar di [turso.tech](https://turso.tech)
2. Install Turso CLI: `npm install -g @libsql/client`
3. Buat database: `turso db create presant`
4. Dapatkan URL dan token dari dashboard Turso
5. Install client: `npm install @libsql/client`

**Environment Variables di Vercel:**
```
TURSO_DATABASE_URL=libsql://your-db-url
TURSO_AUTH_TOKEN=your-auth-token
```

**Keuntungan:**
- ✅ Kompatibel dengan SQLite (syntax sama)
- ✅ Gratis tier tersedia
- ✅ Fast & scalable
- ✅ Minimal code changes

### Opsi 2: PlanetScale (MySQL Serverless)

**Setup:**
1. Daftar di [planetscale.com](https://planetscale.com)
2. Buat database baru
3. Install client: `npm install @planetscale/database`

**Keuntungan:**
- ✅ Gratis tier tersedia
- ✅ Auto-scaling
- ✅ Branching untuk development

### Opsi 3: Supabase (PostgreSQL)

**Setup:**
1. Daftar di [supabase.com](https://supabase.com)
2. Buat project baru
3. Install client: `npm install @supabase/supabase-js`

**Keuntungan:**
- ✅ Gratis tier tersedia
- ✅ Real-time features
- ✅ Built-in auth (optional)

### Opsi 4: Vercel Postgres

**Setup:**
1. Di Vercel dashboard, buka project
2. Settings → Storage → Create Database
3. Pilih Postgres
4. Environment variables otomatis ditambahkan

**Keuntungan:**
- ✅ Terintegrasi dengan Vercel
- ✅ Gratis tier tersedia
- ✅ Easy setup

## Implementasi

Setelah memilih database, update:

1. **`src/infrastructure/database/db.ts`** - Switch ke client database eksternal
2. **`src/repositories/sqlite/*.ts`** - Update untuk menggunakan client baru
3. **Environment Variables** - Tambahkan di Vercel dashboard

## Quick Start dengan Turso

```bash
# Install Turso CLI
npm install -g @libsql/client

# Login
turso auth login

# Create database
turso db create presant

# Get connection info
turso db show presant

# Install client
npm install @libsql/client
```

Update `db.ts`:
```typescript
import { createClient } from '@libsql/client';

export function getDatabase() {
  if (process.env.VERCEL && process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  // Fallback ke better-sqlite3 untuk development
  // ...
}
```

## Migration Path

1. **Development**: Tetap gunakan SQLite file-based (`better-sqlite3`)
2. **Production (Vercel)**: Gunakan Turso atau database eksternal
3. **Service Factory**: Otomatis switch berdasarkan environment

## Catatan

- Data di `/tmp` akan hilang setiap function restart
- Untuk production, **WAJIB** menggunakan database eksternal
- Turso adalah pilihan terbaik karena kompatibel dengan SQLite syntax

