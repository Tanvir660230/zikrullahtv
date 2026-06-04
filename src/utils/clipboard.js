import { showToast } from './utils.js';

export function copyToClipboard(text) {
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

export function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
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
