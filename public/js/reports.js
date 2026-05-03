// === REPORTS VIEW ===
const ReportsView = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  charts: {},

  async render(container) {
    container.innerHTML = `<div class="fade-in">
      <div class="page-title">Reports</div>
      <div class="month-picker">
        <button id="rep-prev">◀</button>
        <span id="rep-month-label"></span>
        <button id="rep-next">▶</button>
      </div>
      <div id="reports-content"><div class="loading-spinner"><div class="spinner"></div></div></div>
    </div>`;
    document.getElementById('rep-prev').addEventListener('click', () => { this.month--; if(this.month<1){this.month=12;this.year--;} this.load(); });
    document.getElementById('rep-next').addEventListener('click', () => { this.month++; if(this.month>12){this.month=1;this.year++;} this.load(); });
    this.load();
  },

  async load() {
    document.getElementById('rep-month-label').textContent = `${Utils.monthNames[this.month-1]} ${this.year}`;
    const el = document.getElementById('reports-content');
    el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
      const [summary, catData, dailyData] = await Promise.all([
        API.getSummary(this.month, this.year),
        API.getCategoryWise(this.month, this.year),
        API.getDaily(this.month, this.year)
      ]);

      const netClass = summary.net >= 0 ? 'net-positive' : 'net-negative';
      let html = `<div class="summary-grid">
        <div class="summary-card"><div class="summary-card-label">Total Income</div><div class="summary-card-value income">${Utils.formatCurrency(summary.totalDeposit)}</div></div>
        <div class="summary-card"><div class="summary-card-label">Total Expense</div><div class="summary-card-value expense">${Utils.formatCurrency(summary.totalExpense)}</div></div>
        <div class="summary-card"><div class="summary-card-label">Net</div><div class="summary-card-value ${netClass}">${summary.net >= 0 ? '+' : ''}${Utils.formatCurrency(summary.net)}</div></div>
        <div class="summary-card"><div class="summary-card-label">Transactions</div><div class="summary-card-value">${summary.transactionCount}</div></div>
      </div>`;

      // Category chart
      html += `<div class="chart-container"><div class="chart-title">Expenses by Category</div>
        ${catData.length > 0 ? '<canvas id="chart-category" height="260"></canvas>' : '<div class="empty-state"><div class="empty-state-text">No expense data</div></div>'}
      </div>`;

      // Daily chart
      html += `<div class="chart-container"><div class="chart-title">Daily Trend</div><canvas id="chart-daily" height="200"></canvas></div>`;

      // Wallet breakdown
      html += `<div class="chart-container"><div class="chart-title">Wallet Breakdown</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">
          <div><div style="font-size:12px;color:var(--text-dim)">💵 Cash</div><div style="color:var(--success);font-weight:700">+${Utils.formatCurrency(summary.walletBreakdown.cash.deposit)}</div><div style="color:var(--danger);font-weight:700">-${Utils.formatCurrency(summary.walletBreakdown.cash.expense)}</div></div>
          <div><div style="font-size:12px;color:var(--text-dim)">🏦 Bank</div><div style="color:var(--success);font-weight:700">+${Utils.formatCurrency(summary.walletBreakdown.bank.deposit)}</div><div style="color:var(--danger);font-weight:700">-${Utils.formatCurrency(summary.walletBreakdown.bank.expense)}</div></div>
          <div><div style="font-size:12px;color:var(--text-dim)">📱 Online</div><div style="color:var(--success);font-weight:700">+${Utils.formatCurrency(summary.walletBreakdown.online.deposit)}</div><div style="color:var(--danger);font-weight:700">-${Utils.formatCurrency(summary.walletBreakdown.online.expense)}</div></div>
        </div>
      </div>`;

      el.innerHTML = html;

      // Render charts
      this.destroyCharts();
      if (catData.length > 0) {
        const colors = ['#7C3AED','#EF4444','#F59E0B','#10B981','#3B82F6','#EC4899','#8B5CF6','#F97316','#06B6D4','#84CC16'];
        this.charts.cat = new Chart(document.getElementById('chart-category'), {
          type: 'doughnut',
          data: { labels: catData.map(c=>c._id), datasets: [{ data: catData.map(c=>c.total), backgroundColor: colors.slice(0, catData.length), borderWidth: 0 }] },
          options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF', padding: 12, font: { size: 12 } } } } }
        });
      }

      if (dailyData.length > 0) {
        this.charts.daily = new Chart(document.getElementById('chart-daily'), {
          type: 'bar',
          data: {
            labels: dailyData.map(d => d.day),
            datasets: [
              { label: 'Expense', data: dailyData.map(d=>d.expense), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 },
              { label: 'Deposit', data: dailyData.map(d=>d.deposit), backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 4 }
            ]
          },
          options: { responsive: true, scales: { x: { ticks: { color: '#6B7280', font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: '#6B7280' }, grid: { color: 'rgba(55,65,81,0.3)' } } }, plugins: { legend: { labels: { color: '#9CA3AF' } } } }
        });
      }
    } catch(e) { el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">${e.message}</div></div>`; }
  },

  destroyCharts() { Object.values(this.charts).forEach(c => c && c.destroy()); this.charts = {}; }
};
