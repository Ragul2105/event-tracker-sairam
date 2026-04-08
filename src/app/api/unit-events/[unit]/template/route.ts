import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs"; // Force Node.js runtime for XLSX

const UNIT_CODES: Record<string, string> = {
  "innovation-ecosystem": "INNOVATION_ECOSYSTEM",
  "nss": "NSS",
  "uba": "UBA",
  "household-survey": "HOUSEHOLD_SURVEY_SIRD",
};

const UNIT_NAMES: Record<string, string> = {
  "innovation-ecosystem": "Innovation Ecosystem",
  "nss": "National Service Scheme (NSS)",
  "uba": "Unnat Bharat Abhiyan (UBA)",
  "household-survey": "House Hold Survey & SIRD",
};

interface RouteParams {
  params: Promise<{ unit: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    console.log("[Template] Starting template generation...");
    const { unit } = await params;
    console.log("[Template] Unit:", unit);
    
    if (!UNIT_CODES[unit]) {
      console.log("[Template] Invalid unit:", unit);
      return NextResponse.json({ error: "Invalid unit" }, { status: 400 });
    }

    const unitName = UNIT_NAMES[unit];
    console.log("[Template] Unit name:", unitName);

    // Sample data rows
    const sampleData = [
      {
        "S.No": 1,
        "SDG Goal No": "17 Goals",
        "Date": "08.02.2024",
        "Year": 2024,
        "Activity Name": "Sample Activity 1",
        "Type of Activity": "Workshop",
        "Students": 100,
        "Faculty": 10,
        "External": 5,
        "Total": 115,
        "Location": "Sri Sairam Engineering College - Chennai",
        "Hours Per Person": 2,
        "Total Hours Engaged": 230,
        "Amount Spent": 5000,
        "Beneficiaries": "First year students",
        "No. of Beneficiaries": 115,
        "Report Link": "https://example.com/report1",
        "Social Media Link": "https://example.com/social1",
      },
      {
        "S.No": 2,
        "SDG Goal No": "Goal 4, Goal 17",
        "Date": "15.03.2024",
        "Year": 2024,
        "Activity Name": "Sample Activity 2",
        "Type of Activity": "Seminar",
        "Students": 80,
        "Faculty": 8,
        "External": 3,
        "Total": 91,
        "Location": "Main Auditorium",
        "Hours Per Person": 3,
        "Total Hours Engaged": 273,
        "Amount Spent": 3000,
        "Beneficiaries": "Second year students",
        "No. of Beneficiaries": 91,
        "Report Link": "",
        "Social Media Link": "",
      },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create main sheet with sample data
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    ws["!cols"] = [
      { wch: 6 },  // S.No
      { wch: 15 }, // SDG Goal No
      { wch: 12 }, // Date
      { wch: 6 },  // Year
      { wch: 30 }, // Activity Name
      { wch: 20 }, // Type of Activity
      { wch: 10 }, // Students
      { wch: 10 }, // Faculty
      { wch: 10 }, // External
      { wch: 8 },  // Total
      { wch: 35 }, // Location
      { wch: 12 }, // Hours Per Person
      { wch: 15 }, // Total Hours
      { wch: 12 }, // Amount Spent
      { wch: 30 }, // Beneficiaries
      { wch: 15 }, // No. of Beneficiaries
      { wch: 35 }, // Report Link
      { wch: 35 }, // Social Media Link
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Sample Data");

    // Create instructions sheet
    const instructions = [
      {
        Field: "REQUIRED FIELDS",
        Description: "(Must be filled for each record)",
        Example: "",
      },
      {
        Field: "S.No",
        Description: "Serial number (for reference only)",
        Example: "1, 2, 3...",
      },
      {
        Field: "SDG Goal No",
        Description: 'SDG Goal numbers or "17 Goals"',
        Example: 'Goal 1, Goal 4 or "17 Goals"',
      },
      {
        Field: "Date",
        Description: "Event date in DD.MM.YYYY format",
        Example: "08.02.2024",
      },
      {
        Field: "Year",
        Description: "Year of the event",
        Example: "2024",
      },
      {
        Field: "Activity Name",
        Description: "Name/title of the activity",
        Example: "SDG Awareness Workshop",
      },
      {
        Field: "Type of Activity",
        Description: "Category/type of the activity",
        Example: "Workshop, Seminar, Webinar, etc.",
      },
      {
        Field: "Students",
        Description: "Number of students participated",
        Example: "100",
      },
      {
        Field: "Faculty",
        Description: "Number of faculty participated",
        Example: "10",
      },
      {
        Field: "External",
        Description: "Number of external participants",
        Example: "5",
      },
      {
        Field: "Total",
        Description: "Total participants (auto-calculated)",
        Example: "115",
      },
      {
        Field: "Location",
        Description: "Venue/location of the event",
        Example: "Main Auditorium, Sri Sairam Engineering College",
      },
      {
        Field: "Hours Per Person",
        Description: "Duration of event in hours",
        Example: "2, 3.5",
      },
      {
        Field: "Total Hours Engaged",
        Description: "Total hours (Total × Hours Per Person)",
        Example: "230",
      },
      {
        Field: "Amount Spent",
        Description: "Total amount spent (in Rupees)",
        Example: "5000",
      },
      {
        Field: "Beneficiaries",
        Description: "Description of beneficiaries",
        Example: "First year students from all departments",
      },
      {
        Field: "No. of Beneficiaries",
        Description: "Number of beneficiaries",
        Example: "115",
      },
      {
        Field: "",
        Description: "",
        Example: "",
      },
      {
        Field: "OPTIONAL FIELDS",
        Description: "(Can be left empty)",
        Example: "",
      },
      {
        Field: "Report Link",
        Description: "URL to event report/documentation",
        Example: "https://drive.google.com/...",
      },
      {
        Field: "Social Media Link",
        Description: "URL to social media post",
        Example: "https://instagram.com/post/...",
      },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions["!cols"] = [{ wch: 25 }, { wch: 45 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${unit}-events-template.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
