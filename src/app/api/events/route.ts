import { NextRequest } from "next/server";
import * as eventService from "@/modules/events/services";
import { createEventSchema, eventFiltersSchema } from "@/modules/events/validators";
import { getAuthUser } from "@/modules/auth/middleware";
import { getUserUnitIds } from "@/modules/auth/repositories";
import { errorResponse, successResponse, paginatedResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    const { searchParams } = new URL(request.url);
    const filters = eventFiltersSchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      unitId: searchParams.get("unitId") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      sdgGoalId: searchParams.get("sdgGoalId") ?? undefined,
      activityType: searchParams.get("activityType") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: searchParams.get("sortOrder") ?? undefined,
    });
    
    const userUnitIds = await getUserUnitIds(user.userId);
    const { events, total } = await eventService.listEvents(
      filters,
      user.role as UserRole,
      userUnitIds
    );
    
    return paginatedResponse(events, filters.page, filters.pageSize, total);
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);
    
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }
    
    const userUnitIds = await getUserUnitIds(user.userId);
    const event = await eventService.createEvent(
      parsed.data,
      user.userId,
      user.role as UserRole,
      userUnitIds
    );
    
    return successResponse(event, "Event created successfully");
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
