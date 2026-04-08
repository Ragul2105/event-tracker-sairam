import { NextRequest } from "next/server";
import * as importService from "@/modules/imports/services";
import { getAuthUser } from "@/modules/auth/middleware";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError, NotFoundError } from "@/modules/shared/errors";

interface RouteParams {
  params: Promise<{ batchId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    const { batchId } = await params;
    const batch = await importService.getImportBatch(batchId);
    
    if (!batch) {
      throw new NotFoundError("Import batch");
    }
    
    return successResponse(batch);
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
