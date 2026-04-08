import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/modules/auth/services";
import { getAuthUser } from "@/modules/auth/middleware";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (user) {
      await authService.logout(user.userId);
    }
    
    const response = successResponse({ message: "Logged out successfully" });
    
    // Clear cookies
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    
    return response;
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
