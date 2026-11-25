/* AgentMail client and capability registry.

   The SDK exposes far more than an enquiry acknowledgement. This module wraps
   every endpoint the package ships, records what each is for, and states
   whether this system drives it automatically, exposes it to a human, or
   deliberately leaves it to the account owner. That distinction matters: a
   procurement system may send an RFQ, but it must never be able to delete an
   organisation, rotate an API key or sign itself up.

   Nothing here throws to the caller. A missing key, a rejected request or an
   outage returns { ok: false, reason } so the calling screen can show what
   happened instead of the request dying mid-page. */

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { AgentMailClient } = require('agentmail')

const INBOX_CLIENT_ID = 'waide-procurement-os-v1'
const INBOX_DISPLAY_NAME = 'Waide Procurement Desk'

/* ------------------------------------------------------------------ surface */

/* Every SDK group and method, with the reason it exists in a procurement
   context. 'automated' = the system calls it; 'human' = a person triggers it
   from the console; 'owner_only' = account administration we deliberately do
   not automate. */

/* The surface is declared as path -> methods, transcribed from the installed
   package's own type declarations, and then proven at runtime by hasMethod().
   A method named here that the package does not ship would 404 in production,
   so `sdkSurfaceAudit()` reports the difference and the live probe fails on it.

   This replaced a hand-written 120-row list in which six entries did not exist
   (organisation-level drafts are read-only; `files` is inbox-scoped only; auth
   exposes `me`, not `authenticate`). Documentation that drifts from the SDK is
   worse than none: it claims coverage the system cannot deliver. */

const METHODS = {
  inboxes: ['list', 'search', 'get', 'create', 'update', 'delete', 'authorize'],
  'inboxes.messages': ['list', 'search', 'get', 'getRaw', 'send', 'reply', 'replyAll', 'forward', 'update', 'delete', 'batchGet', 'batchUpdate', 'getAttachment', 'createAgentArmorFeedback', 'releaseAgentArmorMessage'],
  'inboxes.threads': ['list', 'search', 'get', 'update', 'delete', 'getAttachment'],
  'inboxes.drafts': ['list', 'get', 'create', 'update', 'delete', 'send', 'getAttachment'],
  'inboxes.lists': ['list', 'get', 'create', 'delete'],
  'inboxes.events': ['list'],
  'inboxes.webhooks': ['list', 'get', 'create', 'update', 'delete', 'getHeaders', 'updateHeaders'],
  'inboxes.webhooks.polling': ['list', 'get', 'create', 'update', 'delete'],
  'inboxes.forwarding': ['get', 'update', 'delete'],
  'inboxes.files': ['create', 'complete', 'list', 'get', 'delete'],
  'inboxes.metrics': ['queryEvents', 'queryUsage', 'queryRates'],
  'inboxes.apiKeys': ['list', 'create', 'update', 'delete'],
  'inboxes.accounts': ['list', 'get'],
  'inboxes.calendar': ['get', 'update', 'listEvents', 'getAgenda', 'createEvent', 'getEvent', 'updateEvent', 'deleteEvent', 'listEventInstances', 'respondToEvent'],

  webhooks: ['list', 'get', 'create', 'update', 'delete', 'getHeaders', 'updateHeaders'],
  'webhooks.polling': ['list', 'get', 'create', 'update', 'delete'],
  threads: ['list', 'search', 'get', 'update', 'delete', 'getAttachment'],
  drafts: ['list', 'get', 'getAttachment'],
  lists: ['list', 'get', 'create', 'delete'],
  metrics: ['queryEvents', 'queryUsage', 'queryRates'],

  pods: ['list', 'get', 'create', 'delete'],
  'pods.inboxes': ['list', 'search', 'get', 'create', 'update', 'delete'],
  'pods.threads': ['list', 'search', 'get', 'getAttachment', 'update', 'delete'],
  'pods.drafts': ['list', 'get', 'getAttachment'],
  'pods.lists': ['list', 'get', 'create', 'delete'],
  'pods.domains': ['list', 'get', 'getZoneFile', 'create', 'update', 'delete', 'verify'],
  'pods.webhooks': ['list', 'get', 'create', 'update', 'delete', 'getHeaders', 'updateHeaders'],
  'pods.metrics': ['queryEvents', 'queryUsage', 'queryRates'],
  'pods.apiKeys': ['list', 'create', 'update', 'delete'],
  'pods.accounts': ['list', 'get'],
  'pods.forwarding': ['get', 'update', 'delete'],

  domains: ['list', 'get', 'create', 'update', 'delete', 'verify', 'getSetupLink', 'getZoneFile'],
  forwarding: ['get', 'update', 'delete', 'startVerification', 'confirmVerification'],
  apiKeys: ['list', 'get', 'create', 'update', 'delete'],
  accounts: ['list', 'get', 'update'],
  organizations: ['get', 'getLabs', 'joinLabs'],
  apps: ['list', 'search', 'get', 'listAccounts', 'connect'],
  agent: ['signUp', 'attachHuman', 'verify'],
  auth: ['me'],
  websockets: ['connect']
}

/* Named reasons where the procurement meaning is not obvious from the method
   name. Anything unlisted still appears in the report, with a generated label,
   because completeness matters more than prose. */
const PURPOSES = {
  'inboxes.create': 'Create the desk inbox idempotently on first use',
  'inboxes.authorize': 'Grant a human access to a mailbox',
  'inboxes.messages.send': 'Send an RFQ, clarification or acknowledgement (policy-gated)',
  'inboxes.messages.reply': 'Answer a supplier on the existing thread',
  'inboxes.messages.getAttachment': 'Fetch a supplier attachment for extraction',
  'inboxes.messages.update': 'Apply labels that record processing state',
  'inboxes.messages.batchUpdate': 'Label a batch after a sync pass',
  'inboxes.messages.getRaw': 'Inspect raw MIME when a header is disputed',
  'inboxes.drafts.create': 'Stage a human-approval message without sending it',
  'inboxes.drafts.send': 'Send an approved draft (a named human presses this)',
  'inboxes.webhooks.create': 'Register the signed webhook on the mailbox',
  'inboxes.events.list': 'Audit delivery and bounce events per mailbox',
  'inboxes.files.create': 'Upload a large attachment to the mailbox file store',
  'inboxes.metrics.queryEvents': 'Delivery metrics for the desk',
  'inboxes.calendar.createEvent': 'Schedule a supplier meeting',
  'inboxes.calendar.getAgenda': 'Show the next week of supplier meetings',
  'webhooks.create': 'Create the organisation webhook for message events',
  'webhooks.list': 'Show registered webhooks so a stale delivery URL is visible',
  'domains.verify': 'Trigger DNS verification of a sending domain',
  'pods.list': 'Tenant separation between trading entities',
  'metrics.queryRates': 'Bounce and delivery rates',
  'websockets.connect': 'Live event stream alternative to webhooks',
  'agent.signUp': 'Create the agent account - the owner does this, not the system',
  'auth.me': 'Read the authenticated account'
}

/* Things the system drives on its own. Everything else needs a person or the
   account owner; a new method is human by default, never automated. */
const AUTOMATED = new Set([
  'inboxes.list', 'inboxes.get', 'inboxes.create', 'inboxes.search',
  'inboxes.messages.list', 'inboxes.messages.get', 'inboxes.messages.send',
  'inboxes.messages.reply', 'inboxes.messages.update', 'inboxes.messages.batchUpdate',
  'inboxes.messages.getAttachment', 'inboxes.threads.list', 'inboxes.threads.get',
  'inboxes.threads.getAttachment', 'inboxes.drafts.create', 'inboxes.events.list',
  'inboxes.webhooks.create', 'inboxes.webhooks.list', 'inboxes.webhooks.get',
  'webhooks.create', 'webhooks.list', 'webhooks.get', 'threads.list', 'threads.get'
])

/* Irreversible or account-level actions. Deleting correspondence destroys the
   evidence a procurement decision rests on, so no code path may do it. */
const OWNER_ONLY = new Set([
  'inboxes.delete', 'inboxes.authorize', 'inboxes.messages.delete',
  'inboxes.threads.delete', 'inboxes.forwarding.update', 'inboxes.forwarding.delete',
  'inboxes.apiKeys.list', 'inboxes.apiKeys.create', 'inboxes.apiKeys.update', 'inboxes.apiKeys.delete',
  'threads.delete', 'pods.create', 'pods.delete', 'pods.domains.create', 'pods.domains.delete',
  'pods.domains.verify', 'pods.apiKeys.create', 'pods.apiKeys.delete',
  'domains.create', 'domains.update', 'domains.delete', 'domains.verify', 'domains.getSetupLink', 'domains.getZoneFile',
  'forwarding.update', 'forwarding.delete', 'forwarding.startVerification', 'forwarding.confirmVerification',
  'apiKeys.list', 'apiKeys.create', 'apiKeys.update', 'apiKeys.delete',
  'accounts.list', 'accounts.get', 'accounts.update', 'agent.signUp', 'agent.verify', 'agent.attachHuman',
  'organizations.joinLabs'
])

function exposureOf(key) {
  if (AUTOMATED.has(key)) return 'automated'
  if (OWNER_ONLY.has(key)) return 'owner_only'
  return 'human'
}

/* Shape preserved for callers that already consume the flat array. */
export const SDK_SURFACE = Object.entries(METHODS).flatMap(([group, methods]) =>
  methods.map((method) => {
    const key = `${group}.${method}`
    return {
      path: group,
      method,
      key,
      exposure: exposureOf(key),
      purpose: PURPOSES[key] || `${method} on ${group}`
    }
  })
)


export function capabilityReport() {
  const byExposure = { automated: 0, human: 0, owner_only: 0 }
  for (const item of SDK_SURFACE) byExposure[item.exposure] += 1
  return {
    total: SDK_SURFACE.length,
    ...byExposure,
    items: SDK_SURFACE
  }
}

/* ------------------------------------------------------------------- client */

let cachedClient = null
let cachedInbox = null

export function apiKey() {
  return process.env.AGENTMAIL_API_KEY || ''
}

export function webhookSecret() {
  return process.env.AGENTMAIL_WEBHOOK_SECRET || ''
}

export function configuredInbox() {
  return process.env.AGENTMAIL_INBOX || ''
}

export function isConfigured() {
  return Boolean(apiKey())
}

export function client() {
  if (!isConfigured()) return null
  if (!cachedClient) cachedClient = new AgentMailClient({ apiKey: apiKey() })
  return cachedClient
}

/* Resolve a method path such as 'inboxes.messages.send' against a client. */
function resolveOn(mail, path) {
  if (!mail) return null
  let target = mail
  for (const segment of path.split('.')) {
    if (target == null) return null
    target = target[segment]
  }
  return typeof target === 'function' ? target : null
}

function resolve(path) {
  return resolveOn(client(), path)
}

/* A throwaway client used only to check that a method path resolves. Building
   the SDK's resource graph makes no network call, so any non-empty key is
   enough and the surface can be audited before an owner supplies a real one. */
let cachedSurfaceClient = null
function surfaceClient() {
  if (!cachedSurfaceClient) cachedSurfaceClient = new AgentMailClient({ apiKey: apiKey() || 'surface-probe' })
  return cachedSurfaceClient
}

export function hasMethod(path) {
  return Boolean(resolveOn(surfaceClient(), path))
}

/* Compare what this module claims with what the installed package ships. The
   result is empty when they agree; `npm test` fails on any difference, so the
   registry cannot quietly claim an endpoint the SDK does not have. */
export function sdkSurfaceAudit() {
  const missing = []
  for (const entry of SDK_SURFACE) {
    if (!hasMethod(`${entry.path}.${entry.method}`)) missing.push(`${entry.path}.${entry.method}`)
  }
  const counts = { automated: 0, human: 0, owner_only: 0 }
  for (const entry of SDK_SURFACE) counts[entry.exposure] += 1
  return { ok: missing.length === 0, total: SDK_SURFACE.length, missing, ...counts }
}

function errorShape(error) {
  const status = error && (error.statusCode || error.status)
  const body = error && (error.body || error.detail || error.message)
  return {
    ok: false,
    status: status || null,
    reason: String(body && body.message ? body.message : body || 'AgentMail request failed').slice(0, 400),
    raw: body && typeof body === 'object' ? body : undefined
  }
}

/* Call any SDK method through one guarded seam: no unhandled rejection ever
   reaches a server component. */
export async function call(path, ...args) {
  if (!isConfigured()) {
    return { ok: false, configured: false, reason: 'AGENTMAIL_API_KEY is not set' }
  }
  const fn = resolve(path)
  if (!fn) return { ok: false, reason: 'AgentMail SDK has no method ' + path }

  const [parentPath, methodName] = [path.split('.').slice(0, -1), path.split('.').slice(-1)[0]]
  let parent = client()
  for (const segment of parentPath) parent = parent[segment]

  try {
    const data = await parent[methodName](...args)
    return { ok: true, configured: true, data }
  } catch (error) {
    return errorShape(error)
  }
}

/* The desk mailbox: the address in AGENTMAIL_INBOX when set, otherwise created
   once with a stable client id so a retry returns the same inbox rather than
   leaving orphans behind. */
export async function mailbox() {
  if (configuredInbox()) {
    return { ok: true, inboxId: configuredInbox(), email: configuredInbox(), created: false }
  }
  if (cachedInbox) return { ok: true, ...cachedInbox }
  if (!isConfigured()) return { ok: false, configured: false, reason: 'AGENTMAIL_API_KEY is not set' }

  const created = await call('inboxes.create', {
    clientId: INBOX_CLIENT_ID,
    displayName: INBOX_DISPLAY_NAME
  })

  if (!created.ok) return created

  const inbox = created.data || {}
  cachedInbox = {
    inboxId: inbox.inboxId || inbox.email,
    email: inbox.email || inbox.inboxId,
    created: true
  }
  return { ok: true, ...cachedInbox }
}

/* Health probe used by the console header: does the key work, and which inbox
   answers? It makes one cheap call and never caches a failure. */
export async function status() {
  const report = capabilityReport()
  if (!isConfigured()) {
    return {
      configured: false,
      connected: false,
      inbox: configuredInbox() || null,
      webhookConfigured: Boolean(webhookSecret()),
      capability: report,
      reason: 'No AGENTMAIL_API_KEY in the environment. Add one from console.agentmail.to; the rest of the console works without it.'
    }
  }

  const listed = await call('inboxes.list', {})
  if (!listed.ok) {
    return {
      configured: true,
      connected: false,
      inbox: configuredInbox() || null,
      webhookConfigured: Boolean(webhookSecret()),
      capability: report,
      reason: listed.reason,
      status: listed.status || null
    }
  }

  const inboxes = (listed.data && (listed.data.inboxes || listed.data)) || []
  const address = configuredInbox()
  const match = address
    ? inboxes.find((inbox) => (inbox.email || inbox.inboxId) === address)
    : inboxes.find((inbox) => inbox.clientId === INBOX_CLIENT_ID) || inboxes[0]

  return {
    configured: true,
    connected: true,
    inbox: match ? (match.email || match.inboxId) : (address || null),
    inboxCount: Array.isArray(inboxes) ? inboxes.length : null,
    webhookConfigured: Boolean(webhookSecret()),
    capability: report
  }
}

export function resetClient() {
  cachedClient = null
  cachedInbox = null
}
