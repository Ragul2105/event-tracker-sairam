import prisma from "@/lib/prisma/client";
import * as eventRepo from "../repositories";
import { CreateEventInput, UpdateEventInput, EventFiltersInput } from "../validators";
import { NotFoundError, AuthorizationError } from "@/modules/shared/errors";
import { createLogger } from "@/lib/logger";
import { UserRole } from "@prisma/client";

const logger = createLogger("events-service");

function normalizeNullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeNullableDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  if (value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function listEvents(
  filters: EventFiltersInput,
  userRole: UserRole,
  userUnitIds: string[]
) {
  // Admin and Master can see all events, Unit users only see their units
  const allowedUnitIds =
    userRole === "ADMIN" || userRole === "MASTER" ? undefined : userUnitIds;
  
  return eventRepo.findEvents(filters, allowedUnitIds);
}

export async function getEvent(
  id: string,
  userRole: UserRole,
  userUnitIds: string[]
) {
  const event = await eventRepo.findEventById(id);
  
  if (!event) {
    throw new NotFoundError("Event");
  }
  
  // Check access for unit users
  if (userRole === "UNIT_USER" && !userUnitIds.includes(event.unitId)) {
    throw new AuthorizationError("You don't have access to this event");
  }
  
  return event;
}

export async function createEvent(
  input: CreateEventInput,
  userId: string,
  userRole: UserRole,
  userUnitIds: string[]
) {
  // Check unit access for unit users
  if (userRole === "UNIT_USER" && !userUnitIds.includes(input.unitId)) {
    throw new AuthorizationError("You don't have access to this unit");
  }
  
  // Get unit code for event code generation
  const unit = await prisma.unit.findUnique({
    where: { id: input.unitId },
    select: { code: true },
  });
  
  if (!unit) {
    throw new NotFoundError("Unit");
  }
  
  const year = input.year || new Date().getFullYear();
  const eventCode = await eventRepo.getNextEventCode(unit.code, year);

  const studentCount = input.studentCount || 0;
  const facultyCount = input.facultyCount || 0;
  const externalCount = input.externalCount || 0;
  const totalParticipants =
    input.totalParticipants !== undefined
      ? input.totalParticipants
      : studentCount + facultyCount + externalCount;
  
  const event = await eventRepo.createEvent({
    eventCode,
    status: "PENDING",
    title: input.title,
    description: normalizeNullableString(input.description) ?? input.description ?? null,
    unitId: input.unitId,
    eventDate: normalizeNullableDate(input.eventDate),
    eventDateTo: normalizeNullableDate(input.eventDateTo),
    year,
    activityType: normalizeNullableString(input.activityType) ?? input.activityType ?? null,
    studentCount,
    facultyCount,
    externalCount,
    totalParticipants,
    beneficiaryText: normalizeNullableString(input.beneficiaryText) ?? input.beneficiaryText ?? null,
    beneficiaryCount: input.beneficiaryCount ?? null,
    hoursPerEvent: input.hoursPerEvent ?? null,
    totalHoursEngaged: input.totalHoursEngaged ?? null,
    amountSpent: input.amountSpent ?? null,
    locationText: normalizeNullableString(input.locationText) ?? input.locationText ?? null,
    subUnitName: normalizeNullableString(input.subUnitName) ?? input.subUnitName ?? null,
    reportUrl: input.reportUrl === "" ? null : (input.reportUrl ?? null),
    socialUrl: input.socialUrl === "" ? null : (input.socialUrl ?? null),
    createdById: userId,
  });
  
  // Set SDG goals if provided
  if (input.sdgGoalIds && input.sdgGoalIds.length > 0) {
    await eventRepo.setEventGoals(event.id, input.sdgGoalIds, input.primarySdgGoalId);
  }
  
  logger.info("Event created", { eventId: event.id, eventCode: event.eventCode });
  
  return eventRepo.findEventById(event.id);
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput,
  userId: string,
  userRole: UserRole,
  userUnitIds: string[]
) {
  const existing = await eventRepo.findEventById(id);
  
  if (!existing) {
    throw new NotFoundError("Event");
  }
  
  // Check access
  if (userRole === "UNIT_USER") {
    if (!userUnitIds.includes(existing.unitId)) {
      throw new AuthorizationError("You don't have access to this event");
    }
    // Unit users cannot change the unit
    if (input.unitId && input.unitId !== existing.unitId) {
      throw new AuthorizationError("You cannot change the unit of this event");
    }
  }

  if (input.status && userRole !== "ADMIN") {
    throw new AuthorizationError("Only admins can approve or reject events");
  }
  
  const event = await eventRepo.updateEvent(id, {
    title: input.title,
    description: normalizeNullableString(input.description),
    unitId: input.unitId,
    eventDate: normalizeNullableDate(input.eventDate),
    eventDateTo: normalizeNullableDate(input.eventDateTo),
    year: input.year,
    activityType: normalizeNullableString(input.activityType),
    status: input.status,
    studentCount: input.studentCount,
    facultyCount: input.facultyCount,
    externalCount: input.externalCount,
    totalParticipants:
      input.totalParticipants !== undefined
        ? input.totalParticipants
        : (input.studentCount !== undefined || input.facultyCount !== undefined || input.externalCount !== undefined)
          ? (input.studentCount ?? existing.studentCount) + (input.facultyCount ?? existing.facultyCount) + (input.externalCount ?? existing.externalCount)
          : undefined,
    beneficiaryText: normalizeNullableString(input.beneficiaryText),
    beneficiaryCount: input.beneficiaryCount,
    hoursPerEvent: input.hoursPerEvent,
    totalHoursEngaged: input.totalHoursEngaged,
    amountSpent: input.amountSpent,
    locationText: normalizeNullableString(input.locationText),
    subUnitName: normalizeNullableString(input.subUnitName),
    reportUrl: input.reportUrl === "" || input.reportUrl === null ? null : input.reportUrl,
    socialUrl: input.socialUrl === "" || input.socialUrl === null ? null : input.socialUrl,
    updatedById: userId,
  });
  
  // Update SDG goals if provided
  if (input.sdgGoalIds !== undefined) {
    await eventRepo.setEventGoals(event.id, input.sdgGoalIds || [], input.primarySdgGoalId ?? undefined);
  }
  
  logger.info("Event updated", { eventId: event.id });
  
  return eventRepo.findEventById(event.id);
}

export async function deleteEvent(
  id: string,
  userRole: UserRole
) {
  if (userRole === "UNIT_USER") {
    throw new AuthorizationError("Only Admin and Master users can delete events");
  }
  
  const existing = await eventRepo.findEventById(id);
  
  if (!existing) {
    throw new NotFoundError("Event");
  }
  
  await eventRepo.deleteEvent(id);
  
  logger.info("Event deleted", { eventId: id });
}
