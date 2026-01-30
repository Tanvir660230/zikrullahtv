import { store } from './store/store.js?v=26';
import { fmtUSD, fmtBDT, showToast, debounce } from './utils/utils.js';

// Elements Map
const els = {
    // Header - Month Nav
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),
    monthSelect: document.getElementById('monthSelect'),
    yearInput: document.getElementById('yearInput'),

    settingsBtn: document.getElementById('openSettingsBtn'),

    // Dashboard
    liqUSD: document.getElementById('liqUSD'),
    liqBDT: document.getElementById('liqBDT'),
    monthReceipts: document.getElementById('monthReceipts'),
    monthReceiptsBDT: document.getElementById('monthReceiptsBDT'),
    monthDisbursements: document.getElementById('monthDisbursements'),
    monthDisbursementsBDT: document.getElementById('monthDisbursementsBDT'),
    outLiqUSD: document.getElementById('outLiqUSD'),
    outLiqBDT: document.getElementById('outLiqBDT'),
    avgBuyRate: document.getElementById('avgBuyRate'),

    // Stats
    statsPendingCount: document.getElementById('statsPendingCount'),
    statsPendingAmount: document.getElementById('statsPendingAmount'),
    statsPaidCount: document.getElementById('statsPaidCount'),
    statsPaidAmount: document.getElementById('statsPaidAmount'),
    statsReceiversCount: document.getElementById('statsReceiversCount'),

    // Navigation
    navDashboard: document.getElementById('navDashboard'),
    navMoneyIn: document.getElementById('navMoneyIn'),
    navMoneyOut: document.getElementById('navMoneyOut'),

    // Views
    dashboardView: document.getElementById('dashboardView'),
    incomingView: document.getElementById('incomingTab'), // Reusing ID for now or renamed in HTML? HTML kept IDs but logic treats them as views
    outgoingView: document.getElementById('outgoingTab'),

    // Incoming
    incLiqUSD: document.getElementById('incLiqUSD'),
    incLiqBDT: document.getElementById('incLiqBDT'),
    incSearch: document.getElementById('incSearch'),
    exportIncBtn: document.getElementById('exportIncBtn'),
    openIncModalBtn: document.getElementById('openIncModalBtn'),
    incTableBody: document.querySelector('#incomingTable tbody'),

    // Outgoing
    outSearch: document.getElementById('outSearch'),
    exportOutBtn: document.getElementById('exportOutBtn'),
    openOutModalBtn: document.getElementById('openOutModalBtn'),
    outTableBody: document.querySelector('#outgoingTable tbody'),

    // Management Buttons
    manageSourcesBtn: document.getElementById('manageSourcesBtn'),
    manageBeneficiariesBtn: document.getElementById('manageBeneficiariesBtn'),
    openAddBenModalBtn: document.getElementById('openAddBenModalBtn'),

    // Modals
    incomingModal: document.getElementById('incomingModal'),
    closeIncModal: document.getElementById('closeIncModal'),
    outgoingModal: document.getElementById('outgoingModal'),
    closeOutModal: document.getElementById('closeOutModal'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    sourcesModal: document.getElementById('sourcesModal'),
    closeSourcesModal: document.getElementById('closeSourcesModal'),
    beneficiariesListModal: document.getElementById('beneficiariesListModal'),
    closeBenListModal: document.getElementById('closeBenListModal'),
    beneficiaryModal: document.getElementById('beneficiaryModal'),
    closeBenModal: document.getElementById('closeBenModal'),
    reportModal: document.getElementById('reportModal'),
    closeReportModal: document.getElementById('closeReportModal'),
    downloadReportBtn: document.getElementById('downloadReportBtn'),

    // Report Elements
    downloadReportPdfBtn: document.getElementById('downloadReportPdfBtn'),
    openReportModalBtn: document.getElementById('openReportModalBtn'),
    repMonth: document.getElementById('repMonth'),
    repGenDate: document.getElementById('repGenDate'),
    repOpening: document.getElementById('repOpening'),
    repOpeningUSD: document.getElementById('repOpeningUSD'),
    repTotalIn: document.getElementById('repTotalIn'),
    repTotalInUSD: document.getElementById('repTotalInUSD'),
    repTotalOut: document.getElementById('repTotalOut'),
    repTotalOutUSD: document.getElementById('repTotalOutUSD'),
    repClosing: document.getElementById('repClosing'),
    repClosingUSD: document.getElementById('repClosingUSD'),
    repClosingCard: document.getElementById('repClosingCard'),
    repInBody: document.getElementById('repInBody'),
    repOutBody: document.getElementById('repOutBody'),
    repInTotal: document.getElementById('repInTotal'),
    repInTotalUSD: document.getElementById('repInTotalUSD'),
    repOutTotal: document.getElementById('repOutTotal'),
    repOutTotalUSD: document.getElementById('repOutTotalUSD'),
    repNetFlow: document.getElementById('repNetFlow'),
    repNetFlowUSD: document.getElementById('repNetFlowUSD'),
    repStatusBadge: document.getElementById('repStatusBadge'),

    // Forms
    incomingForm: document.getElementById('incomingForm'),
    incDate: document.getElementById('incDate'),
    incId: document.getElementById('incId'),
    incType: document.getElementById('incType'),
    incSource: document.getElementById('incSource'),
    incUSD: document.getElementById('incUSD'),
    incBDT: document.getElementById('incBDT'),
    incRate: document.getElementById('incRate'),

    outgoingForm: document.getElementById('outgoingForm'),
    outDate: document.getElementById('outDate'),
    outId: document.getElementById('outId'),
    outBeneficiary: document.getElementById('outBeneficiary'),
    outUSD: document.getElementById('outUSD'),
    outBDT: document.getElementById('outBDT'),
    outRate: document.getElementById('outRate'),
    hintRateVal: document.getElementById('hintRateVal'),
    applyAvgRateBtn: document.getElementById('applyAvgRateBtn'),
    bankPreview: document.getElementById('bankPreview'),
    prevBankName: document.getElementById('prevBankName'),
    prevAccNo: document.getElementById('prevAccNo'),
    prevDisplayName: document.getElementById('prevDisplayName'),

    // Source Management Form
    addSourceForm: document.getElementById('addSourceForm'),
    sourcesList: document.getElementById('sourcesList'),

    // Beneficiary Management
    beneficiariesTableBody: document.querySelector('#beneficiariesTable tbody'),
    benModalTitle: document.getElementById('benModalTitle'),
    benId: document.getElementById('benId'),
    benNickname: document.getElementById('benNickname'),
    benAccountName: document.getElementById('benAccountName'),
    benBankName: document.getElementById('benBankName'),
    benAccountNo: document.getElementById('benAccountNo'),
    benBranch: document.getElementById('benBranch'),

    // Settings Form
    settingsForm: document.getElementById('settingsForm'),
    setOpeningUSD: document.getElementById('setOpeningUSD'),
    setOpeningBDT: document.getElementById('setOpeningBDT'),
    openingBalanceSection: document.getElementById('openingBalanceSection'),
    clearDataBtn: document.getElementById('clearDataBtn'),
    downloadBackupBtn: document.getElementById('downloadBackupBtn'),

    // Beneficiary Form
    benForm: document.getElementById('beneficiaryForm'),

    // History Modal
    historyModal: document.getElementById('historyModal'),
    closeHistoryModal: document.getElementById('closeHistoryModal'),
    openHistoryModalBtn: document.getElementById('openHistoryModalBtn'),
    sidebarHistoryBtn: document.getElementById('sidebarHistoryBtn'),
    histSearch: document.getElementById('histSearch'),
    histMonth: document.getElementById('histMonth'),
    histYear: document.getElementById('histYear'),
    downloadBankStatementBtn: document.getElementById('downloadBankStatementBtn'),
    historyTableBody: document.getElementById('historyTableBody'),

    // Login
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    loginPassword: document.getElementById('loginPassword'),
    logoutBtn: document.getElementById('logoutBtn'),
    settingsHeaderTitle: document.getElementById('settingsHeaderTitle'),

    // Sidebar
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileSidebar: document.getElementById('mobileSidebar'),
    mobileSidebarOverlay: document.getElementById('mobileSidebarOverlay'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    sidebarReportBtn: document.getElementById('sidebarReportBtn'),
    sidebarLogoutBtn: document.getElementById('sidebarLogoutBtn'),
    sidebarSettingsBtn: document.getElementById('sidebarSettingsBtn')
};

// --- Responsive Layout ---
function setupResponsiveLayout() {
    const monthNav = document.querySelector('.month-navigator');
    const headerLeft = document.querySelector('.header-left');
    // els.mobileDateLocation is not in els object yet? Let's check or use document.getElementById
    const mobileLoc = document.getElementById('mobileDateLocation');

    const handleResize = () => {
        if (window.innerWidth <= 768) {
            // Move to mobile location if not already there
            if (mobileLoc && monthNav && !mobileLoc.contains(monthNav)) {
                mobileLoc.appendChild(monthNav);
            }
        } else {
            // Move back to header if not already there
            if (headerLeft && monthNav && !headerLeft.contains(monthNav)) {
                // Ensure it goes after h1
                const h1 = headerLeft.querySelector('h1');
                if (h1 && h1.nextSibling) {
                    headerLeft.insertBefore(monthNav, h1.nextSibling);
                } else {
                    headerLeft.appendChild(monthNav);
                }
            }
        }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}


async function initApp() {
    try {
        populateMonthSelect();

        const today = new Date().toISOString().split('T')[0];
        els.incDate.value = today;
        els.outDate.value = today;

        const [currYear, currMonth] = today.slice(0, 7).split('-');
        els.yearInput.value = currYear;
        els.monthSelect.value = currMonth;

        updateStoreDate();
        setupEventListeners();
        setupResponsiveLayout(); // Add this
        store.subscribe(render);
        checkLoginStatus();

        // Check DB Connection (Async - Don't block UI)
        console.log('App: Verifying data bridge status in background...');
        updateConnectionStatus();

        // Listen for real-time network changes
        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);

        console.log('App: UI Initialization complete.');
    } catch (error) {
        console.error('App init failed:', error);
        alert('Critical error during app initialization. Please check the console.\nDetail: ' + error.message);
    }
}

async function updateConnectionStatus() {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;

    // 1. Check Browser Network Status first
    if (!navigator.onLine) {
        statusEl.textContent = 'Offline';
        statusEl.className = 'status-badge-v2 danger';
        statusEl.style.background = '#fef2f2';
        statusEl.style.color = '#991b1b';
        statusEl.title = 'No Internet Connection';
        showToast('You are currently Offline. Changes will not be saved.', 'error');
        return;
    }

    try {
        console.log('App: Checking Cloud connection...');
        const { db } = await import('./services/db.js');
        const status = await db.initPromise;
        const isOnline = status.online;
        const errorMsg = status.error;

        if (isOnline) {
            statusEl.textContent = 'Online';
            statusEl.className = 'status-badge-v2 success';
            statusEl.title = 'Connected to Firebase Cloud Sync';
            console.log('App: Data connection established (Cloud Mode)');
        } else {
            statusEl.textContent = 'Disconnected';
            statusEl.className = 'status-badge-v2 danger';
            statusEl.style.background = '#fef2f2';
            statusEl.style.color = '#991b1b';
            statusEl.title = 'Connection Failed: ' + (errorMsg || 'Unknown Error');
            console.warn('App: Cloud connection failed:', errorMsg);

            // Show more helpful error to user
            if (errorMsg && errorMsg.includes('Anonymous Login')) {
                showToast('SETUP REQUIRED: Enable Anonymous Login in Firebase Console.', 'error', 15000);
            } else if (errorMsg && errorMsg.includes('Rules')) {
                showToast('SETUP REQUIRED: Update Firebase Rules. See FIREBASE_SETUP.md', 'error', 15000);
            } else {
                showToast('Database Error: ' + (errorMsg || 'Check your internet connection'), 'error', 10000);
            }
        }
    } catch (err) {
        console.error('App: Critical connection check failure:', err);
        statusEl.textContent = 'Error';
        statusEl.className = 'status-badge-v2 danger';
        showToast('Database connection error', 'error');
    }
}

function checkLoginStatus() {
    const isAuth = sessionStorage.getItem('isAuth') === 'true';
    if (isAuth) {
        els.loginModal.classList.remove('open');
        els.loginModal.style.display = 'none';
        els.logoutBtn.style.display = 'flex';
    } else {
        els.loginModal.classList.add('open');
        els.loginModal.style.display = 'flex';
        els.logoutBtn.style.display = 'none';
    }
}

function populateMonthSelect() {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    els.monthSelect.innerHTML = months.map((m, i) =>
        `<option value="${String(i + 1).padStart(2, '0')}">${m}</option>`
    ).join('');
}

function updateStoreDate() {
    const y = els.yearInput.value;
    const m = els.monthSelect.value;
    if (y && m) {
        store.setMonth(`${y}-${m}`);
    }
}

function changeMonth(offset) {
    let year = parseInt(els.yearInput.value);
    let monthIdx = parseInt(els.monthSelect.value) - 1; // 0-11

    const date = new Date(year, monthIdx + offset, 1);

    // Update Inputs
    els.yearInput.value = date.getFullYear();
    els.monthSelect.value = String(date.getMonth() + 1).padStart(2, '0');

    updateStoreDate();
}

function setupEventListeners() {
    // --- Sidebar Logic ---
    const openSidebar = () => {
        if (els.mobileSidebar) els.mobileSidebar.classList.add('open');
        if (els.mobileSidebarOverlay) els.mobileSidebarOverlay.classList.add('open');
    };

    const closeSidebar = () => {
        if (els.mobileSidebar) els.mobileSidebar.classList.remove('open');
        if (els.mobileSidebarOverlay) els.mobileSidebarOverlay.classList.remove('open');
    };

    if (els.mobileMenuBtn) els.mobileMenuBtn.addEventListener('click', openSidebar);
    if (els.closeSidebarBtn) els.closeSidebarBtn.addEventListener('click', closeSidebar);
    if (els.mobileSidebarOverlay) els.mobileSidebarOverlay.addEventListener('click', closeSidebar);

    // Sidebar Actions
    if (els.sidebarReportBtn) {
        els.sidebarReportBtn.addEventListener('click', () => {
            closeSidebar();
            if (els.openReportModalBtn) els.openReportModalBtn.click();
        });
    }

    if (els.sidebarSettingsBtn) {
        els.sidebarSettingsBtn.addEventListener('click', () => {
            closeSidebar();
            if (els.settingsBtn) els.settingsBtn.click();
        });
    }

    if (els.sidebarLogoutBtn) {
        els.sidebarLogoutBtn.addEventListener('click', () => {
            closeSidebar();
            if (els.logoutBtn) els.logoutBtn.click();
        });
    }

    // --- Tabs ---
    // --- Navigation ---
    const updateNav = (view) => {
        // Reset all
        [els.navDashboard, els.navMoneyIn, els.navMoneyOut].forEach(b => b.classList.remove('active'));
        [els.dashboardView, els.incomingView, els.outgoingView].forEach(v => v.style.display = 'none');

        // Activate specific
        if (view === 'dashboard') {
            els.navDashboard.classList.add('active');
            els.dashboardView.style.display = 'block';
        } else if (view === 'money-in') {
            els.navMoneyIn.classList.add('active');
            els.incomingView.style.display = 'block';
        } else if (view === 'money-out') {
            els.navMoneyOut.classList.add('active');
            els.outgoingView.style.display = 'block';
        }
    };

    els.navDashboard.addEventListener('click', () => updateNav('dashboard'));
    els.navMoneyIn.addEventListener('click', () => updateNav('money-in'));
    els.navMoneyOut.addEventListener('click', () => updateNav('money-out'));

    // --- Login ---
    els.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = els.loginPassword.value;
        if (pwd === 'admin123#') {
            sessionStorage.setItem('isAuth', 'true');
            checkLoginStatus();
            showToast('Access Granted', 'success');
        } else {
            showToast('Invalid Password', 'error');
            els.loginPassword.value = '';
        }
    });

    els.logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            sessionStorage.removeItem('isAuth');
            window.location.reload();
        }
    });

    // --- Secret Reset Logic ---
    let secretClickCount = 0;
    els.settingsHeaderTitle.addEventListener('click', () => {
        secretClickCount++;
        if (secretClickCount === 5) {
            els.clearDataBtn.style.display = 'block';
            els.openingBalanceSection.style.display = 'block';
            showToast('Master Controls Unlocked', 'info');
        }
    });

    els.clearDataBtn.addEventListener('click', async () => {
        const confirmCode = prompt('⚠ EXTREME WARNING: This will permanently delete ALL Cloud data.\nTo proceed, type the Master Key (RESET-99):');

        if (confirmCode === 'RESET-99') {
            const secondConfirm = confirm('THIS ACTION CANNOT BE UNDONE. Are you 100% sure?');
            if (secondConfirm) {
                try {
                    showToast('Wiping database...', 'info');
                    await store.clearAllData();
                    showToast('Database wiped successfully', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                } catch (err) {
                    showToast('Reset failed: ' + err.message, 'error');
                }
            }
        } else if (confirmCode !== null) {
            showToast('Incorrect Master Key', 'error');
        }
    });
    els.monthSelect.addEventListener('change', updateStoreDate);
    els.yearInput.addEventListener('change', updateStoreDate);

    // Smart Nav Arrows
    els.prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    els.nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // Mobile Sorting (Chips)
    document.querySelectorAll('.sort-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            // Remove active from all
            document.querySelectorAll('.sort-chip').forEach(c => c.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');
            // Trigger Sort
            store.setSort(e.target.dataset.sort);
        });
    });

    // --- View Switching ---
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            store.setSort(th.dataset.sort);
        });
    });

    // --- Modals ---
    // Incoming
    els.openIncModalBtn.addEventListener('click', () => els.incomingModal.classList.add('open'));
    els.closeIncModal.addEventListener('click', () => els.incomingModal.classList.remove('open'));
    els.incomingModal.addEventListener('click', (e) => {
        if (e.target === els.incomingModal) els.incomingModal.classList.remove('open');
    });

    // Outgoing
    els.openOutModalBtn.addEventListener('click', () => {
        els.outgoingModal.classList.add('open');
        // Auto-fill Rate with Average Buy Rate for perfect maintenance
        const avgRate = store.state.liquidity.averageBuyRate || 0;
        if (avgRate > 0) {
            els.outRate.value = avgRate.toFixed(2);
        }
    });

    if (els.applyAvgRateBtn) {
        els.applyAvgRateBtn.addEventListener('click', () => {
            const avgRate = store.state.liquidity.averageBuyRate || 0;
            if (avgRate > 0) {
                els.outRate.value = avgRate.toFixed(2);
                showToast('Average Buy Rate Applied', 'info');
            }
        });
    }
    els.closeOutModal.addEventListener('click', () => els.outgoingModal.classList.remove('open'));

    // History listeners
    if (els.openHistoryModalBtn) {
        els.openHistoryModalBtn.addEventListener('click', () => {
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value);
            els.historyModal.classList.add('open');
        });
    }

    if (els.sidebarHistoryBtn) {
        els.sidebarHistoryBtn.addEventListener('click', () => {
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value);
            els.historyModal.classList.add('open');
            els.mobileSidebar.classList.remove('open');
            els.mobileSidebarOverlay.classList.remove('open');
        });
    }

    if (els.closeHistoryModal) {
        els.closeHistoryModal.addEventListener('click', () => {
            els.historyModal.classList.remove('open');
        });
    }

    if (els.histSearch) {
        els.histSearch.addEventListener('input', debounce(() => {
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value, els.histMonth.value, els.histYear.value);
        }, 300));
    }

    if (els.histMonth) {
        els.histMonth.addEventListener('change', () => {
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value, els.histMonth.value, els.histYear.value);
        });
    }

    if (els.histYear) {
        els.histYear.addEventListener('change', () => {
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value, els.histMonth.value, els.histYear.value);
        });
    }

    if (els.downloadBankStatementBtn) {
        els.downloadBankStatementBtn.addEventListener('click', () => {
            downloadBankStatement(store.state.transactions, store.state.beneficiaries, els.histMonth.value, els.histYear.value);
        });
    }

    // Settings
    els.settingsBtn.addEventListener('click', () => {
        const { openingBalanceUSD, openingBalanceBDT } = store.state.settings;
        els.setOpeningUSD.value = openingBalanceUSD || 0;
        els.setOpeningBDT.value = openingBalanceBDT || 0;
        els.settingsModal.classList.add('open');
    });
    els.closeSettingsModal.addEventListener('click', () => els.settingsModal.classList.remove('open'));

    // Sources
    els.closeSourcesModal.addEventListener('click', () => els.sourcesModal.classList.remove('open'));

    // Beneficiary List
    els.closeBenListModal.addEventListener('click', () => els.beneficiariesListModal.classList.remove('open'));

    // Beneficiary Edit
    els.closeBenModal.addEventListener('click', () => els.beneficiaryModal.classList.remove('open'));

    // Report
    els.closeReportModal.addEventListener('click', () => els.reportModal.classList.remove('open'));

    // Backup
    els.downloadBackupBtn.addEventListener('click', downloadFullBackup);

    // Report Download
    els.downloadReportBtn.addEventListener('click', () => {
        exportCEOReportCSV();
    });

    // Click Outside to Close for all modals
    [els.incomingModal, els.outgoingModal, els.settingsModal, els.sourcesModal, els.beneficiariesListModal, els.beneficiaryModal, els.reportModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('open');
            });
        }
    });

    // Settings Save
    els.settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        store.saveSettings({
            ...store.state.settings,
            openingBalanceUSD: parseFloat(els.setOpeningUSD.value),
            openingBalanceBDT: parseFloat(els.setOpeningBDT.value)
        });
        els.settingsModal.classList.remove('open');
    });

    // Clear Data
    if (els.clearDataBtn) {
        els.clearDataBtn.addEventListener('click', () => {
            if (confirm('⚠ Are you sure you want to DELETE ALL TRANSACTIONS?\n\nThis action cannot be undone.')) {
                store.clearAllData();
                els.settingsModal.classList.remove('open');
            }
        });
    }

    // --- Sources Management ---
    els.manageSourcesBtn.addEventListener('click', () => {
        renderSourcesList(store.state.sources);
        els.sourcesModal.classList.add('open');
    });

    els.addSourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(els.addSourceForm);
        store.addSource({ name: formData.get('name') });
        els.addSourceForm.reset();
    });

    els.sourcesList.addEventListener('click', (e) => {
        const btn = e.target.closest('.icon-btn');
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;

        if (btn.classList.contains('delete-btn')) {
            if (confirm('Delete this payer?')) store.deleteSource(id);
        } else if (btn.classList.contains('edit-btn')) {
            const currentName = store.state.sources.find(s => s.id === id)?.name;
            const newName = prompt('Enter new name:', currentName);
            if (newName && newName !== currentName) {
                store.updateSource(id, { name: newName });
            }
        }
    });

    // --- Beneficiaries Management ---
    els.manageBeneficiariesBtn.addEventListener('click', () => {
        renderBeneficiariesList(store.state.beneficiaries);
        els.beneficiariesListModal.classList.add('open');
    });

    els.openAddBenModalBtn.addEventListener('click', () => {
        openBeneficiaryModal(); // Add mode
    });

    els.benForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(els.benForm);
        const id = formData.get('id');
        const benData = {
            nickname: formData.get('nickname'),
            accountName: formData.get('accountName'),
            bankName: formData.get('bankName'),
            accountNo: formData.get('accountNo'),
            branch: formData.get('branch'),
            // Maintain compatibility with old data structure if needed, or migration
            name: formData.get('nickname') // fallback
        };

        if (id) {
            store.updateBeneficiary(id, benData);
        } else {
            store.addBeneficiary(benData);
        }
        els.beneficiaryModal.classList.remove('open');
        // If opened from list, re-render list happens via store subscription
    });

    els.beneficiariesTableBody.addEventListener('click', (e) => {
        // Handle Edit by clicking Name
        const nameLink = e.target.closest('.receiver-link-action');
        if (nameLink) {
            const id = nameLink.dataset.id;
            const ben = store.state.beneficiaries.find(b => b.id === id);
            openBeneficiaryModal(ben);
            return;
        }

        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (editBtn) {
            const id = editBtn.dataset.id;
            const ben = store.state.beneficiaries.find(b => b.id === id);
            openBeneficiaryModal(ben);
        } else if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (confirm('Delete this receiver?')) store.deleteBeneficiary(id);
        }
    });

    // --- Report Download ---
    els.downloadReportPdfBtn.addEventListener('click', () => {
        window.print();
    });

    els.openReportModalBtn.addEventListener('click', () => {
        generateMonthlyReport();
        els.reportModal.classList.add('open');
    });

    // --- Forms ---

    // Smart Calculation Reuse
    setupSmartCalc(els.incUSD, els.incBDT, els.incRate);
    setupSmartCalc(els.outUSD, els.outBDT, els.outRate);

    // Incoming Form Submit
    els.incomingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const id = els.incId.value;
            const txData = {
                date: els.incDate.value,
                type: 'incoming',
                subType: els.incType.value,
                source: els.incSource.value,
                rate: parseFloat(els.incRate.value) || 0,
                amountUSD: parseFloat(els.incUSD.value) || 0,
                amountBDT: parseFloat(els.incBDT.value) || 0,
            };

            // INSTANT UI FEEDBACK (Close modal immediately)
            els.incomingModal.classList.remove('open');
            els.incomingForm.reset();
            els.incId.value = ''; // Reset ID
            els.incDate.value = new Date().toISOString().split('T')[0];

            if (id) {
                await store.updateTransaction(id, txData);
                showToast('Transaction Updated Successfully', 'success');
            } else {
                txData.status = 'received';
                await store.addTransaction(txData);
                showToast('Money In Record Added', 'success');
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            showToast('Failed to save record: ' + error.message, 'error');
        }
    });

    // Outgoing Form Submit
    els.outgoingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const id = els.outId.value;
            const txData = {
                date: els.outDate.value,
                type: 'outgoing',
                beneficiaryId: els.outBeneficiary.value,
                rate: parseFloat(els.outRate.value) || 0,
                amountUSD: parseFloat(els.outUSD.value) || 0,
                amountBDT: parseFloat(els.outBDT.value) || 0,
            };

            // INSTANT UI FEEDBACK (Close modal immediately)
            els.outgoingModal.classList.remove('open');
            els.outgoingForm.reset();
            els.outId.value = ''; // Reset ID
            els.outDate.value = new Date().toISOString().split('T')[0];
            els.bankPreview.style.display = 'none';

            if (id) {
                await store.updateTransaction(id, txData);
                showToast('Transaction Updated Successfully', 'success');
            } else {
                txData.status = 'pending';
                await store.addTransaction(txData);
                showToast('Money Out Record Added', 'success');
            }
        } catch (error) {
            console.error('Error saving outgoing:', error);
            showToast('Failed to save record: ' + error.message, 'error');
        }
    });



    function editTransaction(id) {
        const tx = store.state.transactions.find(t => t.id == id);
        if (!tx) return;

        // Prevent editing if Paid (Outgoing only per request, or both? User said "before paid mark", implies outgoing flow)
        if (tx.type === 'outgoing' && tx.status === 'paid') {
            showToast('Paid records are locked and cannot be edited.', 'error');
            return;
        }

        if (tx.type === 'incoming') {
            els.incomingModal.classList.add('open');
            els.incId.value = tx.id; // SET ID
            els.incDate.value = tx.date;
            els.incType.value = tx.subType;
            els.incSource.value = tx.source;
            els.incRate.value = tx.rate;
            els.incUSD.value = tx.amountUSD;
            els.incBDT.value = tx.amountBDT;
        } else {
            els.outgoingModal.classList.add('open');
            els.outId.value = tx.id; // SET ID
            els.outDate.value = tx.date;
            els.outBeneficiary.value = tx.beneficiaryId;
            els.outBeneficiary.dispatchEvent(new Event('change')); // Trigger bank preview
            els.outRate.value = tx.rate;
            els.outUSD.value = tx.amountUSD;
            els.outBDT.value = tx.amountBDT;
        }
    }

    // Source Auto-Fill Rate
    els.incSource.addEventListener('change', () => {
        const source = els.incSource.value;
        if (!source) return;
        const lastTx = store.state.transactions.find(t => t.source === source && t.rate);
        if (lastTx) {
            els.incRate.value = lastTx.rate;
            if (els.incUSD.value) els.incRate.dispatchEvent(new Event('input'));
        }
    });

    // Beneficiary Selection
    els.outBeneficiary.addEventListener('change', () => {
        const benId = els.outBeneficiary.value;
        const ben = store.state.beneficiaries.find(b => b.id === benId);

        if (ben) {
            els.prevDisplayName.textContent = ben.nickname || ben.name;
            els.prevBankName.textContent = ben.bankName || 'N/A';
            els.prevAccNo.textContent = `Acc: ${ben.accountNo || 'N/A'}`;
            els.bankPreview.style.display = 'block';
        } else {
            els.bankPreview.style.display = 'none';
        }

        // Auto-fill Rate from last INCOMING transaction (Fund Receive) priority
        // as per "rate same as fund receive" request
        const lastIncomingTx = store.state.transactions.find(t => t.type === 'incoming' && t.rate > 0);

        if (lastIncomingTx) {
            els.outRate.value = lastIncomingTx.rate;
            if (els.outUSD.value) els.outRate.dispatchEvent(new Event('input'));
        } else if (benId) {
            // Fallback: Last tx for this beneficiary
            const lastTx = store.state.transactions.find(t => t.beneficiaryId === benId && t.rate);
            if (lastTx) {
                els.outRate.value = lastTx.rate;
                if (els.outUSD.value) els.outRate.dispatchEvent(new Event('input'));
            }
        }
    });

    // --- Table Actions ---
    els.incTableBody.addEventListener('click', async (e) => {
        // 1. Copy Amount
        if (e.target.closest('.copy-amount-btn')) {
            const btn = e.target.closest('.copy-amount-btn');
            copyToClipboard(btn.dataset.amount);
            return;
        }

        const cloneBtn = e.target.closest('.clone-btn');
        const editBtn = e.target.closest('.edit-tx-btn');

        if (cloneBtn) {
            cloneTransaction(cloneBtn.dataset.id);
        } else if (editBtn) {
            editTransaction(editBtn.dataset.id);
        }
    });

    els.outTableBody.addEventListener('click', async (e) => {
        // 1. Copy Amount
        if (e.target.closest('.copy-amount-btn')) {
            const btn = e.target.closest('.copy-amount-btn');
            copyToClipboard(btn.dataset.amount);
            return;
        }

        // 2. View Receiver
        if (e.target.closest('.receiver-link')) {
            const id = e.target.closest('.receiver-link').dataset.id;
            const ben = store.state.beneficiaries.find(b => b.id == id);
            if (ben) {
                openBeneficiaryModal(ben);
            }
            return;
        }

        // 3. Mark Paid / Hold / Resume / Clone / Edit
        const payBtn = e.target.closest('.pay-btn');
        const holdBtn = e.target.closest('.hold-btn');
        const resumeBtn = e.target.closest('.resume-btn');
        const editTxBtn = e.target.closest('.edit-tx-btn');
        const cloneBtn = e.target.closest('.clone-btn');

        if (payBtn) {
            const id = payBtn.dataset.id;
            if (confirm('Mark this transaction as PAID?')) {
                await store.markAsPaid(id);
                showToast('Transaction marked as Paid', 'success');
            }
        } else if (holdBtn) {
            const id = holdBtn.dataset.id;
            await store.updateTransaction(id, { status: 'hold' });
            showToast('Transaction put on Hold', 'success');
        } else if (resumeBtn) {
            const id = resumeBtn.dataset.id;
            await store.updateTransaction(id, { status: 'pending' });
            showToast('Transaction Resumed', 'success');
        } else if (editTxBtn) {
            editTransaction(editTxBtn.dataset.id);
        } else if (cloneBtn) {
            cloneTransaction(cloneBtn.dataset.id);
        }
    });

    // Logout
    // Logout logic removed for public access

    // Search (Debounced)
    const debouncedRender = debounce(() => renderTables(store.state.transactions, store.state.beneficiaries, store.state.selectedMonth, store.state.sortConfig), 300);
    els.incSearch.addEventListener('input', debouncedRender);
    els.outSearch.addEventListener('input', debouncedRender);

    // Export
    els.exportIncBtn.addEventListener('click', () => exportCSV('incoming'));
    els.exportOutBtn.addEventListener('click', () => exportCSV('outgoing'));
}

function setupSmartCalc(usdInput, bdtInput, rateInput) {
    const calculate = (source) => {
        const usd = parseFloat(usdInput.value);
        const bdt = parseFloat(bdtInput.value);
        const rate = parseFloat(rateInput.value);

        if (source === 'usd' && !isNaN(usd) && !isNaN(rate)) {
            bdtInput.value = (usd * rate).toFixed(2);
        } else if (source === 'bdt') {
            if (!isNaN(bdt) && !isNaN(usd) && usd !== 0) {
                rateInput.value = (bdt / usd).toFixed(2);
            } else if (!isNaN(bdt) && !isNaN(rate) && rate !== 0) {
                usdInput.value = (bdt / rate).toFixed(2);
            }
        } else if (source === 'rate' && !isNaN(rate) && !isNaN(usd)) {
            bdtInput.value = (usd * rate).toFixed(2);
        }
    };

    usdInput.addEventListener('input', () => calculate('usd'));
    bdtInput.addEventListener('input', () => calculate('bdt'));
    rateInput.addEventListener('input', () => calculate('rate'));
}



function render(state) {
    // Render Liquidity & Monthly Stats
    const {
        openingUSD, openingBDT,
        monthReceiptsUSD, monthReceiptsBDT,
        monthDisbursedUSD, monthDisbursedBDT,
        closingUSD, closingBDT
    } = state.liquidity;

    // Display Closing Balance (Carry    // Updates
    els.liqUSD.textContent = fmtUSD(state.liquidity.closingUSD);
    els.liqBDT.textContent = fmtBDT(state.liquidity.closingBDT);
    if (els.avgBuyRate) els.avgBuyRate.textContent = (state.liquidity.averageBuyRate || 0).toFixed(2);
    if (els.hintRateVal) els.hintRateVal.textContent = (state.liquidity.averageBuyRate || 0).toFixed(2);

    // Update Mini Stats in Tabs (Both Money In and Money Out)
    if (els.outLiqUSD) els.outLiqUSD.textContent = fmtUSD(state.liquidity.closingUSD);
    if (els.outLiqBDT) els.outLiqBDT.textContent = fmtBDT(state.liquidity.closingBDT);
    if (els.incLiqUSD) els.incLiqUSD.textContent = fmtUSD(state.liquidity.closingUSD);
    if (els.incLiqBDT) els.incLiqBDT.textContent = fmtBDT(state.liquidity.closingBDT);

    els.monthReceipts.textContent = fmtUSD(state.liquidity.monthReceiptsUSD);
    els.monthReceiptsBDT.textContent = fmtBDT(monthReceiptsBDT);

    els.monthDisbursements.textContent = fmtUSD(monthDisbursedUSD);
    els.monthDisbursementsBDT.textContent = fmtBDT(monthDisbursedBDT);

    // Render Payment Overview Stats
    const summary = calculatePaymentSummary(state.transactions, state.beneficiaries, state.selectedMonth);
    els.statsPendingCount.textContent = summary.pendingCount;
    els.statsPendingAmount.textContent = fmtBDT(summary.pendingAmount);
    els.statsPaidCount.textContent = summary.paidCount;
    els.statsPaidAmount.textContent = fmtBDT(summary.paidAmount);
    els.statsReceiversCount.textContent = state.beneficiaries.length;

    // Update Payers Dropdown
    const currentSource = els.incSource.value;
    els.incSource.innerHTML = '';

    // Add default option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = "";
    defaultOpt.textContent = "Select Payer";
    els.incSource.appendChild(defaultOpt);

    state.sources.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        els.incSource.appendChild(opt);
    });
    if (currentSource) els.incSource.value = currentSource;

    // Update Receivers Dropdown
    const currentBenVal = els.outBeneficiary.value;
    els.outBeneficiary.innerHTML = '';
    const defaultBenOpt = document.createElement('option');
    defaultBenOpt.value = "";
    defaultBenOpt.textContent = "Select Receiver";
    els.outBeneficiary.appendChild(defaultBenOpt);

    state.beneficiaries.forEach(ben => {
        const opt = document.createElement('option');
        opt.value = ben.id;
        opt.textContent = ben.nickname || ben.name;
        els.outBeneficiary.appendChild(opt);
    });
    if (currentBenVal) els.outBeneficiary.value = currentBenVal;

    // Render Tables (Filtered by Month & Sorted)
    renderTables(state.transactions, state.beneficiaries, state.selectedMonth, state.sortConfig);

    renderProjectedCashflow(state.transactions, state.liquidity, state.settings);


    // Update Modals if open
    if (els.sourcesModal.classList.contains('open')) renderSourcesList(state.sources);
    if (els.beneficiariesListModal.classList.contains('open')) renderBeneficiariesList(state.beneficiaries);
    if (els.reportModal.classList.contains('open')) generateMonthlyReport();
}

function renderSourcesList(sources) {
    els.sourcesList.innerHTML = '';
    sources.forEach(s => {
        const item = document.createElement('div');
        item.className = 'list-item';

        const span = document.createElement('span');
        span.textContent = s.name;

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn edit-btn';
        editBtn.dataset.id = s.id;
        editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn delete-btn';
        deleteBtn.dataset.id = s.id;
        deleteBtn.style.color = 'var(--color-danger)';
        deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>';

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        item.appendChild(span);
        item.appendChild(actions);
        els.sourcesList.appendChild(item);
    });
}

function renderBeneficiariesList(beneficiaries) {
    els.beneficiariesTableBody.innerHTML = '';

    if (beneficiaries.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.style.textAlign = 'center';
        td.style.color = 'var(--text-muted)';
        td.style.padding = '2rem';
        td.textContent = 'No receivers found. Add one to get started.';
        tr.appendChild(td);
        els.beneficiariesTableBody.appendChild(tr);
    } else {
        beneficiaries.forEach(b => {
            const tr = document.createElement('tr');

            // Name Column
            const tdName = document.createElement('td');
            tdName.setAttribute('data-label', 'Nickname');
            tdName.style.fontWeight = '500';

            const nameLink = document.createElement('span');
            nameLink.className = 'receiver-link-action';
            nameLink.dataset.id = b.id;
            nameLink.style.cursor = 'pointer';
            nameLink.style.color = 'var(--color-primary)';
            nameLink.style.textDecoration = 'underline';
            nameLink.style.display = 'flex';
            nameLink.style.alignItems = 'center';
            nameLink.style.gap = '0.5rem';
            nameLink.textContent = b.nickname || b.name;

            // Icon inside name link
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("fill", "none");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.setAttribute("stroke-width", "1.5");
            svg.setAttribute("stroke", "currentColor");
            svg.style.width = "14px";
            svg.style.height = "14px";
            svg.style.opacity = "0.7";
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />';
            nameLink.appendChild(svg);
            tdName.appendChild(nameLink);

            // Account Name
            const tdAccName = document.createElement('td');
            tdAccName.setAttribute('data-label', 'Account Name');
            tdAccName.className = 'text-sub';
            tdAccName.textContent = b.accountName || '-';

            // Bank Name
            const tdBank = document.createElement('td');
            tdBank.setAttribute('data-label', 'Bank');
            tdBank.innerHTML = `<div style="font-weight: 500;">${b.bankName || '-'}</div><div class="text-sub" style="font-size: 0.8rem;">${b.branch || ''}</div>`;

            // Account No
            const tdAccNo = document.createElement('td');
            tdAccNo.setAttribute('data-label', 'Account No');
            tdAccNo.style.fontFamily = 'monospace';
            tdAccNo.textContent = b.accountNo || '-';

            // Actions
            const tdActions = document.createElement('td');
            tdActions.className = 'actions-cell';

            const btnEdit = document.createElement('button');
            btnEdit.className = 'icon-btn edit-btn';
            btnEdit.dataset.id = b.id;
            btnEdit.title = 'Edit';
            btnEdit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>';

            const btnDel = document.createElement('button');
            btnDel.className = 'icon-btn delete-btn';
            btnDel.dataset.id = b.id;
            btnDel.title = 'Delete';
            btnDel.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>';
            btnDel.style.color = 'var(--color-danger)';
            btnDel.style.background = 'none';
            btnDel.style.border = 'none';
            btnDel.style.padding = '0';
            btnDel.style.cursor = 'pointer';
            btnDel.style.display = 'flex';
            btnDel.style.alignItems = 'center';

            tdActions.appendChild(btnEdit);
            tdActions.appendChild(btnDel);

            tr.appendChild(tdName);
            tr.appendChild(tdAccName);
            tr.appendChild(tdBank);
            tr.appendChild(tdAccNo);
            tr.appendChild(tdActions);

            els.beneficiariesTableBody.appendChild(tr);
        });
    }
}

// --- Restored/Reconstructed Functions ---

function calculatePaymentSummary(transactions, beneficiaries, selectedMonth) {
    const monthlyTxs = transactions.filter(t => t.date.startsWith(selectedMonth) && t.type === 'outgoing');

    let pendingCount = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    let paidAmount = 0;

    monthlyTxs.forEach(tx => {
        if (tx.status === 'paid') {
            paidCount++;
            paidAmount += (tx.amountBDT || 0);
        } else if (tx.status === 'pending') {
            pendingCount++;
            pendingAmount += (tx.amountBDT || 0);
        }
    });

    return { pendingCount, pendingAmount, paidCount, paidAmount };
}

function cloneTransaction(id) {
    const tx = store.state.transactions.find(t => t.id === id);
    if (!tx) return;

    if (tx.type === 'incoming') {
        els.incDate.value = new Date().toISOString().split('T')[0];
        els.incType.value = tx.subType;
        els.incSource.value = tx.source;
        els.incRate.value = tx.rate;
        els.incUSD.value = tx.amountUSD;
        els.incBDT.value = tx.amountBDT;
        els.incId.value = '';
        els.incomingModal.classList.add('open');
    } else {
        els.outDate.value = new Date().toISOString().split('T')[0];
        els.outBeneficiary.value = tx.beneficiaryId;
        els.outRate.value = tx.rate;
        els.outUSD.value = tx.amountUSD;
        els.outBDT.value = tx.amountBDT;
        els.outId.value = '';
        els.outgoingModal.classList.add('open');
    }
    showToast('Transaction Cloned. Review and Save.', 'success');
}

function renderTables(transactions, beneficiaries, selectedMonth, sortConfig) {
    // 1. Month Filter
    const monthlyTxs = transactions.filter(t => t.date.startsWith(selectedMonth));

    // 2. UI: Update Header Sort Indicators
    const headers = document.querySelectorAll('th.sortable');
    headers.forEach(h => {
        h.classList.remove('active-asc', 'active-desc');
        if (h.dataset.sort === sortConfig.field) {
            h.classList.add(sortConfig.direction === 'asc' ? 'active-asc' : 'active-desc');
        }
    });

    // 3. Search Filter
    const incSearchQuery = els.incSearch.value.toLowerCase().trim();
    const outSearchQuery = els.outSearch.value.toLowerCase().trim();

    // 4. Sorting Logic
    const sortedTxs = [...monthlyTxs].sort((a, b) => {
        const field = sortConfig.field;
        const dir = sortConfig.direction === 'asc' ? 1 : -1;

        let valA, valB;

        if (field === 'beneficiaryId') {
            const benA = beneficiaries.find(ben => ben.id === a.beneficiaryId);
            const benB = beneficiaries.find(ben => ben.id === b.beneficiaryId);
            valA = (benA ? benA.nickname || benA.name : '').toLowerCase();
            valB = (benB ? benB.nickname || benB.name : '').toLowerCase();
        } else if (field === 'amountUSD' || field === 'amountBDT' || field === 'rate') {
            valA = parseFloat(a[field] || 0);
            valB = parseFloat(b[field] || 0);
        } else {
            valA = (a[field] || '').toString().toLowerCase();
            valB = (b[field] || '').toString().toLowerCase();
        }

        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
    });

    // Incoming
    let incTxs = sortedTxs.filter(t => t.type === 'incoming');
    if (incSearchQuery) {
        incTxs = incTxs.filter(t =>
            t.source.toLowerCase().includes(incSearchQuery) ||
            t.amountBDT.toString().includes(incSearchQuery) ||
            t.amountUSD.toString().includes(incSearchQuery) ||
            t.date.includes(incSearchQuery)
        );
    }

    els.incTableBody.innerHTML = '';
    if (incTxs.length === 0) {
        els.incTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-muted">${incSearchQuery ? 'No matching results' : 'No transactions found for this month.'}</td></tr>`;
    } else {
        incTxs.forEach(tx => {
            const tr = document.createElement('tr');
            tr.className = `status-${tx.status || 'received'} type-${tx.subType}`;
            tr.innerHTML = `
                <td data-label="Date">${tx.date}</td>
                <td data-label="Payer">${tx.source}</td>
                <td data-label="Action"><span class="badge ${tx.subType === 'receive' ? 'bg-green-light text-green' : 'bg-orange-light text-orange'}">${tx.subType === 'receive' ? 'Receive' : 'Return'}</span></td>
                <td data-label="Amount (USD)" class="amount-column">${fmtUSD(tx.amountUSD)}</td>
                <td data-label="Amount (BDT)" class="amount-column">
                    <div class="amount-wrapper">
                        <span>${fmtBDT(tx.amountBDT)}</span>
                        <button class="icon-btn copy-amount-btn" data-amount="${tx.amountBDT}" title="Copy BDT">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7.5V6a2 2 0 012-2h9a2 2 0 012 2v9a2 2 0 01-2 2h-1.5M4 10.5V18a2 2 0 002 2h9a2 2 0 002-2v-7.5a2 2 0 00-2-2H6a2 2 0 00-2 2z" /></svg>
                        </button>
                    </div>
                </td>
                <td data-label="Rate" class="text-right">${tx.rate}</td>
                <td data-label="Status"><span class="badge ${tx.status === 'hold' ? 'bg-orange-light text-orange' : 'bg-green-light text-green'}">${tx.status || 'received'}</span></td>
                <td class="actions-cell">
                   <button class="icon-btn edit-tx-btn" data-id="${tx.id}" title="Edit">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                   </button>
                   <button class="icon-btn clone-btn" data-id="${tx.id}" title="Clone">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6" /></svg>
                   </button>
                </td>
            `;
            els.incTableBody.appendChild(tr);
        });
    }

    // Outgoing
    let outTxs = sortedTxs.filter(t => t.type === 'outgoing');
    if (outSearchQuery) {
        outTxs = outTxs.filter(t => {
            const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
            const benName = ben ? (ben.nickname || ben.name).toLowerCase() : 'unknown';
            return (
                benName.includes(outSearchQuery) ||
                t.amountBDT.toString().includes(outSearchQuery) ||
                t.amountUSD.toString().includes(outSearchQuery) ||
                t.date.includes(outSearchQuery) ||
                t.status.toLowerCase().includes(outSearchQuery)
            );
        });
    }

    els.outTableBody.innerHTML = '';
    if (outTxs.length === 0) {
        els.outTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-muted">${outSearchQuery ? 'No matching results' : 'No outgoing transactions found.'}</td></tr>`;
    } else {
        outTxs.forEach(tx => {
            const ben = beneficiaries.find(b => b.id === tx.beneficiaryId);
            const benName = ben ? ben.nickname || ben.name : 'Unknown';
            const statusClass = tx.status === 'paid' ? 'bg-green-light text-green' : (tx.status === 'hold' ? 'bg-orange-light text-orange' : 'bg-gray-light');

            const tr = document.createElement('tr');
            tr.className = `status-${tx.status}`;
            tr.innerHTML = `
                <td data-label="Date">${tx.date}</td>
                <td data-label="Receiver">
                    <span class="receiver-link" data-id="${tx.beneficiaryId}" style="cursor:pointer; text-decoration:underline;">${benName}</span>
                </td>
                <td data-label="Amount (USD)" class="amount-column">${fmtUSD(tx.amountUSD)}</td>
                <td data-label="Amount (BDT)" class="amount-column">
                    <div class="amount-wrapper">
                        <span>${fmtBDT(tx.amountBDT)}</span>
                        <button class="icon-btn copy-amount-btn" data-amount="${tx.amountBDT}" title="Copy BDT">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7.5V6a2 2 0 012-2h9a2 2 0 012 2v9a2 2 0 01-2 2h-1.5M4 10.5V18a2 2 0 002 2h9a2 2 0 002-2v-7.5a2 2 0 00-2-2H6a2 2 0 00-2 2z" /></svg>
                        </button>
                    </div>
                </td>
                <td data-label="Status"><span class="badge ${statusClass}">${tx.status}</span></td>
                <td class="actions-cell">
                    ${tx.status === 'pending' ? `<button class="icon-btn pay-btn" data-id="${tx.id}" title="Mark Paid">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    </button>` : ''}
                    ${tx.status === 'pending' ? `<button class="icon-btn hold-btn" data-id="${tx.id}" title="Hold">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
                    </button>` : ''}
                    ${tx.status === 'hold' ? `<button class="icon-btn resume-btn" data-id="${tx.id}" title="Resume">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" /></svg>
                    </button>` : ''}
                    <button class="icon-btn edit-tx-btn" data-id="${tx.id}" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                    </button>
                    <button class="icon-btn clone-btn" data-id="${tx.id}" title="Clone">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6" /></svg>
                    </button>
                </td>
            `;
            els.outTableBody.appendChild(tr);
        });
    }
}

function generateMonthlyReport() {
    const { transactions, liquidity, selectedMonth, settings, beneficiaries } = store.state;

    // 1. Header & Dates
    const [y, m] = selectedMonth.split('-');
    const dateOpts = { year: 'numeric', month: 'long' };
    const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', dateOpts);

    els.repMonth.textContent = monthName;
    els.repGenDate.textContent = new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });

    // 2. Summary Financials
    els.repOpening.textContent = fmtBDT(liquidity.openingBDT);
    els.repOpeningUSD.textContent = fmtUSD(liquidity.openingUSD);

    els.repTotalIn.textContent = fmtBDT(liquidity.monthReceiptsBDT);
    els.repTotalInUSD.textContent = fmtUSD(liquidity.monthReceiptsUSD);

    els.repTotalOut.textContent = fmtBDT(liquidity.monthDisbursedBDT);
    els.repTotalOutUSD.textContent = fmtUSD(liquidity.monthDisbursedUSD);

    els.repClosing.textContent = fmtBDT(liquidity.closingBDT);
    els.repClosingUSD.textContent = fmtUSD(liquidity.closingUSD);

    // Calculate Monthly Liabilities (Pending & Hold)
    const monthlyOutTxs = transactions.filter(t => t.date.startsWith(selectedMonth) && t.type === 'outgoing');
    let monthlyLiabilitiesBDT = 0;
    let monthlyLiabilitiesUSD = 0;
    monthlyOutTxs.forEach(t => {
        if (t.status === 'pending') {
            monthlyLiabilitiesBDT += parseFloat(t.amountBDT || 0);
            monthlyLiabilitiesUSD += parseFloat(t.amountUSD || 0);
        }
    });

    const netFlowBDT = liquidity.monthReceiptsBDT - liquidity.monthDisbursedBDT;
    const netFlowUSD = liquidity.monthReceiptsUSD - liquidity.monthDisbursedUSD;

    // Projected performance for the month
    const projectedNetFlowBDT = netFlowBDT - monthlyLiabilitiesBDT;

    els.repNetFlow.textContent = fmtBDT(netFlowBDT);
    els.repNetFlowUSD.textContent = fmtUSD(netFlowUSD);

    // 3. Status Badge logic (Factoring in Hold/Pending as liabilities)
    const isSurplus = projectedNetFlowBDT >= 0;
    const badge = document.getElementById('repStatusBadge');
    if (badge) {
        badge.textContent = isSurplus ? 'SURPLUS' : 'SHORTAGE';
        badge.className = `status-badge-v2 ${isSurplus ? 'surplus' : 'shortage'}`;
    }

    if (els.repClosingCard) {
        els.repClosingCard.classList.remove('success', 'danger');
        els.repClosingCard.classList.add(isSurplus ? 'success' : 'danger');
    }

    // 4. Strategic Insights Generation
    let insightHTML = '';
    if (isSurplus) {
        insightHTML = `Zikrullah TV LLC maintained a healthy operational surplus (including projected liabilities) of <strong>${fmtBDT(projectedNetFlowBDT)}</strong> this month. `;
    } else {
        insightHTML = `The business experienced an operational shortage of <strong>${fmtBDT(Math.abs(projectedNetFlowBDT))}</strong>. This factors in all <strong>Paid, Pending, and Held</strong> disbursements for the period. `;
    }

    // Identify Top Revenue Source
    const incTxs = transactions.filter(t => t.type === 'incoming' && t.date.startsWith(selectedMonth));
    const sourceGroups = {};
    incTxs.forEach(t => {
        if (!sourceGroups[t.source]) sourceGroups[t.source] = { bdt: 0, usd: 0 };
        const b = parseFloat(t.amountBDT || 0);
        const u = parseFloat(t.amountUSD || 0);
        if (t.subType === 'receive') {
            sourceGroups[t.source].bdt += b;
            sourceGroups[t.source].usd += u;
        } else {
            sourceGroups[t.source].bdt -= b;
            sourceGroups[t.source].usd -= u;
        }
    });

    const topSource = Object.entries(sourceGroups).sort((a, b) => b[1].bdt - a[1].bdt)[0];
    if (topSource && topSource[1].bdt > 0) {
        insightHTML += `The primary revenue driver for ${monthName} was <strong>${topSource[0]}</strong>. `;
    }

    // Identify Major Outflow (Paid + Hold + Pending)
    const outTxs = transactions.filter(t => t.type === 'outgoing' && t.date.startsWith(selectedMonth));
    const benGroups = {};
    outTxs.forEach(t => {
        const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
        const name = ben ? ben.nickname || ben.name : 'Unknown';
        if (!benGroups[name]) benGroups[name] = { bdt: 0, usd: 0 };
        benGroups[name].bdt += parseFloat(t.amountBDT || 0);
        benGroups[name].usd += parseFloat(t.amountUSD || 0);
    });

    const topOut = Object.entries(benGroups).sort((a, b) => b[1].bdt - a[1].bdt)[0];
    if (topOut && topOut[1].bdt > 0) {
        insightHTML += `Operational spending was primarily concentrated towards <strong>${topOut[0]}</strong>. `;
    }

    const repInsightsEl = document.getElementById('repInsights');
    if (repInsightsEl) repInsightsEl.innerHTML = insightHTML;

    // 5. Populate Tables
    els.repInBody.innerHTML = Object.entries(sourceGroups).map(([name, data]) => `
        <tr>
            <td>${name}</td>
            <td class="text-right">${fmtUSD(data.usd)}</td>
            <td class="text-right">${fmtBDT(data.bdt)}</td>
        </tr>
    `).join('');
    els.repInTotal.textContent = fmtBDT(liquidity.monthReceiptsBDT);
    els.repInTotalUSD.textContent = fmtUSD(liquidity.monthReceiptsUSD);

    els.repOutBody.innerHTML = Object.entries(benGroups).map(([name, data]) => `
        <tr>
            <td>${name}</td>
            <td class="text-right">${fmtUSD(data.usd)}</td>
            <td class="text-right">${fmtBDT(data.bdt)}</td>
        </tr>
    `).join('');
    els.repOutTotal.textContent = fmtBDT(liquidity.monthDisbursedBDT);
    els.repOutTotalUSD.textContent = fmtUSD(liquidity.monthDisbursedUSD);
}

function exportCEOReportCSV() {
    const { transactions, liquidity, selectedMonth, beneficiaries } = store.state;
    const [y, m] = selectedMonth.split('-');
    const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    let csv = `Zikrullah TV LLC - EXECUTIVE FINANCIAL OPERATIONS REPORT\n`;
    csv += `Report Period: ${monthName}\n`;
    csv += `Generated On: ${new Date().toLocaleDateString()}\n\n`;

    // 1. Executive Summary
    csv += `EXECUTIVE SUMMARY\n`;
    csv += `Opening Balance (BDT),${liquidity.openingBDT}\n`;
    csv += `Opening Balance (USD),${liquidity.openingUSD}\n`;
    csv += `Total Money In (BDT),${liquidity.monthReceiptsBDT}\n`;
    csv += `Total Money Out (BDT),${liquidity.monthDisbursedBDT}\n`;
    csv += `Closing Balance (BDT),${liquidity.closingBDT}\n`;
    csv += `Closing Balance (USD),${liquidity.closingUSD}\n\n`;

    // 2. Money In Section
    csv += `MONEY IN (PAYERS)\n`;
    csv += `Date,Source,Type,USD,BDT,Rate\n`;
    const inTxs = transactions.filter(t => t.type === 'incoming' && t.date.startsWith(selectedMonth));
    inTxs.forEach(t => {
        csv += `${t.date},"${t.source}",${t.subType},${t.amountUSD},${t.amountBDT},${t.rate}\n`;
    });
    csv += `,,TOTAL,${liquidity.monthReceiptsUSD},${liquidity.monthReceiptsBDT},\n\n`;

    // 3. Money Out Section
    csv += `MONEY OUT (RECEIVERS)\n`;
    csv += `Date,Receiver,USD,BDT,Rate,Status\n`;
    const outTxs = transactions.filter(t => t.type === 'outgoing' && t.date.startsWith(selectedMonth));
    outTxs.forEach(t => {
        const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
        const name = ben ? ben.nickname || ben.name : 'Unknown';
        csv += `${t.date},"${name}",${t.amountUSD},${t.amountBDT},${t.rate},${t.status}\n`;
    });
    csv += `,,TOTAL,${liquidity.monthDisbursedUSD},${liquidity.monthDisbursedBDT},\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `CEO_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportCSV(type) {
    const { transactions, selectedMonth } = store.state;
    const txs = transactions.filter(t => t.type === type && t.date.startsWith(selectedMonth));

    if (txs.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    const headers = type === 'incoming'
        ? ['Date', 'Type', 'Source', 'USD', 'BDT', 'Rate']
        : ['Date', 'Receiver', 'USD', 'BDT', 'Rate', 'Status'];

    const rows = txs.map(t => {
        if (type === 'incoming') {
            return [t.date, t.subType, t.source, t.amountUSD, t.amountBDT, t.rate];
        } else {
            const ben = store.state.beneficiaries.find(b => b.id === t.beneficiaryId);
            const name = ben ? ben.nickname || ben.name : 'Unknown';
            return [t.date, name, t.amountUSD, t.amountBDT, t.rate, t.status];
        }
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${type}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadFullBackup() {
    const data = {
        state: store.state,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zikrullah_tv_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Backup downloaded successfully', 'success');
}

function renderProjectedCashflow(transactions, liquidity, settings) {
    const container = document.getElementById('cashflowSummary');
    if (!container) return;

    // Calculate Liabilities (Pending & Hold OUTGOING - User requested to include Hold in shortage/activity)
    const pendingOutTxs = transactions.filter(t => t.type === 'outgoing' && (t.status === 'pending' || t.status === 'hold'));
    let pendingOutBDT = 0;
    let pendingOutUSD = 0;
    pendingOutTxs.forEach(t => {
        pendingOutBDT += parseFloat(t.amountBDT || 0);
        pendingOutUSD += parseFloat(t.amountUSD || 0);
    });

    // Calculate Projected Receivables (Held INCOMING)
    const heldIncTxs = transactions.filter(t => t.type === 'incoming' && t.status === 'hold');
    let heldIncBDT = 0;
    let heldIncUSD = 0;
    heldIncTxs.forEach(t => {
        heldIncBDT += parseFloat(t.amountBDT || 0);
        heldIncUSD += parseFloat(t.amountUSD || 0);
    });

    const currentCashBDT = liquidity.closingBDT;
    const currentCashUSD = liquidity.closingUSD;

    // Projected = Current + Expected In - Pending Out
    const projectedBDT = currentCashBDT + heldIncBDT - pendingOutBDT;
    const projectedUSD = currentCashUSD + heldIncUSD - pendingOutUSD;

    // Determine Status
    const isShortage = projectedBDT < 0;
    const statusLabel = isShortage ? 'Cash Shortage' : 'Cash Surplus';
    const statusColor = isShortage ? 'var(--danger)' : 'var(--brand-primary)';
    const statusBg = isShortage ? 'var(--danger-bg)' : 'var(--brand-light)';

    // Render Summary Cards
    container.innerHTML = `
        <div class="section-header">
            <h3>Projected Cashflow</h3>
        </div>
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-icon indigo">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.212 11.638 12.09 10.5 11.5c-1.138-.59-1.138-1.712 0-2.303 1.172-.59 3.07-.59 4.242 0 .44.221.73.495.879.659M9.75 4.038c3.236 4.5 1.25 9.125-1.5 12.875m7.5-12.875c-3.236 4.5-1.25 9.125 1.5 12.875" />
                    </svg>
                </div>
                <div class="card-content">
                    <div class="card-label">Cash in Hand</div>
                    <div class="card-value-display">
                        <div class="currency-row usd-row">
                            <span class="currency-label">USD</span>
                            <span class="currency-val usd">${fmtUSD(currentCashUSD)}</span>
                        </div>
                        <div class="currency-row bdt-row">
                            <span class="currency-label">BDT</span>
                            <span class="currency-val bdt text-brand">${fmtBDT(currentCashBDT)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-icon orange">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5a.75.75 0 0 1 .75-.75h.75m-1.5 1.5v12.75c0 .621-.504 1.125-1.125 1.125H12m1.5-15h.375c.621 0 1.125.504 1.125 1.125V6.75m-3-1.5h.375c.621 0 1.125.504 1.125 1.125V6.75m-3-1.5h.375c.621 0 1.125.504 1.125 1.125V6.75m-3-1.5h.375c.621 0 1.125.504 1.125 1.125V6.75m-3-1.5h.375A1.125 1.125 0 0 1 12 5.25V6.75m-3-1.5h.375A1.125 1.125 0 0 1 9 5.25V6.75m-3-1.5h.375A1.125 1.125 0 0 1 6 5.25V6.75m-3-1.5h.375a1.125 1.125 0 0 1 1.125 1.125V6.75" />
                    </svg>
                </div>
                <div class="card-content">
                    <div class="card-label">Expected Activity</div>
                    <div class="card-value-display">
                        <div class="currency-row usd-row">
                            <span class="currency-label">Pending USD</span>
                            <span class="currency-val usd text-warning">-${fmtUSD(pendingOutUSD)}</span>
                        </div>
                        <div class="currency-row bdt-row">
                            <span class="currency-label">Pending BDT</span>
                            <span class="currency-val bdt text-warning">-${fmtBDT(pendingOutBDT)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                 <div class="card-icon" style="color: ${isShortage ? 'var(--danger)' : 'var(--success)'}; background: ${isShortage ? 'var(--danger-bg)' : 'var(--success-bg)'}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                    </svg>
                </div>
                <div class="card-content">
                    <div class="card-label">${statusLabel}</div>
                    <div class="card-value-display">
                        <div class="currency-row usd-row">
                            <span class="currency-label">Projected USD</span>
                            <span class="currency-val usd ${isShortage ? 'text-danger' : 'text-success'}">${fmtUSD(projectedUSD)}</span>
                        </div>
                        <div class="currency-row bdt-row">
                            <span class="currency-label">Projected BDT</span>
                            <span class="currency-val bdt ${isShortage ? 'text-danger' : 'text-success'}">${fmtBDT(projectedBDT)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Copied: ${text}`, 'success');
        }).catch(err => {
            console.error('Modern copy failed', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure it's not visible and doesn't interfere with layout
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast(`Copied: ${text}`, 'success');
        } else {
            showToast('Failed to copy', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed', err);
        showToast('Failed to copy', 'error');
    }

    document.body.removeChild(textArea);
}

function openBeneficiaryModal(ben = null) {
    if (ben) {
        els.benModalTitle.textContent = 'Edit Receiver';
        els.benId.value = ben.id;
        els.benNickname.value = ben.nickname || ben.name;
        els.benAccountName.value = ben.accountName || '';
        els.benBankName.value = ben.bankName || '';
        els.benAccountNo.value = ben.accountNo || '';
        els.benBranch.value = ben.branch || '';
        els.beneficiaryModal.classList.add('open');
    } else {
        els.benModalTitle.textContent = 'Add Receiver';
        els.benForm.reset();
        els.benId.value = '';
        els.beneficiaryModal.classList.add('open');
    }
}

function renderHistoryTable(transactions, beneficiaries, query = '', filterMonth = '', filterYear = '2026') {
    const q = query.toLowerCase().trim();

    // Sort by date descending
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

    let filtered = sorted;

    // 1. Apply Month/Year Filter if selected
    if (filterMonth) {
        const targetPrefix = `${filterYear}-${filterMonth}`;
        filtered = filtered.filter(t => t.date.startsWith(targetPrefix));
    } else if (filterYear) {
        // If only year is selected (or default 2026)
        filtered = filtered.filter(t => t.date.startsWith(filterYear));
    }

    // 2. Apply Search Query
    if (q) {
        filtered = filtered.filter(t => {
            const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
            const identity = (t.type === 'incoming' ? t.source : (ben ? ben.nickname || ben.name : 'Unknown')).toLowerCase();
            return (
                t.date.includes(q) ||
                identity.includes(q) ||
                t.amountUSD.toString().includes(q) ||
                t.amountBDT.toString().includes(q) ||
                t.type.toLowerCase().includes(q)
            );
        });
    }

    els.historyTableBody.innerHTML = '';
    if (filtered.length === 0) {
        els.historyTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-muted">No transactions found matching "${q}"</td></tr>`;
        return;
    }

    filtered.forEach(tx => {
        const ben = beneficiaries.find(b => b.id === tx.beneficiaryId);
        const identity = tx.type === 'incoming' ? tx.source : (ben ? ben.nickname || ben.name : 'Unknown');
        const typeLabel = tx.type === 'incoming' ? (tx.subType === 'return' ? 'Return' : 'Receive') : 'Payout';
        const typeClass = tx.type === 'incoming' ? (tx.subType === 'return' ? 'bg-orange-light text-orange' : 'bg-green-light text-green') : 'bg-indigo-light text-indigo';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Date">${tx.date}</td>
            <td data-label="Type"><span class="badge ${typeClass}">${typeLabel}</span></td>
            <td data-label="Identity">${identity}</td>
            <td data-label="USD" class="amount-column">${fmtUSD(tx.amountUSD)}</td>
            <td data-label="BDT" class="amount-column font-bold">${fmtBDT(tx.amountBDT)}</td>
            <td data-label="Rate" class="text-right">${tx.rate.toFixed(2)}</td>
            <td class="actions-cell">
                <button class="icon-btn edit-tx-btn-hist" data-id="${tx.id}" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                </button>
            </td>
        `;

        // Handle Edit from History
        tr.querySelector('.edit-tx-btn-hist').addEventListener('click', () => {
            els.historyModal.classList.remove('open');
            editTransaction(tx.id);
        });

        els.historyTableBody.appendChild(tr);
    });
}

/**
 * Generates a bank-style CSV statement for a specific month
 */
function downloadBankStatement(transactions, beneficiaries, month, year) {
    try {
        console.log('Statement download triggered:', { month, year, txCount: transactions.length });

        let filtered = transactions;
        let title = "Full Transaction History";
        let fileName = "full_history.csv";

        if (month) {
            const targetPrefix = `${year}-${month}`;
            filtered = transactions
                .filter(t => t.date.startsWith(targetPrefix))
                .sort((a, b) => a.date.localeCompare(b.date));
            title = `Account Statement - ${month}/${year}`;
            fileName = `statement_${year}_${month}.csv`;
        } else {
            // Sort by date descending for full history
            filtered = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
        }

        if (filtered.length === 0) {
            showToast('No transactions found to download.', 'info');
            return;
        }

        // --- Format CSV ---
        const headers = ["Date", "Type", "Ref/Identity", "USD", "BDT", "Rate", "Status"];
        let csvContent = `${title}\n\n`;
        csvContent += headers.join(",") + "\n";

        filtered.forEach(tx => {
            const ben = beneficiaries.find(b => b.id === tx.beneficiaryId);
            const identity = tx.type === 'incoming' ? (tx.source || 'Unknown') : (ben ? ben.nickname || ben.name : 'Unknown');
            const typeLabel = tx.type === 'incoming' ? (tx.subType === 'return' ? 'Return' : 'Receive') : 'Payout';

            const usd = (parseFloat(tx.amountUSD) || 0).toFixed(2);
            const bdt = (parseFloat(tx.amountBDT) || 0).toFixed(2);
            const rate = (parseFloat(tx.rate) || 0).toFixed(2);

            const row = [
                tx.date,
                `"${typeLabel}"`,
                `"${identity.replace(/"/g, '""')}"`,
                usd,
                bdt,
                rate,
                `"${tx.status || 'received'}"`
            ];
            csvContent += row.join(",") + "\n";
        });

        // --- Trigger Download ---
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;

        // Ensure link is in DOM for some browsers
        link.style.display = 'none';
        document.body.appendChild(link);

        // Trigger click
        link.click();

        // Clean up after longer delay
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
        }, 1000);

        showToast('Download Started', 'success');
    } catch (error) {
        console.error('Download Logic Error:', error);
        showToast('System Error: File could not be generated.', 'error');
    }
}
