export async function onRequestPost({ request, env }) {
  try {
    const { name, email, reason, message } = await request.json();

    if (!name || !email || !reason || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store in Supabase
    await fetch(`${env.SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name, email, reason, message })
    });

    // Notify owner via Web3Forms
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '21a33d17-0162-4526-a6c6-c8a0992bc83c',
        subject: `New Contact: ${reason} from ${name}`,
        name: name,
        email: email,
        message: `Reason: ${reason}\n\nMessage:\n${message}`
      })
    });

    const result = await response.json();
    console.log('Web3Forms result:', JSON.stringify(result));

    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Failed to send notification' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
