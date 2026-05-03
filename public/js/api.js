// === API HELPER ===
const API = {
  getToken() { return localStorage.getItem('token'); },
  setToken(t) { localStorage.setItem('token', t); },
  clearToken() { localStorage.removeItem('token'); localStorage.removeItem('user'); },
  getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } },
  setUser(u) { localStorage.setItem('user', JSON.stringify(u)); },
  isAdmin() { const u = this.getUser(); return u && u.role === 'admin'; },

  async request(url, options = {}) {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      throw err;
    }
  },
  get(url) { return this.request(url); },
  post(url, body) { return this.request(url, { method: 'POST', body: JSON.stringify(body) }); },
  put(url, body) { return this.request(url, { method: 'PUT', body: JSON.stringify(body) }); },
  delete(url) { return this.request(url, { method: 'DELETE' }); },

  // Auth
  login(username, password) { return this.post('/api/auth/login', { username, password }); },
  getMe() { return this.get('/api/auth/me'); },
  getUsers() { return this.get('/api/auth/users'); },
  createUser(data) { return this.post('/api/auth/users', data); },
  deleteUser(id) { return this.delete(`/api/auth/users/${id}`); },
  changePassword(data) { return this.put('/api/auth/change-password', data); },

  // Wallets
  getWallets() { return this.get('/api/wallets'); },
  setupWallets(data) { return this.put('/api/wallets/setup', data); },

  // Transactions
  addExpense(data) { return this.post('/api/transactions/expense', data); },
  addDeposit(data) { return this.post('/api/transactions/deposit', data); },
  addTransfer(data) { return this.post('/api/transactions/transfer', data); },
  getTransactions(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get(`/api/transactions?${q}`);
  },
  deleteTransaction(id) { return this.delete(`/api/transactions/${id}`); },

  // Categories
  getCategories() { return this.get('/api/categories'); },
  createCategory(data) { return this.post('/api/categories', data); },
  deleteCategory(id) { return this.delete(`/api/categories/${id}`); },

  // Reminders
  getReminders() { return this.get('/api/reminders'); },
  createReminder(data) { return this.post('/api/reminders', data); },
  completeReminder(id) { return this.put(`/api/reminders/${id}/complete`); },
  deleteReminder(id) { return this.delete(`/api/reminders/${id}`); },

  // Reports
  getSummary(month, year) { return this.get(`/api/reports/summary?month=${month}&year=${year}`); },
  getCategoryWise(month, year) { return this.get(`/api/reports/category-wise?month=${month}&year=${year}`); },
  getDaily(month, year) { return this.get(`/api/reports/daily?month=${month}&year=${year}`); }
};
