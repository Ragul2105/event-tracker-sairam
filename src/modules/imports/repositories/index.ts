import prisma from "@/lib/prisma/client";
import { ImportStatus } from "@prisma/client";

export async function createImportBatch(data: {
  fileName: string;
  uploadedById: string;
  totalRows: number;
}) {
  return prisma.importBatch.create({
    data: {
      fileName: data.fileName,
      uploadedById: data.uploadedById,
      totalRows: data.totalRows,
      status: ImportStatus.PENDING,
    },
  });
}

export async function updateImportBatch(
  id: string,
  data: {
    status?: ImportStatus;
    successRows?: number;
    failedRows?: number;
    notes?: string;
  }
) {
  return prisma.importBatch.update({
    where: { id },
    data,
  });
}

export async function findImportBatches(userId?: string) {
  return prisma.importBatch.findMany({
    where: userId ? { uploadedById: userId } : {},
    include: {
      uploadedBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findImportBatchById(id: string) {
  return prisma.importBatch.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: { id: true, name: true },
      },
      rowErrors: true,
    },
  });
}

export async function createImportRowError(data: {
  batchId: string;
  sheetName: string;
  rowNumber: number;
  rawPayload: unknown;
  errorMessage: string;
}) {
  return prisma.importRowError.create({
    data: {
      batchId: data.batchId,
      sheetName: data.sheetName,
      rowNumber: data.rowNumber,
      rawPayload: data.rawPayload as object,
      errorMessage: data.errorMessage,
    },
  });
}
