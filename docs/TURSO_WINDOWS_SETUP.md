# Setup Turso di Windows (Alternatif)

Jika installer script Turso diblokir oleh antivirus, gunakan cara berikut:

## Metode 1: Via Web Dashboard (Paling Mudah) ✅

**Tidak perlu install CLI sama sekali!**

1. **Daftar/Login ke Turso:**
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

4. **Setup di Vercel:**
   - Buka Vercel Dashboard → Project → Settings → Environment Variables
   - Tambahkan:
     - `TURSO_DATABASE_URL` = Database URL yang sudah di-copy
     - `TURSO_AUTH_TOKEN` = Auth Token yang sudah di-copy
   - Klik "Save"

5. **Deploy ulang aplikasi**

## Metode 2: Install CLI via npm

```bash
npm install -g @libsql/client
```

Kemudian:
```bash
turso auth login
turso db create presant
turso db show presant
```

## Metode 3: Download Binary Manual

1. Download dari: https://github.com/tursodatabase/turso-cli/releases
2. Pilih file untuk Windows (misalnya: `turso-windows-amd64.exe`)
3. Extract dan rename menjadi `turso.exe`
4. Pindahkan ke folder yang ada di PATH (misalnya: `C:\Windows\System32`)
5. Atau tambahkan folder tersebut ke PATH environment variable

## Verifikasi Setup

Setelah environment variables di-set di Vercel:
1. Deploy ulang aplikasi
2. Test login - seharusnya sudah tidak ada error
3. Cek Turso dashboard untuk melihat data

## Troubleshooting

**Error: "TURSO_DATABASE_URL is not set"**
- Pastikan environment variables sudah di-set di Vercel
- Pastikan sudah di-deploy ulang setelah menambahkan variables

**Error: "Authentication failed"**
- Pastikan `TURSO_AUTH_TOKEN` benar
- Generate token baru di Turso dashboard jika perlu

**Installer script diblokir antivirus:**
- Gunakan Metode 1 (Web Dashboard) - tidak perlu CLI
- Atau gunakan Metode 2 (npm) - lebih aman

