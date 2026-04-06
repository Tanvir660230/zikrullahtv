import { store } from './store/store.js';

// --- DOM Elements ---
const els = {
    // Dashboard
    liqUSD: document.getElementById('liqUSD'),
    liqBDT: document.getElementById('liqBDT'),
    receipts: document.getElementById('totalReceipts'),
    disbursements: document.getElementById('totalDisbursements'),

    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Forms - Incoming
    incForm: document.getElementById('incomingForm'),
    incDate: document.getElementById('incDate'),
    incType: document.getElementById('incType'),
    incSource: document.getElementById('incSource'),
    incRate: document.getElementById('incRate'),
    incUSD: document.getElementById('incUSD'),
    incBDT: document.getElementById('incBDT'),

    // Forms - Outgoing
    outForm: document.getElementById('outgoingForm'),
    outDate: document.getElementById('outDate'),
    outBeneficiary: document.getElementById('outBeneficiary'),
    outRate: document.getElementById('outRate'),
    outUSD: document.getElementById('outUSD'),
    outBDT: document.getElementById('outBDT'),
    bankPreview: document.getElementById('bankPreview'),
    prevBankName: document.getElementById('prevBankName'),
    prevAccNo: document.getElementById('prevAccNo'),

    // Tables
    incTableBody: document.querySelector('#incomingTable tbody'),
    outTableBody: document.querySelector('#outgoingTable tbody'),

    // Settings Modal
    settingsBtn: document.getElementById('openSettingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    settingsForm: document.getElementById('settingsForm'),
    setOpeningUSD: document.getElementById('setOpeningUSD'),
    setOpeningBDT: document.getElementById('setOpeningBDT'),

    // Beneficiary Modal
    addBenBtn: document.getElementById('addBeneficiaryBtn'),
    benModal: document.getElementById('beneficiaryModal'),
    benForm: document.getElementById('beneficiaryForm'),
};

// --- Formatters ---
const fmtUSD = (n) => `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)}`;
const fmtBDT = (n) => `৳${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)}`;

// --- Initialization ---
function init() {
    // Set default dates to today
    const today = new Date().toISOString().split('T')[0];
    els.incDate.value = today;
    els.outDate.value = today;

    setupEventListeners();

    // Subscribe to store updates
    store.subscribe(render);

    // Responsive Layout Handler
    setupResponsiveLayout();
}

// --- Responsive Layout ---
function setupResponsiveLayout() {
    const monthNav = document.querySelector('.month-navigator');
    const headerLeft = document.querySelector('.header-left');
    const mobileLoc = document.getElementById('mobileDateLocation');

    const handleResize = () => {
        if (window.innerWidth <= 768) {
            // Move to mobile location if not already there
            if (mobileLoc && monthNav && mobileLoc.children.length === 0) {
                mobileLoc.appendChild(monthNav);
            }
        } else {
            // Move back to header if not already there
            if (headerLeft && monthNav && headerLeft.children.length < 2) { // h1 is first child
                // Ensure it goes after h1
                if (headerLeft.children.length > 0) {
                    headerLeft.appendChild(monthNav);
                } else {
                    headerLeft.appendChild(monthNav);
                }
            }
        }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
}

// --- Event Listeners ---
function setupEventListeners() {
    // Tabs
    els.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            els.tabBtns.forEach(b => b.classList.remove('active'));
            els.tabContents.forEach(c => c.style.display = 'none');

            btn.classList.add('active');
            const tabId = btn.dataset.tab + 'Tab';
            document.getElementById(tabId).style.display = 'block';
        });
    });

    // Settings Modal
    els.settingsBtn.addEventListener('click', () => {
        const { openingBalanceUSD, openingBalanceBDT } = store.state.settings;
        els.setOpeningUSD.value = openingBalanceUSD || 0;
        els.setOpeningBDT.value = openingBalanceBDT || 0;
        els.settingsModal.classList.add('open');
    });

    els.settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        store.saveSettings({
            ...store.state.settings,
            openingBalanceUSD: parseFloat(els.setOpeningUSD.value),
            openingBalanceBDT: parseFloat(els.setOpeningBDT.value)
        });
        els.settingsModal.classList.remove('open');
    });

    // Sidebar Logic
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarReportBtn = document.getElementById('sidebarReportBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    const sidebarSettingsBtn = document.getElementById('sidebarSettingsBtn');
    const openReportModalBtn = document.getElementById('openReportModalBtn');

    const openSidebar = () => {
        mobileSidebar.classList.add('open');
        mobileSidebarOverlay.classList.add('open');
    };

    const closeSidebar = () => {
        mobileSidebar.classList.remove('open');
        mobileSidebarOverlay.classList.remove('open');
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (mobileSidebarOverlay) mobileSidebarOverlay.addEventListener('click', closeSidebar);

    // Sidebar Action Wiring
    if (sidebarSettingsBtn) {
        sidebarSettingsBtn.addEventListener('click', () => {
            closeSidebar();
            const settingsBtn = document.getElementById('openSettingsBtn');
            if (settingsBtn) settingsBtn.click();
        });
    }

    if (sidebarReportBtn) {
        sidebarReportBtn.addEventListener('click', () => {
            closeSidebar();
            if (openReportModalBtn) openReportModalBtn.click();
        });
    }

    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', () => {
            closeSidebar();
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.click();
        });
    }

    // Beneficiary Modal
    els.addBenBtn.addEventListener('click', (e) => {
        e.preventDefault(); // prevent form submit if inside form
        els.benModal.classList.add('open');
    });

    els.benForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(els.benForm);
        store.addBeneficiary({
            name: formData.get('name') || formData.get('nickname'), // Fallback if name changed
            nickname: formData.get('nickname'),
            bankName: formData.get('bankName'),
            accountNo: formData.get('accountNo'),
            branch: formData.get('branch'),
            accountName: formData.get('accountName')
        });
        els.benForm.reset();
        els.benModal.classList.remove('open');
    });

    // Smart Calculations (Incoming)
    setupSmartCalc(els.incUSD, els.incBDT, els.incRate);

    // Smart Calculations (Outgoing)
    setupSmartCalc(els.outUSD, els.outBDT, els.outRate);

    // Incoming Form Submit
    els.incForm.addEventListener('submit', (e) => {
        e.preventDefault();
        store.addTransaction({
            date: els.incDate.value,
            type: 'incoming',
            subType: els.incType.value,
            source: els.incSource.value,
            rate: parseFloat(els.incRate.value) || 0,
            amountUSD: parseFloat(els.incUSD.value) || 0,
            amountBDT: parseFloat(els.incBDT.value) || 0,
            status: 'received' // Incoming is always received immediately for now? 
            // Actually prompt doesn't specify pending for incoming, only for outgoing.
        });
        els.incForm.reset();
        els.incDate.value = new Date().toISOString().split('T')[0]; // Reset date to today
    });

    // Outgoing Form Submit
    els.outForm.addEventListener('submit', (e) => {
        e.preventDefault();
        store.addTransaction({
            date: els.outDate.value,
            type: 'outgoing',
            beneficiaryId: els.outBeneficiary.value,
            rate: parseFloat(els.outRate.value) || 0,
            amountUSD: parseFloat(els.outUSD.value) || 0,
            amountBDT: parseFloat(els.outBDT.value) || 0,
            status: 'pending' // Default status
        });
        els.outForm.reset();
        els.outDate.value = new Date().toISOString().split('T')[0];
        els.bankPreview.style.display = 'none';
    });

    // Beneficiary Selection Change
    els.outBeneficiary.addEventListener('change', () => {
        const benId = els.outBeneficiary.value;
        const ben = store.state.beneficiaries.find(b => b.id === benId);
        if (ben) {
            els.prevBankName.textContent = ben.bankName;
            els.prevAccNo.textContent = `Acc: ${ben.accountNo}`;
            els.bankPreview.style.display = 'block';
        } else {
            els.bankPreview.style.display = 'none';
        }
    });

    // Pay Button Click (Event Delegation)
    els.outTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('pay-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Mark this transaction as PAID? Liquidity will be deducted.')) {
                store.markAsPaid(id);
            }
        }
    });
}

function setupSmartCalc(usdInput, bdtInput, rateInput) {
    const getRate = () => {
        const r = parseFloat(rateInput.value);
        if (r) return r;
        // Auto-fill from history
        const lastRate = store.state.settings.lastRate;
        if (lastRate) {
            rateInput.value = lastRate;
            return lastRate;
        }
        return 0;
    };

    usdInput.addEventListener('input', () => {
        const rate = getRate();
        if (rate && usdInput.value) {
            bdtInput.value = (parseFloat(usdInput.value) * rate).toFixed(2);
        }
    });

    bdtInput.addEventListener('input', () => {
        const rate = getRate();
        if (rate && bdtInput.value) {
            usdInput.value = (parseFloat(bdtInput.value) / rate).toFixed(2);
        }
    });

    // If rate changes, update BDT if USD is present (priority to USD source)
    rateInput.addEventListener('input', () => {
        if (usdInput.value) {
            bdtInput.value = (parseFloat(usdInput.value) * parseFloat(rateInput.value)).toFixed(2);
        }
    });
}

// --- Render ---
function render(state) {
    // Dashboard
    els.liqUSD.textContent = fmtUSD(state.liquidity.usd);
    els.liqBDT.textContent = fmtBDT(state.liquidity.bdt);
    els.receipts.textContent = `${fmtUSD(state.liquidity.totalReceiptsUSD)} / ${fmtBDT(state.liquidity.totalReceiptsBDT)}`;
    els.disbursements.textContent = `${fmtUSD(state.liquidity.totalDisbursedUSD)} / ${fmtBDT(state.liquidity.totalDisbursedBDT)}`;

    // Beneficiary Dropdown (preserve selection if possible, otherwise it resets on re-render, 
    // but simpler to just re-populate. If user is typing, this might be annoying, 
    // but state updates only happen on submit/action, not typing.)
    // Actually, re-rendering dropdown on every keypress (if we had that) would be bad. 
    // But store notify only happens on CRUD.

    const currentBen = els.outBeneficiary.value;
    els.outBeneficiary.innerHTML = '<option value="">Select Beneficiary</option>';
    state.beneficiaries.forEach(ben => {
        const opt = document.createElement('option');
        opt.value = ben.id;
        opt.textContent = ben.name;
        els.outBeneficiary.appendChild(opt);
    });
    els.outBeneficiary.value = currentBen;

    // Tables
    renderTables(state.transactions, state.beneficiaries);
}

function renderTables(transactions, beneficiaries) {
    // Incoming
    const incoming = transactions.filter(t => t.type === 'incoming');
    els.incTableBody.innerHTML = incoming.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.source}</td>
      <td><span class="badge ${t.subType === 'receive' ? 'badge-received' : 'badge-pending'}">${t.subType === 'receive' ? 'Receive' : 'Return'}</span></td>
      <td>${fmtUSD(t.amountUSD)}</td>
      <td>${fmtBDT(t.amountBDT)}</td>
      <td>${t.rate}</td>
    </tr>
  `).join('');

    // Outgoing
    const outgoing = transactions.filter(t => t.type === 'outgoing');
    els.outTableBody.innerHTML = outgoing.map(t => {
        const ben = beneficiaries.find(b => b.id === t.beneficiaryId)?.name || 'Unknown';
        const isPaid = t.status === 'paid';
        return `
    <tr>
      <td>${t.date}</td>
      <td>${ben}</td>
      <td>${fmtUSD(t.amountUSD)}</td>
      <td>${fmtBDT(t.amountBDT)}</td>
      <td><span class="badge ${isPaid ? 'badge-paid' : 'badge-pending'}">${isPaid ? 'Paid' : 'Pending'}</span></td>
      <td>
        ${!isPaid ? `<button class="pay-btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" data-id="${t.id}">✔ Pay</button>` : 'COMPLETED'}
      </td>
    </tr>
  `}).join('');
}

// Start
init();
