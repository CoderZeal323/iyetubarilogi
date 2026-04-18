export async function onRequestPost({ request, env }) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store in Supabase
    const supabaseResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        email,
        subscribed_at: new Date().toISOString()
      })
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      if (!errorText.includes('duplicate key') && !errorText.includes('unique')) {
        console.error('Supabase error:', errorText);
        return new Response(JSON.stringify({ error: 'Failed to subscribe' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Notify owner via Web3Forms
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '21a33d17-0162-4526-a6c6-c8a0992bc83c',
        subject: 'New Newsletter Subscriber',
        from_name: 'Website Notification',
        message: `New subscriber: ${email}`
      })
    });

    // Send welcome email to subscriber via Web3Forms
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '21a33d17-0162-4526-a6c6-c8a0992bc83c',
        subject: 'Welcome to My Maintenance & Reliability Newsletter',
        from_name: 'Iyetu Barilogi',
        to: email,
        message: `You're subscribed!\n\nThank you for subscribing to insights on maintenance engineering, CMMS implementation, and reliability best practices.\n\nBest regards,\nIyetu Barilogi\nMaintenance & Reliability Engineer`
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Subscribe function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
