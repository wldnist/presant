# Troubleshooting Database Setup

## Error: Cannot find module 'better-sqlite3'

### Masalah 1: Node.js Version
`better-sqlite3` versi terbaru memerlukan Node.js 20+.

**Solusi:**
1. Upgrade Node.js ke versi 20 atau lebih baru
2. Atau install versi older yang support Node 18:
```bash
npm install better-sqlite3@8.7.0 uuid
```

### Masalah 2: Visual Studio Build Tools Missing (Windows)

**Error yang muncul:**
```
gyp ERR! find VS You need to install the latest version of Visual Studio
gyp ERR! find VS including the "Desktop development with C++" workload.
```

**Solusi:**

#### Opsi A: Install Visual Studio Build Tools (Recommended)
1. Download [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Install dengan pilihan "Desktop development with C++"
3. Restart terminal
4. Jalankan: `npm install better-sqlite3`

#### Opsi B: Install Visual Studio Community (Full IDE)
1. Download [Visual Studio Community](https://visualstudio.microsoft.com/vs/community/)
2. Pilih "Desktop development with C++" workload saat install
3. Restart terminal
4. Jalankan: `npm install better-sqlite3`

#### Opsi C: Gunakan Versi Older (Quick Fix)
```bash
npm install better-sqlite3@8.7.0 uuid
npm install --save-dev @types/better-sqlite3 @types/uuid
```

**Catatan:** Versi 8.7.0 masih support Node 18 dan lebih mudah di-compile.

## Error: Migration tidak berjalan

### Check:
1. Pastikan `better-sqlite3` sudah terinstall dengan benar
2. Pastikan folder `src/infrastructure/database/migrations` ada
3. Check console untuk error messages
4. Pastikan `tsx` sudah terinstall: `npm install --save-dev tsx`

## Error: Database locked

- Pastikan tidak ada multiple connections ke database
- Close semua connections sebelum exit
- Check file permissions di folder `data/`

## Alternative: Gunakan SQLite WASM (untuk development)

Jika better-sqlite3 masih bermasalah, bisa gunakan SQLite WASM untuk development:

```bash
npm install @sqlite.org/sqlite-wasm
```

Namun ini memerlukan perubahan di `src/infrastructure/database/db.ts`.

