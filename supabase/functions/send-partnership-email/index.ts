import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

/* Partnership enquiry relay.
   Not shipped with the website (stage.mjs excludes supabase/). If it is ever
   deployed, it must not behave as an open relay: the caller must be same
   origin, and every value is escaped before it reaches the email body. */

const ALLOWED_ORIGINS = new Set([
  "https://waidemobility.com",
  "https://www.waidemobility.com",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
])

const MAX_LENGTH = { name: 120, organisation: 160, email: 200, type: 80, country: 80, message: 4000 }

function escapeHtml(value: unknown, max: number): string {
  return String(value ?? "")
    .slice(0, max)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

serve(async (req) => {
  const origin = req.headers.get("origin") ?? ""
  const allowed = ALLOWED_ORIGINS.has(origin)
  const cors = {
    "Access-Control-Allow-Origin": allowed ? origin : "https://waidemobility.com",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: cors })
  }

  if (!allowed) {
    return new Response("Origin not allowed", { status: 403, headers: cors })
  }

  try {
    const body = await req.json()

    const email = String(body?.email ?? "").trim()
    if (!isEmail(email)) {
      return new Response("A valid email address is required", { status: 422, headers: cors })
    }

    const resendKey = Deno.env.get("RESEND_API_KEY")
    if (!resendKey) {
      return new Response("Email service not configured", { status: 500, headers: cors })
    }

    const firstName = escapeHtml(body?.firstName, MAX_LENGTH.name)
    const lastName = escapeHtml(body?.lastName, MAX_LENGTH.name)
    const organisation = escapeHtml(body?.organization, MAX_LENGTH.organisation) || "not given"
    const partnershipType = escapeHtml(body?.partnershipType, MAX_LENGTH.type) || "not given"
    const country = escapeHtml(body?.country, MAX_LENGTH.country) || "not given"
    const message = escapeHtml(body?.message, MAX_LENGTH.message)
    const safeEmail = escapeHtml(email, MAX_LENGTH.email)

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: Deno.env.get("RESEND_FROM") ?? "onboarding@resend.dev",
        to: [Deno.env.get("PARTNERSHIP_TO") ?? "sales@waidemobility.com"],
        reply_to: email,
        subject: `Partnership request from ${organisation}`,
        html: `
          <h2>Partnership request</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Organisation:</strong> ${organisation}</p>
          <p><strong>Partnership type:</strong> ${partnershipType}</p>
          <p><strong>Country or region:</strong> ${country}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      })
    })

    return new Response(res.ok ? "Email sent" : "Failed to send email", {
      status: res.ok ? 200 : 502,
      headers: cors
    })
  } catch {
    return new Response("Error processing request", { status: 400, headers: cors })
  }
})
