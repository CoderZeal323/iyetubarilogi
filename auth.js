// auth.js - Admin authentication functions

document.addEventListener('DOMContentLoaded', () => {
  const authSection = document.getElementById('authSection');
  const adminPanel = document.getElementById('adminPanel');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const authMessage = document.getElementById('authMessage');

  // Check if user is already logged in
  checkAuthStatus();

  // Login form submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      authMessage.textContent = 'Login successful!';
      authMessage.style.color = 'green';
      checkAuthStatus();

    } catch (error) {
      authMessage.textContent = 'Login failed: ' + error.message;
      authMessage.style.color = 'red';
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    try {
      const { error } = await window.supabaseClient.auth.signOut();
      if (error) throw error;

      checkAuthStatus();
    } catch (error) {
      console.error('Logout error:', error);
    }
  });

  // Check authentication status
  async function checkAuthStatus() {
    try {
      const { data: { user } } = await window.supabaseClient.auth.getUser();

      if (user) {
        authSection.style.display = 'none';
        adminPanel.style.display = 'block';
        logoutBtn.style.display = 'inline-block';

        // Load admin data
        loadPosts();
        loadComments();
      } else {
        authSection.style.display = 'block';
        adminPanel.style.display = 'none';
        logoutBtn.style.display = 'none';
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }

  // Listen for auth changes
  window.supabaseClient.auth.onAuthStateChange((event, session) => {
    checkAuthStatus();
  });
});