// === SETTINGS VIEW (Admin) ===
const SettingsView = {
  async render(container) {
    if (!API.isAdmin()) {
      container.innerHTML = '<div class="fade-in"><div class="page-title">Settings</div><div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-text">Admin access required</div></div></div>';
      return;
    }
    container.innerHTML = `<div class="fade-in">
      <div class="page-title">Settings</div>
      <div class="section-header"><span class="section-title">👥 User Management</span></div>
      <div style="background:var(--surface-el);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          <div class="form-group" style="margin:0"><input type="text" id="new-user-name" placeholder="Full Name"></div>
          <div class="form-group" style="margin:0"><input type="text" id="new-user-username" placeholder="Username"></div>
          <div class="form-group" style="margin:0"><input type="password" id="new-user-pass" placeholder="Password"></div>
          <div class="form-group" style="margin:0"><select id="new-user-role"><option value="staff">Staff</option><option value="admin">Admin</option></select></div>
        </div>
        <button class="btn btn-primary btn-sm" id="create-user-btn">+ Create User</button>
      </div>
      <div id="user-list-container"><div class="loading-spinner"><div class="spinner"></div></div></div>

      <div class="section-header" style="margin-top:28px"><span class="section-title">📂 Categories</span></div>
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <input type="text" id="new-cat-name" placeholder="New category name" style="flex:1;padding:10px 14px;background:var(--surface-el);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text)">
        <button class="btn btn-primary btn-sm" id="create-cat-btn">+ Add</button>
      </div>
      <div id="cat-list-container"><div class="loading-spinner"><div class="spinner"></div></div></div>

      <div class="section-header" style="margin-top:28px"><span class="section-title">🔑 Change Password</span></div>
      <div style="background:var(--surface-el);border:1px solid var(--border);border-radius:var(--radius);padding:20px">
        <div class="form-group"><input type="password" id="cp-current" placeholder="Current Password"></div>
        <div class="form-group"><input type="password" id="cp-new" placeholder="New Password"></div>
        <button class="btn btn-warning btn-sm" id="cp-btn">Change Password</button>
      </div>
    </div>`;

    this.loadUsers();
    this.loadCategories();

    document.getElementById('create-user-btn').addEventListener('click', async () => {
      const name = document.getElementById('new-user-name').value.trim();
      const username = document.getElementById('new-user-username').value.trim();
      const password = document.getElementById('new-user-pass').value;
      const role = document.getElementById('new-user-role').value;
      if (!name || !username || !password) return Utils.showToast('All fields required', 'error');
      try {
        await API.createUser({ name, username, password, role });
        Utils.showToast('User created!', 'success');
        document.getElementById('new-user-name').value = '';
        document.getElementById('new-user-username').value = '';
        document.getElementById('new-user-pass').value = '';
        this.loadUsers();
      } catch(e) { Utils.showToast(e.message, 'error'); }
    });

    document.getElementById('create-cat-btn').addEventListener('click', async () => {
      const name = document.getElementById('new-cat-name').value.trim();
      if (!name) return;
      try {
        await API.createCategory({ name });
        Utils.showToast('Category added!', 'success');
        document.getElementById('new-cat-name').value = '';
        this.loadCategories();
      } catch(e) { Utils.showToast(e.message, 'error'); }
    });

    document.getElementById('cp-btn').addEventListener('click', async () => {
      const currentPassword = document.getElementById('cp-current').value;
      const newPassword = document.getElementById('cp-new').value;
      if (!currentPassword || !newPassword) return Utils.showToast('Fill both fields', 'error');
      try {
        await API.changePassword({ currentPassword, newPassword });
        Utils.showToast('Password changed!', 'success');
        document.getElementById('cp-current').value = '';
        document.getElementById('cp-new').value = '';
      } catch(e) { Utils.showToast(e.message, 'error'); }
    });
  },

  async loadUsers() {
    const el = document.getElementById('user-list-container');
    try {
      const users = await API.getUsers();
      const me = API.getUser();
      let html = '<div class="user-list">';
      users.forEach(u => {
        html += `<div class="user-item">
          <div class="user-avatar">${u.name.charAt(0).toUpperCase()}</div>
          <div class="user-info"><div class="user-name">${u.name} <span class="role-badge ${u.role}">${u.role}</span></div><div class="user-role">@${u.username}</div></div>
          ${u._id !== me.id ? `<button class="txn-delete-btn" data-del-user="${u._id}" title="Delete">🗑️</button>` : '<span style="font-size:12px;color:var(--text-dim)">You</span>'}
        </div>`;
      });
      html += '</div>';
      el.innerHTML = html;
      el.querySelectorAll('[data-del-user]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ok = await Utils.confirm('Delete User', 'This cannot be undone. Continue?');
          if (!ok) return;
          try { await API.deleteUser(btn.dataset.delUser); Utils.showToast('User deleted', 'success'); this.loadUsers(); }
          catch(e) { Utils.showToast(e.message, 'error'); }
        });
      });
    } catch(e) { el.innerHTML = `<div class="empty-state"><div class="empty-state-text">${e.message}</div></div>`; }
  },

  async loadCategories() {
    const el = document.getElementById('cat-list-container');
    try {
      const cats = await API.getCategories();
      let html = '<div class="category-list">';
      cats.forEach(c => {
        html += `<span class="category-tag">${c.icon} ${c.name}${!c.isDefault ? `<button class="cat-delete" data-del-cat="${c._id}">×</button>` : ''}</span>`;
      });
      html += '</div>';
      el.innerHTML = html;
      el.querySelectorAll('[data-del-cat]').forEach(btn => {
        btn.addEventListener('click', async () => {
          try { await API.deleteCategory(btn.dataset.delCat); Utils.showToast('Category deleted', 'success'); this.loadCategories(); }
          catch(e) { Utils.showToast(e.message, 'error'); }
        });
      });
    } catch(e) { el.innerHTML = ''; }
  }
};
