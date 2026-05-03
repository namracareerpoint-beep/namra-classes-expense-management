// === TRANSACTIONS HISTORY VIEW ===
const TransactionsView = {
  async render(container) {
    container.innerHTML = `<div class="fade-in">
      <div class="page-title">Transaction History</div>
      <div class="filters-bar">
        <input type="text" id="txn-search" placeholder="🔍 Search...">
        <select id="txn-type-filter"><option value="">All Types</option><option value="expense">Expense</option><option value="deposit">Deposit</option><option value="transfer">Transfer</option></select>
        <select id="txn-wallet-filter"><option value="">All Wallets</option><option value="cash">Cash</option><option value="bank">Bank</option><option value="online">Online</option></select>
        <input type="date" id="txn-start-date" title="From date">
        <input type="date" id="txn-end-date" title="To date">
      </div>
      <div id="txn-list-container"><div class="loading-spinner"><div class="spinner"></div></div></div>
      <div id="txn-pagination" style="display:flex;justify-content:center;gap:8px;margin-top:16px"></div>
    </div>`;
    this.currentPage = 1;
    this.loadTransactions();
    // Filter events
    ['txn-search','txn-type-filter','txn-wallet-filter','txn-start-date','txn-end-date'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => { this.currentPage = 1; this.loadTransactions(); });
    });
    document.getElementById('txn-search').addEventListener('input', (() => {
      let t; return () => { clearTimeout(t); t = setTimeout(() => { this.currentPage = 1; this.loadTransactions(); }, 400); };
    })());
  },

  async loadTransactions() {
    const listEl = document.getElementById('txn-list-container');
    const params = { page: this.currentPage, limit: 20 };
    const search = document.getElementById('txn-search').value.trim();
    const type = document.getElementById('txn-type-filter').value;
    const wallet = document.getElementById('txn-wallet-filter').value;
    const startDate = document.getElementById('txn-start-date').value;
    const endDate = document.getElementById('txn-end-date').value;
    if (search) params.search = search;
    if (type) params.type = type;
    if (wallet) params.wallet = wallet;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    try {
      const data = await API.getTransactions(params);
      const isAdmin = API.isAdmin();
      if (data.transactions.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No transactions found</div></div>';
      } else {
        let html = '<div class="transaction-list">';
        data.transactions.forEach(t => {
          const sign = t.type === 'expense' ? '-' : t.type === 'deposit' ? '+' : '↔';
          const walletInfo = t.type === 'transfer' ? `${Utils.walletEmoji(t.wallet)}→${Utils.walletEmoji(t.toWallet)}` : Utils.walletEmoji(t.wallet);
          const by = t.createdBy ? t.createdBy.name : '';
          html += `<div class="transaction-item">
            <div class="txn-icon ${t.type}">${Utils.typeIcon(t.type)}</div>
            <div class="txn-details">
              <div class="txn-desc">${t.description}</div>
              <div class="txn-meta">${Utils.formatDate(t.date)} · ${walletInfo} · <span class="txn-wallet-badge">${t.category}</span>${by ? ` · by ${by}` : ''}</div>
            </div>
            <div class="txn-amount ${t.type}">${sign}${Utils.formatCurrency(t.amount)}</div>
            ${isAdmin ? `<button class="txn-delete-btn" data-id="${t._id}" title="Delete">🗑️</button>` : ''}
          </div>`;
        });
        html += '</div>';
        listEl.innerHTML = html;

        // Delete buttons
        if (isAdmin) {
          listEl.querySelectorAll('.txn-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
              const ok = await Utils.confirm('Delete Transaction', 'This will reverse the wallet balance change. Continue?');
              if (!ok) return;
              try {
                await API.deleteTransaction(btn.dataset.id);
                Utils.showToast('Transaction deleted', 'success');
                this.loadTransactions();
              } catch(e) { Utils.showToast(e.message, 'error'); }
            });
          });
        }
      }

      // Pagination
      const pagEl = document.getElementById('txn-pagination');
      if (data.pages > 1) {
        let pHtml = '';
        for (let i = 1; i <= data.pages; i++) {
          pHtml += `<button class="btn btn-sm ${i === data.page ? 'btn-primary' : 'btn-outline'}" data-p="${i}">${i}</button>`;
        }
        pagEl.innerHTML = pHtml;
        pagEl.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
          this.currentPage = Number(b.dataset.p); this.loadTransactions();
        }));
      } else { pagEl.innerHTML = ''; }
    } catch(e) { listEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">${e.message}</div></div>`; }
  }
};
