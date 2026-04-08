import prisma from "@/lib/prisma/client";
import * as eventRepo from "@/modules/events/repositories";
import { DashboardSummary } from "@/modules/shared/types";

export async function getDashboardSummary(unitIds?: string[]): Promise<DashboardSummary> {
  // Get event stats
  const stats = await eventRepo.getEventStats(unitIds);
  
  // Get events by unit
  const eventsByUnitRaw = await eventRepo.getEventsByUnit(unitIds);
  const unitMap = new Map(
    (await prisma.unit.findMany({ select: { id: true, code: true, name: true } }))
      .map((u) => [u.id, u])
  );
  
  const eventsByUnit = eventsByUnitRaw.map((e) => {
    const unit = unitMap.get(e.unitId);
    return {
      unitCode: unit?.code || "UNKNOWN",
      unitName: unit?.name || "Unknown",
      count: e._count.id,
    };
  });
  
  // Get events by year
  const eventsByYearRaw = await eventRepo.getEventsByYear(unitIds);
  const eventsByYear = eventsByYearRaw
    .filter((e) => e.year !== null)
    .map((e) => ({
      year: e.year!,
      count: e._count.id,
    }));
  
  // Get events by SDG goal
  const eventsBySDGRaw = await prisma.eventGoal.groupBy({
    by: ["sdgGoalId"],
    _count: { id: true },
  });
  
  const sdgMap = new Map(
    (await prisma.sDGGoal.findMany({ select: { id: true, goalNumber: true, name: true } }))
      .map((s) => [s.id, s])
  );
  
  const eventsBySDG = eventsBySDGRaw.map((e) => {
    const sdg = sdgMap.get(e.sdgGoalId);
    return {
      goalNumber: sdg?.goalNumber || 0,
      goalName: sdg?.name || "Unknown",
      count: e._count.id,
    };
  }).sort((a, b) => a.goalNumber - b.goalNumber);
  
  // Get blood donation highlight
  const bloodDonationUnit = await prisma.unit.findUnique({
    where: { code: "BLOOD_DONATION" },
  });
  
  let bloodDonationHighlight: DashboardSummary["bloodDonationHighlight"] = null;
  
  if (bloodDonationUnit) {
    const latestMetrics = await prisma.programYearMetric.findMany({
      where: {
        unitId: bloodDonationUnit.id,
        metricType: { in: ["CAMP_DONORS", "REGULAR_DONORS", "TOTAL_DONORS"] },
      },
      orderBy: { year: "desc" },
      take: 3,
    });
    
    if (latestMetrics.length > 0) {
      const latestYear = latestMetrics[0].year;
      const metricsForYear = latestMetrics.filter((m) => m.year === latestYear);
      
      bloodDonationHighlight = {
        latestYear,
        totalDonors: metricsForYear.find((m) => m.metricType === "TOTAL_DONORS")?.valueNumber.toNumber() || 0,
        campDonors: metricsForYear.find((m) => m.metricType === "CAMP_DONORS")?.valueNumber.toNumber() || 0,
        regularDonors: metricsForYear.find((m) => m.metricType === "REGULAR_DONORS")?.valueNumber.toNumber() || 0,
      };
    }
  }
  
  return {
    totalEvents: stats.totalEvents,
    totalBeneficiaries: stats.totalBeneficiaries,
    totalParticipants: stats.totalParticipants,
    totalHoursEngaged: stats.totalHoursEngaged,
    eventsByUnit,
    eventsByYear,
    eventsBySDG,
    bloodDonationHighlight,
  };
}
