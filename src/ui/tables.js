import { store } from '../store/store.js';
import { fmtUSD, fmtBDT, escapeHTML } from '../utils/utils.js';
import { els } from './elements.js';

export function populateHistYears() {
    if (!els.histYear) return;
    const txs = store.state.transactions;
    const currentYear = new Date().getFullYear();
    const years = new Set([currentYear]);
    txs.forEach(t => {
        const y = parseInt((t.accountingMonth || t.date || '').slice(0, 4));
        if (y >= 2020 && y <= currentYear + 1) years.add(y);
    });
    const selectedYear = els.histYear.value || String(currentYear);
    els.histYear.innerHTML = [...years].sort().map(y =>
        `<option value="${y}"${String(y) === selectedYear ? ' selected' : ''}>${y}</option>`
    ).join('');
}

export function renderTables(transactions, beneficiaries, selectedMonth, sortConfig) {
    const monthlyTxs = transactions.filter(t => (t.accountingMonth || (t.date ? t.date.slice(0, 7) : '')) === selectedMonth);

    const headers = document.querySelectorAll('th.sortable');
    headers.forEach(h => {
        h.classList.remove('active-asc', 'active-desc');
        if (h.dataset.sort === sortConfig.field) {
            h.classList.add(sortConfig.direction === 'asc' ? 'active-asc' : 'active-desc');
        }
    });

    const incSearchQuery = els.incSearch.value.toLowerCase().trim();
    const outSearchQuery = els.outSearch.value.toLowerCase().trim();

    const sortedTxs = [...monthlyTxs].sort((a, b) => {
        const field = sortConfig.field;
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        let valA, valB;
        if (field === 'beneficiaryId') {
            const benA = beneficiaries.find(ben => ben.id === a.beneficiaryId);
            const benB = beneficiaries.find(ben => ben.id === b.beneficiaryId);
            valA = (benA ? benA.nickname || benA.name : (a.beneficiaryName || '')).toLowerCase();
            valB = (benB ? benB.nickname || benB.name : (b.beneficiaryName || '')).toLowerCase();
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

    // --- Incoming ---
    let incTxs = sortedTxs.filter(t => t.type === 'incoming');
    if (incSearchQuery) {
        incTxs = incTxs.filter(t =>
            (t.source?.toLowerCase() || '').includes(incSearchQuery) ||
            (t.amountBDT?.toString() || '').includes(incSearchQuery) ||
            (t.amountUSD?.toString() || '').includes(incSearchQuery) ||
            (t.date || '').includes(incSearchQuery)
        );
    }

    let totalIncUSD = 0, totalIncBDT = 0;
    incTxs.forEach(t => {
        const u = parseFloat(t.amountUSD || 0);
        const b = parseFloat(t.amountBDT || 0);
        if (t.subType === 'return') { totalIncUSD -= u; totalIncBDT -= b; }
        else { totalIncUSD += u; totalIncBDT += b; }
    });

    els.incTableBody.innerHTML = '';
    if (incTxs.length === 0) {
        const emptyMsg = incSearchQuery ? 'No results match your search.' : 'No money in records for this month.';
        const emptyHint = incSearchQuery ? 'Try a different keyword.' : 'Click "+ Money In" to add a record.';
        els.incTableBody.innerHTML = `<tr><td colspan="8" class="empty-state-cell"><div class="empty-state-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:48px;height:48px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <p>${emptyMsg}</p><span>${emptyHint}</span></div></td></tr>`;
    } else {
        const totalRow = document.createElement('tr');
        totalRow.style.background = 'linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%)';
        totalRow.style.fontWeight = '900';
        totalRow.style.boxShadow = 'inset 0 -2px 0 #16a34a';
        totalRow.innerHTML = `
            <td colspan="3" class="text-center" style="color:#166534;letter-spacing:0.15em;font-size:0.85rem;text-transform:uppercase;">
                <span style="background:#16a34a;color:white;padding:2px 10px;border-radius:4px;font-weight:800;">MONTHLY TOTAL SUMMARY</span>
            </td>
            <td class="amount-column" style="color:#15803d;font-size:1.25rem;">${fmtUSD(totalIncUSD)}</td>
            <td class="amount-column" style="color:#15803d;font-size:1.25rem;">${fmtBDT(totalIncBDT)}</td>
            <td colspan="3"></td>
        `;
        els.incTableBody.appendChild(totalRow);

        incTxs.forEach(tx => {
            const tr = document.createElement('tr');
            tr.className = `status-${tx.status || 'received'} type-${tx.subType}`;
            tr.innerHTML = `
                <td data-label="Date">${escapeHTML(tx.date || '')}</td>
                <td data-label="Payer">${escapeHTML(tx.source || '-')}</td>
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
                <td data-label="Rate" class="text-right">${(parseFloat(tx.rate) || 0).toFixed(2)}</td>
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

    // --- Outgoing ---
    let outTxs = sortedTxs.filter(t => t.type === 'outgoing');
    if (outSearchQuery) {
        outTxs = outTxs.filter(t => {
            const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
            const benName = ben ? (ben.nickname || ben.name).toLowerCase() : 'unknown';
            return (
                benName.includes(outSearchQuery) ||
                (t.amountBDT?.toString() || '').includes(outSearchQuery) ||
                (t.amountUSD?.toString() || '').includes(outSearchQuery) ||
                (t.date || '').includes(outSearchQuery) ||
                (t.status?.toLowerCase() || '').includes(outSearchQuery)
            );
        });
    }

    let totalOutUSD = 0, totalOutBDT = 0;
    outTxs.forEach(t => {
        totalOutUSD += parseFloat(t.amountUSD || 0);
        totalOutBDT += parseFloat(t.amountBDT || 0);
    });

    els.outTableBody.innerHTML = '';
    if (outTxs.length === 0) {
        const emptyMsg = outSearchQuery ? 'No results match your search.' : 'No money out records for this month.';
        const emptyHint = outSearchQuery ? 'Try a different keyword.' : 'Click "+ Money Out" to create a pending order.';
        els.outTableBody.innerHTML = `<tr><td colspan="7" class="empty-state-cell"><div class="empty-state-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:48px;height:48px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p>${emptyMsg}</p><span>${emptyHint}</span></div></td></tr>`;
    } else {
        const totalRow = document.createElement('tr');
        totalRow.style.background = 'linear-gradient(90deg, #fef2f2 0%, #fee2e2 100%)';
        totalRow.style.fontWeight = '900';
        totalRow.style.boxShadow = 'inset 0 -2px 0 #dc2626';
        totalRow.innerHTML = `
            <td colspan="2" class="text-center" style="color:#991b1b;letter-spacing:0.15em;font-size:0.85rem;text-transform:uppercase;">
                <span style="background:#dc2626;color:white;padding:2px 10px;border-radius:4px;font-weight:800;">MONTHLY TOTAL SUMMARY</span>
            </td>
            <td class="amount-column" style="color:#b91c1c;font-size:1.25rem;">${fmtUSD(totalOutUSD)}</td>
            <td class="amount-column" style="color:#b91c1c;font-size:1.25rem;">${fmtBDT(totalOutBDT)}</td>
            <td colspan="3"></td>
        `;
        els.outTableBody.appendChild(totalRow);

        outTxs.forEach(tx => {
            const ben = beneficiaries.find(b => b.id === tx.beneficiaryId);
            const isUnknown = !ben && !tx.beneficiaryName;
            const benName = ben ? (ben.nickname || ben.name) : (tx.beneficiaryName || 'Unknown');
            const statusClass = tx.status === 'paid' ? 'bg-green-light text-green' : (tx.status === 'hold' ? 'bg-orange-light text-orange' : 'bg-gray-light');

            const tr = document.createElement('tr');
            tr.className = `status-${tx.status}`;
            tr.innerHTML = `
                <td data-label="Date">${escapeHTML(tx.date)}</td>
                <td data-label="Receiver">
                    <span class="receiver-link" data-id="${tx.beneficiaryId}" style="cursor:pointer;text-decoration:underline;">${escapeHTML(benName)}</span>
                    ${isUnknown ? `<button class="fix-name-btn icon-btn" data-id="${tx.id}" title="Fix Name" style="font-size:0.7rem;padding:2px 7px;margin-left:4px;background:var(--brand-light);border:none;color:var(--brand-primary);border-radius:4px;cursor:pointer;">✏ Fix</button>` : ''}
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
                    ${tx.status === 'pending' ? `<button class="icon-btn pay-btn" data-id="${tx.id}" title="Mark Paid"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg></button>` : ''}
                    ${tx.status === 'pending' ? `<button class="icon-btn hold-btn" data-id="${tx.id}" title="Hold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg></button>` : ''}
                    ${tx.status === 'hold' ? `<button class="icon-btn resume-btn" data-id="${tx.id}" title="Resume"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" /></svg></button>` : ''}
                    <button class="icon-btn edit-tx-btn" data-id="${tx.id}" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                    <button class="icon-btn clone-btn" data-id="${tx.id}" title="Clone"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6" /></svg></button>
                    ${tx.status !== 'paid' ? `<button class="icon-btn delete-tx-btn" data-id="${tx.id}" title="Delete Transaction"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>` : ''}
                </td>
            `;
            els.outTableBody.appendChild(tr);
        });
    }
}

export function renderHistoryTable(transactions, beneficiaries, query = '', filterMonth = '', filterYear = String(new Date().getFullYear())) {
    const q = query.toLowerCase().trim();
    const txMonth = t => t.accountingMonth || (t.date ? t.date.slice(0, 7) : '');

    const sorted = [...transactions].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    let filtered = sorted;

    if (filterMonth) {
        const targetPrefix = `${filterYear}-${filterMonth}`;
        filtered = filtered.filter(t => txMonth(t) === targetPrefix);
    } else if (filterYear) {
        filtered = filtered.filter(t => txMonth(t).startsWith(filterYear));
    }

    if (q) {
        filtered = filtered.filter(t => {
            const ben = beneficiaries.find(b => b.id === t.beneficiaryId);
            const rawIdentity = t.type === 'incoming' ? t.source : (ben ? ben.nickname || ben.name : (t.beneficiaryName || 'Unknown'));
            const identity = (rawIdentity || '').toLowerCase();
            return (
                (t.date || '').includes(q) ||
                identity.includes(q) ||
                (t.amountUSD?.toString() || '').includes(q) ||
                (t.amountBDT?.toString() || '').includes(q) ||
                (t.type?.toLowerCase() || '').includes(q)
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
        const identity = tx.type === 'incoming' ? tx.source : (ben ? ben.nickname || ben.name : (tx.beneficiaryName || 'Unknown'));
        const typeLabel = tx.type === 'incoming' ? (tx.subType === 'return' ? 'Return' : 'Receive') : 'Payout';
        const typeClass = tx.type === 'incoming' ? (tx.subType === 'return' ? 'bg-orange-light text-orange' : 'bg-green-light text-green') : 'bg-indigo-light text-indigo';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Date">${tx.date}</td>
            <td data-label="Type"><span class="badge ${typeClass}">${typeLabel}</span></td>
            <td data-label="Identity">${identity}</td>
            <td data-label="USD" class="amount-column">${fmtUSD(tx.amountUSD)}</td>
            <td data-label="BDT" class="amount-column font-bold">${fmtBDT(tx.amountBDT)}</td>
            <td data-label="Rate" class="text-right">${(parseFloat(tx.rate) || 0).toFixed(2)}</td>
            <td class="actions-cell">
                <button class="icon-btn edit-tx-btn-hist" data-id="${tx.id}" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                </button>
            </td>
        `;
        els.historyTableBody.appendChild(tr);
    });
}
