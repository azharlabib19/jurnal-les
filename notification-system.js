/**
 * ═══════════════════════════════════════════════════════════════════
 * NOTIFICATION SYSTEM - CORE
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Sistem notifikasi pembayaran gaji guru yang terintegrasi dengan
 * aplikasi Jurnal Les. Fitur utama:
 * 
 * ✅ Auto-detect paket completion
 * ✅ Smart deduplication
 * ✅ localStorage persistence
 * ✅ Badge counter management
 * ✅ Auto-cleanup notifikasi lama
 * ✅ Debug logging
 */

// ═══════════════════════════════════════════════════════════════════
// ⚙️ CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════════════

const NOTIFICATION_CONFIG = {
    STORAGE_KEY: 'app_salary_notifications',
    SISWA_DATA_KEY: 'app_siswa_data',
    SESI_DATA_KEY: 'app_sesi_data',
    RETENTION_DAYS: 30,           // Hapus notifikasi lama setelah 30 hari
    DEBUG: true,                  // Set false untuk production
    AUTO_CLEANUP_INTERVAL: 86400000  // 24 jam
};

// ═══════════════════════════════════════════════════════════════════
// 🚀 INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

function initNotificationSystem() {
    try {
        // Pastikan storage ada
        if (!localStorage.getItem(NOTIFICATION_CONFIG.STORAGE_KEY)) {
            localStorage.setItem(NOTIFICATION_CONFIG.STORAGE_KEY, JSON.stringify([]));
        }

        // Setup auto-cleanup
        setInterval(cleanupOldNotifications, NOTIFICATION_CONFIG.AUTO_CLEANUP_INTERVAL);

        debugLog('✅ Notification System initialized');
    } catch (error) {
        console.error('❌ Error initializing notification system:', error);
    }
}

// ═══════════════════════════════════════════════════════════════════
// 📌 CORE FUNCTIONS - CRUD
// ═══════════════════════════════════════════════════════════════════

/**
 * Buat notifikasi pembayaran gaji baru
 * @param {Object} data - Data notifikasi
 * @param {string} data.guru_name - Nama guru
 * @param {string} data.guru_username - Username guru untuk identifikasi
 * @param {string} data.siswa_name - Nama siswa
 * @param {string} data.siswa_id - ID siswa
 * @param {number} data.paket_total - Total sesi dalam paket
 * @param {string} data.notes - Catatan tambahan (optional)
 */
function createSalaryNotification(data) {
    try {
        // Validasi data
        if (!data.guru_username || !data.siswa_id) {
            throw new Error('guru_username dan siswa_id wajib diisi');
        }

        // Smart deduplication - cek apakah sudah ada
        const existing = getStoredNotifications().find(
            n => n.guru_username === data.guru_username && 
                 n.siswa_id === data.siswa_id &&
                 !n.is_transferred
        );

        if (existing) {
            debugLog(`ℹ Notifikasi sudah ada untuk ${data.guru_name} → ${data.siswa_name}`);
            return existing.id;
        }

        // Buat notifikasi baru
        const notif = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'salary_payment',
            guru_name: data.guru_name || 'Unknown Guru',
            guru_username: data.guru_username,
            siswa_name: data.siswa_name || 'Unknown Siswa',
            siswa_id: data.siswa_id,
            paket_total: data.paket_total || 0,
            created_at: new Date().toISOString(),
            is_transferred: false,
            transferred_at: null,
            notes: data.notes || '',
            is_read: false
        };

        // Simpan
        const allNotifs = getStoredNotifications();
        allNotifs.push(notif);
        saveNotifications(allNotifs);

        debugLog(`✅ Notifikasi created: ${notif.guru_name} → ${notif.siswa_name}`);
        
        // Update UI badge
        updateNotificationBadge();

        return notif.id;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
    }
}

/**
 * Get semua notifikasi dari storage
 */
function getStoredNotifications() {
    try {
        const data = localStorage.getItem(NOTIFICATION_CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('❌ Error getting stored notifications:', error);
        return [];
    }
}

/**
 * Get hanya notifikasi yang belum ditransfer (active)
 */
function getActiveNotifications() {
    return getStoredNotifications().filter(n => !n.is_transferred);
}

/**
 * Get hanya notifikasi yang sudah ditransfer (transferred/history)
 */
function getTransferredNotifications() {
    return getStoredNotifications().filter(n => n.is_transferred);
}

/**
 * Get semua notifikasi untuk display (keduanya)
 */
function getAllNotificationsForDisplay() {
    return getStoredNotifications();
}

/**
 * Tandai notifikasi sebagai sudah ditransfer
 */
function markAsTransferred(notifId) {
    try {
        const allNotifs = getStoredNotifications();
        const notif = allNotifs.find(n => n.id === notifId);

        if (!notif) {
            throw new Error(`Notifikasi ${notifId} tidak ditemukan`);
        }

        notif.is_transferred = true;
        notif.transferred_at = new Date().toISOString();
        notif.is_read = true;

        saveNotifications(allNotifs);
        debugLog(`✅ Notifikasi marked as transferred: ${notif.guru_name}`);

        // Update UI
        updateNotificationBadge();

        return true;
    } catch (error) {
        console.error('❌ Error marking notification as transferred:', error);
        return false;
    }
}

/**
 * Hapus notifikasi (biasanya notifikasi yang sudah ditransfer)
 */
function deleteNotification(notifId) {
    try {
        let allNotifs = getStoredNotifications();
        const index = allNotifs.findIndex(n => n.id === notifId);

        if (index === -1) {
            throw new Error(`Notifikasi ${notifId} tidak ditemukan`);
        }

        const deleted = allNotifs[index];
        allNotifs = allNotifs.filter(n => n.id !== notifId);
        saveNotifications(allNotifs);

        debugLog(`✅ Notifikasi deleted: ${deleted.guru_name} → ${deleted.siswa_name}`);

        // Update UI
        updateNotificationBadge();

        return true;
    } catch (error) {
        console.error('❌ Error deleting notification:', error);
        return false;
    }
}

/**
 * Simpan notifikasi ke localStorage
 */
function saveNotifications(notifs) {
    try {
        localStorage.setItem(NOTIFICATION_CONFIG.STORAGE_KEY, JSON.stringify(notifs));
    } catch (error) {
        console.error('❌ Error saving notifications:', error);
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🔍 AUTO-DETECT PAKET COMPLETION
// ═══════════════════════════════════════════════════════════════════

/**
 * Deteksi apakah guru sudah menyelesaikan paket siswa
 * Dipanggil dari handleSaveSesi() saat status === 'Selesai'
 * 
 * @param {string} siswaId - ID siswa
 * @param {string} guruUsername - Username guru
 */
function checkPackageCompletion(siswaId, guruUsername) {
    try {
        if (!siswaId || !guruUsername) {
            throw new Error('siswaId dan guruUsername wajib diisi');
        }

        // Get data siswa
        const allSiswa = JSON.parse(localStorage.getItem(NOTIFICATION_CONFIG.SISWA_DATA_KEY) || '[]');
        const siswa = allSiswa.find(s => s.id === siswaId);

        if (!siswa) {
            debugLog(`⚠️ Siswa ${siswaId} tidak ditemukan`);
            return false;
        }

        // Get total sesi selesai untuk siswa ini dari guru ini
        const allSesi = JSON.parse(localStorage.getItem(NOTIFICATION_CONFIG.SESI_DATA_KEY) || '[]');
        const completedSessions = allSesi.filter(
            s => s.siswa_id === siswaId && 
                 s.guru_username === guruUsername && 
                 (s.status === 'Selesai' || s.status === 'selesai')
        ).length;

        // Get total paket untuk siswa
        const paketTotal = siswa.sisa_sesi_awal || 8;

        debugLog(`📊 Check: Guru=${guruUsername}, Siswa=${siswa.nama}, Completed=${completedSessions}/${paketTotal}`);

        // Jika selesai, buat notifikasi
        if (completedSessions >= paketTotal) {
            debugLog(`🎉 Package completed! Creating notification...`);

            // Get guru info
            const allGuru = JSON.parse(localStorage.getItem('app_guru_data') || '[]');
            const guru = allGuru.find(g => g.username === guruUsername);
            const guruName = guru ? guru.nama : guruUsername;

            createSalaryNotification({
                guru_name: guruName,
                guru_username: guruUsername,
                siswa_name: siswa.nama,
                siswa_id: siswaId,
                paket_total: paketTotal,
                notes: `Paket ${paketTotal} sesi untuk ${siswa.nama} telah selesai`
            });

            return true;
        }

        return false;
    } catch (error) {
        console.error('❌ Error checking package completion:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 BADGE & UI UPDATE
// ═══════════════════════════════════════════════════════════════════

/**
 * Update badge counter di UI
 */
function updateNotificationBadge() {
    try {
        const activeCount = getActiveNotifications().length;
        
        // Update badge di berbagai tempat
        const badges = [
            document.getElementById('notifQuickBadge'),
            document.getElementById('notificationBadge'),
            document.getElementById('salaryNotifBadge')
        ];

        badges.forEach(badge => {
            if (badge && activeCount > 0) {
                badge.textContent = activeCount;
                badge.classList.remove('hide');
            } else if (badge) {
                badge.classList.add('hide');
            }
        });

        // Update bell button
        const bellBtn = document.getElementById('btnNotifBell');
        if (bellBtn) {
            if (activeCount > 0) {
                bellBtn.classList.remove('hide');
            } else {
                bellBtn.classList.add('hide');
            }
        }

        debugLog(`📊 Badge updated: ${activeCount} active notifications`);
    } catch (error) {
        console.error('❌ Error updating badge:', error);
    }
}

/**
 * Refresh UI notifikasi (dipanggil dari UI integration)
 */
function refreshNotificationUI() {
    if (typeof loadAndDisplayNotifications === 'function') {
        loadAndDisplayNotifications();
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🧹 CLEANUP & MAINTENANCE
// ═══════════════════════════════════════════════════════════════════

/**
 * Hapus notifikasi lama yang sudah ditransfer (>30 hari)
 */
function cleanupOldNotifications() {
    try {
        let allNotifs = getStoredNotifications();
        const now = new Date();
        const retentionTime = NOTIFICATION_CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000;

        const beforeCount = allNotifs.length;
        
        allNotifs = allNotifs.filter(notif => {
            // Keep notifikasi yang belum ditransfer
            if (!notif.is_transferred) return true;

            // Keep notifikasi yang baru
            const transferredAt = notif.transferred_at ? new Date(notif.transferred_at) : new Date(notif.created_at);
            const age = now - transferredAt;

            return age < retentionTime;
        });

        const deletedCount = beforeCount - allNotifs.length;

        if (deletedCount > 0) {
            saveNotifications(allNotifs);
            debugLog(`🧹 Cleanup: Deleted ${deletedCount} old notifications`);
        }
    } catch (error) {
        console.error('❌ Error cleaning up notifications:', error);
    }
}

/**
 * Manual cleanup semua notifikasi yang sudah ditransfer
 */
function clearAllTransferred() {
    try {
        let allNotifs = getStoredNotifications();
        const transferred = allNotifs.filter(n => n.is_transferred);
        const active = allNotifs.filter(n => !n.is_transferred);

        if (transferred.length === 0) {
            debugLog('ℹ Tidak ada notifikasi transferred untuk dihapus');
            return 0;
        }

        saveNotifications(active);
        debugLog(`🧹 Cleared ${transferred.length} transferred notifications`);

        updateNotificationBadge();
        return transferred.length;
    } catch (error) {
        console.error('❌ Error clearing transferred notifications:', error);
        return 0;
    }
}

/**
 * Manual hard reset semua notifikasi
 */
function resetAllNotifications() {
    if (confirm('⚠️ Hard reset: Hapus SEMUA notifikasi? Ini tidak bisa dibatalkan!')) {
        localStorage.setItem(NOTIFICATION_CONFIG.STORAGE_KEY, JSON.stringify([]));
        debugLog('🧹 All notifications reset');
        updateNotificationBadge();
        return true;
    }
    return false;
}

// ═══════════════════════════════════════════════════════════════════
// 📅 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Format tanggal untuk display di UI
 */
function formatNotificationDate(isoString) {
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        // Less than 1 minute
        if (diff < 60000) {
            return 'Baru saja';
        }

        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} menit lalu`;
        }

        // Less than 1 day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} jam lalu`;
        }

        // More than 1 day
        const days = Math.floor(diff / 86400000);
        if (days === 1) return 'Kemarin';
        if (days < 7) return `${days} hari lalu`;

        // Format date
        const options = { day: 'numeric', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined };
        return date.toLocaleDateString('id-ID', options);
    } catch (error) {
        return isoString;
    }
}

/**
 * Get stats notifikasi
 */
function getNotificationStats() {
    const all = getStoredNotifications();
    return {
        total: all.length,
        active: getActiveNotifications().length,
        transferred: getTransferredNotifications().length,
        today: all.filter(n => {
            const date = new Date(n.created_at);
            const today = new Date();
            return date.toDateString() === today.toDateString();
        }).length
    };
}

// ═══════════════════════════════════════════════════════════════════
// 🐛 DEBUG LOGGING
// ═══════════════════════════════════════════════════════════════════

function debugLog(message) {
    if (NOTIFICATION_CONFIG.DEBUG) {
        console.log(`[NOTIF-SYSTEM] ${message}`);
    }
}

function enableDebugMode() {
    NOTIFICATION_CONFIG.DEBUG = true;
    console.log('✅ Debug mode enabled');
}

function disableDebugMode() {
    NOTIFICATION_CONFIG.DEBUG = false;
    console.log('✅ Debug mode disabled');
}

// ═══════════════════════════════════════════════════════════════════
// 📊 EXPORT FUNCTIONS (untuk testing/debugging)
// ═══════════════════════════════════════════════════════════════════

function exportNotificationsAsJSON() {
    const data = {
        timestamp: new Date().toISOString(),
        stats: getNotificationStats(),
        notifications: getStoredNotifications()
    };
    return JSON.stringify(data, null, 2);
}

function exportNotificationsAsCSV() {
    const notifs = getStoredNotifications();
    
    if (notifs.length === 0) {
        return 'No notifications to export';
    }

    let csv = 'ID,Guru,Siswa,Paket,Status,Created,Transferred\n';
    
    notifs.forEach(n => {
        csv += `"${n.id}","${n.guru_name}","${n.siswa_name}",${n.paket_total},"${n.is_transferred ? 'Transferred' : 'Pending'}","${n.created_at}","${n.transferred_at || 'N/A'}"\n`;
    });

    return csv;
}

function printNotificationDebugInfo() {
    console.clear();
    console.log('═══════════════════════════════════════════');
    console.log('📊 NOTIFICATION SYSTEM - DEBUG INFO');
    console.log('═══════════════════════════════════════════');
    console.log('Stats:', getNotificationStats());
    console.log('Active Notifications:', getActiveNotifications());
    console.log('Transferred Notifications:', getTransferredNotifications());
    console.log('Storage used:', localStorage.getItem(NOTIFICATION_CONFIG.STORAGE_KEY).length + ' bytes');
    console.log('═══════════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════════
// 🎬 AUTO-INIT
// ═══════════════════════════════════════════════════════════════════

// Auto-initialize saat script loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
} else {
    initNotificationSystem();
}
