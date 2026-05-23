import { NextRequest } from "next/server";
import * as dashboardService from "@/modules/dashboard/services";
import { getAuthUser } from "@/modules/auth/middleware";
import { getUserUnitIds } from "@/modules/auth/repositories";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    let unitIds: string[] | undefined;
    if (user.role === UserRole.UNIT_USER) {
      unitIds = await getUserUnitIds(user.userId);
    }

    const analytics = await dashboardService.getDashboardAnalytics(unitIds);

    return successResponse(analytics);
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
