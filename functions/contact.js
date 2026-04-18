export async function onRequestPost({ request, env }) {
  try {
    const { name, email, reason, message } = await request.json();

    if (!name || !email || !reason || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store in Supabase (using service role key to bypass RLS)
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

    // Email 1: Notify site owner
    const ownerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Website Contact <onboarding@resend.dev>',
        to: ['iyetubarilogi@gmail.com'],
        subject: `New Contact Form Submission: ${reason}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color:#888;font-size:12px;">Submitted via your portfolio contact form.</p>
        `
      })
    });

    if (!ownerEmailResponse.ok) {
      console.error('Resend owner email error:', await ownerEmailResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to send notification email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email 2: Thank-you to the user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Iyetu Barilogi <onboarding@resend.dev>',
        to: [email],
        subject: "Thanks for reaching out — I'll be in touch soon",
        html: `
          <h2>Hi ${name},</h2>
          <p>Thank you for getting in touch! I've received your message and will respond within 1–2 business days.</p>
          <p><strong>Your message:</strong></p>
          <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555;">
            ${message.replace(/\n/g, '<br>')}
          </blockquote>
          <p>Best regards,<br>
          <strong>Iyetu Barilogi</strong><br>
          Maintenance &amp; Reliability Engineer · CMMS Specialist</p>
        `
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
