// app.js - Supabase initialization and common utility functions
// IMPORTANT: Replace the two values below with your actual Supabase project details.
// Find them at: https://supabase.com/dashboard → your project → Settings → API

const supabaseUrl = 'https://fqgklqqszoddoxaifcjl.supabase.co';       // e.g. https://xyzxyz.supabase.co
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxZ2tscXFzem9kZG94YWlmY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDU0ODcsImV4cCI6MjA5MTk4MTQ4N30.d69rut82ZA-Eah7iH7muU3eqHrgXPLR6YnHM0VzHIF4';  // the "anon public" key

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabaseClient;

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
