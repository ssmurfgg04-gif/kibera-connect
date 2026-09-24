import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

/**
 * Netlify lambdas get a read-only /var/task, but SQLite wants writes.
 * On boot we copy the bundled, pre-seeded database into /tmp (writable)
 * and point Prisma at that copy. Data survives per lambda instance;
 * the seed always exists as the base layer.
 */
function resolveSqliteUrl() {
  if (!process.env.DATABASE_URL?.startsWith('file:')) return

  const raw = process.env.DATABASE_URL.slice('file:'.length)

  // Only rewrite inside a Netlify function runtime.
  if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) return

  const bundledCandidates = [
    path.join('/var/task', raw.replace(/^\//, '')),
    path.join(process.cwd(), raw.replace(/^\//, '')),
    raw,
  ]

  const bundled = bundledCandidates.find((p) => {
    try {
      return fs.existsSync(p)
    } catch {
      return false
    }
  })

  if (!bundled) return

  const tmpDb = '/tmp/kibera-connect.db'
  try {
    if (!fs.existsSync(tmpDb)) {
      fs.copyFileSync(bundled, tmpDb)
    }
    process.env.DATABASE_URL = `file:${tmpDb}`
  } catch {
    // fall through with the original URL
  }
}

resolveSqliteUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NETLIFY ? [] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
