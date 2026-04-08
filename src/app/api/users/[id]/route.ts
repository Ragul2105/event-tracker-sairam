import { NextRequest } from "next/server";
import * as userService from "@/modules/users/services";
import { updateUserSchema } from "@/modules/auth/validators";
import { getAuthUser } from "@/modules/auth/middleware";
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
    
    if (user.role !== UserRole.ADMIN) {
      return errorResponse("Permission denied", 403);
    }
    
    const { id } = await params;
    const foundUser = await userService.getUser(id);
    
    // Remove password hash
    const { passwordHash, ...sanitized } = foundUser;
    
    return successResponse(sanitized);
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
    
    if (user.role !== UserRole.ADMIN) {
      return errorResponse("Permission denied", 403);
    }
    
    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }
    
    const updatedUser = await userService.updateUser(id, parsed.data);
    
    // Remove password hash
    const { passwordHash, ...sanitized } = updatedUser;
    
    return successResponse(sanitized, "User updated successfully");
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
    
    if (user.role !== UserRole.ADMIN) {
      return errorResponse("Permission denied", 403);
    }
    
    const { id } = await params;
    await userService.deleteUser(id);
    
    return successResponse({ id }, "User deleted successfully");
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
