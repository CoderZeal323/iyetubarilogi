export async function onRequestPost({ request, env }) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
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
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Iyetu Barilogi <noreply@guebiopren.resend.app>',
        to: ['iyetubarilogi@gmail.com'],
        subject: 'New Newsletter Subscriber',
        html: `
          <h2>New Subscriber!</h2>
          <p><strong>${email}</strong> just subscribed to your newsletter.</p>
          <hr>
          <p style="color:#888;font-size:12px;">Via your portfolio subscribe form.</p>
        `
      })
    });
    const welcomeResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Iyetu Barilogi <noreply@guebiopren.resend.app>',
        to: [email],
        subject: 'Welcome to My Maintenance & Reliability Newsletter',
        html: `
          <h2>You're subscribed!</h2>
          <p>Thank you for subscribing to insights on maintenance engineering, CMMS implementation, and reliability best practices.</p>
          <p>You'll receive occasional updates on:</p>
          <ul>
            <li>CMMS deployment strategies</li>
            <li>Reliability engineering techniques</li>
            <li>Maintenance optimization tips</li>
            <li>Industry trends and case studies</li>
          </ul>
          <p>Best regards,<br>
          <strong>Iyetu Barilogi</strong><br>
          Maintenance &amp; Reliability Engineer</p>
          <p style="color:#888;font-size:12px;">
            <a href="mailto:iyetubarilogi@gmail.com?subject=Unsubscribe&body=Please unsubscribe ${encodeURIComponent(email)}">Unsubscribe</a>
          </p>
        `
      })
    });
    if (!welcomeResponse.ok) {
      console.error('Resend welcome email error:', await welcomeResponse.text());
    }
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
