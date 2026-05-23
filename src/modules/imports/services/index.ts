import prisma from "@/lib/prisma/client";
import { ImportStatus } from "@prisma/client";
import { parseExcelBuffer } from "../parsers/excel";
import { mapSheet } from "../mappers";
import * as importRepo from "../repositories";
import * as eventRepo from "@/modules/events/repositories";
import * as metricsRepo from "@/modules/metrics/repositories";
import { createLogger } from "@/lib/logger";

const logger = createLogger("imports-service");

export interface ImportResult {
  batchId: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  sheetResults: {
    sheetName: string;
    type: string;
    unitCode: string | null;
    totalRows: number;
    successRows: number;
    failedRows: number;
  }[];
}

export async function processImport(
  buffer: ArrayBuffer,
  fileName: string,
  userId: string
): Promise<ImportResult> {
  // Parse workbook
  const workbook = parseExcelBuffer(buffer, fileName);
  
  // Count total rows
  let totalRows = 0;
  for (const sheet of workbook.sheets) {
    totalRows += sheet.rows.length;
  }
  
  // Create import batch
  const batch = await importRepo.createImportBatch({
    fileName,
    uploadedById: userId,
    totalRows,
  });
  
  let successRows = 0;
  let failedRows = 0;
  const sheetResults: ImportResult["sheetResults"] = [];
  
  // Get unit map
  const units = await prisma.unit.findMany();
  const unitMap = new Map(units.map((u) => [u.code, u.id]));
  
  // Get SDG goal map
  const sdgGoals = await prisma.sDGGoal.findMany();
  const sdgMap = new Map(sdgGoals.map((s) => [s.goalNumber, s.id]));
  
  // Process each sheet
  for (const sheet of workbook.sheets) {
    const mapped = mapSheet(sheet);
    
    let sheetSuccess = 0;
    let sheetFailed = 0;
    
    if (mapped.type === "CONSOLIDATED") {
      // Skip consolidated sheet
      logger.info("Skipping consolidated sheet", { sheetName: sheet.name });
      continue;
    }
    
    if (mapped.type === "BLOOD_DONATION") {
      // Process blood donation rows
      const unitId = unitMap.get("BLOOD_DONATION");
      
      if (!unitId) {
        logger.error("Blood donation unit not found");
        continue;
      }
      
      for (const row of mapped.bloodDonationRows) {
        try {
          if (!row.year || row.campDonors === null || row.regularDonors === null) {
            throw new Error("Missing required fields: year, campDonors, or regularDonors");
          }
          
          await metricsRepo.upsertBloodDonationMetric({
            unitId,
            year: row.year,
            campDonors: row.campDonors,
            regularDonors: row.regularDonors,
            totalDonors: row.campDonors + row.regularDonors,
          });
          
          sheetSuccess++;
        } catch (error) {
          sheetFailed++;
          await importRepo.createImportRowError({
            batchId: batch.id,
            sheetName: sheet.name,
            rowNumber: row.sourceRowNumber,
            rawPayload: row,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    } else if (mapped.type === "EVENT" && mapped.unitCode) {
      // Process event rows
      const unitId = unitMap.get(mapped.unitCode);
      
      if (!unitId) {
        logger.error("Unit not found", { unitCode: mapped.unitCode });
        continue;
      }
      
      // Get unit for event code generation
      const unit = units.find((u) => u.id === unitId);
      
      for (const row of mapped.eventRows) {
        try {
          if (!row.title) {
            throw new Error("Title is required");
          }
          
          if (!row.year && !row.eventDate) {
            throw new Error("Either year or event date is required");
          }
          
          const year = row.year || (row.eventDate ? row.eventDate.getFullYear() : new Date().getFullYear());
          const eventCode = await eventRepo.getNextEventCode(unit!.code, year);
          
          // Create event
          const event = await eventRepo.createEvent({
            eventCode,
            title: row.title,
            description: row.description || undefined,
            unitId,
            eventDate: row.eventDate || undefined,
            year,
            activityType: row.activityType || undefined,
            studentCount: row.studentCount || 0,
            facultyCount: row.facultyCount || 0,
            externalCount: row.externalCount || 0,
            totalParticipants: row.totalParticipants || 0,
            beneficiaryText: row.beneficiaryText || undefined,
            beneficiaryCount: row.beneficiaryCount || undefined,
            hoursPerEvent: row.hoursPerEvent || undefined,
            totalHoursEngaged: row.totalHoursEngaged || undefined,
            amountSpent: row.amountSpent || undefined,
            locationText: row.locationText || undefined,
            reportUrl: row.reportUrl === "Nil" ? undefined : row.reportUrl || undefined,
            socialUrl: row.socialUrl || undefined,
            sourceSheet: row.sourceSheet,
            sourceRowNumber: row.sourceRowNumber,
            createdById: userId,
          });
          
          // Set SDG goals
          if (row.sdgGoalNumbers.length > 0) {
            const sdgGoalIds = row.sdgGoalNumbers
              .map((num) => sdgMap.get(num))
              .filter((id): id is string => id !== undefined);
            
            const primarySdgGoalId = row.primarySdgGoalNumber
              ? sdgMap.get(row.primarySdgGoalNumber)
              : undefined;
            
            if (sdgGoalIds.length > 0) {
              await eventRepo.setEventGoals(event.id, sdgGoalIds, primarySdgGoalId);
            }
          }
          
          sheetSuccess++;
        } catch (error) {
          sheetFailed++;
          await importRepo.createImportRowError({
            batchId: batch.id,
            sheetName: sheet.name,
            rowNumber: row.sourceRowNumber,
            rawPayload: row,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }
    
    successRows += sheetSuccess;
    failedRows += sheetFailed;
    
    sheetResults.push({
      sheetName: sheet.name,
      type: mapped.type,
      unitCode: mapped.unitCode,
      totalRows: mapped.eventRows.length + mapped.bloodDonationRows.length,
      successRows: sheetSuccess,
      failedRows: sheetFailed,
    });
  }
  
  // Update batch status
  const status: ImportStatus =
    failedRows === 0
      ? ImportStatus.COMPLETED
      : successRows === 0
      ? ImportStatus.FAILED
      : ImportStatus.PARTIAL_SUCCESS;
  
  await importRepo.updateImportBatch(batch.id, {
    status,
    successRows,
    failedRows,
  });
  
  logger.info("Import completed", {
    batchId: batch.id,
    totalRows,
    successRows,
    failedRows,
  });
  
  return {
    batchId: batch.id,
    totalRows,
    successRows,
    failedRows,
    sheetResults,
  };
}

export async function getImportBatches(userId?: string) {
  return importRepo.findImportBatches(userId);
}

export async function getImportBatch(id: string) {
  return importRepo.findImportBatchById(id);
}
