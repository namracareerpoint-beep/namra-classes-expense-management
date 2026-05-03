// === ADD EXPENSE/DEPOSIT VIEW ===
const ExpenseView = {
  categories: [],
  async render(container) {
    try { this.categories = await API.getCategories(); } catch(e) { this.categories = []; }
    const catOptions = this.categories.map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('');
    container.innerHTML = `<div class="fade-in">
      <div class="page-title">Add Entry</div>
      <div class="tab-bar">
        <button class="tab-btn active" data-tab="expense">💸 Expense</button>
        <button class="tab-btn" data-tab="deposit">💰 Deposit</button>
      </div>
      <form id="entry-form">
        <div class="form-group">
          <label>Amount (₹)</label>
          <input type="number" id="entry-amount" placeholder="Enter amount" required min="1" inputmode="numeric">
        </div>
        <div class="form-group">
          <label>Source / Destination</label>
          <div class="wallet-selector">
            <label class="wallet-pill active" data-wallet="cash"><input type="radio" name="wallet-radio" value="cash" checked>💵 Cash</label>
            <label class="wallet-pill" data-wallet="bank"><input type="radio" name="wallet-radio" value="bank">🏦 Bank</label>
            <label class="wallet-pill" data-wallet="online"><input type="radio" name="wallet-radio" value="online">📱 Online</label>
          </div>
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="entry-category">${catOptions}</select>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="entry-desc" placeholder="Where was the money used?" required>
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" id="entry-date" value="${Utils.todayISO()}">
        </div>
        <button type="submit" class="btn btn-danger btn-full" id="entry-submit">💸 Add Expense</button>
      </form>
    </div>`;
    this.attachEvents(container);
  },

  attachEvents(container) {
    let currentType = 'expense';
    // Tab switching
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.tab;
        const submitBtn = document.getElementById('entry-submit');
        if (currentType === 'expense') {
          submitBtn.className = 'btn btn-danger btn-full';
          submitBtn.textContent = '💸 Add Expense';
        } else {
          submitBtn.className = 'btn btn-success btn-full';
          submitBtn.textContent = '💰 Add Deposit';
        }
      });
    });
    // Wallet pills
    container.querySelectorAll('.wallet-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        container.querySelectorAll('.wallet-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        pill.querySelector('input').checked = true;
      });
    });
    // Form submit
    document.getElementById('entry-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('entry-submit');
      const data = {
        amount: document.getElementById('entry-amount').value,
        wallet: container.querySelector('input[name="wallet-radio"]:checked').value,
        category: document.getElementById('entry-category').value,
        description: document.getElementById('entry-desc').value,
        date: document.getElementById('entry-date').value
      };
      btn.disabled = true;
      try {
        if (currentType === 'expense') {
          await API.addExpense(data);
          Utils.showToast('Expense added!', 'success');
        } else {
          await API.addDeposit(data);
          Utils.showToast('Deposit added!', 'success');
        }
        document.getElementById('entry-form').reset();
        document.getElementById('entry-date').value = Utils.todayISO();
        container.querySelectorAll('.wallet-pill').forEach((p,i) => p.classList.toggle('active', i===0));
        container.querySelector('input[name="wallet-radio"]').checked = true;
      } catch (err) {
        Utils.showToast(err.message, 'error');
      } finally { btn.disabled = false; }
    });
  }
};
