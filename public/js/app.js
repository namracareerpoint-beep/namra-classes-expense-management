// === MAIN APP CONTROLLER ===
const App = {
  currentPage: 'dashboard',

  async init() {
    AuthView.init();
    this.setupNavigation();
    this.checkAuth();
  },

  async checkAuth() {
    const token = API.getToken();
    if (!token) { this.showLogin(); return; }
    try {
      const user = await API.getMe();
      API.setUser(user);
      // Check if setup is complete
      const wallet = await API.getWallets();
      if (!wallet.isSetupComplete && user.role === 'admin') {
        this.showSetup();
      } else {
        this.showApp();
      }
    } catch (err) {
      API.clearToken();
      this.showLogin();
    }
  },

  showLogin() {
    document.getElementById('login-page').classList.add('active');
    document.getElementById('setup-page').classList.remove('active');
    document.getElementById('app-page').classList.remove('active');
  },

  showSetup() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('setup-page').classList.add('active');
    document.getElementById('app-page').classList.remove('active');
    SetupView.render();
  },

  showApp() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('setup-page').classList.remove('active');
    document.getElementById('app-page').classList.add('active');
    // Update user info
    const user = API.getUser();
    if (user) {
      document.getElementById('header-user-name').textContent = user.name;
      document.getElementById('sidebar-user-info').textContent = `${user.name} (${user.role})`;
      // Show/hide admin-only items
      document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = user.role === 'admin' ? '' : 'none';
      });
    }
    this.navigate(this.currentPage);
  },

  setupNavigation() {
    // Sidebar nav
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(item.dataset.page);
        this.closeSidebar();
      });
    });

    // Bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(item.dataset.page);
      });
    });

    // Mobile hamburger menu
    document.getElementById('header-menu-btn').addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());

    // Logout
    document.getElementById('sidebar-logout-btn').addEventListener('click', () => this.logout());
  },

  navigate(page) {
    this.currentPage = page;
    const container = document.getElementById('view-container');

    // Update active states
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));

    // Render view
    switch (page) {
      case 'dashboard': DashboardView.render(container); break;
      case 'add': ExpenseView.render(container); break;
      case 'transfer': TransferView.render(container); break;
      case 'transactions': TransactionsView.render(container); break;
      case 'reminders': RemindersView.render(container); break;
      case 'reports': ReportsView.render(container); break;
      case 'settings': SettingsView.render(container); break;
      default: DashboardView.render(container);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
  },

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  },

  logout() {
    API.clearToken();
    Utils.showToast('Logged out', 'info');
    this.showLogin();
  }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
