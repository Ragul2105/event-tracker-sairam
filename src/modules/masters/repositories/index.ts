import prisma from "@/lib/prisma/client";

export async function findUnits(includeInactive = false) {
  return prisma.unit.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function findUnitById(id: string) {
  return prisma.unit.findUnique({
    where: { id },
  });
}

export async function findUnitByCode(code: string) {
  return prisma.unit.findUnique({
    where: { code },
  });
}

export async function createUnit(data: {
  code: string;
  name: string;
}) {
  return prisma.unit.create({
    data,
  });
}

export async function updateUnit(
  id: string,
  data: {
    code?: string;
    name?: string;
    isActive?: boolean;
  }
) {
  return prisma.unit.update({
    where: { id },
    data,
  });
}

export async function findSDGGoals() {
  return prisma.sDGGoal.findMany({
    orderBy: { goalNumber: "asc" },
  });
}

export async function findSDGGoalById(id: string) {
  return prisma.sDGGoal.findUnique({
    where: { id },
  });
}

export async function findSDGGoalByNumber(goalNumber: number) {
  return prisma.sDGGoal.findUnique({
    where: { goalNumber },
  });
}
