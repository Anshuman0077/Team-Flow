import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

// 👇 Add global type definition
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export default prisma
