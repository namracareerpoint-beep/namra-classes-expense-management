// === AUTH VIEW ===
const AuthView = {
  init() {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      if (!username || !password) return Utils.showToast('Enter username and password', 'error');
      btn.disabled = true;
      btn.innerHTML = '<span>Signing in...</span>';
      try {
        const data = await API.login(username, password);
        API.setToken(data.token);
        API.setUser(data.user);
        Utils.showToast(`Welcome, ${data.user.name}!`, 'success');
        App.checkAuth();
      } catch (err) {
        Utils.showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In</span>';
      }
    });
  }
};
