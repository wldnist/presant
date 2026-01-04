# Database Setup Guide

## Arsitektur

Aplikasi ini menggunakan **Hexagonal Architecture** (Ports & Adapters) yang memungkinkan switch antara berbagai teknologi tanpa mengubah business logic.

### Struktur

```
src/
├── infrastructure/
│   └── database/          # Database infrastructure (SQLite)
│       ├── db.ts          # Database connection
│       ├── migrate.ts     # Migration runner
│       └── migrations/    # SQL migration files
├── repositories/
│   ├── interfaces.ts      # Repository interfaces (Ports)
│   └── sqlite/            # SQLite implementations (Adapters)
├── services/
│   ├── interfaces.ts       # Service interfaces
│   ├── sqliteServices.ts  # SQLite-based services
│   ├── serviceFactory.ts  # Factory untuk switch teknologi
│   └── apiClient.ts       # API client (untuk future API implementation)
└── app/
    └── api/               # Next.js API routes (server-side)
```

## Setup SQLite

### 1. Install Dependencies

**PENTING:** `better-sqlite3` memerlukan native compilation. Untuk Windows, ada beberapa opsi:

#### Opsi 1: Install Visual Studio Build Tools (Recommended)
1. Download dan install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Pilih "Desktop development with C++" workload
3. Install dependencies:
```bash
npm install better-sqlite3 uuid
npm install --save-dev @types/better-sqlite3 @types/uuid
```

#### Opsi 2: Gunakan Prebuilt Binaries (Quick Fix)
```bash
npm install better-sqlite3 --build-from-source=false
npm install uuid
npm install --save-dev @types/better-sqlite3 @types/uuid
```

#### Opsi 3: Install dengan Python (Alternative)
Jika sudah punya Python terinstall:
```bash
npm install --python=python3 better-sqlite3
npm install uuid
npm install --save-dev @types/better-sqlite3 @types/uuid
```

**Catatan:** Jika semua opsi gagal, pertimbangkan menggunakan SQLite alternative seperti `@libsql/client` atau setup database terpisah.

### 2. Database Location

Database akan dibuat di: `data/presant.db` (relative to project root)

File ini sudah di-ignore di `.gitignore`.

### 3. Run Migrations

Migrations akan otomatis berjalan saat server start. Atau jalankan manual:

```bash
npm run db:migrate
```

### 4. Seed Data (Optional)

Untuk development, seed data tersedia:

```bash
npm run db:seed
```

## Menggunakan Services

### Server-Side (API Routes)

```typescript
import { createParticipantService } from '@/services/serviceFactory';

export async function GET() {
  const service = createParticipantService();
  const participants = await service.getAllParticipants();
  return NextResponse.json(participants);
}
```

### Client-Side (React Components)

Gunakan API routes:

```typescript
// Di component
const response = await fetch('/api/participants');
const participants = await response.json();
```

## Switch ke API

Untuk switch ke API-based services di masa depan:

1. Implementasi API services di `src/services/apiServices.ts`
2. Update `serviceFactory.ts` untuk menggunakan API services
3. Set environment variable: `SERVICE_PROVIDER=api`

## Environment Variables

```env
# Service provider: 'sqlite' | 'api' | 'mock'
SERVICE_PROVIDER=sqlite

# Database path (optional, default: data/presant.db)
DATABASE_PATH=./data/presant.db

# API URL (untuk future API implementation)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Troubleshooting

### Error: "Cannot find module 'better-sqlite3'"

1. Pastikan dependencies sudah diinstall
2. Untuk Windows, install Visual Studio Build Tools
3. Atau gunakan prebuilt: `npm install better-sqlite3 --build-from-source=false`

### Error: "Database locked"

- Pastikan tidak ada multiple connections ke database
- Close semua connections sebelum exit
- Check file permissions

### Migration tidak berjalan

- Pastikan folder `src/infrastructure/database/migrations` ada
- Check console untuk error messages
- Run migration manual: `npm run db:migrate`

## Next Steps

1. ✅ SQLite implementation
2. ⏳ API routes untuk semua entities
3. ⏳ API-based services implementation
4. ⏳ Update semua pages untuk menggunakan API routes

