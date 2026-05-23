import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/modules/auth/middleware";
import prisma from "@/lib/prisma/client";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

function toCellString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toCellInt(value: unknown): number {
  const parsed = parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toCellFloat(value: unknown): number {
  const parsed = parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function parseExcelDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    return new Date((value - 25569) * 86400 * 1000);
  }
  if (typeof value === "string") {
    const str = value.trim();
    // DD.MM.YYYY
    const dotParts = str.split(".");
    if (dotParts.length === 3) {
      const [d, m, y] = dotParts;
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      if (!isNaN(date.getTime())) return date;
    }
    // DD-MM-YYYY
    const dashParts = str.split("-");
    if (dashParts.length === 3) {
      const [d, m, y] = dashParts;
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      if (!isNaN(date.getTime())) return date;
    }
    // DD/MM/YYYY
    const slashParts = str.split("/");
    if (slashParts.length === 3) {
      const [d, m, y] = slashParts;
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      if (!isNaN(date.getTime())) return date;
    }
  }
  return null;
}

function parseSDGGoals(primary: unknown, secondary: unknown): { primaryNum: number | null; allNums: number[] } {
  const parseNums = (val: unknown): number[] => {
    if (!val && val !== 0) return [];
    if (val instanceof Date) return [];
    const str = String(val).toLowerCase().trim();
    if (str.includes("all") || str.includes("17 goal")) {
      return Array.from({ length: 17 }, (_, i) => i + 1);
    }
    return str
      .split(/[\s,]+/)
      .map((part) => {
        const match = part.match(/\d+/);
        return match ? parseInt(match[0]) : null;
      })
      .filter((n): n is number => n !== null && n >= 1 && n <= 17);
  };

  const primaryNums = parseNums(primary);
  const secondaryNums = parseNums(secondary);
  const allNums = [...new Set([...primaryNums, ...secondaryNums])];
  return { primaryNum: primaryNums[0] ?? null, allNums };
}

function generateEventCode(unitCode: string, year: number, sequence: number): string {
  const yearShort = year.toString().slice(-2);
  const unitShort = unitCode.slice(0, 3);
  return `${yearShort}${unitShort}${String(sequence).padStart(4, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const unitRecord = await prisma.unit.findFirst({
      where: { code: "SCOUTS_AND_GUIDES" },
    });

    if (!unitRecord) {
      return NextResponse.json({ error: "Scouts & Guides unit not found in database" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    const allGoals = await prisma.sDGGoal.findMany();

    let imported = 0;
    const errors: string[] = [];

    // Rows 0 and 1 are header rows; data starts at row 2
    for (let i = 2; i < data.length; i++) {
      const row = data[i] as unknown[];
      if (!row || row.length === 0) continue;

      // Col 1 = SI.No; skip summary rows (no serial number)
      const sno = toCellInt(row[1]);
      if (!sno) continue;

      // Col 7 = Activity Name (title)
      const title = toCellString(row[7]);
      if (!title) continue;

      const subUnitName = toCellString(row[0]);
      const { primaryNum, allNums } = parseSDGGoals(row[2], row[3]);

      const eventDate = parseExcelDate(row[4]);
      const eventDateTo = parseExcelDate(row[5]);

      let year = toCellInt(row[6]);
      if (!year || year < 1900) {
        year = eventDate ? eventDate.getFullYear() : new Date().getFullYear();
      }

      const activityType = toCellString(row[8]);
      const students = toCellInt(row[9]);
      const faculty = toCellInt(row[10]);
      const external = toCellInt(row[11]);

      // Col 12 is a formula total — compute from parts
      const total = students + faculty + external;

      const locationText = toCellString(row[13]);
      const hoursPerEvent = toCellFloat(row[14]);
      const totalHoursEngaged = toCellFloat(row[15]);
      const amountSpent = toCellFloat(row[16]);
      const beneficiaryText = toCellString(row[17]);

      // Col 18: beneficiary count — may be a formula or number
      let beneficiaryCount = 0;
      if (row[18] !== null && row[18] !== undefined) {
        const raw = toCellString(row[18]);
        if (!raw.startsWith("=")) {
          beneficiaryCount = toCellInt(row[18]);
        } else {
          // formula like =M3 → use total
          beneficiaryCount = total;
        }
      }

      const reportUrl = toCellString(row[19]);
      const socialUrl = toCellString(row[20]);

      try {
        const existingCount = await prisma.event.count({
          where: { unitId: unitRecord.id, year },
        });
        const eventCode = generateEventCode(unitRecord.code, year, existingCount + 1);

        const event = await prisma.event.create({
          data: {
            eventCode,
            title,
            unitId: unitRecord.id,
            eventDate: eventDate ?? undefined,
            eventDateTo: eventDateTo ?? undefined,
            year,
            activityType: activityType || null,
            studentCount: students,
            facultyCount: faculty,
            externalCount: external,
            totalParticipants: total,
            hoursPerEvent: hoursPerEvent > 0 ? hoursPerEvent : undefined,
            totalHoursEngaged: totalHoursEngaged > 0 ? totalHoursEngaged : undefined,
            amountSpent: amountSpent > 0 ? amountSpent : undefined,
            locationText: locationText || null,
            beneficiaryText: beneficiaryText || null,
            beneficiaryCount: beneficiaryCount > 0 ? beneficiaryCount : undefined,
            reportUrl: reportUrl && !reportUrl.startsWith("=") ? reportUrl : null,
            socialUrl: socialUrl && !socialUrl.startsWith("=") ? socialUrl : null,
            subUnitName: subUnitName || null,
            sourceSheet: sheetName,
            sourceRowNumber: i + 1,
            createdById: authUser.userId,
          },
        });

        // Link SDG goals
        if (allNums.length > 0) {
          for (let gi = 0; gi < allNums.length; gi++) {
            const goal = allGoals.find((g) => g.goalNumber === allNums[gi]);
            if (goal) {
              await prisma.eventGoal.create({
                data: {
                  eventId: event.id,
                  sdgGoalId: goal.id,
                  isPrimary: allNums[gi] === primaryNum,
                },
              });
            }
          }
        }

        imported++;
      } catch (err) {
        errors.push(`Row ${i + 1} (${title}): ${getErrorMessage(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      total: imported + errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Scouts & Guides import error:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
