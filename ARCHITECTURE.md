# Presant - Arsitektur Proyek

## 📁 Struktur Folder

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Halaman dashboard kehadiran
│   │   └── page.tsx
│   ├── participants/      # Halaman data peserta (akan dibuat)
│   ├── events/           # Halaman data acara (akan dibuat)
│   ├── users/            # Halaman data user (akan dibuat)
│   ├── reports/          # Halaman laporan (akan dibuat)
│   ├── layout.tsx
│   └── page.tsx          # Halaman utama
├── components/           # Komponen UI yang dapat digunakan kembali
│   ├── AttendanceCard.tsx
│   ├── AttendanceGrid.tsx
│   ├── AttendanceLegend.tsx
│   └── SearchBar.tsx
├── data/                 # Data mock untuk development
│   └── mockData.ts
├── services/             # Business logic dan service layer
│   ├── interfaces.ts     # Interface untuk services
│   └── mockServices.ts   # Implementasi mock services
├── types/                # TypeScript type definitions
│   └── index.ts
└── utils/                # Utility functions
    └── attendanceUtils.ts
```

## 🏗️ Arsitektur yang Diterapkan

### 1. **Clean Architecture**
- **Domain Layer**: Types dan interfaces (`src/types/`, `src/services/interfaces.ts`)
- **Application Layer**: Services dan business logic (`src/services/`)
- **Infrastructure Layer**: Mock data dan external dependencies (`src/data/`)
- **Presentation Layer**: Components dan pages (`src/components/`, `src/app/`)

### 2. **SOLID Principles**
- **Single Responsibility**: Setiap komponen memiliki satu tanggung jawab
- **Open/Closed**: Mudah diperluas tanpa mengubah kode existing
- **Liskov Substitution**: Interface dapat diimplementasi dengan berbagai cara
- **Interface Segregation**: Interface yang spesifik dan focused
- **Dependency Inversion**: Bergantung pada abstraksi, bukan implementasi konkret

### 3. **Design Patterns**
- **Repository Pattern**: Untuk data access (`AttendanceRepository`, `ParticipantRepository`, `EventRepository`)
- **Service Pattern**: Untuk business logic (`AttendanceService`, `ParticipantService`, `EventService`)
- **Component Pattern**: Untuk UI components yang reusable
- **Observer Pattern**: Untuk state management dengan React hooks

## 🎯 Fitur Dashboard Kehadiran

### ✅ Yang Sudah Diimplementasi:
1. **Mobile-First Responsive Design**
   - Grid responsive: 1 kolom di mobile, hingga 5 kolom di desktop
   - Breakpoints: sm, lg, xl, 2xl

2. **Status Kehadiran**
   - **Hadir** (Hijau): `bg-green-500`
   - **Ijin** (Kuning): `bg-yellow-500`
   - **Absen** (Merah): `bg-red-500`

3. **Interaksi**
   - Tap/click kartu peserta untuk mengubah status
   - Status berubah secara siklus: Hadir → Ijin → Absen → Hadir

4. **Fitur Pencarian**
   - Search berdasarkan nama peserta atau institusi
   - Debounced search (300ms delay)

5. **Filter Status**
   - Filter berdasarkan status kehadiran
   - Filter "Semua" untuk menampilkan semua peserta

6. **Data Mock**
   - 6 peserta dengan status berbeda
   - 1 acara contoh
   - Data dapat diupdate secara real-time

## 🚀 Cara Menggunakan

1. **Akses Dashboard**: `http://localhost:3000/dashboard`
2. **Ubah Status**: Klik/tap kartu peserta untuk mengubah status
3. **Cari Peserta**: Gunakan search bar untuk mencari nama atau institusi
4. **Filter Status**: Gunakan legend untuk filter berdasarkan status
5. **Responsive**: Resize browser untuk melihat perbedaan mobile/desktop

## 📱 Responsive Behavior

- **Mobile (< 640px)**: 1 kolom
- **Small (640px+)**: 2 kolom
- **Large (1024px+)**: 3 kolom
- **XL (1280px+)**: 4 kolom
- **2XL (1536px+)**: 5 kolom

## 🔧 Teknologi yang Digunakan

- **Next.js 15.5.4**: React framework dengan App Router
- **TypeScript**: Type safety dan better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: State management dan lifecycle
- **Clean Architecture**: Maintainable dan scalable code structure
