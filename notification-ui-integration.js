/**
 * ═══════════════════════════════════════════════════════════════════
 * NOTIFICATION UI INTEGRATION
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Menangani UI integration notifikasi ke dashboard utama.
 * Include: section injection, modal, rendering, dan event handlers.
 */

// ═══════════════════════════════════════════════════════════════════
// 🎨 UI INJECTION - Tambahkan section notifikasi ke dashboard
// ═══════════════════════════════════════════════════════════════════

function injectSalaryNotificationUI() {
    // Cek apakah sudah di-inject
    if (document.getElementById('salaryNotificationSection')) {
        return;
    }

    // Cari container untuk inject (biasanya di pageDashboard)
    const dashboardContainer = document.getElementById('pageDashboard');
    if (!dashboardContainer) return;

    // Buat HTML section
    const sectionHTML = `
        <div id="salaryNotificationSection" class="mb-6 relative">
            <!-- Animated border -->
            <div class="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-[2rem] blur opacity-20 animate-pulse"></div>
            
            <div class="bg-white rounded-[1.5rem] overflow-hidden border-2 border-amber-200 shadow-lg relative z-10">
                <!-- Header -->
                <div class="px-6 py-5 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-100">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white rounded-2xl border-2 border-amber-300 shadow-sm text-amber-600 flex items-center justify-center relative">
                            <i class="fa-solid fa-money-bill-wave text-xl"></i>
                            <span id="notifQuickBadge" class="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px] font-black hide">0</span>
                        </div>
                        <div>
                            <h3 class="text-amber-900 font-black text-base">💰 Notifikasi Pembayaran Gaji Guru</h3>
                            <p class="text-amber-700 text-xs mt-1 font-bold">Guru yang sudah selesai paket - tunggu konfirmasi transfer</p>
                        </div>
                    </div>
                    <button id="btnViewAllNotifications" onclick="openSalaryNotificationModal()" class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm px-5 py-2.5 rounded-xl transition shadow-md">
                        <i class="fa-solid fa-arrow-right text-sm"></i> Lihat Semua
                    </button>
                </div>

                <!-- Quick View Panel -->
                <div id="notificationQuickPanel" class="divide-y divide-amber-100 bg-white">
                    <div class="p-6 text-center">
                        <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-600">
                            <i class="fa-solid fa-inbox text-lg"></i>
                        </div>
                        <p class="text-slate-500 text-sm font-bold">Tidak ada notifikasi menunggu transfer</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Notifikasi Lengkap -->
        <div id="salaryNotificationModal" class="modal-backdrop hide">
            <div class="modal-card max-w-2xl flex flex-col max-h-[90vh]">
                <!-- Modal Header -->
                <div class="bg-gradient-to-r from-amber-600 to-orange-500 p-6 flex justify-between items-center relative overflow-hidden border-b-4 border-amber-400">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-xl translate-x-10 -translate-y-10"></div>
                    <h3 class="text-white font-black text-lg flex items-center gap-3 relative z-10">
                        <div class="bg-white/20 text-white w-10 h-10 rounded-xl flex items-center justify-center border border-white/40 backdrop-blur-md shadow-inner">
                            <i class="fa-solid fa-bell"></i>
                        </div>
                        Notifikasi Pembayaran Gaji
                    </h3>
                    <button onclick="closeSalaryNotificationModal()" class="text-white/90 hover:text-white w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center transition relative z-10">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <!-- Modal Body - Tabs -->
                <div class="flex-1 overflow-hidden flex flex-col bg-slate-50">
                    <!-- Tab Buttons -->
                    <div class="flex gap-2 px-6 pt-5 pb-0 border-b-2 border-slate-200 bg-white">
                        <button id="tabMenunggu" onclick="switchNotificationTab('menunggu')" class="px-5 py-3 font-black text-sm text-amber-700 border-b-4 border-amber-500 transition">
                            ⏳ Menunggu Konfirmasi
                        </button>
                        <button id="tabTransferred" onclick="switchNotificationTab('transferred')" class="px-5 py-3 font-black text-sm text-slate-500 border-b-4 border-transparent hover:border-slate-300 transition">
                            ✅ Sudah Ditransfer
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div class="flex-1 overflow-y-auto">
                        <!-- Menunggu Tab -->
                        <div id="tabContentMenunggu" class="p-6 space-y-4">
                            <!-- Injected here -->
                        </div>

                        <!-- Transferred Tab -->
                        <div id="tabContentTransferred" class="p-6 space-y-4 hide">
                            <!-- Injected here -->
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-5 border-t-2 border-slate-200 bg-white flex gap-3 justify-end">
                    <button onclick="clearAllTransferredNotifications()" id="btnClearTransferred" class="bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-sm px-5 py-2.5 rounded-xl hover:bg-slate-200 transition">
                        <i class="fa-solid fa-trash text-sm"></i> Hapus Riwayat
                    </button>
                    <button onclick="closeSalaryNotificationModal()" class="bg-gradient-to-r from-amber-600 to-orange-500 text-white font-black text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    `;

    // Inject sebelum element terakhir atau di awal
    const firstChild = dashboardContainer.querySelector('.page-content.hide') || dashboardContainer.firstChild;
    if (firstChild) {
        firstChild.insertAdjacentHTML('beforebegin', sectionHTML);
    } else {
        dashboardContainer.insertAdjacentHTML('beforeend', sectionHTML);
    }

    // Load notifikasi pertama kali
    loadAndDisplayNotifications();
    
    // Setup auto-refresh
    startNotificationRefreshInterval();
}

// ═══════════════════════════════════════════════════════════════════
// 📱 LOAD & DISPLAY NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════

function loadAndDisplayNotifications() {
    const activeNotifs = getActiveNotifications();
    
    // Update quick panel
    renderNotificationPanel(activeNotifs);
    
    // Update quick badge
    const badge = document.getElementById('notifQuickBadge');
    if (badge && activeNotifs.length > 0) {
        badge.textContent = activeNotifs.length;
        badge.classList.remove('hide');
    } else if (badge) {
        badge.classList.add('hide');
    }

    // Update modal jika dibuka
    if (document.getElementById('salaryNotificationModal') && 
        !document.getElementById('salaryNotificationModal').classList.contains('hide')) {
        renderFullSalaryNotificationList();
    }
}

function renderNotificationPanel(activeNotifs) {
    const panel = document.getElementById('notificationQuickPanel');
    if (!panel) return;

    if (activeNotifs.length === 0) {
        panel.innerHTML = `
            <div class="p-6 text-center">
                <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-600">
                    <i class="fa-solid fa-inbox text-lg"></i>
                </div>
                <p class="text-slate-500 text-sm font-bold">Tidak ada notifikasi menunggu transfer</p>
            </div>
        `;
        return;
    }

    // Show top 3
    const topNotifs = activeNotifs.slice(0, 3);
    let html = '';

    topNotifs.forEach(notif => {
        html += `
            <div class="p-4 hover:bg-amber-50 transition">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                        <h4 class="font-black text-slate-900 text-sm">💰 ${notif.guru_name}</h4>
                        <p class="text-xs text-slate-600 font-bold">👨‍🎓 ${notif.siswa_name}</p>
                        <p class="text-xs text-amber-700 font-black mt-1">📦 Paket: ${notif.paket_total} Sesi Selesai</p>
                    </div>
                    <button onclick="markAsTransferred('${notif.id}')" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition whitespace-nowrap ml-2">
                        ✓ OK
                    </button>
                </div>
                <p class="text-[10px] text-slate-500">⏰ ${formatNotificationDate(notif.created_at)}</p>
            </div>
        `;
    });

    panel.innerHTML = html;
}

function renderFullSalaryNotificationList() {
    const allNotifs = getAllNotificationsForDisplay();
    const activeNotifs = allNotifs.filter(n => !n.is_transferred);
    const transferredNotifs = allNotifs.filter(n => n.is_transferred);

    // Render Active Tab
    renderNotificationTab('tabContentMenunggu', activeNotifs, true);
    
    // Render Transferred Tab
    renderNotificationTab('tabContentTransferred', transferredNotifs, false);

    // Show/hide transferred tab button
    const btnTransferred = document.getElementById('tabTransferred');
    if (btnTransferred) {
        if (transferredNotifs.length > 0) {
            btnTransferred.classList.remove('hide');
        } else {
            btnTransferred.classList.add('hide');
        }
    }
}

function renderNotificationTab(containerId, notifications, isActive) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10">
                <div class="w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300 shadow-sm">
                    <i class="fa-solid fa-ghost text-2xl"></i>
                </div>
                <p class="text-slate-500 text-sm font-black">
                    ${isActive ? 'Tidak ada notifikasi menunggu transfer.' : 'Riwayat transfer kosong.'}
                </p>
            </div>
        `;
        return;
    }

    let html = '';
    notifications.forEach(notif => {
        const borderColor = isActive ? 'border-amber-200' : 'border-green-200';
        const bgColor = isActive ? 'bg-amber-50' : 'bg-green-50';
        const statusBg = isActive ? 'bg-amber-100' : 'bg-green-100';
        const statusText = isActive ? 'text-amber-700' : 'text-green-700';

        html += `
            <div class="bg-white border-2 ${borderColor} rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h4 class="font-black text-slate-900 text-sm mb-1 flex items-center gap-2">
                            💰 ${notif.guru_name}
                            <span class="text-[10px] ${statusBg} ${statusText} px-2 py-0.5 rounded-full font-black">
                                ${isActive ? '⏳ Menunggu' : '✅ Selesai'}
                            </span>
                        </h4>
                        <p class="text-xs text-slate-600 font-bold flex items-center gap-1">
                            <i class="fa-solid fa-user-graduate"></i> ${notif.siswa_name}
                        </p>
                        <p class="text-xs text-slate-600 font-bold flex items-center gap-1 mt-1">
                            <i class="fa-solid fa-id-card"></i> ${notif.siswa_id}
                        </p>
                    </div>
                </div>

                <div class="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-200">
                    <p class="text-xs font-black text-slate-700 mb-2">📦 Paket Completion</p>
                    <div class="flex items-center gap-3">
                        <div class="flex-1">
                            <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-full" style="width: 100%"></div>
                            </div>
                        </div>
                        <span class="font-black text-slate-900 text-sm">${notif.paket_total}/${notif.paket_total}</span>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-[10px] text-slate-500 font-bold">
                            ⏰ ${formatNotificationDate(notif.created_at)}
                        </p>
                        ${notif.transferred_at ? `
                            <p class="text-[10px] text-green-600 font-black">
                                ✓ Ditransfer: ${formatNotificationDate(notif.transferred_at)}
                            </p>
                        ` : ''}
                    </div>
                    ${isActive ? `
                        <div class="flex gap-2">
                            <button onclick="markAsTransferred('${notif.id}')" class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-xs px-4 py-2 rounded-lg transition shadow-md">
                                ✓ Transfer OK
                            </button>
                        </div>
                    ` : `
                        <button onclick="deleteNotification('${notif.id}')" class="text-slate-400 hover:text-red-600 transition text-lg">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 MODAL CONTROL
// ═══════════════════════════════════════════════════════════════════

function openSalaryNotificationModal() {
    const modal = document.getElementById('salaryNotificationModal');
    if (modal) {
        modal.classList.remove('hide');
        renderFullSalaryNotificationList();
    }
}

function closeSalaryNotificationModal() {
    const modal = document.getElementById('salaryNotificationModal');
    if (modal) {
        modal.classList.add('hide');
    }
}

function switchNotificationTab(tab) {
    // Update tab buttons
    document.getElementById('tabMenunggu').classList.toggle('text-amber-700 border-b-amber-500', tab === 'menunggu');
    document.getElementById('tabMenunggu').classList.toggle('text-slate-500 border-b-transparent', tab !== 'menunggu');
    
    document.getElementById('tabTransferred').classList.toggle('text-green-700 border-b-green-500', tab === 'transferred');
    document.getElementById('tabTransferred').classList.toggle('text-slate-500 border-b-transparent', tab !== 'transferred');

    // Update tab content
    document.getElementById('tabContentMenunggu').classList.toggle('hide', tab !== 'menunggu');
    document.getElementById('tabContentTransferred').classList.toggle('hide', tab !== 'transferred');
}

// ═══════════════════════════════════════════════════════════════════
// ⚡ ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════════

function markAsTransferred(notifId) {
    if (confirm('Konfirmasi: Sudah transfer gaji untuk notifikasi ini?')) {
        if (typeof markAsTransferred === 'function') {
            // Call dari notification-system.js
            const markAsTransferredFunc = window.markAsTransferred;
            if (markAsTransferredFunc !== arguments.callee) {
                markAsTransferredFunc(notifId);
                loadAndDisplayNotifications();
                showToast('✅ Notifikasi ditandai sudah ditransfer', 'success');
            }
        }
    }
}

function clearAllTransferredNotifications() {
    const transferredNotifs = getTransferredNotifications();
    
    if (transferredNotifs.length === 0) {
        showToast('Tidak ada riwayat transfer untuk dihapus', 'error');
        return;
    }

    if (confirm(`Hapus ${transferredNotifs.length} riwayat transfer?`)) {
        transferredNotifs.forEach(n => deleteNotification(n.id));
        loadAndDisplayNotifications();
        showToast('✅ Riwayat transfer dihapus', 'success');
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🔄 AUTO-REFRESH
// ═══════════════════════════════════════════════════════════════════

let notificationRefreshInterval = null;

function startNotificationRefreshInterval() {
    if (notificationRefreshInterval) {
        clearInterval(notificationRefreshInterval);
    }

    notificationRefreshInterval = setInterval(() => {
        loadAndDisplayNotifications();
    }, 10000); // Refresh setiap 10 detik
}

function stopNotificationRefreshInterval() {
    if (notificationRefreshInterval) {
        clearInterval(notificationRefreshInterval);
        notificationRefreshInterval = null;
    }
}

// ═══════════════════════════════════════════════════════════════════
// 👁️ VISIBILITY CONTROL
// ═══════════════════════════════════════════════════════════════════

function updateNotificationSectionVisibility() {
    // Get current user role
    const userData = JSON.parse(localStorage.getItem('app_current_user') || '{}');
    const userRole = userData.role || localStorage.getItem('app_user_role') || 'tutor';

    const notifSection = document.getElementById('salaryNotificationSection');
    
    if (notifSection) {
        if (userRole === 'admin') {
            notifSection.classList.remove('hide');
        } else {
            notifSection.classList.add('hide');
        }
    }
}

function showSalaryNotificationSection() {
    const section = document.getElementById('salaryNotificationSection');
    if (section) {
        section.classList.remove('hide');
    }
}

function hideSalaryNotificationSection() {
    const section = document.getElementById('salaryNotificationSection');
    if (section) {
        section.classList.add('hide');
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Delay untuk memastikan DOM fully loaded
    setTimeout(() => {
        injectSalaryNotificationUI();
        updateNotificationSectionVisibility();
    }, 1000);
});

// Auto-inject jika navigate ke dashboard
function injectUIOnNavigate() {
    if (document.getElementById('pageDashboard') && !document.getElementById('salaryNotificationSection')) {
        injectSalaryNotificationUI();
        updateNotificationSectionVisibility();
    }
}

// Override navigate function jika ada
if (typeof window.navigateOriginal === 'undefined' && typeof navigate === 'function') {
    window.navigateOriginal = navigate;
    window.navigate = function(page) {
        window.navigateOriginal(page);
        setTimeout(injectUIOnNavigate, 500);
    };
}
