// app.js - Supabase initialization and common utility functions
// IMPORTANT: Replace the two values below with your actual Supabase project details.
// Find them at: https://supabase.com/dashboard → your project → Settings → API

const supabaseUrl = 'YOUR_SUPABASE_URL';       // e.g. https://xyzxyz.supabase.co
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';  // the "anon public" key

if (!supabaseUrl.startsWith('https://') || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️  app.js: Supabase URL and anon key are not configured. Blog, comments, likes and ratings will not work until you set them.');
}

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabase;

// --- Utility functions used across pages ---

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function sanitizeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Basic Markdown → HTML converter
function parseMarkdown(text) {
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2">$1</a>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');
}
