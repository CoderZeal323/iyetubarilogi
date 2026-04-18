// auth.js - Admin authentication functions
document.addEventListener('DOMContentLoaded', async () => {
  const authSection = document.getElementById('authSection');
  const adminPanel = document.getElementById('adminPanel');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const authMessage = document.getElementById('authMessage');

  // Wait for supabaseClient to be ready
  if (!window.supabaseClient) {
    authMessage.textContent = 'Error: Supabase not initialized.';
    return;
  }

  // Login form submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email, password
      });
      if (error) throw error;
      showAdminPanel();
    } catch (error) {
      authMessage.textContent = 'Login failed: ' + error.message;
      authMessage.style.color = 'red';
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await window.supabaseClient.auth.signOut();
    showLoginForm();
  });

  // Check if already logged in
  const { data: { user } } = await window.supabaseClient.auth.getUser();
  if (user) {
    showAdminPanel();
  } else {
    showLoginForm();
  }

  function showAdminPanel() {
    authSection.style.display = 'none';
    adminPanel.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
    loadAdminPosts();
  }

  function showLoginForm() {
    authSection.style.display = 'block';
    adminPanel.style.display = 'none';
    logoutBtn.style.display = 'none';
  }

  // Load posts for admin
  async function loadAdminPosts() {
    const container = document.getElementById('postsList');
    try {
      const { data: posts, error } = await window.supabaseClient
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!posts.length) {
        container.innerHTML = '<p style="color:var(--steel)">No posts yet. Click New Post to create one.</p>';
        return;
      }
      container.innerHTML = posts.map(post => `
        <div class="admin-post-item">
          <div class="post-info">
            <h4>${sanitizeHtml(post.title)}</h4>
            <span class="post-status status-${post.status}">${post.status}</span>
            <span class="post-date">${formatDate(post.created_at)}</span>
          </div>
          <div class="post-actions">
            <button onclick="editPost('${post.id}')">Edit</button>
            <button onclick="deletePost('${post.id}')">Delete</button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      container.innerHTML = '<p style="color:red">Error loading posts: ' + error.message + '</p>';
    }
  }

  // New post button
  document.getElementById('newPostBtn').addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'New Post';
    document.getElementById('postForm').reset();
    document.getElementById('postModal').style.display = 'flex';
  });

  // Close modal
  document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('postModal').style.display = 'none';
  });

  // Save post
  document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const post = {
      title: document.getElementById('postTitle').value,
      slug: document.getElementById('postSlug').value,
      excerpt: document.getElementById('postExcerpt').value,
      content: document.getElementById('postContent').value,
      tags: document.getElementById('postTags').value,
      status: document.getElementById('postStatus').value
    };
    try {
      const { error } = await window.supabaseClient.from('blog_posts').insert([post]);
      if (error) throw error;
      document.getElementById('postModal').style.display = 'none';
      loadAdminPosts();
    } catch (error) {
      alert('Error saving post: ' + error.message);
    }
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab + 'Tab').style.display = 'block';
    });
  });
});
