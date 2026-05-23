import prisma from "@/lib/prisma/client";

export async function findAllBloodDonationRecords() {
  return prisma.bloodDonationRecord.findMany({
    orderBy: { year: "asc" },
  });
}

export async function upsertBloodDonationRecord(data: {
  year: number;
  campDonors: number;
  regularDonors: number;
  totalDonors: number;
  college?: string;
}) {
  return prisma.bloodDonationRecord.upsert({
    where: { year: data.year },
    update: {
      campDonors: data.campDonors,
      regularDonors: data.regularDonors,
      totalDonors: data.totalDonors,
      college: data.college ?? null,
    },
    create: {
      year: data.year,
      campDonors: data.campDonors,
      regularDonors: data.regularDonors,
      totalDonors: data.totalDonors,
      college: data.college ?? null,
    },
  });
}
