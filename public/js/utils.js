// === UTILITY FUNCTIONS ===
const Utils = {
  formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  },
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },
  formatDateShort(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = (today - date) / 86400000;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  },
  todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  walletLabel(w) {
    return { cash: '💵 Cash', bank: '🏦 Bank', online: '📱 Online' }[w] || w;
  },
  walletEmoji(w) {
    return { cash: '💵', bank: '🏦', online: '📱' }[w] || '💰';
  },
  typeIcon(t) {
    return { expense: '↓', deposit: '↑', transfer: '↔' }[t] || '•';
  },
  showToast(msg, type = 'info') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  confirm(title, message) {
    return new Promise(resolve => {
      const modal = document.getElementById('confirm-modal');
      document.getElementById('confirm-modal-title').textContent = title;
      document.getElementById('confirm-modal-message').textContent = message;
      modal.classList.add('active');
      const onConfirm = () => { modal.classList.remove('active'); cleanup(); resolve(true); };
      const onCancel = () => { modal.classList.remove('active'); cleanup(); resolve(false); };
      const confirmBtn = document.getElementById('confirm-modal-confirm');
      const cancelBtn = document.getElementById('confirm-modal-cancel');
      confirmBtn.addEventListener('click', onConfirm);
      cancelBtn.addEventListener('click', onCancel);
      function cleanup() { confirmBtn.removeEventListener('click', onConfirm); cancelBtn.removeEventListener('click', onCancel); }
    });
  }
};
