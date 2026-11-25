#!/usr/bin/env node
/* Build an explicit, public-only deployment directory.
   The repository also contains strategy notes, environment examples, Supabase
   function sources, archives and unused media. Those must never be published.
   This script copies only pages, site assets and the public/ directory, then
   verifies that every local reference in the published HTML still resolves. */

import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(root, "dist")
const skipDirectories = new Set([".git", "dist", "node_modules", "supabase"])

const requiredFiles = [
  "consultancy.css",
  "automation-status.json",
  "consultancy.js",
  "site.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "public/registration/waide-mobility-cac-certificate.pdf",
  "public/registration/waide-mobility-cac-certificate.jpg"
]

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (skipDirectories.has(entry.name)) continue
      files.push(...await walk(path.join(directory, entry.name)))
    } else if (entry.isFile()) {
      files.push(path.join(directory, entry.name))
    }
  }

  return files
}

async function copyRelative(relative) {
  const from = path.join(root, relative)
  const to = path.join(dist, relative)
  await fs.mkdir(path.dirname(to), { recursive: true })
  await fs.copyFile(from, to)
}

function localReference(value) {
  if (!value) return null
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return null
  if (value.startsWith("/")) return value.slice(1)
  return value
}

await fs.rm(dist, { recursive: true, force: true })
await fs.mkdir(dist, { recursive: true })

const sourceFiles = await walk(root)
const pages = sourceFiles.filter((file) => file.endsWith(".html"))

for (const page of pages) {
  await copyRelative(path.relative(root, page))
}

for (const file of requiredFiles) {
  const exists = await fs.stat(path.join(root, file)).then(() => true).catch(() => false)
  if (!exists) throw new Error(`Missing required deployment file: ${file}`)
  await copyRelative(file)
}

/* Copy only the public assets the site references. public/ also holds
   archival photographs and video that no page uses; shipping the whole
   directory would waste bandwidth and publish material that is not part of
   the site. */
const publicAssets = new Set()
const publicReferencePattern = /(?:href|src)="(public\/[^"]+)"/gi

for (const page of pages) {
  const html = await fs.readFile(page, "utf8")
  for (const match of html.matchAll(publicReferencePattern)) {
    publicAssets.add(match[1].split(/[?#]/)[0])
  }
}

for (const asset of publicAssets) {
  const stat = await fs.stat(path.join(root, asset)).then((value) => value).catch(() => null)
  if (stat && stat.isFile()) await copyRelative(asset)
}

/* The Novare gallery builds its capture paths at runtime, so that directory
   ships whole even though no page names each individual file. */
await fs.cp(path.join(root, "public/novare"), path.join(dist, "public/novare"), { recursive: true })

/* Copy any root-level file referenced by a page (for example a future PDF or
   image kept outside public/), but never copy Markdown, environment or source
   files just because they exist. */
const referencePattern = /(?:href|src)="([^"]+)"/gi
const copied = new Set()

for (const page of pages) {
  const html = await fs.readFile(page, "utf8")
  let match
  while ((match = referencePattern.exec(html)) !== null) {
    const reference = localReference(match[1])
    if (!reference) continue

    const clean = reference.split(/[?#]/)[0]
    if (!clean || clean.startsWith("public/")) continue
    if (copied.has(clean)) continue

    const candidate = path.resolve(root, clean)
    if (!candidate.startsWith(root + path.sep)) continue

    const stat = await fs.stat(candidate).then((value) => value).catch(() => null)
    if (!stat || !stat.isFile()) continue
    if (!/\.(?:html|css|js|json|xml|txt|webmanifest|png|jpe?g|webp|svg|gif|ico|pdf|woff2?)$/i.test(clean)) continue

    await copyRelative(clean)
    copied.add(clean)
  }
}

/* Fail the build if a published HTML page still points at a missing local file. */
const problems = []

for (const file of await walk(dist)) {
  if (!file.endsWith(".html")) continue
  const html = await fs.readFile(file, "utf8")
  const relativePage = path.relative(dist, file)

  for (const match of html.matchAll(referencePattern)) {
    const reference = localReference(match[1])
    if (!reference) continue
    const clean = reference.split(/[?#]/)[0]
    if (!clean) continue

    const target = path.resolve(dist, clean)
    const stat = await fs.stat(target).then((value) => value).catch(() => null)
    if (!stat || !stat.isFile()) problems.push(`${relativePage} -> ${match[1]}`)
  }
}

if (problems.length) {
  console.error("Broken local references in the staged site:")
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}

const stagedFiles = await walk(dist)
const bytes = (await Promise.all(stagedFiles.map((file) => fs.stat(file)))).reduce((total, stat) => total + stat.size, 0)
console.log(`Staged ${pages.length} pages and ${stagedFiles.length} files (${(bytes / 1024 / 1024).toFixed(1)} MB) in dist/`)
