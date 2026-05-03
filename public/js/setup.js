// === SETUP WIZARD ===
const SetupView = {
  step: 1,
  data: { cash: 0, bank: 0, online: 0 },

  render() {
    const c = document.getElementById('setup-content');
    if (this.step === 1) {
      c.innerHTML = `
        <div class="setup-step-indicator">
          <div class="step-dot active"></div><div class="step-line"></div>
          <div class="step-dot"></div><div class="step-line"></div>
          <div class="step-dot"></div>
        </div>
        <div class="setup-title">Welcome! 🎉</div>
        <div class="setup-subtitle">Let's set up your starting balances for Namra Classes</div>
        <div class="form-group">
          <label>💵 Cash in Hand (₹)</label>
          <input type="number" id="setup-cash" placeholder="0" value="${this.data.cash || ''}" min="0">
        </div>
        <div class="setup-actions">
          <button class="btn btn-primary btn-full" id="setup-next1">Next →</button>
        </div>`;
      document.getElementById('setup-next1').addEventListener('click', () => {
        this.data.cash = Number(document.getElementById('setup-cash').value) || 0;
        this.step = 2; this.render();
      });
    } else if (this.step === 2) {
      c.innerHTML = `
        <div class="setup-step-indicator">
          <div class="step-dot done"></div><div class="step-line"></div>
          <div class="step-dot active"></div><div class="step-line"></div>
          <div class="step-dot"></div>
        </div>
        <div class="setup-title">Bank & Online 🏦</div>
        <div class="setup-subtitle">Enter your current bank and online wallet balances</div>
        <div class="form-group">
          <label>🏦 Bank Account Balance (₹)</label>
          <input type="number" id="setup-bank" placeholder="0" value="${this.data.bank || ''}" min="0">
        </div>
        <div class="form-group">
          <label>📱 Online/UPI Balance (₹)</label>
          <input type="number" id="setup-online" placeholder="0" value="${this.data.online || ''}" min="0">
        </div>
        <div class="setup-actions">
          <button class="btn btn-outline" id="setup-back2">← Back</button>
          <button class="btn btn-primary" id="setup-next2">Next →</button>
        </div>`;
      document.getElementById('setup-back2').addEventListener('click', () => { this.step = 1; this.render(); });
      document.getElementById('setup-next2').addEventListener('click', () => {
        this.data.bank = Number(document.getElementById('setup-bank').value) || 0;
        this.data.online = Number(document.getElementById('setup-online').value) || 0;
        this.step = 3; this.render();
      });
    } else if (this.step === 3) {
      const total = this.data.cash + this.data.bank + this.data.online;
      c.innerHTML = `
        <div class="setup-step-indicator">
          <div class="step-dot done"></div><div class="step-line"></div>
          <div class="step-dot done"></div><div class="step-line"></div>
          <div class="step-dot active"></div>
        </div>
        <div class="setup-title">All Set! 🚀</div>
        <div class="setup-subtitle">Review your starting balances</div>
        <div class="setup-summary-item"><span class="setup-summary-label">💵 Cash</span><span class="setup-summary-value">${Utils.formatCurrency(this.data.cash)}</span></div>
        <div class="setup-summary-item"><span class="setup-summary-label">🏦 Bank</span><span class="setup-summary-value">${Utils.formatCurrency(this.data.bank)}</span></div>
        <div class="setup-summary-item"><span class="setup-summary-label">📱 Online</span><span class="setup-summary-value">${Utils.formatCurrency(this.data.online)}</span></div>
        <div class="setup-summary-item" style="border-bottom:none;font-size:18px"><span class="setup-summary-label"><strong>Total</strong></span><span class="setup-summary-value" style="color:var(--primary-light)"><strong>${Utils.formatCurrency(total)}</strong></span></div>
        <div class="setup-actions">
          <button class="btn btn-outline" id="setup-back3">← Back</button>
          <button class="btn btn-success" id="setup-finish">🚀 Start Managing</button>
        </div>`;
      document.getElementById('setup-back3').addEventListener('click', () => { this.step = 2; this.render(); });
      document.getElementById('setup-finish').addEventListener('click', () => this.finish());
    }
  },

  async finish() {
    const btn = document.getElementById('setup-finish');
    btn.disabled = true; btn.textContent = 'Setting up...';
    try {
      await API.setupWallets(this.data);
      Utils.showToast('Setup complete!', 'success');
      this.step = 1; this.data = { cash: 0, bank: 0, online: 0 };
      App.showApp();
    } catch (err) {
      Utils.showToast(err.message, 'error');
      btn.disabled = false; btn.textContent = '🚀 Start Managing';
    }
  }
};
