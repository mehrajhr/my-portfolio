import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const env = (globalThis as typeof globalThis & { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  const email = env.OWNER_EMAIL?.trim().toLowerCase();
  const password = env.OWNER_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("Set OWNER_EMAIL and OWNER_PASSWORD (at least 12 characters) before seeding.");
  }
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Portfolio Owner" },
  });
  await prisma.profile.upsert({ where: { id: "owner" }, update: {}, create: {} });
  await prisma.siteSettings.upsert({ where: { id: "site" }, update: {}, create: {} });
  await prisma.seoSettings.upsert({ where: { id: "seo" }, update: {}, create: {} });
  const sections = ["hero", "about", "technologies", "featured-projects", "experience", "education", "achievements", "services", "contact"];
  for (const [sortOrder, key] of sections.entries()) {
    await prisma.homepageSection.upsert({ where: { key }, update: {}, create: { key, title: key === "achievements" ? "Achievements & certifications" : key.replaceAll("-", " "), sortOrder, visible: key !== "experience" } });
  }
}

main().finally(() => prisma.$disconnect());
