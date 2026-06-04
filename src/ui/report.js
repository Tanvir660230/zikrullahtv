import { store } from '../store/store.js';
import { fmtUSD, fmtBDT, showToast } from '../utils/utils.js';
import { els } from './elements.js';

export function generateMonthlyReport() {
    const { transactions, liquidity, selectedMonth, beneficiaries } = store.state;

    const [y, m] = selectedMonth.split('-');
    const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    els.repMonth.textContent = monthName;
    els.repGenDate.textContent = new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });

    const fmtBDTNoCents = (n) => `৳${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n || 0))}`;
    const fmtUSDNoCents = (n) => `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n || 0))}`;

    els.repOpening.textContent = fmtBDTNoCents(liquidity.openingBDT);
    els.repOpeningUSD.textContent = fmtUSDNoCents(liquidity.openingUSD);
    els.repTotalIn.textContent = fmtBDTNoCents(liquidity.monthReceiptsBDT);
    els.repTotalInUSD.textContent = fmtUSDNoCents(liquidity.monthReceiptsUSD);
    els.repTotalOut.textContent = fmtBDTNoCents(liquidity.monthDisbursedBDT);
    els.repTotalOutUSD.textContent = fmtUSDNoCents(liquidity.monthDisbursedUSD);
    els.repClosing.textContent = fmtBDTNoCents(liquidity.closingBDT);
    els.repClosingUSD.textContent = fmtUSDNoCents(liquidity.closingUSD);

    const monthlyOutTxs = transactions.filter(t => (t.accountingMonth || t.date.slice(0, 7)) === selectedMonth && t.type === 'outgoing');
    let monthlyLiabilitiesBDT = 0;
    monthlyOutTxs.forEach(t => {
        if (t.status === 'pending' || t.status === 'hold') monthlyLiabilitiesBDT += parseFloat(t.amountBDT || 0);
    });

    const netFlowBDT = liquidity.monthReceiptsBDT - liquidity.monthDisbursedBDT;
    const projectedNetFlowBDT = netFlowBDT - monthlyLiabilitiesBDT;

    els.repNetFlow.textContent = fmtBDTNoCents(liquidity.closingBDT);
    els.repNetFlowUSD.textContent = fmtUSDNoCents(liquidity.closingUSD);

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

    // Group Money In by source
    const incTxs = transactions.filter(t => t.type === 'incoming' && (t.accountingMonth || t.date.slice(0, 7)) === selectedMonth && t.status !== 'hold');
    const sourceGroups = {};
    incTxs.forEach(t => {
        if (!sourceGroups[t.source]) sourceGroups[t.source] = { bdt: 0, usd: 0 };
        const b = parseFloat(t.amountBDT || 0), u = parseFloat(t.amountUSD || 0);
        if (t.subType === 'return') { sourceGroups[t.source].bdt -= b; sourceGroups[t.source].usd -= u; }
        else { sourceGroups[t.source].bdt += b; sourceGroups[t.source].usd += u; }
    });

    // Group paid outgoing by receiver
    const outTxs = transactions.filter(t => t.type === 'outgoing' && (t.accountingMonth || t.date.slice(0, 7)) === selectedMonth && t.status === 'paid');
    const benGroups = {};
    outTxs.forEach(t => {
        const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
        const name = ben ? ben.nickname || ben.name : (t.beneficiaryName || 'Unknown');
        if (!benGroups[name]) benGroups[name] = { bdt: 0, usd: 0 };
        benGroups[name].bdt += parseFloat(t.amountBDT || 0);
        benGroups[name].usd += parseFloat(t.amountUSD || 0);
    });

    // Group pending/hold outgoing
    const pendingOutTxs = transactions.filter(t => t.type === 'outgoing' && (t.accountingMonth || t.date.slice(0, 7)) === selectedMonth && ['pending', 'hold'].includes(t.status));
    const pendingBenGroups = {};
    pendingOutTxs.forEach(t => {
        const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
        const name = ben ? ben.nickname || ben.name : 'Unknown';
        if (!pendingBenGroups[name]) pendingBenGroups[name] = { bdt: 0, usd: 0 };
        pendingBenGroups[name].bdt += parseFloat(t.amountBDT || 0);
        pendingBenGroups[name].usd += parseFloat(t.amountUSD || 0);
    });

    const sortedSources = Object.entries(sourceGroups).sort((a, b) => a[0].localeCompare(b[0]));
    els.repInBody.innerHTML = sortedSources.map(([name, data]) => `
        <tr style="border-bottom:1px solid var(--border-light);">
            <td style="font-weight:500;font-size:0.95rem;vertical-align:middle;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">
                <span style="display:inline-block;vertical-align:middle;width:8px;height:8px;border-radius:50%;background:var(--success);margin-right:4px;"></span><span style="vertical-align:middle;">${name}</span>
            </td>
            <td class="text-right" style="color:var(--success-text);font-weight:500;">${fmtUSD(data.usd)}</td>
            <td class="text-right" style="font-weight:600;color:#111;">${fmtBDT(data.bdt)}</td>
        </tr>
    `).join('');
    els.repInTotal.textContent = fmtBDT(liquidity.monthReceiptsBDT);
    els.repInTotalUSD.textContent = fmtUSD(liquidity.monthReceiptsUSD);

    const sortedBens = Object.entries(benGroups).sort((a, b) => a[0].localeCompare(b[0]));
    const sortedPendingBens = Object.entries(pendingBenGroups).sort((a, b) => a[0].localeCompare(b[0]));
    let pendingTotalBDT = 0, pendingTotalUSD = 0;
    sortedPendingBens.forEach(([, d]) => { pendingTotalBDT += d.bdt; pendingTotalUSD += d.usd; });

    const paidRows = sortedBens.map(([name, data]) => `
        <tr style="border-bottom:1px solid var(--border-light);">
            <td style="font-weight:500;font-size:0.95rem;vertical-align:middle;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">
                <span style="display:inline-block;vertical-align:middle;width:8px;height:8px;border-radius:50%;background:var(--danger);margin-right:4px;"></span><span style="vertical-align:middle;">${name}</span>
            </td>
            <td class="text-right" style="color:var(--danger-text);font-weight:500;">${fmtUSD(data.usd)}</td>
            <td class="text-right" style="font-weight:600;color:#111;">${fmtBDT(data.bdt)}</td>
        </tr>
    `).join('');

    let pendingRows = '';
    if (sortedPendingBens.length > 0) {
        pendingRows = `<tr style="background:#fff8e1;"><td colspan="3" style="font-weight:700;color:#92400e;text-align:center;padding:5px 8px;font-size:0.8rem;letter-spacing:0.05em;">PENDING LIABILITIES (Not Yet Paid)</td></tr>` +
        sortedPendingBens.map(([name, data]) => `
            <tr style="border-bottom:1px solid #fde68a;background:#fffbeb;">
                <td style="font-weight:500;font-size:0.95rem;vertical-align:middle;max-width:140px;overflow:hidden;text-overflow:ellipsis;">
                    <span style="display:inline-block;vertical-align:middle;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:4px;"></span><span style="vertical-align:middle;color:#92400e;">${name}</span>
                </td>
                <td class="text-right" style="color:#b45309;font-weight:500;">${fmtUSD(data.usd)}</td>
                <td class="text-right" style="font-weight:600;color:#92400e;">${fmtBDT(data.bdt)}</td>
            </tr>
        `).join('') +
        `<tr style="background:#fef3c7;font-weight:700;"><td style="color:#92400e;font-size:0.85rem;">Pending Total</td><td class="text-right" style="color:#b45309;">${fmtUSD(pendingTotalUSD)}</td><td class="text-right" style="color:#92400e;">${fmtBDT(pendingTotalBDT)}</td></tr>`;
    }

    els.repOutBody.innerHTML = paidRows + pendingRows;
    els.repOutTotal.textContent = fmtBDT(liquidity.monthDisbursedBDT);
    els.repOutTotalUSD.textContent = fmtUSD(liquidity.monthDisbursedUSD);
}

export function exportCEOReportCSV() {
    const { transactions, liquidity, selectedMonth, beneficiaries } = store.state;
    const [y, m] = selectedMonth.split('-');
    const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    const sourceGroups = {};
    transactions.filter(t => t.type === 'incoming' && (t.accountingMonth || t.date.slice(0, 7)) === selectedMonth && t.status !== 'hold').forEach(t => {
        if (!sourceGroups[t.source]) sourceGroups[t.source] = { bdt: 0, usd: 0 };
        const b = parseFloat(t.amountBDT || 0), u = parseFloat(t.amountUSD || 0);
        if (t.subType === 'return') { sourceGroups[t.source].bdt -= b; sourceGroups[t.source].usd -= u; }
        else { sourceGroups[t.source].bdt += b; sourceGroups[t.source].usd += u; }
    });

    const benGroups = {};
    transactions.filter(t => t.type === 'outgoing' && (t.accountingMonth || t.date.slice(0, 7)) === selectedMonth && t.status === 'paid').forEach(t => {
        const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
        const name = ben ? ben.nickname || ben.name : (t.beneficiaryName || 'Unknown');
        if (!benGroups[name]) benGroups[name] = { bdt: 0, usd: 0 };
        benGroups[name].bdt += parseFloat(t.amountBDT || 0);
        benGroups[name].usd += parseFloat(t.amountUSD || 0);
    });

    const pendingBenGroups = {};
    transactions.filter(t => t.type === 'outgoing' && (t.accountingMonth || t.date.slice(0, 7)) === selectedMonth && ['pending', 'hold'].includes(t.status)).forEach(t => {
        const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
        const name = ben ? ben.nickname || ben.name : (t.beneficiaryName || 'Unknown');
        if (!pendingBenGroups[name]) pendingBenGroups[name] = { bdt: 0, usd: 0 };
        pendingBenGroups[name].bdt += parseFloat(t.amountBDT || 0);
        pendingBenGroups[name].usd += parseFloat(t.amountUSD || 0);
    });

    const sortedSources = Object.entries(sourceGroups).sort((a, b) => a[0].localeCompare(b[0]));
    const sortedBens = Object.entries(benGroups).sort((a, b) => a[0].localeCompare(b[0]));
    const sortedPending = Object.entries(pendingBenGroups).sort((a, b) => a[0].localeCompare(b[0]));
    let pendingTotalUSD = 0, pendingTotalBDT = 0;
    sortedPending.forEach(([, d]) => { pendingTotalUSD += d.usd; pendingTotalBDT += d.bdt; });

    let csv = `Zikrullah TV LLC - EXECUTIVE FINANCIAL OPERATIONS REPORT\n`;
    csv += `Report Period,${monthName}\nGenerated On,${new Date().toLocaleDateString()}\n\n`;
    csv += `EXECUTIVE SUMMARY\nCategory,USD Amount,BDT Amount (৳)\n`;
    csv += `Opening Balance,${liquidity.openingUSD.toFixed(2)},${liquidity.openingBDT.toFixed(2)}\n`;
    csv += `Total Money In,${liquidity.monthReceiptsUSD.toFixed(2)},${liquidity.monthReceiptsBDT.toFixed(2)}\n`;
    csv += `Total Money Out (Paid),${liquidity.monthDisbursedUSD.toFixed(2)},${liquidity.monthDisbursedBDT.toFixed(2)}\n`;
    csv += `Pending Liabilities,${pendingTotalUSD.toFixed(2)},${pendingTotalBDT.toFixed(2)}\n`;
    csv += `Closing Balance,${liquidity.closingUSD.toFixed(2)},${liquidity.closingBDT.toFixed(2)}\n\n`;
    csv += `MONEY IN (BY PAYER)\nPayer Name,USD Amount,BDT Total (৳)\n`;
    sortedSources.forEach(([name, data]) => { csv += `"${name}",${data.usd.toFixed(2)},${data.bdt.toFixed(2)}\n`; });
    csv += `TOTAL IN,${liquidity.monthReceiptsUSD.toFixed(2)},${liquidity.monthReceiptsBDT.toFixed(2)}\n\n`;
    csv += `MONEY OUT - PAID (BY RECEIVER)\nReceiver Name,USD Amount,BDT Total (৳)\n`;
    sortedBens.forEach(([name, data]) => { csv += `"${name}",${data.usd.toFixed(2)},${data.bdt.toFixed(2)}\n`; });
    csv += `TOTAL PAID OUT,${liquidity.monthDisbursedUSD.toFixed(2)},${liquidity.monthDisbursedBDT.toFixed(2)}\n\n`;
    if (sortedPending.length > 0) {
        csv += `PENDING LIABILITIES (NOT YET PAID)\nReceiver Name,USD Amount,BDT Total (৳)\n`;
        sortedPending.forEach(([name, data]) => { csv += `"${name}",${data.usd.toFixed(2)},${data.bdt.toFixed(2)}\n`; });
        csv += `TOTAL PENDING,${pendingTotalUSD.toFixed(2)},${pendingTotalBDT.toFixed(2)}\n`;
    }

    _triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `Zikrullah_TV_CEO_Report_${selectedMonth}.csv`);
}

export function exportCSV(type) {
    const { transactions, selectedMonth } = store.state;
    const txs = transactions.filter(t => t.type === type && (t.accountingMonth || t.date.slice(0, 7)) === selectedMonth);

    if (txs.length === 0) { showToast('No data to export', 'error'); return; }

    const headers = type === 'incoming'
        ? ['Date', 'Type', 'Source', 'USD', 'BDT', 'Rate']
        : ['Date', 'Receiver', 'USD', 'BDT', 'Rate', 'Status'];

    const rows = txs.map(t => {
        if (type === 'incoming') return [t.date, t.subType, t.source, t.amountUSD, t.amountBDT, t.rate];
        const ben = store.state.beneficiaries.find(b => b.id === t.beneficiaryId);
        const name = ben ? ben.nickname || ben.name : (t.beneficiaryName || 'Unknown');
        return [t.date, name, t.amountUSD, t.amountBDT, t.rate, t.status];
    });

    const escapeCSV = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csvContent = [headers.map(escapeCSV).join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
    _triggerDownload(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), `${type}_${selectedMonth}.csv`);
}

export function downloadFullBackup() {
    const data = { state: store.state, exportDate: new Date().toISOString(), version: '1.0' };
    const json = JSON.stringify(data, null, 2);
    _triggerDownload(new Blob([json], { type: 'application/json' }), `zikrullah_tv_backup_${new Date().toISOString().slice(0, 10)}.json`);
    showToast('Backup downloaded successfully', 'success');
}

export function downloadBankStatement(transactions, beneficiaries, month, year) {
    try {
        let filtered = transactions;
        let title = 'Full Transaction History';
        let fileName = 'full_history.csv';

        if (month) {
            const targetPrefix = `${year}-${month}`;
            filtered = transactions.filter(t => (t.accountingMonth || t.date.slice(0, 7)) === targetPrefix).sort((a, b) => a.date.localeCompare(b.date));
            title = `Account Statement - ${month}/${year}`;
            fileName = `statement_${year}_${month}.csv`;
        } else {
            filtered = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
        }

        if (filtered.length === 0) { showToast('No transactions found to download.', 'info'); return; }

        const headers = ['Date', 'Type', 'Ref/Identity', 'USD', 'BDT', 'Rate', 'Status'];
        let csvContent = `${title}\n\n${headers.join(',')}\n`;

        filtered.forEach(tx => {
            const ben = beneficiaries.find(b => b.id === tx.beneficiaryId);
            const identity = tx.type === 'incoming' ? (tx.source || 'Unknown') : (ben ? ben.nickname || ben.name : (tx.beneficiaryName || 'Unknown'));
            const typeLabel = tx.type === 'incoming' ? (tx.subType === 'return' ? 'Return' : 'Receive') : 'Payout';
            csvContent += [
                tx.date,
                `"${typeLabel}"`,
                `"${identity.replace(/"/g, '""')}"`,
                (parseFloat(tx.amountUSD) || 0).toFixed(2),
                (parseFloat(tx.amountBDT) || 0).toFixed(2),
                (parseFloat(tx.rate) || 0).toFixed(2),
                `"${tx.status || 'received'}"`
            ].join(',') + '\n';
        });

        const BOM = '﻿';
        _triggerDownload(new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' }), fileName);
        showToast('Download Started', 'success');
    } catch (error) {
        console.error('Download Logic Error:', error);
        showToast('System Error: File could not be generated.', 'error');
    }
}

// Internal helper — not exported
function _triggerDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { if (document.body.contains(link)) document.body.removeChild(link); URL.revokeObjectURL(url); }, 1000);
}
