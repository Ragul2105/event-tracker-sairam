import { NextRequest } from "next/server";
import * as metricsRepo from "@/modules/metrics/repositories";
import { getAuthUser } from "@/modules/auth/middleware";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";
import prisma from "@/lib/prisma/client";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>; // id is actually the year
}

async function getBloodDonationUnitId() {
  const unit = await prisma.unit.findUnique({
    where: { code: "BLOOD_DONATION" },
  });
  return unit?.id;
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
    
    const unitId = await getBloodDonationUnitId();
    if (!unitId) {
      return errorResponse("Blood donation unit not found", 404);
    }
    
    const { id } = await params;
    const year = parseInt(id, 10);
    
    if (isNaN(year)) {
      return errorResponse("Invalid year", 400);
    }
    
    await metricsRepo.deleteBloodDonationMetrics(unitId, year);
    
    return successResponse({ year }, "Blood donation metrics deleted");
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
