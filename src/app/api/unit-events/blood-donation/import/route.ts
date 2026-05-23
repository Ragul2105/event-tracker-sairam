import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/modules/auth/middleware";
import { upsertBloodDonationRecord } from "@/modules/blood-donation/repositories";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

function toCellInt(value: unknown): number {
  const parsed = parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toCellString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    let imported = 0;
    const errors: string[] = [];

    // Row 0 is header (YEAR | CAMP DONORS | REGULAR DONORS | COLLEGE), data starts at row 1
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as unknown[];
      if (!row || !row[0]) continue;

      const yearRaw = row[0];

      // Skip summary/total rows
      if (typeof yearRaw === "string" && yearRaw.toUpperCase().includes("TOTAL")) {
        continue;
      }

      const year = toCellInt(yearRaw);
      if (!year || year < 1900 || year > 2100) continue;

      const campDonors = toCellInt(row[1]);
      const regularDonors = toCellInt(row[2]);
      const college = toCellString(row[3]);

      try {
        await upsertBloodDonationRecord({
          year,
          campDonors,
          regularDonors,
          totalDonors: campDonors + regularDonors,
          college: college || undefined,
        });
        imported++;
      } catch (err) {
        errors.push(`Row ${i + 1} (Year ${year}): ${getErrorMessage(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      total: imported + errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Blood donation import error:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
