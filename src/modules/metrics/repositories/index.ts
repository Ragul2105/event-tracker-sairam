import prisma from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export async function findBloodDonationMetrics(unitId: string) {
  return prisma.programYearMetric.findMany({
    where: {
      unitId,
      metricType: { in: ["CAMP_DONORS", "REGULAR_DONORS", "TOTAL_DONORS"] },
    },
    orderBy: { year: "desc" },
  });
}

export async function findBloodDonationMetricsByYear(unitId: string, year: number) {
  return prisma.programYearMetric.findMany({
    where: {
      unitId,
      year,
      metricType: { in: ["CAMP_DONORS", "REGULAR_DONORS", "TOTAL_DONORS"] },
    },
  });
}

export async function upsertBloodDonationMetric(data: {
  unitId: string;
  year: number;
  campDonors: number;
  regularDonors: number;
  totalDonors: number;
}) {
  const { unitId, year, campDonors, regularDonors, totalDonors } = data;
  
  // Upsert all three metrics
  await Promise.all([
    prisma.programYearMetric.upsert({
      where: {
        unitId_year_metricType: { unitId, year, metricType: "CAMP_DONORS" },
      },
      create: {
        unitId,
        year,
        metricType: "CAMP_DONORS",
        valueNumber: new Prisma.Decimal(campDonors),
      },
      update: {
        valueNumber: new Prisma.Decimal(campDonors),
      },
    }),
    prisma.programYearMetric.upsert({
      where: {
        unitId_year_metricType: { unitId, year, metricType: "REGULAR_DONORS" },
      },
      create: {
        unitId,
        year,
        metricType: "REGULAR_DONORS",
        valueNumber: new Prisma.Decimal(regularDonors),
      },
      update: {
        valueNumber: new Prisma.Decimal(regularDonors),
      },
    }),
    prisma.programYearMetric.upsert({
      where: {
        unitId_year_metricType: { unitId, year, metricType: "TOTAL_DONORS" },
      },
      create: {
        unitId,
        year,
        metricType: "TOTAL_DONORS",
        valueNumber: new Prisma.Decimal(totalDonors),
      },
      update: {
        valueNumber: new Prisma.Decimal(totalDonors),
      },
    }),
  ]);
  
  return findBloodDonationMetricsByYear(unitId, year);
}

export async function deleteBloodDonationMetrics(unitId: string, year: number) {
  return prisma.programYearMetric.deleteMany({
    where: {
      unitId,
      year,
      metricType: { in: ["CAMP_DONORS", "REGULAR_DONORS", "TOTAL_DONORS"] },
    },
  });
}

export async function getBloodDonationSummary(unitId: string) {
  const metrics = await prisma.programYearMetric.findMany({
    where: {
      unitId,
      metricType: { in: ["CAMP_DONORS", "REGULAR_DONORS", "TOTAL_DONORS"] },
    },
    orderBy: { year: "desc" },
  });
  
  // Group by year
  const byYear: Record<number, { campDonors: number; regularDonors: number; totalDonors: number }> = {};
  
  for (const metric of metrics) {
    if (!byYear[metric.year]) {
      byYear[metric.year] = { campDonors: 0, regularDonors: 0, totalDonors: 0 };
    }
    
    switch (metric.metricType) {
      case "CAMP_DONORS":
        byYear[metric.year].campDonors = metric.valueNumber.toNumber();
        break;
      case "REGULAR_DONORS":
        byYear[metric.year].regularDonors = metric.valueNumber.toNumber();
        break;
      case "TOTAL_DONORS":
        byYear[metric.year].totalDonors = metric.valueNumber.toNumber();
        break;
    }
  }
  
  return Object.entries(byYear)
    .map(([year, data]) => ({
      year: parseInt(year),
      ...data,
    }))
    .sort((a, b) => b.year - a.year);
}
