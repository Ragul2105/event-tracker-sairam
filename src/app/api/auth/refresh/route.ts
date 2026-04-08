import { NextRequest } from "next/server";
import * as authService from "@/modules/auth/services";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    
    if (!refreshToken) {
      return errorResponse("Refresh token required", 401);
    }
    
    const tokens = await authService.refreshTokens(refreshToken);
    
    const response = successResponse({ accessToken: tokens.accessToken });
    
    // Update cookies
    response.cookies.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    
    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    
    return response;
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
