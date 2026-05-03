// === DASHBOARD VIEW ===
const DashboardView = {
  async render(container) {
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    try {
      const [wallets, txnData, reminders] = await Promise.all([
        API.getWallets(),
        API.getTransactions({ limit: 8 }),
        API.getReminders()
      ]);
      const user = API.getUser();
      const now = new Date();
      const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

      // Filter active/upcoming reminders
      const activeReminders = reminders.filter(r => r.status === 'overdue' || r.status === 'due_today' || r.status === 'upcoming');

      let html = `<div class="fade-in">
        <div style="margin-bottom:20px">
          <div style="font-size:14px;color:var(--text-sec)">${greeting},</div>
          <div style="font-size:22px;font-weight:800">${user ? user.name : 'User'} 👋</div>
          <div style="font-size:12px;color:var(--text-dim);margin-top:2px">${now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        </div>`;

      // Wallet Cards
      html += `<div class="wallets-grid">
        <div class="wallet-card cash-card">
          <div class="wallet-card-header"><span class="wallet-emoji">💵</span><span class="wallet-label">Cash</span></div>
          <div class="wallet-amount">${Utils.formatCurrency(wallets.cash)}</div>
        </div>
        <div class="wallet-card bank-card">
          <div class="wallet-card-header"><span class="wallet-emoji">🏦</span><span class="wallet-label">Bank</span></div>
          <div class="wallet-amount">${Utils.formatCurrency(wallets.bank)}</div>
        </div>
        <div class="wallet-card online-card">
          <div class="wallet-card-header"><span class="wallet-emoji">📱</span><span class="wallet-label">Online</span></div>
          <div class="wallet-amount">${Utils.formatCurrency(wallets.online)}</div>
        </div>
      </div>
      <div class="wallet-total">
        <span class="wallet-total-label">Total Balance</span>
        <span class="wallet-total-amount">${Utils.formatCurrency(wallets.total)}</span>
      </div>`;

      // Reminder alerts
      if (activeReminders.length > 0) {
        activeReminders.slice(0, 3).forEach(r => {
          const isOverdue = r.status === 'overdue';
          const isDueToday = r.status === 'due_today';
          html += `<div class="reminder-alert ${isOverdue ? 'overdue' : ''}">
            <span class="reminder-alert-icon">${isOverdue ? '🔴' : isDueToday ? '🟡' : '🔵'}</span>
            <div class="reminder-alert-text">
              <div class="reminder-alert-title">${r.name} — ${Utils.formatCurrency(r.amount)}</div>
              <div class="reminder-alert-sub">${isOverdue ? 'OVERDUE!' : isDueToday ? 'Due Today' : `Due in ${r.daysUntilDue} days`} · ${Utils.walletLabel(r.wallet)}</div>
            </div>
          </div>`;
        });
      }

      // Recent Transactions
      html += `<div class="section-header">
        <span class="section-title">Recent Activity</span>
        <span class="section-link" onclick="App.navigate('transactions')">View All →</span>
      </div>`;

      if (txnData.transactions.length === 0) {
        html += `<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">No transactions yet. Add your first expense!</div></div>`;
      } else {
        html += '<div class="transaction-list">';
        txnData.transactions.forEach(t => {
          const sign = t.type === 'expense' ? '-' : t.type === 'deposit' ? '+' : '↔';
          const walletInfo = t.type === 'transfer' ? `${Utils.walletEmoji(t.wallet)}→${Utils.walletEmoji(t.toWallet)}` : Utils.walletEmoji(t.wallet);
          html += `<div class="transaction-item">
            <div class="txn-icon ${t.type}">${Utils.typeIcon(t.type)}</div>
            <div class="txn-details">
              <div class="txn-desc">${t.description}</div>
              <div class="txn-meta">${Utils.formatDateShort(t.date)} · ${walletInfo} <span class="txn-wallet-badge">${t.category}</span></div>
            </div>
            <div class="txn-amount ${t.type}">${sign}${Utils.formatCurrency(t.amount)}</div>
          </div>`;
        });
        html += '</div>';
      }
      html += '</div>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">${err.message}</div></div>`;
    }
  }
};
