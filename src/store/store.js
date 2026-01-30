import { db } from '../services/db.js';

class Store {
    constructor() {
        this.state = {
            settings: { openingBalanceUSD: 0, openingBalanceBDT: 0, lastRate: 0 },
            transactions: [],
            beneficiaries: [],
            sources: [],
            selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
            liquidity: {
                openingUSD: 0,
                openingBDT: 0,
                monthReceiptsUSD: 0,
                monthReceiptsBDT: 0,
                monthDisbursedUSD: 0,
                monthDisbursedBDT: 0,
                closingUSD: 0,
                closingBDT: 0
            },
            sortConfig: {
                field: 'date',
                direction: 'desc'
            },
            isOnline: false
        };
        this.listeners = [];
        this.init();
    }

    async init() {
        // Wait for DB to be ready (load firebase SDK)
        if (db.initPromise) {
            this.state.isOnline = await db.initPromise;
        }

        // Give a small delay for DB check if needed, though db.init is usually fast or async
        // Better: just start subscriptions. 
        this.setupSubscriptions();
    }

    setupSubscriptions() {
        // 1. Settings
        db.subscribeToSettings((settings) => {
            if (settings) {
                this.state.settings = settings;
                this.calculateLiquidity();
                this.notify();
            }
        });

        // 2. Transactions
        db.subscribeToCollection('transactions', (data) => {
            this.state.transactions = data;
            this.calculateLiquidity();
            this.notify();
        });

        // 3. Beneficiaries
        db.subscribeToCollection('beneficiaries', (data) => {
            this.state.beneficiaries = data;
            // Sort by nickname/name
            this.state.beneficiaries.sort((a, b) => (a.nickname || a.name || '').localeCompare(b.nickname || b.name || ''));
            this.notify();
        });

        // 4. Sources
        db.subscribeToCollection('sources', (data) => {
            this.state.sources = data;
            this.state.sources.sort((a, b) => a.name.localeCompare(b.name));
            this.notify();
        });
    }

    subscribe(listener) {
        this.listeners.push(listener);
        // Initial call
        listener(this.state);
        return () => this.listeners = this.listeners.filter(l => l !== listener);
    }

    notify() {
        this.listeners.forEach(l => l(this.state));
    }

    setMonth(yyyyMM) {
        this.state.selectedMonth = yyyyMM;
        this.calculateLiquidity();
        this.notify();
    }

    setSort(field) {
        if (this.state.sortConfig.field === field) {
            this.state.sortConfig.direction = this.state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortConfig.field = field;
            this.state.sortConfig.direction = 'asc';
        }
        this.notify();
    }

    calculateLiquidity() {
        const { openingBalanceUSD, openingBalanceBDT } = this.state.settings;
        const selectedMonth = this.state.selectedMonth; // "YYYY-MM"

        // Global Opening Balance (Base) - Always ensure these are valid numbers
        const globalOpenUSD = parseFloat(this.state.settings?.openingBalanceUSD) || 0;
        const globalOpenBDT = parseFloat(this.state.settings?.openingBalanceBDT) || 0;

        // Average Rate Calculation (Weighted basis of all incoming money)
        let totalLifetimeUSDIn = globalOpenUSD;
        let totalLifetimeBDTIn = globalOpenBDT;

        // Previous Month Carry Over Calculation
        let prevPeriodUSD = 0;
        let prevPeriodBDT = 0;

        // Current Month Metrics
        let monthReceiptsUSD = 0;
        let monthReceiptsBDT = 0;
        let monthDisbursedUSD = 0;
        let monthDisbursedBDT = 0;

        this.state.transactions.forEach(tx => {
            const txDate = tx.date; // YYYY-MM-DD
            const txMonth = txDate.slice(0, 7); // YYYY-MM

            // Robust parsing
            const amountUSD = Number(tx.amountUSD) || 0;
            const amountBDT = Number(tx.amountBDT) || 0;

            // Accumulate Lifetime Incoming for Average Rate
            // We only count money that ACTUALLY added USD liquidity
            if (tx.type === 'incoming' && tx.status !== 'hold') {
                if (tx.subType === 'return') {
                    // Returns reduce our total BDT/USD pool
                    totalLifetimeUSDIn -= amountUSD;
                    totalLifetimeBDTIn -= amountBDT;
                } else {
                    // Receipts add to our pool
                    totalLifetimeUSDIn += amountUSD;
                    totalLifetimeBDTIn += amountBDT;
                }
            }

            // Logic for Selected Month:
            if (txMonth < selectedMonth) {
                // Historic Transaction -> Carry Over
                if (tx.type === 'incoming') {
                    if (tx.status !== 'hold') { // Only count if not held
                        if (tx.subType === 'return') {
                            prevPeriodUSD -= amountUSD;
                            prevPeriodBDT -= amountBDT;
                        } else {
                            prevPeriodUSD += amountUSD;
                            prevPeriodBDT += amountBDT;
                        }
                    }
                } else if (tx.type === 'outgoing' && tx.status === 'paid') {
                    prevPeriodUSD -= amountUSD;
                    prevPeriodBDT -= amountBDT;
                }
            } else if (txMonth === selectedMonth) {
                // Current Month Transaction
                if (tx.type === 'incoming') {
                    if (tx.status !== 'hold') { // Only count if not held
                        if (tx.subType === 'return') {
                            monthReceiptsUSD -= amountUSD;
                            monthReceiptsBDT -= amountBDT;
                        } else {
                            monthReceiptsUSD += amountUSD;
                            monthReceiptsBDT += amountBDT;
                        }
                    }
                } else if (tx.type === 'outgoing' && tx.status === 'paid') {
                    monthDisbursedUSD += amountUSD;
                    monthDisbursedBDT += amountBDT;
                }
            }
        });

        // Opening Balance for Selected Month = Global Base + All Previous Activity
        const openingUSD = globalOpenUSD + prevPeriodUSD;
        const openingBDT = globalOpenBDT + prevPeriodBDT;

        // Net Flow for Selected Month
        const netMonthUSD = monthReceiptsUSD - monthDisbursedUSD;
        const netMonthBDT = monthReceiptsBDT - monthDisbursedBDT;

        // Closing Balance = Opening + Net Flow
        const closingUSD = openingUSD + netMonthUSD;
        const closingBDT = openingBDT + netMonthBDT;

        // Final Average Buy Rate calculation
        let averageBuyRate = 0;
        if (totalLifetimeUSDIn > 0 && totalLifetimeBDTIn > 0) {
            averageBuyRate = totalLifetimeBDTIn / totalLifetimeUSDIn;
        }

        // If we still have 0, try to use the most recent transaction rate or settings rate as a fallback
        if (averageBuyRate <= 0) {
            const lastIncomingTx = this.state.transactions.find(t => t.type === 'incoming' && t.rate > 0);
            averageBuyRate = lastIncomingTx ? lastIncomingTx.rate : (this.state.settings.lastRate || 0);
        }

        this.state.liquidity = {
            openingUSD,
            openingBDT,
            monthReceiptsUSD,
            monthReceiptsBDT,
            monthDisbursedUSD,
            monthDisbursedBDT,
            closingUSD,
            closingBDT,
            averageBuyRate
        };
    }

    // --- Actions ---

    async saveSettings(cleanSettings) {
        await db.saveSettings(cleanSettings);
        // Listener will update state
    }

    async addTransaction(tx) {
        await db.addTransaction(tx);
        // Listener will update state

        // Update last known rate if present - this triggers a setting save
        if (tx.rate) {
            const newSettings = { ...this.state.settings, lastRate: tx.rate };
            // Ensure we don't cause a loop, but saveSettings updates DB which updates listener
            db.saveSettings(newSettings);
        }
    }

    async markAsPaid(id) {
        await db.updateTransactionStatus(id, 'paid');
        // Listener will update state
    }

    async updateTransaction(id, updates) {
        await db.updateTransaction(id, updates);
        // Listener will update state
    }

    async addBeneficiary(ben) {
        await db.addBeneficiary(ben);
    }

    async updateBeneficiary(id, updates) {
        await db.updateBeneficiary(id, updates);
    }

    async deleteBeneficiary(id) {
        await db.deleteBeneficiary(id);
    }

    async deleteAllBeneficiaries() {
        await db.deleteAllBeneficiaries();
    }

    // --- Sources Actions ---

    async addSource(source) {
        await db.addSource(source);
    }

    async updateSource(id, updates) {
        await db.updateSource(id, updates);
    }

    async deleteSource(id) {
        await db.deleteSource(id);
    }

    async clearAllData() {
        await db.clearAll();
        // Listeners should technically fire "empty", but clearAll implementation in DB for Firebase calls deleteDoc loop.
        // It will trigger removing items one by one or in batches.
    }
}

export const store = new Store();
