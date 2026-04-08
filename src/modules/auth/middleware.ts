import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload } from "@/lib/jwt";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export async function getAuthUser(request: NextRequest): Promise<TokenPayload | null> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Try to get from cookie
    const token = request.cookies.get("accessToken")?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  }
  
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

export function requireAuth(handler: (request: NextRequest, user: TokenPayload) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return handler(request, user);
  };
}

export function requireRole(roles: UserRole[]) {
  return (handler: (request: NextRequest, user: TokenPayload) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const user = await getAuthUser(request);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        );
      }
      
      if (!roles.includes(user.role as UserRole)) {
        return NextResponse.json(
          { success: false, error: "Permission denied" },
          { status: 403 }
        );
      }
      
      return handler(request, user);
    };
  };
}

export function requireAdmin(handler: (request: NextRequest, user: TokenPayload) => Promise<NextResponse>) {
  return requireRole([UserRole.ADMIN])(handler);
}

export function requireAdminOrMaster(handler: (request: NextRequest, user: TokenPayload) => Promise<NextResponse>) {
  return requireRole([UserRole.ADMIN, UserRole.MASTER])(handler);
}
