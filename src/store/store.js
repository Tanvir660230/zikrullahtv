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
                closingBDT: 0,
                averageBuyRate: 0,
                impliedRate: 0
            },
            sortConfig: {
                field: 'date',
                direction: 'desc'
            },
            isOnline: false,
            isLoading: true
        };
        this.listeners = [];
        this.init();
    }

    async init() {
        if (db.initPromise) {
            const result = await db.initPromise;
            this.state.isOnline = result.online;
            if (!result.online) {
                // Firebase failed — stop spinner, show zeros
                this.state.isLoading = false;
                this.notify();
                return;
            }
        }
        this.setupSubscriptions();
    }

    setupSubscriptions() {
        // Track all 4 subscriptions — only stop loading when ALL have responded
        const ready = { settings: false, transactions: false, beneficiaries: false, sources: false };
        const checkAllReady = () => {
            if (Object.values(ready).every(Boolean)) {
                this.state.isLoading = false;
            }
        };

        // 1. Settings
        db.subscribeToSettings((settings) => {
            if (settings) {
                this.state.settings = settings;
                this.calculateLiquidity();
            }
            ready.settings = true;
            checkAllReady();
            this.notify();
        });

        // 2. Transactions
        db.subscribeToCollection('transactions', (data) => {
            this.state.transactions = data;
            this.calculateLiquidity();
            ready.transactions = true;
            checkAllReady();
            this.notify();
        });

        // 3. Beneficiaries
        db.subscribeToCollection('beneficiaries', (data) => {
            this.state.beneficiaries = data;
            this.state.beneficiaries.sort((a, b) => (a.nickname || a.name || '').localeCompare(b.nickname || b.name || ''));
            ready.beneficiaries = true;
            checkAllReady();
            this.notify();
        });

        // 4. Sources
        db.subscribeToCollection('sources', (data) => {
            this.state.sources = data;
            this.state.sources.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            ready.sources = true;
            checkAllReady();
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
        const selectedMonth = this.state.selectedMonth; // "YYYY-MM"

        const globalOpenUSD = parseFloat(this.state.settings?.openingBalanceUSD) || 0;
        const globalOpenBDT = parseFloat(this.state.settings?.openingBalanceBDT) || 0;

        // Weighted Average Buy Rate — weighted sum of (USD × rate) / total USD
        // Opening balance included only when both sides are set (implies a known starting rate)
        let totalWeightedBDT = (globalOpenUSD > 0 && globalOpenBDT > 0) ? globalOpenBDT : 0;
        let totalLifetimeUSDIn = (globalOpenUSD > 0 && globalOpenBDT > 0) ? globalOpenUSD : 0;

        // Previous Month Carry Over Calculation
        let prevPeriodUSD = 0;
        let prevPeriodBDT = 0;

        // Current Month Metrics
        let monthReceiptsUSD = 0;
        let monthReceiptsBDT = 0;
        let monthDisbursedUSD = 0;
        let monthDisbursedBDT = 0;

        this.state.transactions.forEach(tx => {
            // Priority: Explicit Accounting Month -> Derived from Transaction Date
            const txMonth = tx.accountingMonth || (tx.date ? tx.date.slice(0, 7) : '');
            if (!txMonth) return;

            // Robust parsing
            const amountUSD = Number(tx.amountUSD) || 0;
            const amountBDT = Number(tx.amountBDT) || 0;

            // Weighted average — only transactions up to (and including) selected month
            if (tx.type === 'incoming' && tx.status !== 'hold' && tx.subType !== 'return'
                && amountUSD > 0 && txMonth <= selectedMonth) {
                const txRate = Number(tx.rate) > 0
                    ? Number(tx.rate)
                    : (amountBDT > 0 ? amountBDT / amountUSD : 0);
                if (txRate > 0) {
                    totalLifetimeUSDIn += amountUSD;
                    totalWeightedBDT += amountUSD * txRate;
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

        // Final Weighted Average Buy Rate = total weighted BDT / total USD in
        let averageBuyRate = 0;
        if (totalLifetimeUSDIn > 0 && totalWeightedBDT > 0) {
            averageBuyRate = totalWeightedBDT / totalLifetimeUSDIn;
        }

        // Fallback if result is 0, Infinity, or NaN
        if (!isFinite(averageBuyRate) || averageBuyRate <= 0) {
            const lastIncomingTx = [...this.state.transactions].reverse().find(t => t.type === 'incoming' && parseFloat(t.rate) > 0);
            averageBuyRate = lastIncomingTx ? parseFloat(lastIncomingTx.rate) : (parseFloat(this.state.settings.lastRate) || 0);
        }

        // Implied rate = actual BDT/USD ratio of current balance (for dashboard display)
        // Falls back to avg buy rate when either side is zero or negative
        const impliedRate = (closingUSD > 0 && closingBDT > 0)
            ? closingBDT / closingUSD
            : averageBuyRate;

        this.state.liquidity = {
            openingUSD,
            openingBDT,
            monthReceiptsUSD,
            monthReceiptsBDT,
            monthDisbursedUSD,
            monthDisbursedBDT,
            closingUSD,
            closingBDT,
            averageBuyRate,
            impliedRate
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

        // Only save lastRate from incoming receipts — outgoing rate is irrelevant for avg rate fallback
        if (tx.type === 'incoming' && tx.subType !== 'return' && tx.rate) {
            const newSettings = { ...this.state.settings, lastRate: tx.rate };
            await db.saveSettings(newSettings);
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

    async deleteTransaction(id) {
        const tx = this.state.transactions.find(t => t.id === id);
        if (tx?.status === 'paid') throw new Error('Paid records cannot be deleted.');
        await db.deleteTransaction(id);
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
