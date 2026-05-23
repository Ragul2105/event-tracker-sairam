import prisma from "@/lib/prisma/client";
import * as eventRepo from "../repositories";
import { CreateEventInput, UpdateEventInput, EventFiltersInput } from "../validators";
import { NotFoundError, AuthorizationError } from "@/modules/shared/errors";
import { createLogger } from "@/lib/logger";
import { UserRole } from "@prisma/client";

const logger = createLogger("events-service");

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
  
  const event = await eventRepo.createEvent({
    eventCode,
    title: input.title,
    description: input.description,
    unitId: input.unitId,
    eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
    year,
    activityType: input.activityType,
    studentCount: input.studentCount || 0,
    facultyCount: input.facultyCount || 0,
    externalCount: input.externalCount || 0,
    totalParticipants: input.totalParticipants || 0,
    beneficiaryText: input.beneficiaryText,
    beneficiaryCount: input.beneficiaryCount,
    hoursPerEvent: input.hoursPerEvent,
    totalHoursEngaged: input.totalHoursEngaged,
    amountSpent: input.amountSpent,
    locationText: input.locationText,
    reportUrl: input.reportUrl || undefined,
    socialUrl: input.socialUrl || undefined,
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
  
  const event = await eventRepo.updateEvent(id, {
    title: input.title,
    description: input.description,
    unitId: input.unitId,
    eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
    year: input.year,
    activityType: input.activityType,
    studentCount: input.studentCount,
    facultyCount: input.facultyCount,
    externalCount: input.externalCount,
    totalParticipants: input.totalParticipants,
    beneficiaryText: input.beneficiaryText,
    beneficiaryCount: input.beneficiaryCount,
    hoursPerEvent: input.hoursPerEvent,
    totalHoursEngaged: input.totalHoursEngaged,
    amountSpent: input.amountSpent,
    locationText: input.locationText,
    reportUrl: input.reportUrl || undefined,
    socialUrl: input.socialUrl || undefined,
    updatedById: userId,
  });
  
  // Update SDG goals if provided
  if (input.sdgGoalIds !== undefined) {
    await eventRepo.setEventGoals(event.id, input.sdgGoalIds || [], input.primarySdgGoalId);
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
