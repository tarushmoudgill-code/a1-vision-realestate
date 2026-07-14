import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Cache the Prisma client on the global object so it survives hot-reloads in
// dev and function-instance reuse on serverless platforms (Vercel).
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (!globalForPrisma.prisma) globalForPrisma.prisma = db
