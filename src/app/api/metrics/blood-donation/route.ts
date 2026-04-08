import { NextRequest } from "next/server";
import * as metricsRepo from "@/modules/metrics/repositories";
import { bloodDonationMetricSchema } from "@/modules/metrics/validators";
import { getAuthUser } from "@/modules/auth/middleware";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";
import prisma from "@/lib/prisma/client";
import { UserRole } from "@prisma/client";

// Helper to get blood donation unit ID
async function getBloodDonationUnitId() {
  const unit = await prisma.unit.findUnique({
    where: { code: "BLOOD_DONATION" },
  });
  return unit?.id;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    const unitId = await getBloodDonationUnitId();
    if (!unitId) {
      return errorResponse("Blood donation unit not found", 404);
    }
    
    const metrics = await metricsRepo.getBloodDonationSummary(unitId);
    
    return successResponse(metrics);
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
    
    if (user.role === UserRole.UNIT_USER) {
      return errorResponse("Permission denied", 403);
    }
    
    const unitId = await getBloodDonationUnitId();
    if (!unitId) {
      return errorResponse("Blood donation unit not found", 404);
    }
    
    const body = await request.json();
    const parsed = bloodDonationMetricSchema.safeParse(body);
    
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }
    
    const { year, campDonors, regularDonors, totalDonors } = parsed.data;
    
    await metricsRepo.upsertBloodDonationMetric({
      unitId,
      year,
      campDonors,
      regularDonors,
      totalDonors: totalDonors ?? campDonors + regularDonors,
    });
    
    return successResponse({ year, campDonors, regularDonors }, "Blood donation metrics saved");
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
