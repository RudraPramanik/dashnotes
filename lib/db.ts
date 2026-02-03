import { PrismaClient } from "./generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  })

export const db = prismaClient as any

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient
}

