import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/modules/auth/middleware";
import prisma from "@/lib/prisma/client";
import * as XLSX from "xlsx";

export const runtime = "nodejs"; // Force Node.js runtime for XLSX

const UNIT_CODES: Record<string, string> = {
  "innovation-ecosystem": "INNOVATION_ECOSYSTEM",
  "nss": "NSS",
  "uba": "UBA",
  "household-survey": "HOUSEHOLD_SURVEY_SIRD",
};

interface ParsedEventRow {
  sno: number;
  sdgGoalNo: string;
  date: string;
  year: number;
  activityName: string;
  typeOfActivity: string;
  students: number;
  faculty: number;
  external: number;
  total: number;
  location: string;
  hoursPerPerson: number;
  totalHours: number;
  amountSpent: number;
  beneficiaries: string;
  beneficiariesCount: number;
  reportLink: string;
  socialMediaLink: string;
}

function toCellString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toCellInt(value: unknown): number {
  const parsed = parseInt(toCellString(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toCellFloat(value: unknown): number {
  const parsed = parseFloat(toCellString(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function parseExcelDate(value: unknown): Date | null {
  if (!value) return null;

  // If it's already a date object
  if (value instanceof Date) return value;

  // If it's an Excel serial number
  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date;
  }

  // If it's a string in DD.MM.YYYY format
  if (typeof value === "string") {
    const parts = value.split(".");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  }

  return null;
}

function parseSDGGoals(sdgGoalNo: string): number[] {
  if (!sdgGoalNo) return [];
  
  const str = sdgGoalNo.toLowerCase().trim();
  
  // Handle "17 Goals" case
  if (str.includes("17 goal")) {
    return Array.from({ length: 17 }, (_, i) => i + 1);
  }

  // Extract numbers from string like "Goal 1, Goal 4" or "1, 4"
  const numbers = str
    .split(/[,\s]+/)
    .map((part) => {
      const match = part.match(/\d+/);
      return match ? parseInt(match[0]) : null;
    })
    .filter((n): n is number => n !== null && n >= 1 && n <= 17);

  return [...new Set(numbers)]; // Remove duplicates
}

function generateEventCode(unitCode: string, year: number, sequence: number): string {
  const yearShort = year.toString().slice(-2);
  const unitShort = unitCode.slice(0, 3); // INN, NSS, UBA, etc.
  const seq = sequence.toString().padStart(4, "0");
  return `${yearShort}${unitShort}${seq}`;
}

interface RouteParams {
  params: Promise<{ unit: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { unit } = await params;
    const unitCode = UNIT_CODES[unit];

    if (!unitCode) {
      return NextResponse.json({ error: "Invalid unit" }, { status: 400 });
    }

    // Get the unit from database
    const unitRecord = await prisma.unit.findFirst({
      where: { code: unitCode },
    });

    if (!unitRecord) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read Excel file
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Parse data (skip header row - row 0)
    const events: ParsedEventRow[] = [];
    
    console.log(`Parsing ${data.length} rows from Excel...`);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) {
        console.log(`Skipping empty row ${i}`);
        continue; // Skip empty rows
      }

      try {
        const event: ParsedEventRow = {
          sno: toCellInt(row[0]),
          sdgGoalNo: toCellString(row[1]),
          date: toCellString(row[2]),
          year: toCellInt(row[3]) || new Date().getFullYear(),
          activityName: toCellString(row[4]),
          typeOfActivity: toCellString(row[5]),
          students: toCellInt(row[6]),
          faculty: toCellInt(row[7]),
          external: toCellInt(row[8]),
          total: toCellInt(row[9]),
          location: toCellString(row[10]),
          hoursPerPerson: toCellFloat(row[11]),
          totalHours: toCellFloat(row[12]),
          amountSpent: toCellFloat(row[13]),
          beneficiaries: toCellString(row[14]),
          beneficiariesCount: toCellInt(row[15]),
          reportLink: toCellString(row[16]),
          socialMediaLink: toCellString(row[17]),
        };

        console.log(`Parsed row ${i}: ${event.activityName}`);
        events.push(event);
      } catch (err) {
        console.error(`Error parsing row ${i}:`, err);
      }
    }

    console.log(`Total parsed events: ${events.length}`);

    if (events.length === 0) {
      return NextResponse.json(
        { error: "No valid events found in file" },
        { status: 400 }
      );
    }

    // Get all SDG goals
    const allGoals = await prisma.sDGGoal.findMany();

    // Import events
    let imported = 0;
    const errors: string[] = [];

    for (const eventData of events) {
      try {
        // Generate event code
        const existingCount = await prisma.event.count({
          where: { 
            unitId: unitRecord.id,
            year: eventData.year 
          },
        });
        const eventCode = generateEventCode(unitCode, eventData.year, existingCount + 1);

        // Parse date
        const eventDate = parseExcelDate(eventData.date);

        // Create event
        const event = await prisma.event.create({
          data: {
            eventCode,
            title: eventData.activityName,
            unitId: unitRecord.id,
            eventDate,
            year: eventData.year,
            activityType: eventData.typeOfActivity || null,
            studentCount: eventData.students,
            facultyCount: eventData.faculty,
            externalCount: eventData.external,
            totalParticipants: eventData.total || (eventData.students + eventData.faculty + eventData.external),
            hoursPerEvent: eventData.hoursPerPerson,
            totalHoursEngaged: eventData.totalHours,
            amountSpent: eventData.amountSpent,
            locationText: eventData.location,
            beneficiaryText: eventData.beneficiaries,
            beneficiaryCount: eventData.beneficiariesCount,
            reportUrl: eventData.reportLink || null,
            socialUrl: eventData.socialMediaLink || null,
            sourceSheet: sheetName,
            sourceRowNumber: events.indexOf(eventData) + 3, // +3 for header rows + 0-index
            createdById: authUser.userId,
          },
        });

        // Link SDG goals
        const sdgGoalNumbers = parseSDGGoals(eventData.sdgGoalNo);
        if (sdgGoalNumbers.length > 0) {
          for (let i = 0; i < sdgGoalNumbers.length; i++) {
            const goalNumber = sdgGoalNumbers[i];
            const goal = allGoals.find((g) => g.goalNumber === goalNumber);
            if (goal) {
              await prisma.eventGoal.create({
                data: {
                  eventId: event.id,
                  sdgGoalId: goal.id,
                  isPrimary: i === 0, // First goal is primary
                },
              });
            }
          }
        }

        imported++;
      } catch (err: unknown) {
        console.error(`Error importing event ${eventData.activityName}:`, err);
        errors.push(`Row ${eventData.sno}: ${getErrorMessage(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      total: events.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error("Import error:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
