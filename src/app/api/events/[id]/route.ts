import { NextRequest } from "next/server";
import * as eventService from "@/modules/events/services";
import { updateEventSchema } from "@/modules/events/validators";
import { getAuthUser } from "@/modules/auth/middleware";
import { getUserUnitIds } from "@/modules/auth/repositories";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    const { id } = await params;
    const userUnitIds = await getUserUnitIds(user.userId);
    const event = await eventService.getEvent(id, user.role as UserRole, userUnitIds);
    
    return successResponse(event);
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    const { id } = await params;
    const body = await request.json();
    const parsed = updateEventSchema.safeParse(body);
    
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }
    
    const userUnitIds = await getUserUnitIds(user.userId);
    const event = await eventService.updateEvent(
      id,
      parsed.data,
      user.userId,
      user.role as UserRole,
      userUnitIds
    );
    
    return successResponse(event, "Event updated successfully");
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    const { id } = await params;
    await eventService.deleteEvent(id, user.role as UserRole);
    
    return successResponse({ id }, "Event deleted successfully");
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
