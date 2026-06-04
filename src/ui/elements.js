export const els = {
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
    incomingView: document.getElementById('incomingTab'),
    outgoingView: document.getElementById('outgoingTab'),

    // Incoming tab
    incLiqUSD: document.getElementById('incLiqUSD'),
    incLiqBDT: document.getElementById('incLiqBDT'),
    incSearch: document.getElementById('incSearch'),
    exportIncBtn: document.getElementById('exportIncBtn'),
    openIncModalBtn: document.getElementById('openIncModalBtn'),
    incTableBody: document.querySelector('#incomingTable tbody'),

    // Outgoing tab
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

    // Money In modal balance strip
    incStripUSD: document.getElementById('incStripUSD'),
    incStripBDT: document.getElementById('incStripBDT'),

    // Money In Form
    incomingForm: document.getElementById('incomingForm'),
    incDate: document.getElementById('incDate'),
    incAccMonth: document.getElementById('incAccMonth'),
    incId: document.getElementById('incId'),
    incType: document.getElementById('incType'),
    incSource: document.getElementById('incSource'),
    incUSD: document.getElementById('incUSD'),
    incBDT: document.getElementById('incBDT'),
    incRate: document.getElementById('incRate'),

    // Money Out Form
    outgoingForm: document.getElementById('outgoingForm'),
    outDate: document.getElementById('outDate'),
    outAccMonth: document.getElementById('outAccMonth'),
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

    // Source Management
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
    benForm: document.getElementById('beneficiaryForm'),

    // Settings
    settingsForm: document.getElementById('settingsForm'),
    setOpeningUSD: document.getElementById('setOpeningUSD'),
    setOpeningBDT: document.getElementById('setOpeningBDT'),
    openingBalanceSection: document.getElementById('openingBalanceSection'),
    clearDataBtn: document.getElementById('clearDataBtn'),
    downloadBackupBtn: document.getElementById('downloadBackupBtn'),

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

    // Login / Logout
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    loginPassword: document.getElementById('loginPassword'),
    logoutBtn: document.getElementById('logoutBtn'),
    settingsHeaderTitle: document.getElementById('settingsHeaderTitle'),

    // Mobile Sidebar
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileSidebar: document.getElementById('mobileSidebar'),
    mobileSidebarOverlay: document.getElementById('mobileSidebarOverlay'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    sidebarReportBtn: document.getElementById('sidebarReportBtn'),
    sidebarLogoutBtn: document.getElementById('sidebarLogoutBtn'),
    sidebarSettingsBtn: document.getElementById('sidebarSettingsBtn'),
};
