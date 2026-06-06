import { store } from '../store/store.js';
import { showToast } from '../utils/utils.js';
import { els } from './elements.js';

export function setupSmartCalc(usdInput, bdtInput, rateInput) {
    let lastEdited = 'usd';

    const getVal = (input) => {
        const val = input.value.trim();
        if (!val) return null;
        const n = parseFloat(val);
        return isNaN(n) ? null : n;
    };

    const setVal = (input, val) => {
        if (!isFinite(val) || isNaN(val) || val === null) return;
        input.value = val.toFixed(2);
    };

    const calculate = (source) => {
        const usd = getVal(usdInput);
        const bdt = getVal(bdtInput);
        const rate = getVal(rateInput);

        if (source === 'usd') {
            lastEdited = 'usd';
            if (usd !== null && rate !== null) {
                setVal(bdtInput, usd * rate);
            } else if (usd !== null && bdt !== null && usd !== 0) {
                setVal(rateInput, bdt / usd);
            }
        } else if (source === 'bdt') {
            lastEdited = 'bdt';
            if (bdt !== null && rate !== null && rate !== 0) {
                setVal(usdInput, bdt / rate);
            } else if (bdt !== null && usd !== null && usd !== 0) {
                setVal(rateInput, bdt / usd);
            }
        } else if (source === 'rate-manual') {
            if (lastEdited === 'bdt' && bdt !== null && rate !== 0) {
                setVal(usdInput, bdt / rate);
            } else if (usd !== null) {
                setVal(bdtInput, usd * rate);
            }
        }
    };

    usdInput.addEventListener('input', () => calculate('usd'));
    bdtInput.addEventListener('input', () => calculate('bdt'));
    rateInput.addEventListener('input', () => calculate('rate-manual'));

    usdInput.addEventListener('focus', () => lastEdited = 'usd');
    bdtInput.addEventListener('focus', () => lastEdited = 'bdt');
    usdInput.addEventListener('click', () => lastEdited = 'usd');
    bdtInput.addEventListener('click', () => lastEdited = 'bdt');
}

export function editTransaction(id) {
    const tx = store.state.transactions.find(t => t.id === id);
    if (!tx) return;

    if (tx.type === 'outgoing' && tx.status === 'paid') {
        showToast('Paid records are locked and cannot be edited.', 'error');
        return;
    }

    if (tx.type === 'incoming') {
        els.incomingModal.classList.add('open');
        els.incId.value = tx.id;
        els.incDate.value = tx.date;
        els.incAccMonth.value = tx.accountingMonth || (tx.date ? tx.date.slice(0, 7) : '');
        els.incType.value = tx.subType;
        els.incSource.value = tx.source;
        els.incRate.value = tx.rate;
        els.incUSD.value = tx.amountUSD;
        els.incBDT.value = tx.amountBDT;
    } else {
        els.outgoingModal.classList.add('open');
        els.outId.value = tx.id;
        els.outDate.value = tx.date;
        els.outAccMonth.value = tx.accountingMonth || (tx.date ? tx.date.slice(0, 7) : '');
        els.outBeneficiary.value = tx.beneficiaryId;
        const editBen = store.state.beneficiaries.find(b => b.id === tx.beneficiaryId);
        if (editBen) {
            els.prevDisplayName.textContent = editBen.nickname || editBen.name;
            els.prevBankName.textContent = editBen.bankName || 'N/A';
            els.prevAccNo.textContent = `Acc: ${editBen.accountNo || 'N/A'}`;
            els.bankPreview.style.display = 'block';
        }
        els.outRate.value = tx.rate;
        els.outUSD.value = tx.amountUSD;
        els.outBDT.value = tx.amountBDT;
    }
}

export function cloneTransaction(id) {
    const tx = store.state.transactions.find(t => t.id === id);
    if (!tx) return;

    if (tx.type === 'incoming') {
        els.incDate.value = new Date().toISOString().split('T')[0];
        els.incAccMonth.value = store.state.selectedMonth;
        els.incType.value = tx.subType;
        els.incSource.value = tx.source;
        els.incRate.value = tx.rate;
        els.incUSD.value = tx.amountUSD;
        els.incBDT.value = tx.amountBDT;
        els.incId.value = '';
        els.incomingModal.classList.add('open');
    } else {
        els.outDate.value = new Date().toISOString().split('T')[0];
        els.outAccMonth.value = store.state.selectedMonth;
        els.outBeneficiary.value = tx.beneficiaryId;
        els.outBeneficiary.dispatchEvent(new Event('change'));
        els.outRate.value = tx.rate;
        els.outUSD.value = tx.amountUSD;
        els.outBDT.value = tx.amountBDT;
        els.outId.value = '';
        els.outgoingModal.classList.add('open');
    }
    showToast('Transaction Cloned. Review and Save.', 'success');
}

export function openBeneficiaryModal(ben = null) {
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
