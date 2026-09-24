import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { VILLAGES, jitter, ISSUES, RESOLVED } from './seed-data'

/**
 * Netlify lambdas get a read-only /var/task, but SQLite wants writes.
 * Strategy: always run against a writable copy in /tmp. If the build
 * managed to bundle db/custom.db into the function, copy it. If it did
 * not, rebuild the schema and seed from source (lib/seed-data.ts) so a
 * cold lambda is never empty and never 500s.
 */

const IN_LAMBDA = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME)
const TMP_DB = '/tmp/kibera-connect.db'

function envRawUrl(): string {
  const url = process.env.DATABASE_URL ?? 'file:./db/custom.db'
  return url.startsWith('file:') ? url.slice('file:'.length) : url
}

function findBundledDb(): string | null {
  const raw = envRawUrl()
  const candidates = [
    raw.startsWith('/') ? raw : null,
    '/var/task/db/custom.db',
    path.join(process.cwd(), 'db', 'custom.db'),
    path.join(process.cwd(), raw),
  ].filter((p): p is string => Boolean(p))

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p
    } catch {
      // ignore and keep looking
    }
  }
  return null
}

if (IN_LAMBDA) {
  try {
    if (!fs.existsSync(TMP_DB)) {
      const bundled = findBundledDb()
      if (bundled) {
        fs.copyFileSync(bundled, TMP_DB)
      }
      // No bundled file: the bootstrap below creates the schema in /tmp.
    }
    process.env.DATABASE_URL = `file:${TMP_DB}`
  } catch {
    // fall through with the original URL; bootstrap will try /tmp anyway
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  kiberaDbReady: Promise<void> | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NETLIFY ? [] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Schema DDL matching prisma/schema.prisma. Idempotent: a bundled,
 * already-seeded database runs straight through; an empty /tmp file
 * gets the tables, then the seed.
 */
const DDL = `
CREATE TABLE IF NOT EXISTS "Issue" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'medium',
  "village" TEXT,
  "latitude" REAL,
  "longitude" REAL,
  "photoUrl" TEXT,
  "reporterName" TEXT,
  "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'reported',
  "aiSummary" TEXT,
  "aiActions" TEXT,
  "aiAffected" INTEGER,
  "upvotes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "IssueUpdate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "issueId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT,
  "author" TEXT NOT NULL DEFAULT 'Community Team',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IssueUpdate_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "IssueUpdate_issueId_idx" ON "IssueUpdate"("issueId");
`

async function bootstrapDatabase(): Promise<void> {
  await db.$executeRawUnsafe(DDL)

  const existing = await db.issue.count()
  if (existing > 0) return

  // Same Kibera, rebuilt from source. Matches scripts/seed.ts exactly.
  for (let i = 0; i < ISSUES.length; i++) {
    const issue = ISSUES[i]
    const v = VILLAGES[issue.village] ?? { lat: -1.313, lng: 36.789 }
    const loc = jitter(v, i + 2)
    const createdAt = new Date(Date.now() - issue.daysAgo * 24 * 3600 * 1000 - i * 3600 * 1000)

    const created = await db.issue.create({
      data: {
        title: issue.title,
        description: issue.description,
        category: issue.category,
        severity: issue.severity,
        village: issue.village,
        latitude: loc.lat,
        longitude: loc.lng,
        reporterName: issue.reporter,
        isAnonymous: issue.reporter === 'Anonymous',
        status: issue.status,
        photoUrl: issue.photoUrl ?? null,
        aiSummary: issue.aiSummary,
        aiActions: JSON.stringify(issue.aiActions),
        aiAffected: issue.aiAffected,
        upvotes: issue.upvotes,
        createdAt,
        updatedAt: createdAt,
      },
    })

    if (issue.updateMessage) {
      await db.issueUpdate.create({
        data: {
          issueId: created.id,
          message: issue.updateMessage,
          status: issue.status,
          author: 'Community Response Team',
          createdAt: new Date(createdAt.getTime() + 12 * 3600 * 1000),
        },
      })
    }
  }

  for (let i = 0; i < RESOLVED.length; i++) {
    const r = RESOLVED[i]
    const v = VILLAGES[r.village]
    const loc = jitter(v, i + 11)
    await db.issue.create({
      data: {
        title: r.title,
        description: r.description,
        category: i === 0 ? 'water' : 'safety',
        severity: 'medium',
        village: r.village,
        latitude: loc.lat,
        longitude: loc.lng,
        reporterName: 'Community Response Team',
        status: 'resolved',
        photoUrl: i === 0 ? '/images/pipe-after.jpg' : null,
        aiSummary:
          'Resolution confirmed through community verification. Impact metrics captured for transparency reporting.',
        aiActions: JSON.stringify([
          'Verify impact with beneficiary interviews',
          'Publish resolution report to platform',
        ]),
        aiAffected: i === 0 ? 700 : 350,
        upvotes: r.upvotes,
        createdAt: new Date(Date.now() - r.daysAgo * 24 * 3600 * 1000),
      },
    })
  }
}

// Runs exactly once per process. API routes await this before querying,
// so a cold lambda seeds itself before the first request lands.
export const dbReady: Promise<void> =
  globalForPrisma.kiberaDbReady ??
  bootstrapDatabase().catch((error) => {
    console.error('Database bootstrap failed:', error)
    throw error
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.kiberaDbReady = dbReady
