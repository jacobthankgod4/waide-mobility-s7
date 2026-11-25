#!/usr/bin/env node
/* Temporal driver: starts a workflow, signals it like a person would, and
   prints what the workflow decided.

   Usage:
     node scripts/temporal-run.mjs approval [approvalId]
     node scripts/temporal-run.mjs bid [opportunityId]

   The approval probe creates its own record (`AP-2026-900`) so the demonstration
   does not consume a real pending decision. It then proves dual control in the
   only way that counts: the same authority is refused a second time, and the
   action closes when two distinct authorities have signed. */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
try {
  process.loadEnvFile(path.join(root, '.env.local'))
} catch {
  /* Defaults below are enough. */
}

const { loadStore, saveStore } = await import('../lib/data/store.mjs')

const mode = process.argv[2] || 'approval'
const target = process.argv[3]

const address = process.env.TEMPORAL_ADDRESS || '127.0.0.1:7233'
const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'waide-procurement'

const { Connection, Client } = await import('@temporalio/client')
const connection = await Connection.connect({ address })
const client = new Client({ connection })

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function describe(handle) {
  const info = await handle.describe()
  return { status: info.status.name, workflowId: info.workflowId, runId: info.runId }
}

if (mode === 'approval') {
  const approvalId = target || 'AP-2026-900'
  const store = loadStore()

  if (!store.approvals.some((item) => item.id === approvalId)) {
    store.approvals.unshift({
      id: approvalId,
      action: 'supplier.advance',
      subjectId: 'TEMPORAL-PROBE',
      subjectLabel: 'Durable dual-control probe (Temporal)',
      risk: 'amber',
      status: 'pending',
      requestedBy: 'u-ai',
      requestedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
      payloadHash: 'ph-temporal-probe',
      evidence: ['Temporal workflow run', 'Two distinct authorities required'],
      summary: 'Created by scripts/temporal-run.mjs to prove that an approval survives beyond a page request and needs two distinct authorities.',
      requiredRoles: ['managing_director', 'finance_approver'],
      amount: 1000,
      decisions: []
    })
    saveStore(store)
  }

  const handle = await client.workflow.start('approvalWorkflow', {
    taskQueue,
    workflowId: `approval-${approvalId}-${randomUUID().slice(0, 8)}`,
    args: [{ approvalId, windowMs: 10 * 60 * 1000 }]
  })

  await wait(1500)
  console.log(JSON.stringify({ step: 'started', ...(await describe(handle)) }))

  await handle.signal('decision', { role: 'managing_director', name: 'MD probe', decision: 'approve', rationale: 'First signature.' })
  await wait(1200)

  /* The same role twice must not satisfy a two-authority approval. */
  await handle.signal('decision', { role: 'managing_director', name: 'MD probe', decision: 'approve', rationale: 'Second signature by the same authority.' })
  await wait(1200)

  await handle.signal('decision', { role: 'finance_approver', name: 'Finance probe', decision: 'approve', rationale: 'Second distinct authority.' })

  const result = await handle.result()
  console.log(JSON.stringify({ step: 'result', result }, null, 2))

  const after = loadStore().approvals.find((item) => item.id === approvalId)
  console.log(JSON.stringify({ step: 'persisted', status: after.status, decisions: after.decisions.length, decidedBy: after.decidedBy }, null, 2))
} else if (mode === 'bid') {
  const opportunityId = target || loadStore().opportunities.find((item) => item.stage === 'eligible')?.id
  if (!opportunityId) {
    console.log(JSON.stringify({ ok: false, reason: 'No eligible opportunity in the store.' }))
    process.exit(1)
  }

  const handle = await client.workflow.start('bidWorkflow', {
    taskQueue,
    workflowId: `bid-${opportunityId}-${randomUUID().slice(0, 8)}`,
    args: [{ opportunityId, approvalWindowMs: 5000, receiptWindowMs: 5000 }]
  })
  console.log(JSON.stringify({ step: 'started', ...(await describe(handle)) }))

  const result = await handle.result()
  console.log(JSON.stringify({ step: 'result', result }, null, 2))
} else {
  console.log(JSON.stringify({ ok: false, reason: `unknown mode ${mode}; use approval or bid` }))
  process.exit(1)
}

await connection.close()
