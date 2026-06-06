import { store } from './store/store.js';
import { fmtUSD, fmtBDT, showToast, debounce } from './utils/utils.js';

// --- Modular Imports (New split structure) ---
import { els } from './ui/elements.js';
import { render, renderSourcesList, renderBeneficiariesList } from './ui/render.js';
import { renderTables, renderHistoryTable, populateHistYears } from './ui/tables.js';
import { setupSmartCalc, editTransaction, cloneTransaction, openBeneficiaryModal } from './ui/forms.js';
import { generateMonthlyReport, exportCEOReportCSV, exportCSV, downloadFullBackup, downloadBankStatement } from './ui/report.js';
import { copyToClipboard } from './utils/clipboard.js';

// --- Custom Dialog (replaces browser confirm/prompt) ---
function showConfirm(message, { title = 'Confirm', okLabel = 'Confirm', isDanger = false } = {}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmInputWrapper').style.display = 'none';
        const okBtn = document.getElementById('confirmOkBtn');
        okBtn.textContent = okLabel;
        okBtn.className = isDanger ? 'btn-primary danger-confirm' : 'btn-primary';
        modal.classList.add('open');

        const ok = () => { cleanup(); resolve(true); };
        const cancel = () => { cleanup(); resolve(false); };

        function cleanup() {
            modal.classList.remove('open');
            okBtn.removeEventListener('click', ok);
            document.getElementById('confirmCancelBtn').removeEventListener('click', cancel);
        }

        okBtn.addEventListener('click', ok);
        document.getElementById('confirmCancelBtn').addEventListener('click', cancel);
    });
}

function showPrompt(message, { title = 'Enter Value', placeholder = '', defaultValue = '' } = {}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        const wrapper = document.getElementById('confirmInputWrapper');
        const input = document.getElementById('confirmInput');
        wrapper.style.display = 'block';
        input.placeholder = placeholder;
        input.value = defaultValue;
        const okBtn = document.getElementById('confirmOkBtn');
        okBtn.textContent = 'OK';
        okBtn.className = 'btn-primary';
        modal.classList.add('open');
        setTimeout(() => input.focus(), 100);

        const ok = () => { cleanup(); resolve(input.value.trim() || null); };
        const cancel = () => { cleanup(); resolve(null); };
        const keydown = (e) => { if (e.key === 'Enter') ok(); };

        function cleanup() {
            modal.classList.remove('open');
            okBtn.removeEventListener('click', ok);
            document.getElementById('confirmCancelBtn').removeEventListener('click', cancel);
            document.removeEventListener('keydown', keydown);
        }

        okBtn.addEventListener('click', ok);
        document.getElementById('confirmCancelBtn').addEventListener('click', cancel);
        document.addEventListener('keydown', keydown);
    });
}

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
        if (els.incDate) els.incDate.value = today;
        if (els.outDate) els.outDate.value = today;
        if (els.incAccMonth) els.incAccMonth.value = today.slice(0, 7);
        if (els.outAccMonth) els.outAccMonth.value = today.slice(0, 7);

        const [currYear, currMonth] = today.slice(0, 7).split('-');
        if (els.yearInput) els.yearInput.value = currYear;
        if (els.monthSelect) els.monthSelect.value = currMonth;

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
        console.error('Critical init error:', error.message);
    }
}

async function updateConnectionStatus() {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;

    // 1. Check Browser Network Status first
    if (!navigator.onLine) {
        statusEl.textContent = 'Offline';
        statusEl.className = 'status-badge-v2 danger';
        statusEl.removeAttribute('style');
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
            statusEl.removeAttribute('style');
            statusEl.title = 'Connected to Firebase Cloud Sync';
            console.log('App: Data connection established (Cloud Mode)');
        } else {
            statusEl.textContent = 'Disconnected';
            statusEl.className = 'status-badge-v2 danger';
            statusEl.removeAttribute('style');
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
        statusEl.removeAttribute('style');
        showToast('Database connection error', 'error');
    }
}

function checkLoginStatus() {
    const isAuth = localStorage.getItem('isAuth') === 'true';
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

    if (els.mobileMenuBtn) els.mobileMenuBtn?.addEventListener('click', openSidebar);
    if (els.closeSidebarBtn) els.closeSidebarBtn?.addEventListener('click', closeSidebar);
    if (els.mobileSidebarOverlay) els.mobileSidebarOverlay?.addEventListener('click', closeSidebar);

    // Sidebar Actions
    if (els.sidebarReportBtn) {
        els.sidebarReportBtn?.addEventListener('click', () => {
            closeSidebar();
            if (els.openReportModalBtn) els.openReportModalBtn.click();
        });
    }

    if (els.sidebarSettingsBtn) {
        els.sidebarSettingsBtn?.addEventListener('click', () => {
            closeSidebar();
            if (els.settingsBtn) els.settingsBtn.click();
        });
    }

    if (els.sidebarLogoutBtn) {
        els.sidebarLogoutBtn?.addEventListener('click', () => {
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

    els.navDashboard?.addEventListener('click', () => updateNav('dashboard'));
    els.navMoneyIn?.addEventListener('click', () => updateNav('money-in'));
    els.navMoneyOut?.addEventListener('click', () => updateNav('money-out'));

    // --- Escape key closes any open modal ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
            closeSidebar();
        }
        // N key shortcut — opens new transaction modal for current tab
        if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (document.querySelector('.modal-overlay.open')) return;
            if (els.navMoneyIn.classList.contains('active')) els.openIncModalBtn?.click();
            else if (els.navMoneyOut.classList.contains('active')) els.openOutModalBtn?.click();
        }
    });

    // --- Search Clear Buttons ---
    const setupSearchClear = (input, clearBtn) => {
        if (!input || !clearBtn) return;
        input.addEventListener('input', () => {
            clearBtn.style.display = input.value ? 'block' : 'none';
        });
        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            input.dispatchEvent(new Event('input'));
            input.focus();
        });
    };
    setupSearchClear(document.getElementById('incSearch'), document.getElementById('incSearchClear'));
    setupSearchClear(document.getElementById('outSearch'), document.getElementById('outSearchClear'));

    // --- Number Format Hints ---
    const addFormatHint = (input, isBDT = false) => {
        const hint = document.createElement('div');
        hint.className = 'format-hint';
        input.parentNode.appendChild(hint);
        input.addEventListener('input', () => {
            const val = parseFloat(input.value);
            if (val > 0) {
                hint.textContent = isBDT
                    ? '৳ ' + new Intl.NumberFormat('en-IN').format(val)
                    : '$ ' + new Intl.NumberFormat('en-US').format(val);
            } else {
                hint.textContent = '';
            }
        });
    };
    addFormatHint(els.incUSD, false);
    addFormatHint(els.incBDT, true);
    addFormatHint(els.outUSD, false);
    addFormatHint(els.outBDT, true);

    // --- Login ---
    els.loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = els.loginPassword.value;
        // Basic obfuscation for 'admin123#' to avoid plain text password in source
        if (btoa(pwd) === 'YWRtaW4xMjMj') {
            localStorage.setItem('isAuth', 'true');
            checkLoginStatus();
            showToast('Access Granted', 'success');
        } else {
            showToast('Invalid Password', 'error');
            els.loginPassword.value = '';
        }
    });

    els.logoutBtn?.addEventListener('click', async () => {
        const ok = await showConfirm('Are you sure you want to log out?', { title: 'Logout', okLabel: 'Logout', isDanger: true });
        if (ok) { localStorage.removeItem('isAuth'); window.location.reload(); }
    });

    // --- Secret Reset Logic ---
    let secretClickCount = 0;
    els.settingsHeaderTitle?.addEventListener('click', () => {
        secretClickCount++;
        if (secretClickCount === 5) {
            els.clearDataBtn.style.display = 'block';
            els.openingBalanceSection.style.display = 'block';
            showToast('Master Controls Unlocked', 'info');
        }
    });

    els.clearDataBtn?.addEventListener('click', async () => {
        const confirmCode = await showPrompt(
            "EXTREME WARNING: This will permanently delete ALL Cloud data.\nType the Master Key to confirm:",
            { title: 'Reset All Data', placeholder: 'Type RESET-99 to confirm' }
        );
        if (confirmCode === 'RESET-99') {
            const ok = await showConfirm('THIS ACTION CANNOT BE UNDONE. Are you 100% sure?', { title: 'Final Warning', okLabel: 'Yes, Delete Everything', isDanger: true });
            if (ok) {
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

    els.monthSelect?.addEventListener('change', updateStoreDate);
    els.yearInput?.addEventListener('change', () => {
        let y = parseInt(els.yearInput.value);
        if (y < 2020) { els.yearInput.value = 2020; }
        if (y > 2099) { els.yearInput.value = 2099; }
        updateStoreDate();
    });

    // Smart Nav Arrows
    els.prevMonthBtn?.addEventListener('click', () => changeMonth(-1));
    els.nextMonthBtn?.addEventListener('click', () => changeMonth(1));

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
    els.openIncModalBtn?.addEventListener('click', () => {
        // Always reset to Add mode â€” clear any lingering edit ID
        els.incomingForm.reset();
        els.incId.value = '';
        els.incomingModal.classList.add('open');
        // Auto-fill Rate with the latest used incoming rate (Prioritize LocalStorage)
        const savedRate = localStorage.getItem('lastIncRate');
        if (savedRate) {
            els.incRate.value = savedRate;
        } else {
            const lastTx = [...store.state.transactions].reverse().find(t => t.type === 'incoming' && t.rate > 0);
            if (lastTx) {
                els.incRate.value = lastTx.rate;
            }
        }
        // Default Accounting Month and Date
        els.incAccMonth.value = store.state.selectedMonth;
        els.incDate.value = new Date().toISOString().split('T')[0];
    });
    els.closeIncModal?.addEventListener('click', () => els.incomingModal.classList.remove('open'));
    els.incomingModal?.addEventListener('click', (e) => {
        if (e.target === els.incomingModal) els.incomingModal.classList.remove('open');
    });

    // Outgoing
    els.openOutModalBtn?.addEventListener('click', () => {
        // Always reset to Add mode â€” clear any lingering edit ID
        els.outgoingForm.reset();
        els.outId.value = '';
        els.outgoingModal.classList.add('open');
        // Clear bank preview from any previous use
        els.bankPreview.style.display = 'none';
        els.prevDisplayName.textContent = '';
        els.prevBankName.textContent = '';
        els.prevAccNo.textContent = '';
        // Default Date and Month
        els.outDate.value = new Date().toISOString().split('T')[0];
        els.outAccMonth.value = store.state.selectedMonth;
        // Auto-fill with implied rate (actual BDT/USD ratio â€” consistent with dashboard)
        const fillRate = store.state.liquidity.impliedRate || store.state.liquidity.averageBuyRate || 0;
        if (fillRate > 0) {
            els.outRate.value = fillRate.toFixed(2);
        }
    });

    if (els.applyAvgRateBtn) {
        els.applyAvgRateBtn?.addEventListener('click', () => {
            const fillRate = store.state.liquidity.impliedRate || store.state.liquidity.averageBuyRate || 0;
            if (fillRate > 0) {
                els.outRate.value = fillRate.toFixed(2);
                els.outRate.dispatchEvent(new Event('input'));
                showToast('Current Rate Applied', 'info');
            }
        });
    }
    els.closeOutModal?.addEventListener('click', () => els.outgoingModal.classList.remove('open'));

    // History listeners
    if (els.openHistoryModalBtn) {
        els.openHistoryModalBtn?.addEventListener('click', () => {
            populateHistYears();
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value);
            els.historyModal.classList.add('open');
        });
    }

    if (els.sidebarHistoryBtn) {
        els.sidebarHistoryBtn?.addEventListener('click', () => {
            populateHistYears();
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value);
            els.historyModal.classList.add('open');
            els.mobileSidebar.classList.remove('open');
            els.mobileSidebarOverlay.classList.remove('open');
        });
    }

    if (els.closeHistoryModal) {
        els.closeHistoryModal?.addEventListener('click', () => {
            els.historyModal.classList.remove('open');
        });
    }

    if (els.histSearch) {
        els.histSearch?.addEventListener('input', debounce(() => {
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value, els.histMonth.value, els.histYear.value);
        }, 300));
    }

    if (els.histMonth) {
        els.histMonth?.addEventListener('change', () => {
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value, els.histMonth.value, els.histYear.value);
        });
    }

    if (els.histYear) {
        els.histYear?.addEventListener('change', () => {
            renderHistoryTable(store.state.transactions, store.state.beneficiaries, els.histSearch.value, els.histMonth.value, els.histYear.value);
        });
    }

    if (els.downloadBankStatementBtn) {
        els.downloadBankStatementBtn?.addEventListener('click', () => {
            downloadBankStatement(store.state.transactions, store.state.beneficiaries, els.histMonth.value, els.histYear.value);
        });
    }

    // Delegated edit listener for history table â€” set once to avoid memory leak
    els.historyTableBody?.addEventListener('click', (e) => {
        const btn = e.target.closest('.edit-tx-btn-hist');
        if (!btn) return;
        els.historyModal.classList.remove('open');
        editTransaction(btn.dataset.id);
    });

    // Settings
    els.settingsBtn?.addEventListener('click', () => {
        const { openingBalanceUSD, openingBalanceBDT } = store.state.settings;
        els.setOpeningUSD.value = openingBalanceUSD || 0;
        els.setOpeningBDT.value = openingBalanceBDT || 0;
        els.settingsModal.classList.add('open');
    });
    els.closeSettingsModal?.addEventListener('click', () => els.settingsModal.classList.remove('open'));

    // Sources
    els.closeSourcesModal?.addEventListener('click', () => els.sourcesModal.classList.remove('open'));

    // Beneficiary List
    els.closeBenListModal?.addEventListener('click', () => els.beneficiariesListModal.classList.remove('open'));

    // Beneficiary Edit
    els.closeBenModal?.addEventListener('click', () => els.beneficiaryModal.classList.remove('open'));

    // Report
    els.closeReportModal?.addEventListener('click', () => els.reportModal.classList.remove('open'));

    // Backup
    els.downloadBackupBtn?.addEventListener('click', downloadFullBackup);

    // Report Download
    els.downloadReportBtn?.addEventListener('click', () => {
        exportCEOReportCSV();
    });

    // Click Outside to Close for all modals
    [els.incomingModal, els.outgoingModal, els.settingsModal, els.sourcesModal, els.beneficiariesListModal, els.beneficiaryModal, els.reportModal, els.historyModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('open');
            });
        }
    });

    // Settings Save
    els.settingsForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await store.saveSettings({
                ...store.state.settings,
                openingBalanceUSD: parseFloat(els.setOpeningUSD.value) || 0,
                openingBalanceBDT: parseFloat(els.setOpeningBDT.value) || 0
            });
            showToast('Settings saved', 'success');
            els.settingsModal.classList.remove('open');
        } catch (err) {
            showToast('Failed to save settings: ' + err.message, 'error');
        }
    });


    // --- Sources Management ---
    els.manageSourcesBtn?.addEventListener('click', () => {
        renderSourcesList(store.state.sources);
        els.sourcesModal.classList.add('open');
    });

    els.addSourceForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(els.addSourceForm);
        try {
            await store.addSource({ name: formData.get('name') });
            els.addSourceForm.reset();
        } catch (err) {
            showToast('Failed to add payer: ' + err.message, 'error');
        }
    });

    els.sourcesList?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.icon-btn');
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;

        if (btn.classList.contains('delete-btn')) {
            const ok = await showConfirm('Delete this payer?', { title: 'Delete Payer', okLabel: 'Delete', isDanger: true });
            if (ok) {
                try {
                    await store.deleteSource(id);
                } catch (err) {
                    showToast('Failed to delete: ' + err.message, 'error');
                }
            }
        } else if (btn.classList.contains('edit-btn')) {
            const currentName = store.state.sources.find(s => s.id === id)?.name;
            const newName = await showPrompt('Enter new payer name:', { title: 'Edit Payer', placeholder: 'Payer name', defaultValue: currentName || '' });
            if (newName && newName !== currentName) {
                try {
                    await store.updateSource(id, { name: newName });
                } catch (err) {
                    showToast('Failed to update: ' + err.message, 'error');
                }
            }
        }
    });

    // --- Beneficiaries Management ---
    els.manageBeneficiariesBtn?.addEventListener('click', () => {
        renderBeneficiariesList(store.state.beneficiaries);
        els.beneficiariesListModal.classList.add('open');
    });

    els.openAddBenModalBtn?.addEventListener('click', () => {
        openBeneficiaryModal(); // Add mode
    });

    els.benForm?.addEventListener('submit', async (e) => {
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

        try {
            if (id) {
                await store.updateBeneficiary(id, benData);
            } else {
                await store.addBeneficiary(benData);
            }
            els.beneficiaryModal.classList.remove('open');
        } catch (err) {
            showToast('Failed to save receiver: ' + err.message, 'error');
        }
    });

    els.beneficiariesTableBody?.addEventListener('click', async (e) => {
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
            const ok = await showConfirm('Delete this receiver?', { title: 'Delete Receiver', okLabel: 'Delete', isDanger: true });
            if (ok) {
                try {
                    await store.deleteBeneficiary(id);
                } catch (err) {
                    showToast('Failed to delete receiver: ' + err.message, 'error');
                }
            }
        }
    });

    // --- Report Download ---
    els.downloadReportPdfBtn?.addEventListener('click', async () => {
        if (!window.html2pdf) {
            showToast('PDF Library is still loading. Please try again in a moment.', 'error');
            return;
        }
        
        const originalText = els.downloadReportPdfBtn.innerHTML;
        els.downloadReportPdfBtn.innerHTML = 'Structuring PDF...';
        els.downloadReportPdfBtn.disabled = true;

        const element = document.getElementById('printableReportArea');
        const monthYear = document.getElementById('repMonth').textContent.replace(' ', '_');
        
        // 1. Temporarily remove constraints for seamless full-page capture
        const originalStyles = {
            overflow: element.style.overflow,
            height: element.style.height,
            maxHeight: element.style.maxHeight
        };
        
        element.style.overflow = 'visible';
        element.style.height = 'auto';
        element.style.maxHeight = 'none';
        
        // Wait a tick for styles to apply
        await new Promise(r => setTimeout(r, 100));

        // Exact pixel dimensions of what the user sees
        const pxWidth = element.scrollWidth;
        const pxHeight = element.scrollHeight + 50; // extra padding at bottom

        const opt = {
            margin:       0, // No margins, just literal pixel mapping
            filename:     `Zikrullah_TV_Report_${monthYear}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                scrollY: 0, // IMPORTANT: force scroll to 0 to prevent top space offset bug in PDF
                windowY: 0,
                backgroundColor: '#ffffff'
            },
            // Create a single enormous PDF page so NOTHING gets cut into pieces
            jsPDF:        { unit: 'px', format: [pxWidth, pxHeight], orientation: 'portrait' }
        };

        try {
            await window.html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error('PDF Generation Error:', err);
            showToast('Failed to generate PDF. Check console for details.', 'error');
        } finally {
            // Restore everything
            element.style.overflow = originalStyles.overflow;
            element.style.height = originalStyles.height;
            element.style.maxHeight = originalStyles.maxHeight;
            
            els.downloadReportPdfBtn.innerHTML = originalText;
            els.downloadReportPdfBtn.disabled = false;
        }
    });

    els.openReportModalBtn?.addEventListener('click', () => {
        generateMonthlyReport();
        els.reportModal.classList.add('open');
    });

    // --- Forms ---

    // Smart Calculation Reuse
    setupSmartCalc(els.incUSD, els.incBDT, els.incRate);
    setupSmartCalc(els.outUSD, els.outBDT, els.outRate);

    // --- Money Out: Live Balance Preview ---
    const updateOutPreview = () => {
        const bdtVal = parseFloat(els.outBDT.value) || 0;
        const preview = document.getElementById('outPaymentPreview');
        if (!preview) return;
        if (bdtVal > 0) {
            const available = store.state.liquidity.closingBDT;
            const after = available - bdtVal;
            preview.style.display = 'flex';
            document.getElementById('ppAvailable').textContent = fmtBDT(available);
            const ppAfterEl = document.getElementById('ppAfter');
            ppAfterEl.textContent = fmtBDT(after);
            ppAfterEl.style.color = after < 0 ? 'var(--danger)' : 'var(--success-text)';
            preview.classList.toggle('preview-warning', after < 0);
        } else {
            preview.style.display = 'none';
        }
    };
    els.outBDT?.addEventListener('input', updateOutPreview);

    // Incoming Form Submit
    els.incomingForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const id = els.incId.value;

            // Save Rate for future convenience
            if (els.incRate.value) {
                localStorage.setItem('lastIncRate', els.incRate.value);
            }

            const txData = {
                date: els.incDate.value,
                accountingMonth: els.incAccMonth.value,
                type: 'incoming',
                subType: els.incType.value,
                source: els.incSource.value,
                rate: parseFloat(els.incRate.value) || 0,
                amountUSD: parseFloat(els.incUSD.value) || 0,
                amountBDT: parseFloat(els.incBDT.value) || 0,
            };

            if (!txData.amountUSD && !txData.amountBDT) {
                showToast('Please enter at least one amount (USD or BDT)', 'error');
                return;
            }
            if (txData.amountUSD < 0 || txData.amountBDT < 0) {
                showToast('Amounts must be positive. Use Return type for refunds.', 'error');
                return;
            }
            // Return validation: warn if return exceeds current balance
            if (txData.subType === 'return') {
                const { closingUSD, closingBDT } = store.state.liquidity;
                if (txData.amountUSD > 0 && txData.amountUSD > closingUSD) {
                    showToast(`Return $${txData.amountUSD} exceeds available USD $${closingUSD.toFixed(2)}`, 'error');
                    return;
                }
                if (txData.amountBDT > 0 && txData.amountBDT > closingBDT) {
                    showToast(`Return ৳${txData.amountBDT} exceeds available BDT ৳${closingBDT.toFixed(2)}`, 'error');
                    return;
                }
            }

            if (id) {
                await store.updateTransaction(id, txData);
                showToast('Transaction Updated Successfully', 'success');
            } else {
                txData.status = 'received';
                await store.addTransaction(txData);
                showToast('Money In Record Added', 'success');
            }

            // Reset AFTER successful save so data isn't lost on DB failure
            els.incomingModal.classList.remove('open');
            els.incomingForm.reset();
            els.incId.value = '';
            els.incDate.value = new Date().toISOString().split('T')[0];
            els.incAccMonth.value = store.state.selectedMonth;
        } catch (error) {
            console.error('Error saving transaction:', error);
            showToast('Failed to save record: ' + error.message, 'error');
        }
    });

    // Outgoing Form Submit
    els.outgoingForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const id = els.outId.value;
            const selectedBen = store.state.beneficiaries.find(b => b.id === els.outBeneficiary.value);
            const txData = {
                date: els.outDate.value,
                accountingMonth: els.outAccMonth.value,
                type: 'outgoing',
                beneficiaryId: els.outBeneficiary.value,
                beneficiaryName: selectedBen ? (selectedBen.nickname || selectedBen.name || '') : '',
                rate: parseFloat(els.outRate.value) || 0,
                amountUSD: parseFloat(els.outUSD.value) || 0,
                amountBDT: parseFloat(els.outBDT.value) || 0,
            };

            if (!txData.amountUSD && !txData.amountBDT) {
                showToast('Please enter at least one amount (USD or BDT)', 'error');
                return;
            }
            if (txData.amountUSD < 0 || txData.amountBDT < 0) {
                showToast('Amounts must be positive.', 'error');
                return;
            }

            if (id) {
                await store.updateTransaction(id, txData);
                showToast('Transaction Updated Successfully', 'success');
            } else {
                txData.status = 'pending';
                await store.addTransaction(txData);
                showToast('Money Out Record Added', 'success');
            }

            // Reset AFTER successful save so data isn't lost on DB failure
            els.outgoingModal.classList.remove('open');
            els.outgoingForm.reset();
            els.outId.value = '';
            els.outDate.value = new Date().toISOString().split('T')[0];
            els.bankPreview.style.display = 'none';
            els.prevDisplayName.textContent = '';
            els.prevBankName.textContent = '';
            els.prevAccNo.textContent = '';
        } catch (error) {
            console.error('Error saving outgoing:', error);
            showToast('Failed to save record: ' + error.message, 'error');
        }
    });

    // Source Auto-Fill Rate
    els.incSource?.addEventListener('change', () => {
        const source = els.incSource.value;
        if (!source) return;
        const lastTx = [...store.state.transactions].reverse().find(t => t.source === source && t.rate);
        if (lastTx) {
            els.incRate.value = lastTx.rate;
            els.incRate.dispatchEvent(new Event('input'));
        }
    });

    // Beneficiary Selection
    els.outBeneficiary?.addEventListener('change', async () => {
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

        // 1. Check for Pending/Hold to Merge â€” only within selected month
        const existingUnpaid = store.state.transactions.find(t =>
            String(t.beneficiaryId) === String(benId) &&
            t.type === 'outgoing' &&
            ['pending', 'hold'].includes((t.status || '').toLowerCase()) &&
            (t.accountingMonth || (t.date ? t.date.slice(0, 7) : '')) === store.state.selectedMonth
        );

        const fillRate = store.state.liquidity.impliedRate || store.state.liquidity.averageBuyRate || 0;

        if (existingUnpaid) {
            const load = await showConfirm(`Found a pending payment of $${existingUnpaid.amountUSD} / ৳${existingUnpaid.amountBDT} for this receiver.\n\nLoad and update the existing entry?`, { title: 'Existing Pending Payment', okLabel: 'Load & Update' });
            if (load) {
                // MERGE MODE â€” load stored values directly, no recalculation (avoids corrupting saved data)
                els.outId.value = existingUnpaid.id;
                els.outUSD.value = existingUnpaid.amountUSD;
                els.outBDT.value = existingUnpaid.amountBDT;
                els.outRate.value = existingUnpaid.rate || fillRate.toFixed(2);
                showToast(`Loaded Pending Tx ($${existingUnpaid.amountUSD}). Update total to merge.`, 'info');
            } else {
                // NEW ENTRY MODE
                els.outId.value = '';
                els.outUSD.value = '';
                els.outBDT.value = '';
                if (fillRate > 0) {
                    els.outRate.value = fillRate.toFixed(2);
                    els.outRate.dispatchEvent(new Event('input'));
                }
            }
        } else {
            // NEW ENTRY MODE
            els.outId.value = '';
            els.outUSD.value = '';
            els.outBDT.value = '';
            if (fillRate > 0) {
                els.outRate.value = fillRate.toFixed(2);
                els.outRate.dispatchEvent(new Event('input'));
            }
        }
    });

    // --- Table Actions ---
    els.incTableBody?.addEventListener('click', async (e) => {
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

    els.outTableBody?.addEventListener('click', async (e) => {
        // 1. Copy Amount
        if (e.target.closest('.copy-amount-btn')) {
            const btn = e.target.closest('.copy-amount-btn');
            copyToClipboard(btn.dataset.amount);
            return;
        }

        // 2a. Fix Unknown Name
        if (e.target.closest('.fix-name-btn')) {
            const btn = e.target.closest('.fix-name-btn');
            const newName = await showPrompt('Enter receiver name for this transaction:', { title: 'Fix Receiver Name', placeholder: 'Name' });
            if (newName && newName.trim()) {
                await store.updateTransaction(btn.dataset.id, { beneficiaryName: newName.trim() });
                showToast('Name updated', 'success');
            }
            return;
        }

        // 2b. View Receiver
        if (e.target.closest('.receiver-link')) {
            const id = e.target.closest('.receiver-link').dataset.id;
            const ben = store.state.beneficiaries.find(b => b.id === id);
            if (ben) {
                openBeneficiaryModal(ben);
            }
            return;
        }

        // 3. Mark Paid / Hold / Resume / Clone / Edit / Delete
        const payBtn = e.target.closest('.pay-btn');
        const holdBtn = e.target.closest('.hold-btn');
        const resumeBtn = e.target.closest('.resume-btn');
        const editTxBtn = e.target.closest('.edit-tx-btn');
        const cloneBtn = e.target.closest('.clone-btn');
        const deleteTxBtn = e.target.closest('.delete-tx-btn');

        if (payBtn) {
            const id = payBtn.dataset.id;
            const ok = await showConfirm('Mark this transaction as PAID?', { title: 'Confirm Payment', okLabel: 'Mark Paid' });
            if (ok) {
                try {
                    await store.updateTransaction(id, { status: 'paid' });
                    showToast('Transaction marked as Paid', 'success');
                } catch (err) {
                    showToast('Failed to mark as paid: ' + err.message, 'error');
                }
            }
        } else if (holdBtn) {
            const id = holdBtn.dataset.id;
            try {
                await store.updateTransaction(id, { status: 'hold' });
                showToast('Transaction put on Hold', 'success');
            } catch (err) {
                showToast('Failed to put on hold: ' + err.message, 'error');
            }
        } else if (resumeBtn) {
            const id = resumeBtn.dataset.id;
            try {
                await store.updateTransaction(id, { status: 'pending' });
                showToast('Transaction Resumed', 'success');
            } catch (err) {
                showToast('Failed to resume: ' + err.message, 'error');
            }
        } else if (editTxBtn) {
            editTransaction(editTxBtn.dataset.id);
        } else if (cloneBtn) {
            cloneTransaction(cloneBtn.dataset.id);
        } else if (deleteTxBtn) {
            const id = deleteTxBtn.dataset.id;
            const tx = store.state.transactions.find(t => t.id === id);
            const label = tx?.beneficiaryName || store.state.beneficiaries.find(b => b.id === tx?.beneficiaryId)?.nickname || 'this transaction';
            const delOk = await showConfirm(`Delete "${label}"?\n\nThis cannot be undone.`, { title: 'Delete Transaction', okLabel: 'Delete', isDanger: true });
            if (delOk) {
                try {
                    await store.deleteTransaction(id);
                    showToast('Transaction deleted', 'success');
                } catch (err) {
                    showToast(err.message, 'error');
                }
            }
        }
    });

    // Search (Debounced)
    const debouncedRender = debounce(() => renderTables(store.state.transactions, store.state.beneficiaries, store.state.selectedMonth, store.state.sortConfig), 300);
    els.incSearch?.addEventListener('input', debouncedRender);
    els.outSearch?.addEventListener('input', debouncedRender);

    // Export
    els.exportIncBtn?.addEventListener('click', () => exportCSV('incoming'));
    els.exportOutBtn?.addEventListener('click', () => exportCSV('outgoing'));
}
