import { PrismaClient } from "@prisma/client";

// prismaClient 인스턴스 생성
export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  errorFormat: "pretty",
});
