import { NextRequest } from "next/server";
import * as authService from "@/modules/auth/services";
import { getAuthUser } from "@/modules/auth/middleware";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";

export async function GET(request: NextRequest) {
  try {
    const tokenUser = await getAuthUser(request);
    
    if (!tokenUser) {
      return errorResponse("Authentication required", 401);
    }
    
    const user = await authService.getCurrentUser(tokenUser.userId);
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    return successResponse({ user });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
