import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/modules/auth/services";
import { loginSchema } from "@/modules/auth/validators";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }
    
    const { email, password } = parsed.data;
    const result = await authService.login(email, password);
    
    // Create response with cookies
    const response = successResponse({
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
    
    // Set HTTP-only cookies for tokens
    response.cookies.set("accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    response.cookies.set("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    return response;
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
