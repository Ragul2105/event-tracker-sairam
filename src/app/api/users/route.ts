import { NextRequest } from "next/server";
import * as userService from "@/modules/users/services";
import { createUserSchema } from "@/modules/auth/validators";
import { getAuthUser } from "@/modules/auth/middleware";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    if (user.role !== UserRole.ADMIN) {
      return errorResponse("Permission denied", 403);
    }
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    
    const users = await userService.listUsers(includeInactive);
    
    // Remove password hashes from response
    const sanitized = users.map(({ passwordHash, ...u }) => u);
    
    return successResponse(sanitized);
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
    
    if (user.role !== UserRole.ADMIN) {
      return errorResponse("Permission denied", 403);
    }
    
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }
    
    const newUser = await userService.createUser(parsed.data);
    
    // Remove password hash from response
    const { passwordHash, ...sanitized } = newUser;
    
    return successResponse(sanitized, "User created successfully");
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
