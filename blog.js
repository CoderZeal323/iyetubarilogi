// blog.js - Blog CRUD operations

// Load blog posts for listing page
async function loadBlogPosts() {
  const container = document.getElementById('postsContainer');
  const loading = document.getElementById('loading');
  const noPosts = document.getElementById('noPosts');

  try {
    const { data: posts, error } = await window.supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;

    loading.style.display = 'none';

    if (posts.length === 0) {
      noPosts.style.display = 'block';
      return;
    }

    container.innerHTML = posts.map(post => `
      <article class="blog-post-card">
        <h3><a href="post.html?slug=${post.slug}">${sanitizeHtml(post.title)}</a></h3>
        <p class="post-excerpt">${sanitizeHtml(post.excerpt || post.content.substring(0, 150) + '...')}</p>
        <div class="post-meta">
          <span class="post-date">${formatDate(post.created_at)}</span>
          ${post.tags ? `<span class="post-tags">${post.tags.split(',').map(tag => `<span class="tag">${sanitizeHtml(tag.trim())}</span>`).join('')}</span>` : ''}
        </div>
      </article>
    `).join('');

  } catch (error) {
    console.error('Error loading posts:', error);
    loading.textContent = 'Error loading posts.';
  }
}

// Load single blog post
async function loadBlogPost(slug) {
  const container = document.getElementById('postContent');

  try {
    const { data: post, error } = await window.supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;

    if (!post) {
      container.innerHTML = '<p>Post not found.</p>';
      return;
    }

    container.innerHTML = `
      <header class="post-header">
        <h1>${sanitizeHtml(post.title)}</h1>
        <div class="post-meta">
          <span class="post-date">${formatDate(post.created_at)}</span>
          ${post.tags ? `<span class="post-tags">${post.tags.split(',').map(tag => `<span class="tag">${sanitizeHtml(tag.trim())}</span>`).join('')}</span>` : ''}
        </div>
      </header>
      <div class="post-body">
        ${parseMarkdown(post.content)}
      </div>
    `;

  } catch (error) {
    console.error('Error loading post:', error);
    container.innerHTML = '<p>Error loading post.</p>';
  }
}

// Load comments for a post
async function loadComments(slug) {
  const container = document.getElementById('commentsList');

  try {
    const { data: comments, error } = await window.supabaseClient
      .from('comments')
      .select('*')
      .eq('post_slug', slug)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (comments.length === 0) {
      container.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
      return;
    }

    container.innerHTML = comments.map(comment => `
      <div class="comment">
        <div class="comment-header">
          <strong>${sanitizeHtml(comment.name)}</strong>
          <span class="comment-date">${formatDate(comment.created_at)}</span>
        </div>
        <div class="comment-body">${sanitizeHtml(comment.content)}</div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

// Submit comment
document.addEventListener('DOMContentLoaded', () => {
  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug');
      const name = document.getElementById('commentName').value;
      const email = document.getElementById('commentEmail').value;
      const content = document.getElementById('commentText').value;

      try {
        const { error } = await window.supabaseClient
          .from('comments')
          .insert([{
            post_slug: slug,
            name: name,
            email: email,
            content: content
          }]);

        if (error) throw error;

        // Reload comments
        loadComments(slug);
        commentForm.reset();

      } catch (error) {
        console.error('Error posting comment:', error);
        alert('Error posting comment. Please try again.');
      }
    });
  }
});

// Load likes and rating for a post
async function loadLikesAndRating(slug) {
  try {
    // Load likes count
    const { data: likes, error: likesError } = await window.supabaseClient
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('post_slug', slug);

    if (likesError) throw likesError;

    document.getElementById('likeCount').textContent = likes.length;

    // Load ratings
    const { data: ratings, error: ratingsError } = await window.supabaseClient
      .from('ratings')
      .select('rating')
      .eq('post_slug', slug);

    if (ratingsError) throw ratingsError;

    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : '0.0';

    document.getElementById('avgRating').textContent = avgRating;
    document.getElementById('ratingCount').textContent = ratings.length;

    // Update star display
    updateStarDisplay(avgRating);

  } catch (error) {
    console.error('Error loading likes/rating:', error);
  }
}

// Handle like button
document.addEventListener('DOMContentLoaded', () => {
  const likeBtn = document.getElementById('likeBtn');
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug');

      try {
        const { error } = await window.supabaseClient
          .from('likes')
          .insert([{ post_slug: slug }]);

        if (error) throw error;

        loadLikesAndRating(slug);

      } catch (error) {
        console.error('Error liking post:', error);
      }
    });
  }

  // Handle rating stars
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', async () => {
      const rating = parseInt(star.dataset.rating);
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug');

      try {
        const { error } = await window.supabaseClient
          .from('ratings')
          .insert([{ post_slug: slug, rating: rating }]);

        if (error) throw error;

        loadLikesAndRating(slug);

      } catch (error) {
        console.error('Error rating post:', error);
      }
    });
  });
});

function updateStarDisplay(avgRating) {
  const stars = document.querySelectorAll('.star');
  const rating = parseFloat(avgRating);

  stars.forEach((star, index) => {
    if (index < Math.floor(rating)) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });
}

// Admin functions
async function loadPosts() {
  const container = document.getElementById('postsList');

  try {
    const { data: posts, error } = await window.supabaseClient
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

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
    console.error('Error loading posts:', error);
  }
}

async function loadComments() {
  const container = document.getElementById('commentsList');

  try {
    const { data: comments, error } = await window.supabaseClient
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    container.innerHTML = comments.map(comment => `
      <div class="admin-comment-item">
        <div class="comment-info">
          <strong>${sanitizeHtml(comment.name)}</strong> on "${sanitizeHtml(comment.post_slug)}"
          <span class="comment-date">${formatDate(comment.created_at)}</span>
        </div>
        <div class="comment-content">${sanitizeHtml(comment.content)}</div>
        <div class="comment-actions">
          <button onclick="deleteComment('${comment.id}')">Delete</button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

// Tab switching
document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab + 'Tab').style.display = 'block';
    });
  });
});