import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SDG_GOALS = [
  { goalNumber: 1, name: "No Poverty", shortLabel: "No Poverty" },
  { goalNumber: 2, name: "Zero Hunger", shortLabel: "Zero Hunger" },
  { goalNumber: 3, name: "Good Health and Well-being", shortLabel: "Good Health" },
  { goalNumber: 4, name: "Quality Education", shortLabel: "Quality Education" },
  { goalNumber: 5, name: "Gender Equality", shortLabel: "Gender Equality" },
  { goalNumber: 6, name: "Clean Water and Sanitation", shortLabel: "Clean Water" },
  { goalNumber: 7, name: "Affordable and Clean Energy", shortLabel: "Clean Energy" },
  { goalNumber: 8, name: "Decent Work and Economic Growth", shortLabel: "Decent Work" },
  { goalNumber: 9, name: "Industry, Innovation and Infrastructure", shortLabel: "Innovation" },
  { goalNumber: 10, name: "Reduced Inequalities", shortLabel: "Reduced Inequalities" },
  { goalNumber: 11, name: "Sustainable Cities and Communities", shortLabel: "Sustainable Cities" },
  { goalNumber: 12, name: "Responsible Consumption and Production", shortLabel: "Responsible Consumption" },
  { goalNumber: 13, name: "Climate Action", shortLabel: "Climate Action" },
  { goalNumber: 14, name: "Life Below Water", shortLabel: "Life Below Water" },
  { goalNumber: 15, name: "Life on Land", shortLabel: "Life on Land" },
  { goalNumber: 16, name: "Peace, Justice and Strong Institutions", shortLabel: "Peace & Justice" },
  { goalNumber: 17, name: "Partnerships for the Goals", shortLabel: "Partnerships" },
];

const UNITS = [
  { code: "NSS", name: "National Service Scheme" },
  { code: "UBA", name: "Unnat Bharat Abhiyan" },
  { code: "SCOUTS_AND_GUIDES", name: "Scouts & Guides" },
  { code: "INNOVATION_ECOSYSTEM", name: "Innovation Ecosystem" },
  { code: "HOUSEHOLD_SURVEY_SIRD", name: "Household Survey & SIRD" },
  { code: "BLOOD_DONATION", name: "Blood Donation" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create SDG Goals
  console.log("Creating SDG Goals...");
  for (const goal of SDG_GOALS) {
    await prisma.sDGGoal.upsert({
      where: { goalNumber: goal.goalNumber },
      update: goal,
      create: goal,
    });
  }
  console.log(`✅ Created ${SDG_GOALS.length} SDG Goals`);

  // Create Units
  console.log("Creating Units...");
  for (const unit of UNITS) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: unit,
      create: unit,
    });
  }
  console.log(`✅ Created ${UNITS.length} Units`);

  // Create Admin User
  console.log("Creating Admin User...");
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@sairam.edu.in" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@sairam.edu.in",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log("✅ Created Admin User (admin@sairam.edu.in / admin123)");

  // Create Master User
  console.log("Creating Master User...");
  const masterPassword = await bcrypt.hash("master123", 12);
  await prisma.user.upsert({
    where: { email: "master@sairam.edu.in" },
    update: {},
    create: {
      name: "Master User",
      email: "master@sairam.edu.in",
      passwordHash: masterPassword,
      role: UserRole.MASTER,
      isActive: true,
    },
  });
  console.log("✅ Created Master User (master@sairam.edu.in / master123)");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\nDefault login credentials:");
  console.log("  Admin: admin@sairam.edu.in / admin123");
  console.log("  Master: master@sairam.edu.in / master123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
