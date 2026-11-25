import { NextResponse } from 'next/server'
import { syncMailbox } from '../../../../lib/integrations/agentmail/sync.mjs'

export const dynamic = 'force-dynamic'

/* Pull the mailbox into the procurement record. Same-origin only: this is a
   mutation of local state triggered from the console. */
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ ok: false, error: 'forbidden_origin' }, { status: 403 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch (error) {
    body = {}
  }

  const limit = Number.isFinite(Number(body.limit)) ? Math.min(Math.max(Number(body.limit), 1), 50) : 25
  const result = await syncMailbox({ limit, extract: body.extract !== false })
  return NextResponse.json(result, { status: result.ok ? 200 : 502, headers: { 'cache-control': 'no-store' } })
}
