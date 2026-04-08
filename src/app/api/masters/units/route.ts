import { NextRequest } from "next/server";
import * as mastersRepo from "@/modules/masters/repositories";
import { getAuthUser } from "@/modules/auth/middleware";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    
    const units = await mastersRepo.findUnits(includeInactive);
    
    return successResponse(units);
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
