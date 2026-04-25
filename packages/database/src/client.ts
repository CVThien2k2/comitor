import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })

  const enableQueryLog = process.env.NODE_ENV !== "production"
  const logs: ("query" | "error")[] = enableQueryLog ? ["query", "error"] : []

  return new PrismaClient({
    adapter,
    log: logs,
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
