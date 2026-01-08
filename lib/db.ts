// lib/db.ts
import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const prismaClientSingleton = () =>
  new PrismaClient();

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const prisma =
  global.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}
