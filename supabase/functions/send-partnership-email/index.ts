import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { firstName, lastName, email, organization, partnershipType, country, message } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_gsoXEWL7_3JYwcaF7MnFiCGCXi6UqcQYJ',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['jacob@waidemobility.org'],
        subject: `Partnership Request from ${organization}`,
        html: `
          <h2>Partnership Request</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Organization:</strong> ${organization}</p>
          <p><strong>Partnership Type:</strong> ${partnershipType}</p>
          <p><strong>Country/Region:</strong> ${country}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      })
    })

    if (res.ok) {
      return new Response('Email sent successfully', { status: 200 })
    } else {
      return new Response('Failed to send email', { status: 500 })
    }
  } catch (error) {
    return new Response('Error processing request', { status: 500 })
  }
})