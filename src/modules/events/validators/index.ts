import { z } from "zod";

const dateOnlyString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)");
const isoDateTimeString = z.string().datetime();
const dateLikeString = z.union([isoDateTimeString, dateOnlyString]);

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  unitId: z.string().min(1, "Unit is required"),
  eventDate: z.union([dateLikeString, z.literal("")]).optional(),
  eventDateTo: z.union([dateLikeString, z.literal("")]).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  activityType: z.string().optional(),
  studentCount: z.number().int().min(0).optional(),
  facultyCount: z.number().int().min(0).optional(),
  externalCount: z.number().int().min(0).optional(),
  totalParticipants: z.number().int().min(0).optional(),
  beneficiaryText: z.string().optional(),
  beneficiaryCount: z.number().int().min(0).optional(),
  hoursPerEvent: z.number().min(0).optional(),
  totalHoursEngaged: z.number().min(0).optional(),
  amountSpent: z.number().min(0).optional(),
  locationText: z.string().optional(),
  subUnitName: z.string().optional(),
  reportUrl: z.string().url().optional().or(z.literal("")),
  socialUrl: z.string().url().optional().or(z.literal("")),
  sdgGoalIds: z.array(z.string()).optional(),
  primarySdgGoalId: z.string().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  unitId: z.string().optional(),
  eventDate: z.union([dateLikeString, z.literal(""), z.null()]).optional(),
  eventDateTo: z.union([dateLikeString, z.literal(""), z.null()]).optional(),
  year: z.union([z.number().int().min(1900).max(2100), z.null()]).optional(),
  activityType: z.string().optional().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  studentCount: z.number().int().min(0).optional(),
  facultyCount: z.number().int().min(0).optional(),
  externalCount: z.number().int().min(0).optional(),
  totalParticipants: z.number().int().min(0).optional(),
  beneficiaryText: z.string().optional().nullable(),
  beneficiaryCount: z.number().int().min(0).optional().nullable(),
  hoursPerEvent: z.number().min(0).optional().nullable(),
  totalHoursEngaged: z.number().min(0).optional().nullable(),
  amountSpent: z.number().min(0).optional().nullable(),
  locationText: z.string().optional().nullable(),
  subUnitName: z.string().optional().nullable(),
  reportUrl: z.string().url().optional().or(z.literal("")).nullable(),
  socialUrl: z.string().url().optional().or(z.literal("")).nullable(),
  sdgGoalIds: z.array(z.string()).optional(),
  primarySdgGoalId: z.string().optional().nullable(),
});

export const eventFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(20),
  unitId: z.string().optional(),
  year: z.coerce.number().int().optional(),
  sdgGoalId: z.string().optional(),
  activityType: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  sortBy: z.enum(["createdAt", "eventDate", "title", "year"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
