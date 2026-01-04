# Cara Melihat Tabel di Turso Dashboard

Setelah menjalankan migrations, tabel-tabel yang dibuat bisa dilihat di Turso dashboard dengan beberapa cara:

## Metode 1: Via Tab "Tables" (Edit Data)

1. **Buka Turso Dashboard:**
   - Login ke https://turso.tech
   - Pilih database `presant`

2. **Buka tab "Edit Data":**
   - Klik tab "Edit Data" di bagian atas
   - Pastikan sub-tab "Tables" aktif (highlighted)

3. **Lihat tabel:**
   - Tabel-tabel akan muncul di panel kiri atau main area
   - Klik nama tabel untuk melihat data di dalamnya

4. **Jika tabel tidak muncul:**
   - Klik tombol refresh (🔄) di panel kiri
   - Pastikan database yang dipilih benar (`presant`)
   - Coba refresh halaman browser (F5)

## Metode 2: Via SQL Console (Recommended)

1. **Buka SQL Console:**
   - Di halaman database, klik tab "SQL Console"

2. **Query untuk melihat semua tabel:**
   ```sql
   SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
   ```

3. **Query untuk melihat struktur tabel:**
   ```sql
   SELECT sql FROM sqlite_master WHERE type='table' AND name='participants';
   ```

4. **Query untuk melihat data:**
   ```sql
   SELECT * FROM participants LIMIT 10;
   SELECT * FROM system_users LIMIT 10;
   SELECT * FROM master_events LIMIT 10;
   SELECT * FROM event_instances LIMIT 10;
   SELECT * FROM attendance LIMIT 10;
   ```

## Tabel yang Seharusnya Ada

Setelah migration `001_initial_schema.sql`, seharusnya ada tabel berikut:

1. **`schema_migrations`** - Menyimpan history migrations
2. **`participants`** - Data peserta
3. **`master_events`** - Master acara
4. **`event_instances`** - Instance acara
5. **`event_instance_participants`** - Relasi peserta dengan acara
6. **`attendance`** - Data kehadiran
7. **`system_users`** - User sistem

## Verifikasi Migration Berhasil

### Cek apakah migrations sudah di-apply:

```sql
SELECT * FROM schema_migrations;
```

Seharusnya menampilkan:
```
version              | applied_at
---------------------|-------------------
001_initial_schema    | 2024-01-XX XX:XX:XX
```

### Cek struktur tabel:

```sql
PRAGMA table_info(participants);
```

Ini akan menampilkan kolom-kolom dalam tabel `participants`.

## Troubleshooting

### Tabel tidak muncul di "Tables" tab:

**Kemungkinan:**
1. Migration belum berjalan dengan benar
2. Database yang dipilih salah
3. Cache browser - coba refresh (Ctrl+F5)

**Solusi:**
1. Cek via SQL Console apakah tabel ada:
   ```sql
   SELECT name FROM sqlite_master WHERE type='table';
   ```
2. Jika tabel ada di SQL Console tapi tidak di "Tables" tab, ini bug UI Turso - gunakan SQL Console saja
3. Jika tabel tidak ada sama sekali, jalankan migration lagi:
   ```bash
   npm run db:migrate
   ```

### Error saat query:

**Error: "no such table"**
- Migration belum berjalan
- Jalankan: `npm run db:migrate`

**Error: "database is locked"**
- Ada operasi lain yang sedang berjalan
- Tunggu sebentar dan coba lagi

## Tips

1. **Gunakan SQL Console untuk debugging:**
   - Lebih reliable daripada UI "Tables"
   - Bisa query langsung dan lihat hasil

2. **Cek data setelah seed:**
   ```sql
   -- Cek user default
   SELECT * FROM system_users;
   
   -- Cek participants
   SELECT COUNT(*) FROM participants;
   
   -- Cek events
   SELECT COUNT(*) FROM master_events;
   ```

3. **Monitor resource usage:**
   - Lihat di sidebar kiri untuk usage statistics
   - Free tier: 500M reads, 10M writes, 3GB syncs, 5GB storage

