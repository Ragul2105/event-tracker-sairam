import prisma from "@/lib/prisma/client";
import { Prisma, Event, EventStatus } from "@prisma/client";
import { EventFiltersInput } from "../validators";

export interface CreateEventData {
  eventCode: string;
  title: string;
  description?: string;
  unitId: string;
  departmentId?: string;
  eventDate?: Date;
  startDate?: Date;
  endDate?: Date;
  year?: number;
  activityType?: string;
  mode?: "OFFLINE" | "ONLINE" | "HYBRID";
  status?: EventStatus;
  studentCount?: number;
  facultyCount?: number;
  externalCount?: number;
  totalParticipants?: number;
  beneficiaryText?: string;
  beneficiaryCount?: number;
  hoursPerEvent?: number;
  totalHoursEngaged?: number;
  amountSpent?: number;
  locationText?: string;
  reportUrl?: string;
  socialUrl?: string;
  sourceSheet?: string;
  sourceRowNumber?: number;
  createdById: string;
}

const eventWithRelations = {
  unit: {
    select: { id: true, code: true, name: true },
  },
  department: {
    select: { id: true, code: true, name: true },
  },
  goals: {
    include: {
      sdgGoal: {
        select: { id: true, goalNumber: true, name: true },
      },
    },
  },
  createdBy: {
    select: { id: true, name: true },
  },
  updatedBy: {
    select: { id: true, name: true },
  },
};

export async function findEvents(
  filters: EventFiltersInput,
  allowedUnitIds?: string[]
) {
  const where: Prisma.EventWhereInput = {};
  
  // Apply unit filter
  if (filters.unitId) {
    where.unitId = filters.unitId;
  } else if (allowedUnitIds && allowedUnitIds.length > 0) {
    where.unitId = { in: allowedUnitIds };
  }
  
  if (filters.year) {
    where.year = filters.year;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.activityType) {
    where.activityType = filters.activityType;
  }
  
  if (filters.sdgGoalId) {
    where.goals = {
      some: { sdgGoalId: filters.sdgGoalId },
    };
  }
  
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { locationText: { contains: filters.search, mode: "insensitive" } },
      { eventCode: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  
  const orderBy: Prisma.EventOrderByWithRelationInput = {
    [filters.sortBy]: filters.sortOrder,
  };
  
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: eventWithRelations,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.event.count({ where }),
  ]);
  
  return { events, total };
}

export async function findEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: eventWithRelations,
  });
}

export async function createEvent(data: CreateEventData) {
  return prisma.event.create({
    data: {
      ...data,
      hoursPerEvent: data.hoursPerEvent ? new Prisma.Decimal(data.hoursPerEvent) : undefined,
      totalHoursEngaged: data.totalHoursEngaged ? new Prisma.Decimal(data.totalHoursEngaged) : undefined,
      amountSpent: data.amountSpent ? new Prisma.Decimal(data.amountSpent) : undefined,
    },
    include: eventWithRelations,
  });
}

export async function updateEvent(
  id: string,
  data: Partial<CreateEventData> & { updatedById: string }
) {
  const updateData: Prisma.EventUpdateInput = { ...data };
  
  if (data.hoursPerEvent !== undefined) {
    updateData.hoursPerEvent = data.hoursPerEvent ? new Prisma.Decimal(data.hoursPerEvent) : null;
  }
  if (data.totalHoursEngaged !== undefined) {
    updateData.totalHoursEngaged = data.totalHoursEngaged ? new Prisma.Decimal(data.totalHoursEngaged) : null;
  }
  if (data.amountSpent !== undefined) {
    updateData.amountSpent = data.amountSpent ? new Prisma.Decimal(data.amountSpent) : null;
  }
  
  return prisma.event.update({
    where: { id },
    data: updateData,
    include: eventWithRelations,
  });
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({
    where: { id },
  });
}

export async function getNextEventCode(unitCode: string, year: number): Promise<string> {
  const yearPrefix = String(year).slice(-2);
  const prefix = `${yearPrefix}${unitCode}`;
  
  const lastEvent = await prisma.event.findFirst({
    where: {
      eventCode: { startsWith: prefix },
    },
    orderBy: { eventCode: "desc" },
    select: { eventCode: true },
  });
  
  let sequence = 1;
  if (lastEvent) {
    const lastSequence = parseInt(lastEvent.eventCode.slice(prefix.length), 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }
  
  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

export async function setEventGoals(
  eventId: string,
  sdgGoalIds: string[],
  primarySdgGoalId?: string
) {
  // Delete existing goals
  await prisma.eventGoal.deleteMany({
    where: { eventId },
  });
  
  // Create new goals
  if (sdgGoalIds.length > 0) {
    await prisma.eventGoal.createMany({
      data: sdgGoalIds.map((sdgGoalId) => ({
        eventId,
        sdgGoalId,
        isPrimary: sdgGoalId === primarySdgGoalId,
      })),
    });
  }
}

export async function getEventStats(unitIds?: string[]) {
  const where: Prisma.EventWhereInput = unitIds?.length
    ? { unitId: { in: unitIds } }
    : {};
  
  const [totalEvents, aggregates] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.aggregate({
      where,
      _sum: {
        totalParticipants: true,
        beneficiaryCount: true,
        totalHoursEngaged: true,
      },
    }),
  ]);
  
  return {
    totalEvents,
    totalParticipants: aggregates._sum.totalParticipants || 0,
    totalBeneficiaries: aggregates._sum.beneficiaryCount || 0,
    totalHoursEngaged: aggregates._sum.totalHoursEngaged?.toNumber() || 0,
  };
}

export async function getEventsByUnit(unitIds?: string[]) {
  const where: Prisma.EventWhereInput = unitIds?.length
    ? { unitId: { in: unitIds } }
    : {};
  
  return prisma.event.groupBy({
    by: ["unitId"],
    where,
    _count: { id: true },
  });
}

export async function getEventsByYear(unitIds?: string[]) {
  const where: Prisma.EventWhereInput = unitIds?.length
    ? { unitId: { in: unitIds } }
    : {};
  
  return prisma.event.groupBy({
    by: ["year"],
    where,
    _count: { id: true },
    orderBy: { year: "desc" },
  });
}
