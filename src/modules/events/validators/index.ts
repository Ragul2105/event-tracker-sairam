import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  unitId: z.string().min(1, "Unit is required"),
  eventDate: z.string().datetime().optional(),
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
  reportUrl: z.string().url().optional().or(z.literal("")),
  socialUrl: z.string().url().optional().or(z.literal("")),
  sdgGoalIds: z.array(z.string()).optional(),
  primarySdgGoalId: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(20),
  unitId: z.string().optional(),
  year: z.coerce.number().int().optional(),
  sdgGoalId: z.string().optional(),
  activityType: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "eventDate", "title", "year"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
