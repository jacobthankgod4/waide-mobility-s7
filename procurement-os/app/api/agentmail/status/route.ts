import { NextResponse } from 'next/server'
import { status } from '../../../../lib/integrations/agentmail/client.mjs'

export const dynamic = 'force-dynamic'

/* AgentMail connection state for the console. Read-only: this route never
   creates an inbox, so opening the page cannot change the account. */
export async function GET() {
  const state = await status()
  return NextResponse.json(state, { headers: { 'cache-control': 'no-store' } })
}
