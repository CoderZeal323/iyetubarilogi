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
    const supabaseResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name, email, reason, message })
    });

    if (!supabaseResponse.ok) {
      console.error('Supabase error:', await supabaseResponse.text());
    }

    // Notify owner via Web3Forms
    const ownerResponse = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '21a33d17-0162-4526-a6c6-c8a0992bc83c',
        subject: `New Contact Form Submission: ${reason}`,
        from_name: name,
        replyto: email,
        message: `Name: ${name}\nEmail: ${email}\nReason: ${reason}\n\nMessage:\n${message}`
      })
    });

    const ownerResult = await ownerResponse.json();

    if (!ownerResult.success) {
      console.error('Web3Forms error:', ownerResult);
      return new Response(JSON.stringify({ error: 'Failed to send notification email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send thank-you to user via Web3Forms
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '21a33d17-0162-4526-a6c6-c8a0992bc83c',
        subject: "Thanks for reaching out — I'll be in touch soon",
        from_name: 'Iyetu Barilogi',
        to: email,
        replyto: 'iyetubarilogi@gmail.com',
        message: `Hi ${name},\n\nThank you for getting in touch! I've received your message and will respond within 1-2 business days.\n\nYour message:\n${message}\n\nBest regards,\nIyetu Barilogi\nMaintenance & Reliability Engineer`
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
