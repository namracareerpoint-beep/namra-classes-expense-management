// === REMINDERS VIEW ===
const RemindersView = {
  async render(container) {
    container.innerHTML = '<div class="fade-in"><div class="page-title">Reminders</div><div id="reminders-content"><div class="loading-spinner"><div class="spinner"></div></div></div></div>';
    await this.load();
  },

  async load() {
    const el = document.getElementById('reminders-content');
    try {
      const reminders = await API.getReminders();
      const isAdmin = API.isAdmin();
      let html = `<button class="btn btn-primary btn-sm" id="add-reminder-btn" style="margin-bottom:16px">+ Add Reminder</button>`;
      // Add reminder form (hidden by default)
      html += `<div id="reminder-form-wrap" style="display:none;margin-bottom:20px">
        <div style="background:var(--surface-el);border:1px solid var(--border);border-radius:var(--radius);padding:20px">
          <div class="form-group"><label>Name</label><input type="text" id="rem-name" placeholder="e.g. Monthly Rent" required></div>
          <div class="form-row">
            <div class="form-group"><label>Amount (₹)</label><input type="number" id="rem-amount" placeholder="0" min="0"></div>
            <div class="form-group"><label>Due Date</label><input type="date" id="rem-due" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Wallet</label><select id="rem-wallet"><option value="cash">💵 Cash</option><option value="bank">🏦 Bank</option><option value="online">📱 Online</option></select></div>
            <div class="form-group"><label>Recurring?</label><select id="rem-recurring"><option value="false">No — One Time</option><option value="true">Yes — Recurring</option></select></div>
          </div>
          <div class="form-group" id="rem-freq-group" style="display:none"><label>Frequency</label><select id="rem-freq"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-success btn-sm" id="rem-save">Save</button>
            <button class="btn btn-outline btn-sm" id="rem-cancel">Cancel</button>
          </div>
        </div>
      </div>`;

      if (reminders.length === 0) {
        html += '<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-text">No reminders yet</div></div>';
      } else {
        reminders.forEach(r => {
          html += `<div class="reminder-item ${r.status}">
            <div class="reminder-status-dot ${r.status}"></div>
            <div class="reminder-info">
              <div class="reminder-name">${r.name}</div>
              <div class="reminder-due">${Utils.formatDate(r.dueDate)} · ${Utils.walletLabel(r.wallet)} ${r.recurring ? `· ${r.frequency}` : ''} · <em>${r.status === 'overdue' ? '⚠️ OVERDUE' : r.status === 'due_today' ? '⏰ Due Today' : r.status === 'completed' ? '✅ Done' : r.status === 'upcoming' ? `📅 ${r.daysUntilDue}d left` : '📅 Scheduled'}</em></div>
            </div>
            <div class="reminder-amount">${Utils.formatCurrency(r.amount)}</div>
            <div class="reminder-actions">
              ${!r.isCompleted ? `<button class="btn btn-sm btn-success" data-complete="${r._id}" title="Mark Paid">✓</button>` : ''}
              ${isAdmin ? `<button class="btn btn-sm btn-outline" data-delete="${r._id}" title="Delete" style="padding:8px">🗑️</button>` : ''}
            </div>
          </div>`;
        });
      }
      el.innerHTML = html;

      // Toggle form
      document.getElementById('add-reminder-btn').addEventListener('click', () => {
        document.getElementById('reminder-form-wrap').style.display = 'block';
      });
      document.getElementById('rem-cancel').addEventListener('click', () => {
        document.getElementById('reminder-form-wrap').style.display = 'none';
      });
      document.getElementById('rem-recurring').addEventListener('change', (e) => {
        document.getElementById('rem-freq-group').style.display = e.target.value === 'true' ? 'block' : 'none';
      });
      // Save
      document.getElementById('rem-save').addEventListener('click', async () => {
        const name = document.getElementById('rem-name').value.trim();
        const dueDate = document.getElementById('rem-due').value;
        if (!name || !dueDate) return Utils.showToast('Name and due date required', 'error');
        try {
          await API.createReminder({
            name, amount: document.getElementById('rem-amount').value,
            dueDate, wallet: document.getElementById('rem-wallet').value,
            recurring: document.getElementById('rem-recurring').value === 'true',
            frequency: document.getElementById('rem-freq').value
          });
          Utils.showToast('Reminder created!', 'success');
          this.load();
        } catch(e) { Utils.showToast(e.message, 'error'); }
      });
      // Complete
      el.querySelectorAll('[data-complete]').forEach(btn => {
        btn.addEventListener('click', async () => {
          try { await API.completeReminder(btn.dataset.complete); Utils.showToast('Marked as paid!', 'success'); this.load(); }
          catch(e) { Utils.showToast(e.message, 'error'); }
        });
      });
      // Delete
      el.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ok = await Utils.confirm('Delete Reminder', 'Are you sure?');
          if (!ok) return;
          try { await API.deleteReminder(btn.dataset.delete); Utils.showToast('Deleted', 'success'); this.load(); }
          catch(e) { Utils.showToast(e.message, 'error'); }
        });
      });
    } catch(e) { el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">${e.message}</div></div>`; }
  }
};
