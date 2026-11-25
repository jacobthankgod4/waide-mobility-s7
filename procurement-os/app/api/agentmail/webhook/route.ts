import { NextResponse } from 'next/server'
import { verify, routeEvent } from '../../../../lib/integrations/agentmail/webhook.mjs'

export const dynamic = 'force-dynamic'

/* AgentMail delivery endpoint.

   The raw body is read before parsing: a Svix signature is only valid over the
   exact bytes that were sent. An unsigned or wrongly signed delivery is
   rejected with 401 and nothing is stored. */
export async function POST(request: Request) {
  const raw = Buffer.from(await request.arrayBuffer())

  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  const checked = verify(raw, headers)
  if (!checked.ok) {
    return NextResponse.json({ ok: false, error: checked.reason }, { status: checked.status || 401 })
  }

  let event
  try {
    event = typeof checked.event === 'string' ? JSON.parse(checked.event) : checked.event
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
  }

  try {
    const result = routeEvent(event)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  } catch (error: any) {
    /* A 502 asks AgentMail to retry. Retrying is safe because ingestion is
       idempotent on the message id. */
    return NextResponse.json({ ok: false, error: 'processing_failed', detail: String(error?.message ?? error).slice(0, 200) }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'agentmail-webhook', method: 'POST' })
}
