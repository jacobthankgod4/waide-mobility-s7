#!/usr/bin/env node
/* Temporal worker.

   Runs outside Next.js: the console enqueues work, the worker executes it, and
   both read and write the same store. Restarting the console does not cancel an
   approval that is waiting for a second signature.

   Start the server first (`.tools/bin/temporal.exe server start-dev`), then:
     npm run worker
*/

import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
try {
  process.loadEnvFile(path.join(root, '.env.local'))
} catch {
  /* No .env.local: the defaults below are the only configuration needed. */
}

const { NativeConnection, Worker } = await import('@temporalio/worker')
const activities = await import('../lib/temporal/activities.mjs')

const address = process.env.TEMPORAL_ADDRESS || '127.0.0.1:7233'
const namespace = process.env.TEMPORAL_NAMESPACE || 'default'
const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'waide-procurement'

const connection = await NativeConnection.connect({ address })

const worker = await Worker.create({
  connection,
  namespace,
  taskQueue,
  workflowsPath: path.join(root, 'lib', 'temporal', 'workflows.cjs'),
  activities: {
    loadApproval: activities.loadApproval,
    applyApprovalDecision: activities.applyApprovalDecision,
    evaluateBidApproval: activities.evaluateBidApproval,
    recordBidApproval: activities.recordBidApproval,
    recordBidSubmission: activities.recordBidSubmission
  }
})

console.log(JSON.stringify({ event: 'worker.started', address, namespace, taskQueue, at: new Date().toISOString() }))

const shutdown = async (signal) => {
  console.log(JSON.stringify({ event: 'worker.stopping', signal, at: new Date().toISOString() }))
  await worker.shutdown()
  await connection.close()
  process.exit(0)
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

await worker.run()
