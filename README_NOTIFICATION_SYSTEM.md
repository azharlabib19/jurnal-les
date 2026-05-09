# 📢 SISTEM NOTIFIKASI PEMBAYARAN GAJI GURU

## 🎯 Deskripsi Fitur

Sistem notifikasi pembayaran gaji guru yang memberitahu **Admin** ketika seorang **Guru** telah menyelesaikan paket sesi dengan seorang **Siswa**. Notifikasi tetap tampil di dashboard hingga admin mengklik tombol **"✓ Transfer OK"** untuk mengkonfirmasi bahwa pembayaran gaji sudah ditransfer.

---

## 📋 Fitur Utama

✅ **Deteksi Otomatis**: Notifikasi dibuat secara otomatis ketika guru menyelesaikan jumlah sesi sesuai paket yang disepakati

✅ **Persistent**: Notifikasi tetap ada di storage hingga admin mengklik "Sudah Ditransfer"

✅ **Badge Counter**: Menampilkan jumlah notifikasi aktif di icon bell

✅ **Modal Lengkap**: Lihat detail semua notifikasi dalam satu modal

✅ **Riwayat Transfer**: Lihat history notifikasi yang sudah ditransfer

✅ **Smart Deduplication**: Tidak membuat duplikasi untuk guru + siswa yang sama

---

## 🔧 File yang Ditambahkan

### 1. **notification-system.js** ⚙️
File utama yang menghandle logika notifikasi:
- Menyimpan/mengambil notifikasi dari localStorage
- Mendeteksi paket completion
- Update badge
- Core functions semua fitur

### 2. **notification-ui-integration.js** 🎨
File untuk UI dan integrasi ke dashboard:
- Render card notifikasi
- Modal notifikasi lengkap
- Inject UI ke dashboard
- Fungsi visibility berdasarkan role

### 3. **INTEGRATION_GUIDE.md** 📖
Dokumentasi lengkap cara integrasi ke aplikasi

---

## 🚀 Cara Integrasi ke index.html

### Step 1: Tambahkan Script Tag
Di bagian `<head>` atau sebelum `</body>` di `index.html`, tambahkan:

```html
<!-- Notification System -->
<script src="notification-system.js"></script>
<script src="notification-ui-integration.js"></script>
```

### Step 2: Modifikasi handleSaveSesi()

Di dalam fungsi `handleSaveSesi()`, cari bagian ini:
```javascript
const allSesi = JSON.parse(localStorage.getItem('app_sesi_data') || '[]');
allSesi.push(newSesi);  // atau update jika edit
```

**Tambahkan kode berikut SEBELUM `localStorage.setItem()`:**

```javascript
// ► Cek notifikasi pembayaran gaji jika sesi selesai
if (newSesi.status === 'Selesai') {
    if (typeof checkPackageCompletion === 'function') {
        checkPackageCompletion(newSesi.siswa_id, newSesi.guru_username);
    }
}
```

### Step 3: Inject UI Notifikasi ke Dashboard

Cari fungsi yang menampilkan dashboard (misalnya saat `navigate('dashboard')`), tambahkan:

```javascript
// Inject UI notifikasi pembayaran gaji
injectSalaryNotificationUI();
updateNotificationSectionVisibility();
loadAndDisplayNotifications();
```

### Step 4: Refresh Notifikasi (Opsional)

Untuk auto-refresh setiap 5 detik saat melihat modal:

```javascript
setInterval(() => {
    if (document.getElementById('salaryNotificationModal') && 
        !document.getElementById('salaryNotificationModal').classList.contains('hide')) {
        renderFullSalaryNotificationList();
    }
    loadAndDisplayNotifications();
}, 5000);
```

---

## 📊 Struktur Data

### Notifikasi (localStorage: `app_salary_notifications`)
```json
{
    "id": "notif_1705318800000_abc123def",
    "type": "salary_payment",
    "guru_name": "Budi Santoso",
    "guru_username": "budi_tutoi",
    "siswa_name": "Ahmad Rizam",
    "siswa_id": "siswa_456",
    "paket_total": 8,
    "created_at": "2025-01-15T10:30:00.000Z",
    "is_transferred": false,
    "transferred_at": null,
    "notes": "Paket 8 sesi untuk Ahmad Rizam telah selesai",
    "is_read": false
}
```

### Syarat Data Siswa (localStorage: `app_siswa_data`)
```json
{
    "id": "siswa_456",
    "nama": "Ahmad Rizam",
    "program": "Matematika SMP",
    "sisa_sesi_awal": 8,  // ← WAJIB ADA: Total paket awal
    // ... field lain ...
}
```

### Syarat Data Sesi (localStorage: `app_sesi_data`)
```json
{
    "id": "sesi_123",
    "siswa_id": "siswa_456",      // ← WAJIB ADA
    "guru_username": "budi_tutor", // ← WAJIB ADA
    "status": "Selesai",           // ← WAJIB: Status selesai
    "tanggal": "2025-01-15",
    "jurnal": "Materi pecahan...",
    "created_at": "2025-01-15T10:30:00Z"
}
```

---

## 🎮 Penggunaan

### Untuk Admin (Penerima Notifikasi)

1. **Lihat Notifikasi Quick View**: Di dashboard akan tampil section "Notifikasi Pembayaran Gaji Guru" dengan preview notifikasi yang belum ditransfer

2. **Klik "Lihat Semua"**: Buka modal untuk melihat semua notifikasi detail

3. **Konfirmasi Transfer**: Klik tombol **"✓ Transfer OK"** untuk menandai notifikasi sebagai sudah ditransfer

4. **Lihat Riwayat**: Notifikasi yang sudah ditransfer akan berubah warna menjadi hijau di bawah section "Sudah Ditransfer"

5. **Bersihkan Riwayat**: Klik "Hapus Riwayat Ditransfer" untuk menghapus notifikasi lama yang sudah ditransfer

### Untuk Guru (Pemicu Notifikasi)

Guru tidak perlu melakukan apa-apa. Sistem otomatis mendeteksi ketika guru menyelesaikan paket siswa.

---

## 🔍 Contoh Flow

```
1. Guru Ahmad membuat Sesi Ke-8 untuk siswa Rizam → Status: "Selesai"
   ↓
2. Sistem mendeteksi: Total sesi selesai = 8, Paket total = 8 ✓
   ↓
3. Otomatis membuat Notifikasi:
   "Guru Ahmad telah menyelesaikan Paket 8 Sesi untuk Siswa Rizam"
   ↓
4. Admin melihat Notifikasi di Dashboard
   ↓
5. Admin transfer gaji ke Guru Ahmad
   ↓
6. Admin klik "✓ Transfer OK" pada notifikasi
   ↓
7. Notifikasi hilang dari section "Menunggu Konfirmasi"
   ↓
8. Notifikasi pindah ke "Sudah Ditransfer" (Riwayat)
   ↓
9. Admin bisa hapus riwayat kapan saja
```

---

## ⚙️ API Functions

### Core Functions (notification-system.js)

```javascript
// Inisialisasi
initNotificationSystem()

// Create notifikasi (biasanya otomatis via checkPackageCompletion)
createSalaryNotification({
    guru_name: string,
    guru_username: string,
    siswa_name: string,
    siswa_id: string,
    paket_total: number,
    notes?: string
})

// Get data
getStoredNotifications()        // Semua notifikasi
getActiveNotifications()         // Hanya yang belum ditransfer

// Update status
markAsTransferred(notificationId)
deleteNotification(notificationId)

// Update UI
updateNotificationBadge()
loadAndDisplayNotifications()

// Auto-detect (dipanggil dari handleSaveSesi)
checkPackageCompletion(siswaId, guruUsername)

// Maintenance
cleanupOldNotifications()        // Hapus notifikasi >30 hari yg sudah ditransfer
```

### UI Functions (notification-ui-integration.js)

```javascript
// UI Injection
injectSalaryNotificationUI()
showSalaryNotificationSection()

// Modal Control
openSalaryNotificationModal()
closeSalaryNotificationModal()

// Render
renderNotificationPanel(notifications)
renderFullSalaryNotificationList()

// Actions
clearAllTransferredNotifications()

// Visibility
updateNotificationSectionVisibility()
showSalaryNotificationSection()
```

---

## 🎨 UI Preview

### Dashboard Quick View
```
┌─────────────────────────────────────────┐
│ 🔔 Notifikasi Pembayaran Gaji Guru      │
│ Guru yg sudah selesai paket - tunggu... │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 💰 Guru: Budi Santoso               │ │
│ │ 👨‍🎓 Siswa: Ahmad Rizam              │ │
│ │ 📦 Paket: 8 Sesi Selesai            │ │
│ │ ⏰ Tanggal: 15 Jan, 10:30            │ │
│ │              [✓ Transfer OK]        │ │
│ └─────────────────────────────────────┘ │
│                  [Lihat Semua →]         │
└─────────────────────────────────────────┘
```

### Badge Counter
```
Di icon bell header akan menunjukkan:
🔔(3)  ← Berarti ada 3 notifikasi menunggu transfer
```

---

## 🚨 Troubleshooting

### Notifikasi tidak muncul?
- ✓ Pastikan script sudah diload: `<script src="notification-system.js"></script>`
- ✓ Pastikan `checkPackageCompletion()` dipanggil di `handleSaveSesi()`
- ✓ Pastikan struktur data siswa punya field `sisa_sesi_awal`
- ✓ Buka Console (F12) dan periksa error

### Notifikasi hilang setelah refresh?
- ✓ Data notifikasi disimpan di `localStorage` → akan persist
- ✓ Cek di Console: `JSON.parse(localStorage.getItem('app_salary_notifications'))`

### Badge tidak update?
- ✓ Panggil `updateNotificationBadge()` setelah ada perubahan
- ✓ Fungsi ini sudah otomatis dipanggil di `loadAndDisplayNotifications()`

### Notifikasi duplikat?
- ✓ Sistem sudah ada smart deduplication
- ✓ Cek console untuk log "ℹ Notifikasi sudah ada..."

---

## 📝 Catatan Penting

🔐 **Security**: 
- Notifikasi hanya tampil untuk user dengan role "admin"
- Gunakan `updateNotificationSectionVisibility()` untuk enforce ini

📦 **Data Integrity**:
- Jangan edit manual data di localStorage kecuali tahu apa yang dilakukan
- Gunakan function yang sudah disediakan

🔄 **Maintenance**:
- Jalankan `cleanupOldNotifications()` secara berkala (misalnya saat admin login)
- Ini akan hapus notifikasi yang sudah ditransfer >30 hari lalu

---

## ✨ Future Enhancement

- [ ] Email/SMS notification ke admin
- [ ] Notifikasi ke guru ketika paket mau selesai
- [ ] Analytics: jumlah guru per bulan, rata-rata days to transfer
- [ ] Reminder: notifikasi yang belum ditransfer >3 hari
- [ ] Export: laporan pembayaran gaji dalam format Excel

---

**Dibuat untuk**: azharlabib19/jurnal-les  
**Versi**: 1.0.0  
**Tanggal**: Mei 2026  
**Status**: ✅ Production Ready
