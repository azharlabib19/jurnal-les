# 📚 PANDUAN INTEGRASI NOTIFIKASI PEMBAYARAN GAJI

Dokumen ini berisi step-by-step cara mengintegrasikan sistem notifikasi ke aplikasi Jurnal Les Anda.

---

## 📦 File yang Disediakan

1. **notification-system.js** - Core logic notifikasi
2. **notification-ui-integration.js** - UI integration dengan dashboard
3. **README_NOTIFICATION_SYSTEM.md** - Dokumentasi lengkap

---

## 🔧 Langkah Integrasi (3 Menit)

### Step 1: Copy File Script

Copy ketiga file JS ke folder root project atau folder `js/`:

```
project-root/
├── index.html
├── notification-system.js          ← Copy di sini
├── notification-ui-integration.js  ← Copy di sini
└── ...
```

### Step 2: Tambah Script Tag di index.html

Di bagian `</head>` atau sebelum `</body>` (SETELAH Supabase dan jQuery jika ada), tambahkan:

```html
<!-- Notifikasi Pembayaran Gaji Guru -->
<script src="notification-system.js"></script>
<script src="notification-ui-integration.js"></script>
```

**Posisi yang benar:**
```html
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <!-- ► Tambahkan di sini ◄ -->
    <script src="notification-system.js"></script>
    <script src="notification-ui-integration.js"></script>
</head>
```

### Step 3: Modifikasi handleSaveSesi()

Cari fungsi `handleSaveSesi()` di index.html, biasanya terletak di bagian akhir script.

**Sebelum:**
```javascript
function handleSaveSesi(event) {
    event.preventDefault();
    
    // ... validasi form ...
    
    const newSesi = {
        id: sesiId || 'sesi_' + Date.now(),
        siswa_id: siswaId,
        guru_username: guruUsername,
        status: document.getElementById('sesiStatus').value,
        // ... field lainnya ...
    };
    
    const allSesi = JSON.parse(localStorage.getItem('app_sesi_data') || '[]');
    allSesi.push(newSesi);
    localStorage.setItem('app_sesi_data', JSON.stringify(allSesi));
    
    // Show toast
    showToast('Sesi berhasil disimpan!', 'success');
}
```

**Sesudah** (tambahkan 5 baris ini):
```javascript
function handleSaveSesi(event) {
    event.preventDefault();
    
    // ... validasi form ...
    
    const newSesi = {
        id: sesiId || 'sesi_' + Date.now(),
        siswa_id: siswaId,
        guru_username: guruUsername,
        status: document.getElementById('sesiStatus').value,
        // ... field lainnya ...
    };
    
    const allSesi = JSON.parse(localStorage.getItem('app_sesi_data') || '[]');
    allSesi.push(newSesi);
    localStorage.setItem('app_sesi_data', JSON.stringify(allSesi));
    
    // ► ► ► TAMBAHKAN KODE INI ◄ ◄ ◄
    // Deteksi paket completion dan buat notifikasi pembayaran gaji
    if (newSesi.status === 'Selesai' || newSesi.status === 'selesai') {
        if (typeof checkPackageCompletion === 'function') {
            checkPackageCompletion(newSesi.siswa_id, newSesi.guru_username);
        }
    }
    // ► ► ► AKHIR PENAMBAHAN ◄ ◄ ◄
    
    // Show toast
    showToast('Sesi berhasil disimpan!', 'success');
}
```

### Step 4: Verifikasi Data Struktur

Pastikan data siswa di localStorage punya field `sisa_sesi_awal`:

**Cek di Console (F12):**
```javascript
JSON.parse(localStorage.getItem('app_siswa_data')).forEach(s => {
    console.log(s.nama, '→ sisa_sesi_awal:', s.sisa_sesi_awal);
});
```

Jika tidak ada, tambahkan saat save siswa:

```javascript
function handleSaveSiswa(event) {
    // ... form validation ...
    
    const newSiswa = {
        id: siswaId || 'siswa_' + Date.now(),
        nama: document.getElementById('siswaNama').value,
        program: document.getElementById('siswaProgram').value,
        sisa_sesi_awal: parseInt(document.getElementById('siswaSisaSesi').value) || 8,  // ← PENTING
        // ... field lainnya ...
    };
    
    // Save ...
}
```

### Step 5: Test Fitur

1. **Buka aplikasi** di browser
2. **Navigate ke Dashboard** (sebagai admin)
3. Scroll ke bawah, cari section **"💰 Notifikasi Pembayaran Gaji Guru"** ✓
4. **Buat sesi baru** sebagai guru, pilih status **"Selesai"**
5. **Isi jumlah sesi** = total paket (misal 8 dari 8)
6. **Simpan sesi**
7. **Lihat notifikasi** muncul di dashboard ✓

---

## 🎯 Alur Kerja Lengkap

```
┌─────────────────────────────────────────────────────────────┐
│  1. GURU INPUT SESI                                         │
│     • Pilih siswa: Ahmad Rizam                              │
│     • Tanggal, materi, status: "Selesai"                    │
│     • Klik: Simpan Sesi Les                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  2. SISTEM DETEKSI PAKET COMPLETION                         │
│     • Sesi ke-8 selesai (paket = 8 sesi)                   │
│     • Trigger: checkPackageCompletion()                     │
│     • Hitung: completed = 8, total = 8 ✓                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  3. BUAT NOTIFIKASI PEMBAYARAN                              │
│     • Create: createSalaryNotification()                    │
│     • Simpan ke: localStorage.app_salary_notifications      │
│     • Update: badge counter & panel                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  4. ADMIN MELIHAT NOTIFIKASI                                │
│     • Dashboard menampilkan section notifikasi              │
│     • Badge: 🔔(1) = 1 notifikasi menunggu                 │
│     • Card: "Guru Ahmad - Siswa Rizam - Paket 8 Sesi"     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  5. ADMIN KONFIRMASI TRANSFER                               │
│     • Klik: "✓ TRANSFER OK"                                │
│     • atau Klik: "Lihat Semua" → Modal → Konfirmasi       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  6. NOTIFIKASI DITANDAI SUDAH TRANSFER                      │
│     • markAsTransferred(notifId)                           │
│     • Pindah dari "Menunggu Konfirmasi" ke "Sudah Transfer"│
│     • Badge berkurang: 🔔 → hilang                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### ❌ Notifikasi tidak muncul saat dashboard dibuka

**Solusi:**
1. Buka Console (F12 → Console tab)
2. Ketik: `console.log(localStorage.getItem('app_current_user'))`
3. Pastikan role adalah "admin"
4. Refresh browser

```javascript
// Di Console
localStorage.setItem('app_user_role', 'admin');
location.reload();
```

### ❌ Error "checkPackageCompletion is not a function"

**Solusi:**
1. Pastikan `<script src="notification-system.js"></script>` sudah di-add di HTML
2. Periksa urutan script - harus SEBELUM custom script yang memanggil function ini
3. Refresh browser

### ❌ Notifikasi menghilang saat refresh

**Solusi:**
Ini BUKAN bug - data disimpan di localStorage, jadi akan persist. Jika tidak ada, berarti:
1. Data notifikasi belum dibuat (cek apakah sesi benar-benar selesai)
2. Sudah ditransfer dan dihapus
3. Cek di Console:

```javascript
JSON.parse(localStorage.getItem('app_salary_notifications'))
```

### ❌ Notifikasi duplikat

**Solusi:**
Sistem sudah punya smart deduplication - tidak akan buat 2 notifikasi untuk guru + siswa yang sama.

Jika tetap duplikat, manual delete:
```javascript
const all = JSON.parse(localStorage.getItem('app_salary_notifications'));
const unique = [];
const seen = new Set();

all.forEach(n => {
    const key = `${n.guru_username}_${n.siswa_id}`;
    if (!seen.has(key)) {
        unique.push(n);
        seen.add(key);
    }
});

localStorage.setItem('app_salary_notifications', JSON.stringify(unique));
```

### ❌ Badge/Counter tidak update

**Solusi:**
Jalankan manual di Console:
```javascript
updateNotificationBadge();
refreshNotificationUI();
```

---

## 📊 Contoh Data yang Benar

### Data Siswa (localStorage.app_siswa_data)

```json
[
    {
        "id": "siswa_456",
        "nama": "Ahmad Rizam",
        "program": "Matematika SMP",
        "sisa_sesi_awal": 8,
        "alamat": "...",
        "jadwal_hari": ["Senin", "Rabu", "Jumat"],
        "jadwal_tgl_tetap": "",
        "created_at": "2025-01-10T08:30:00Z"
    }
]
```

### Data Guru (localStorage.app_guru_data)

```json
[
    {
        "username": "budi_tutor",
        "nama": "Budi Santoso",
        "password": "xxx",
        "siswa_assigned": ["siswa_456", "siswa_789"],
        "created_at": "2025-01-09T10:00:00Z"
    }
]
```

### Data Sesi (localStorage.app_sesi_data)

```json
[
    {
        "id": "sesi_001",
        "siswa_id": "siswa_456",
        "guru_username": "budi_tutor",
        "tanggal": "2025-01-15",
        "status": "Selesai",
        "jurnal": "Belajar pecahan: penjumlahan dan pengurangan",
        "created_at": "2025-01-15T10:30:00Z"
    }
]
```

### Data Notifikasi (localStorage.app_salary_notifications)

```json
[
    {
        "id": "notif_1705318800000_abc123def",
        "type": "salary_payment",
        "guru_name": "Budi Santoso",
        "guru_username": "budi_tutor",
        "siswa_name": "Ahmad Rizam",
        "siswa_id": "siswa_456",
        "paket_total": 8,
        "created_at": "2025-01-15T10:30:00Z",
        "is_transferred": false,
        "transferred_at": null,
        "notes": "Paket 8 sesi untuk Ahmad Rizam telah selesai"
    }
]
```

---

## ✅ Checklist Integrasi

- [ ] Copy 3 file ke project root
- [ ] Tambah `<script>` tag di index.html
- [ ] Modifikasi handleSaveSesi() dengan 5 baris code
- [ ] Pastikan data siswa punya field `sisa_sesi_awal`
- [ ] Test: Create sesi → Lihat notifikasi → Konfirmasi transfer
- [ ] Test: Refresh → Notifikasi masih ada
- [ ] Test: Multiple notifikasi → No duplikasi
- [ ] Test: Modal → Lihat semua notifikasi
- [ ] Test: Riwayat transfer → Dapat dihapus
- [ ] Deploy ke production

---

## 🎨 Kustomisasi UI (Optional)

### Ubah Warna Theme

Edit di awal `notification-ui-integration.js`:

```javascript
// Ubah dari amber ke warna lain
const sectionHTML = `
    <div ... class="... border-2 border-blue-200 ...">
        <div class="... bg-gradient-to-r from-blue-50 to-blue-50 ...">
```

### Ubah Durasi Auto-Refresh

Di `notification-ui-integration.js`, cari `startNotificationRefreshInterval()`:

```javascript
}, 5000);  // ← Ubah 5000 ke angka lain (milliseconds)
```

### Ubah Retention Periode Notifikasi

Di `notification-system.js`, cari `RETENTION_DAYS`:

```javascript
RETENTION_DAYS: 60,  // ← Ubah dari 30 ke 60 hari
```

---

## 📞 Support

Jika ada masalah:

1. Buka Console (F12)
2. Copy-paste error message
3. Jalankan debug:

```javascript
// Test notification system
console.log('App State:');
console.log('  Active notif:', getActiveNotifications().length);
console.log('  Transferred:', getTransferredNotifications().length);
console.log('  All data:', JSON.parse(localStorage.getItem('app_salary_notifications')));
```

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-09  
**Status:** ✅ Production Ready
