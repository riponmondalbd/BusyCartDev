/**
 * Seed script: Creates/promotes test accounts for ADMIN and SUPER_ADMIN testing.
 * Run with: npx ts-node --skip-project src/scripts/seedRoles.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import * as bcrypt from "bcrypt";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("Test@1234", 10);

  // ── SUPER_ADMIN ──────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@busycart.test" },
    update: { role: "SUPER_ADMIN" },
    create: {
      name: "Super Admin",
      email: "superadmin@busycart.test",
      password,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅  SUPER_ADMIN →", superAdmin.email);

  // ── ADMIN ────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@busycart.test" },
    update: { role: "ADMIN" },
    create: {
      name: "Admin User",
      email: "admin@busycart.test",
      password,
      role: "ADMIN",
    },
  });
  console.log("✅  ADMIN       →", admin.email);

  // ── Regular USER ─────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "user@busycart.test" },
    update: { role: "USER" },
    create: {
      name: "Test User",
      email: "user@busycart.test",
      password,
      role: "USER",
    },
  });
  console.log("✅  USER        →", user.email);

  console.log("\n🔑  Password for all accounts: Test@1234");
  console.log("\n📋  Login at: http://localhost:3000/login");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
