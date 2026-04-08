import { NextRequest } from "next/server";
import * as importService from "@/modules/imports/services";
import { getAuthUser } from "@/modules/auth/middleware";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { handleError } from "@/modules/shared/errors";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return errorResponse("Authentication required", 401);
    }
    
    // Unit users can only see their own imports
    const userId = user.role === UserRole.UNIT_USER ? user.userId : undefined;
    const batches = await importService.getImportBatches(userId);
    
    return successResponse(batches);
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
    
    // Only Admin and Master can import
    if (user.role === UserRole.UNIT_USER) {
      return errorResponse("Permission denied", 403);
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return errorResponse("File is required", 400);
    }
    
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return errorResponse("Only Excel files (.xlsx, .xls) are supported", 400);
    }
    
    const buffer = await file.arrayBuffer();
    const result = await importService.processImport(buffer, file.name, user.userId);
    
    return successResponse(result, "Import completed");
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return errorResponse(message, statusCode);
  }
}
