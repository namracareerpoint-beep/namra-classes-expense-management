// === TRANSFER VIEW ===
const TransferView = {
  async render(container) {
    let wallets;
    try { wallets = await API.getWallets(); } catch(e) { wallets = {cash:0,bank:0,online:0}; }
    container.innerHTML = `<div class="fade-in">
      <div class="page-title">Transfer Between Wallets</div>
      <div class="wallets-grid" style="margin-bottom:24px">
        <div class="wallet-card cash-card"><div class="wallet-card-header"><span class="wallet-emoji">💵</span><span class="wallet-label">Cash</span></div><div class="wallet-amount">${Utils.formatCurrency(wallets.cash)}</div></div>
        <div class="wallet-card bank-card"><div class="wallet-card-header"><span class="wallet-emoji">🏦</span><span class="wallet-label">Bank</span></div><div class="wallet-amount">${Utils.formatCurrency(wallets.bank)}</div></div>
        <div class="wallet-card online-card"><div class="wallet-card-header"><span class="wallet-emoji">📱</span><span class="wallet-label">Online</span></div><div class="wallet-amount">${Utils.formatCurrency(wallets.online)}</div></div>
      </div>
      <form id="transfer-form">
        <div class="form-row">
          <div class="form-group"><label>From</label><select id="transfer-from"><option value="cash">💵 Cash</option><option value="bank">🏦 Bank</option><option value="online">📱 Online</option></select></div>
          <div class="form-group"><label>To</label><select id="transfer-to"><option value="cash">💵 Cash</option><option value="bank" selected>🏦 Bank</option><option value="online">📱 Online</option></select></div>
        </div>
        <div class="form-group"><label>Amount (₹)</label><input type="number" id="transfer-amount" placeholder="Enter amount" required min="1" inputmode="numeric"></div>
        <div class="form-group"><label>Description (optional)</label><input type="text" id="transfer-desc" placeholder="e.g. ATM Withdrawal"></div>
        <div class="form-group"><label>Date</label><input type="date" id="transfer-date" value="${Utils.todayISO()}"></div>
        <button type="submit" class="btn btn-transfer btn-full" id="transfer-submit">🔄 Transfer</button>
      </form>
    </div>`;

    document.getElementById('transfer-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const from = document.getElementById('transfer-from').value;
      const to = document.getElementById('transfer-to').value;
      if (from === to) return Utils.showToast('Source and destination must be different', 'error');
      const btn = document.getElementById('transfer-submit');
      btn.disabled = true;
      try {
        await API.addTransfer({
          amount: document.getElementById('transfer-amount').value,
          wallet: from, toWallet: to,
          description: document.getElementById('transfer-desc').value || `Transfer ${Utils.walletLabel(from)} → ${Utils.walletLabel(to)}`,
          date: document.getElementById('transfer-date').value
        });
        Utils.showToast('Transfer complete!', 'success');
        this.render(container); // refresh balances
      } catch (err) {
        Utils.showToast(err.message, 'error');
      } finally { btn.disabled = false; }
    });
  }
};
