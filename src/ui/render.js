import { fmtUSD, fmtBDT } from '../utils/utils.js';
import { els } from './elements.js';
import { renderTables } from './tables.js';
import { generateMonthlyReport } from './report.js';

const SPINNER = '<span class="val-spinner"></span>';

export function render(state) {
    if (state.isLoading) {
        els.liqUSD.innerHTML = SPINNER;
        els.liqBDT.innerHTML = SPINNER;
        if (els.avgBuyRate) els.avgBuyRate.innerHTML = SPINNER;
        if (els.outLiqUSD) els.outLiqUSD.innerHTML = SPINNER;
        if (els.outLiqBDT) els.outLiqBDT.innerHTML = SPINNER;
        if (els.incLiqUSD) els.incLiqUSD.innerHTML = SPINNER;
        if (els.incLiqBDT) els.incLiqBDT.innerHTML = SPINNER;
        els.monthReceipts.innerHTML = SPINNER;
        els.monthReceiptsBDT.innerHTML = SPINNER;
        els.monthDisbursements.innerHTML = SPINNER;
        els.monthDisbursementsBDT.innerHTML = SPINNER;
        return;
    }

    const {
        monthReceiptsUSD, monthReceiptsBDT,
        monthDisbursedUSD, monthDisbursedBDT,
        closingUSD, closingBDT
    } = state.liquidity;

    const avgRate = state.liquidity.averageBuyRate || 0;
    const impliedRate = state.liquidity.impliedRate || 0;
    const displayRate = impliedRate > 0 ? impliedRate : avgRate;

    els.liqUSD.textContent = fmtUSD(closingUSD);
    els.liqBDT.textContent = fmtBDT(closingBDT);
    if (els.avgBuyRate) els.avgBuyRate.textContent = displayRate.toFixed(2);
    if (els.hintRateVal) els.hintRateVal.textContent = displayRate.toFixed(2);

    // Balance strips in Money In / Money Out modals
    const incStripUSD = document.getElementById('incStripUSD');
    const incStripBDT = document.getElementById('incStripBDT');
    if (incStripUSD) incStripUSD.textContent = fmtUSD(closingUSD);
    if (incStripBDT) incStripBDT.textContent = fmtBDT(closingBDT);

    if (els.outLiqUSD) els.outLiqUSD.textContent = fmtUSD(closingUSD);
    if (els.outLiqBDT) els.outLiqBDT.textContent = fmtBDT(closingBDT);
    if (els.incLiqUSD) els.incLiqUSD.textContent = fmtUSD(closingUSD);
    if (els.incLiqBDT) els.incLiqBDT.textContent = fmtBDT(closingBDT);

    els.monthReceipts.textContent = fmtUSD(monthReceiptsUSD);
    els.monthReceiptsBDT.textContent = fmtBDT(monthReceiptsBDT);
    els.monthDisbursements.textContent = fmtUSD(monthDisbursedUSD);
    els.monthDisbursementsBDT.textContent = fmtBDT(monthDisbursedBDT);

    const summary = calculatePaymentSummary(state.transactions, state.beneficiaries, state.selectedMonth);
    els.statsPendingCount.textContent = summary.pendingCount;
    els.statsPendingAmount.textContent = fmtBDT(summary.pendingAmount);
    els.statsPaidCount.textContent = summary.paidCount;
    els.statsPaidAmount.textContent = fmtBDT(summary.paidAmount);
    els.statsReceiversCount.textContent = state.beneficiaries.length;

    // Rebuild Payers Dropdown
    const currentSource = els.incSource.value;
    els.incSource.innerHTML = '';
    const defOpt = document.createElement('option');
    defOpt.value = ''; defOpt.textContent = 'Select Payer';
    els.incSource.appendChild(defOpt);
    state.sources.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name; opt.textContent = s.name;
        els.incSource.appendChild(opt);
    });
    if (currentSource) els.incSource.value = currentSource;

    // Rebuild Receivers Dropdown
    const currentBenVal = els.outBeneficiary.value;
    els.outBeneficiary.innerHTML = '';
    const defBenOpt = document.createElement('option');
    defBenOpt.value = ''; defBenOpt.textContent = 'Select Receiver';
    els.outBeneficiary.appendChild(defBenOpt);
    state.beneficiaries.forEach(ben => {
        const opt = document.createElement('option');
        opt.value = ben.id; opt.textContent = ben.nickname || ben.name;
        els.outBeneficiary.appendChild(opt);
    });
    if (currentBenVal) els.outBeneficiary.value = currentBenVal;

    renderTables(state.transactions, state.beneficiaries, state.selectedMonth, state.sortConfig);
    renderProjectedCashflow(state.transactions, state.liquidity, state.selectedMonth);

    if (els.sourcesModal.classList.contains('open')) renderSourcesList(state.sources);
    if (els.beneficiariesListModal.classList.contains('open')) renderBeneficiariesList(state.beneficiaries);
    if (els.reportModal.classList.contains('open')) generateMonthlyReport();
}

export function renderSourcesList(sources) {
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

export function renderBeneficiariesList(beneficiaries) {
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
        return;
    }

    beneficiaries.forEach(b => {
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.setAttribute('data-label', 'Nickname');
        tdName.style.fontWeight = '500';

        const nameLink = document.createElement('span');
        nameLink.className = 'receiver-link-action';
        nameLink.dataset.id = b.id;
        nameLink.style.cssText = 'cursor:pointer;color:var(--color-primary);text-decoration:underline;display:flex;align-items:center;gap:0.5rem;';
        nameLink.textContent = b.nickname || b.name;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('stroke-width', '1.5');
        svg.setAttribute('stroke', 'currentColor');
        svg.style.cssText = 'width:14px;height:14px;opacity:0.7;';
        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />';
        nameLink.appendChild(svg);
        tdName.appendChild(nameLink);

        const tdAccName = document.createElement('td');
        tdAccName.setAttribute('data-label', 'Account Name');
        tdAccName.className = 'text-sub';
        tdAccName.textContent = b.accountName || '-';

        const tdBank = document.createElement('td');
        tdBank.setAttribute('data-label', 'Bank');
        tdBank.innerHTML = `<div style="font-weight:500;">${b.bankName || '-'}</div><div class="text-sub" style="font-size:0.8rem;">${b.branch || ''}</div>`;

        const tdAccNo = document.createElement('td');
        tdAccNo.setAttribute('data-label', 'Account No');
        tdAccNo.style.fontFamily = 'monospace';
        tdAccNo.textContent = b.accountNo || '-';

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
        btnDel.style.cssText = 'color:var(--color-danger);background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;';
        btnDel.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>';

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

export function calculatePaymentSummary(transactions, beneficiaries, selectedMonth) {
    const monthlyTxs = transactions.filter(t => (t.accountingMonth || t.date.slice(0, 7)) === selectedMonth && t.type === 'outgoing');
    let pendingCount = 0, pendingAmount = 0, paidCount = 0, paidAmount = 0;
    monthlyTxs.forEach(tx => {
        if (tx.status === 'paid') { paidCount++; paidAmount += (tx.amountBDT || 0); }
        else if (tx.status === 'pending' || tx.status === 'hold') { pendingCount++; pendingAmount += (tx.amountBDT || 0); }
    });
    return { pendingCount, pendingAmount, paidCount, paidAmount };
}

export function renderProjectedCashflow(transactions, liquidity, selectedMonth) {
    const container = document.getElementById('cashflowSummary');
    if (!container) return;

    const txMonth = t => t.accountingMonth || t.date.slice(0, 7);

    const pendingOutTxs = transactions.filter(t => t.type === 'outgoing' && (t.status === 'pending' || t.status === 'hold') && txMonth(t) === selectedMonth);
    let pendingOutBDT = 0, pendingOutUSD = 0;
    pendingOutTxs.forEach(t => { pendingOutBDT += parseFloat(t.amountBDT || 0); pendingOutUSD += parseFloat(t.amountUSD || 0); });

    const heldIncTxs = transactions.filter(t => t.type === 'incoming' && t.status === 'hold' && txMonth(t) === selectedMonth);
    let heldIncBDT = 0, heldIncUSD = 0;
    heldIncTxs.forEach(t => { heldIncBDT += parseFloat(t.amountBDT || 0); heldIncUSD += parseFloat(t.amountUSD || 0); });

    const currentCashBDT = liquidity.closingBDT;
    const currentCashUSD = liquidity.closingUSD;
    const projectedBDT = currentCashBDT + heldIncBDT - pendingOutBDT;
    const projectedUSD = currentCashUSD + heldIncUSD - pendingOutUSD;

    const isShortage = projectedBDT < 0;
    const statusLabel = isShortage ? 'Cash Shortage' : 'Cash Surplus';

    container.innerHTML = `
        <div class="section-header"><h3>Projected Cashflow</h3></div>
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-icon indigo">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.212 11.638 12.09 10.5 11.5c-1.138-.59-1.138-1.712 0-2.303 1.172-.59 3.07-.59 4.242 0 .44.221.73.495.879.659M9.75 4.038c3.236 4.5 1.25 9.125-1.5 12.875m7.5-12.875c-3.236 4.5-1.25 9.125 1.5 12.875" /></svg>
                </div>
                <div class="card-content">
                    <div class="card-label">Cash in Hand</div>
                    <div class="card-value-display">
                        <div class="currency-row usd-row"><span class="currency-label">USD</span><span class="currency-val usd">${fmtUSD(currentCashUSD)}</span></div>
                        <div class="currency-row bdt-row"><span class="currency-label">BDT</span><span class="currency-val bdt text-brand">${fmtBDT(currentCashBDT)}</span></div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-icon orange">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5a.75.75 0 0 1 .75-.75h.75m-1.5 1.5v12.75c0 .621-.504 1.125-1.125 1.125H12" /></svg>
                </div>
                <div class="card-content">
                    <div class="card-label">Expected Activity</div>
                    <div class="card-value-display">
                        <div class="currency-row usd-row"><span class="currency-label">Pending USD</span><span class="currency-val usd text-warning">-${fmtUSD(pendingOutUSD)}</span></div>
                        <div class="currency-row bdt-row"><span class="currency-label">Pending BDT</span><span class="currency-val bdt text-warning">-${fmtBDT(pendingOutBDT)}</span></div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-icon" style="color:${isShortage ? 'var(--danger)' : 'var(--success)'};background:${isShortage ? 'var(--danger-bg)' : 'var(--success-bg)'}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /></svg>
                </div>
                <div class="card-content">
                    <div class="card-label">${statusLabel}</div>
                    <div class="card-value-display">
                        <div class="currency-row usd-row"><span class="currency-label">Projected USD</span><span class="currency-val usd ${isShortage ? 'text-danger' : 'text-success'}">${fmtUSD(projectedUSD)}</span></div>
                        <div class="currency-row bdt-row"><span class="currency-label">Projected BDT</span><span class="currency-val bdt ${isShortage ? 'text-danger' : 'text-success'}">${fmtBDT(projectedBDT)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
