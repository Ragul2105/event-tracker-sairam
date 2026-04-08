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
    
    const sdgGoals = await mastersRepo.findSDGGoals();
    
    return successResponse(sdgGoals);
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
