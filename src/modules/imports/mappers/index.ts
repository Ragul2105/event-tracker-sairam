import { ParsedSheet, findColumn, getRowValue, parseNumber, parseDate, parseYear, normalizeColumnName } from "../parsers/excel";

export interface MappedEventRow {
  title: string | null;
  description: string | null;
  eventDate: Date | null;
  year: number | null;
  activityType: string | null;
  studentCount: number | null;
  facultyCount: number | null;
  externalCount: number | null;
  totalParticipants: number | null;
  beneficiaryText: string | null;
  beneficiaryCount: number | null;
  hoursPerEvent: number | null;
  totalHoursEngaged: number | null;
  amountSpent: number | null;
  locationText: string | null;
  reportUrl: string | null;
  socialUrl: string | null;
  sdgGoalNumbers: number[];
  primarySdgGoalNumber: number | null;
  sourceSheet: string;
  sourceRowNumber: number;
}

export interface MappedBloodDonationRow {
  year: number | null;
  campDonors: number | null;
  regularDonors: number | null;
  college: string | null;
  sourceSheet: string;
  sourceRowNumber: number;
}

export type SheetType = "EVENT" | "BLOOD_DONATION" | "CONSOLIDATED" | "UNKNOWN";

export function detectSheetType(sheetName: string): SheetType {
  const name = sheetName.toLowerCase();
  
  if (name.includes("blood") && name.includes("donation")) {
    return "BLOOD_DONATION";
  }
  
  if (name.includes("consolidated")) {
    return "CONSOLIDATED";
  }
  
  const eventSheets = [
    "innovation ecosystem",
    "nss",
    "uba",
    "scouts",
    "guides",
    "household",
    "sird",
  ];
  
  for (const eventSheet of eventSheets) {
    if (name.includes(eventSheet)) {
      return "EVENT";
    }
  }
  
  return "UNKNOWN";
}

export function mapSheetToUnit(sheetName: string): string | null {
  const name = sheetName.toLowerCase();
  
  if (name.includes("innovation")) return "INNOVATION_ECOSYSTEM";
  if (name.includes("nss")) return "NSS";
  if (name.includes("uba")) return "UBA";
  if (name.includes("scouts") || name.includes("guides")) return "SCOUTS_AND_GUIDES";
  if (name.includes("household") || name.includes("sird")) return "HOUSEHOLD_SURVEY_SIRD";
  if (name.includes("blood")) return "BLOOD_DONATION";
  
  return null;
}

export function mapEventRow(
  row: Record<string, unknown>,
  headers: string[],
  sheetName: string,
  rowNumber: number
): MappedEventRow {
  // Find columns
  const titleCol = findColumn(headers, "ACTIVITY NAME", "activity name", "Activity Name", "title");
  const dateCol = findColumn(headers, "Date", "date", "Date From - To", "event date");
  const yearCol = findColumn(headers, "YEAR", "year", "Year");
  const activityTypeCol = findColumn(headers, "TYPE OF ACTIVITY", "type of activity", "activity type");
  const locationCol = findColumn(headers, "LOCATION", "location");
  const hoursPerEventCol = findColumn(headers, "NO.OF.HOURS ENGAGED (event hour)", "hours per event", "event hours");
  const totalHoursCol = findColumn(headers, "Total NO.OF.HOURS ENGAGED", "total hours", "Total NO.OF.HOURS");
  const amountCol = findColumn(headers, "AMOUNT SPEND", "amount spent", "amount");
  const beneficiariesCol = findColumn(headers, "BENEFICIERIES", "beneficiaries");
  const beneficiaryCountCol = findColumn(headers, "NO.OF.BENEFICIERIES", "no of beneficiaries", "NO.OF                   BENEFICIERIES");
  const reportCol = findColumn(headers, "Report link", "report url", "report");
  const socialCol = findColumn(headers, "Social media link", "social media", "social url");
  const sdgCol = findColumn(headers, "SDG GOAL NO", "sdg goal", "SDG  primary GOAL NO");
  const primarySdgCol = findColumn(headers, "SDG  primary GOAL NO", "primary sdg");
  const totalCol = findColumn(headers, "Total", "Total ", "total participants");
  
  // Parse SDG goals
  const sdgValue = getRowValue(row, sdgCol);
  const primarySdgValue = getRowValue(row, primarySdgCol);
  
  const sdgGoalNumbers: number[] = [];
  let primarySdgGoalNumber: number | null = null;
  
  if (sdgValue) {
    const sdgStr = String(sdgValue);
    
    if (sdgStr.toLowerCase().includes("17 goals") || sdgStr.toLowerCase() === "all") {
      // All 17 goals
      for (let i = 1; i <= 17; i++) {
        sdgGoalNumbers.push(i);
      }
    } else {
      // Parse individual goal numbers
      const matches = sdgStr.match(/\d+/g);
      if (matches) {
        for (const match of matches) {
          const num = parseInt(match, 10);
          if (num >= 1 && num <= 17) {
            sdgGoalNumbers.push(num);
          }
        }
      }
    }
  }
  
  if (primarySdgValue) {
    const num = parseNumber(primarySdgValue);
    if (num && num >= 1 && num <= 17) {
      primarySdgGoalNumber = num;
    }
  }
  
  return {
    title: getRowValue(row, titleCol) ? String(getRowValue(row, titleCol)) : null,
    description: null,
    eventDate: parseDate(getRowValue(row, dateCol)),
    year: parseYear(getRowValue(row, yearCol)),
    activityType: getRowValue(row, activityTypeCol) ? String(getRowValue(row, activityTypeCol)) : null,
    studentCount: null, // Not directly available in most sheets
    facultyCount: null,
    externalCount: null,
    totalParticipants: parseNumber(getRowValue(row, totalCol)),
    beneficiaryText: getRowValue(row, beneficiariesCol) ? String(getRowValue(row, beneficiariesCol)) : null,
    beneficiaryCount: parseNumber(getRowValue(row, beneficiaryCountCol)),
    hoursPerEvent: parseNumber(getRowValue(row, hoursPerEventCol)),
    totalHoursEngaged: parseNumber(getRowValue(row, totalHoursCol)),
    amountSpent: parseNumber(getRowValue(row, amountCol)),
    locationText: getRowValue(row, locationCol) ? String(getRowValue(row, locationCol)) : null,
    reportUrl: getRowValue(row, reportCol) ? String(getRowValue(row, reportCol)) : null,
    socialUrl: getRowValue(row, socialCol) ? String(getRowValue(row, socialCol)) : null,
    sdgGoalNumbers,
    primarySdgGoalNumber: primarySdgGoalNumber || (sdgGoalNumbers.length === 1 ? sdgGoalNumbers[0] : null),
    sourceSheet: sheetName,
    sourceRowNumber: rowNumber,
  };
}

export function mapBloodDonationRow(
  row: Record<string, unknown>,
  headers: string[],
  sheetName: string,
  rowNumber: number
): MappedBloodDonationRow {
  const yearCol = findColumn(headers, "YEAR", "year");
  const campCol = findColumn(headers, "CAMP DONORS", "camp donors");
  const regularCol = findColumn(headers, "REGULAR DONORS", "regular donors");
  const collegeCol = findColumn(headers, "COLLEGE", "college");
  
  return {
    year: parseYear(getRowValue(row, yearCol)),
    campDonors: parseNumber(getRowValue(row, campCol)),
    regularDonors: parseNumber(getRowValue(row, regularCol)),
    college: getRowValue(row, collegeCol) ? String(getRowValue(row, collegeCol)) : null,
    sourceSheet: sheetName,
    sourceRowNumber: rowNumber,
  };
}

export function mapSheet(sheet: ParsedSheet): {
  type: SheetType;
  unitCode: string | null;
  eventRows: MappedEventRow[];
  bloodDonationRows: MappedBloodDonationRow[];
} {
  const type = detectSheetType(sheet.name);
  const unitCode = mapSheetToUnit(sheet.name);
  
  const eventRows: MappedEventRow[] = [];
  const bloodDonationRows: MappedBloodDonationRow[] = [];
  
  sheet.rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 for header row and 1-based index
    
    if (type === "BLOOD_DONATION") {
      const mapped = mapBloodDonationRow(row, sheet.headers, sheet.name, rowNumber);
      if (mapped.year !== null) {
        bloodDonationRows.push(mapped);
      }
    } else if (type === "EVENT") {
      const mapped = mapEventRow(row, sheet.headers, sheet.name, rowNumber);
      if (mapped.title) {
        eventRows.push(mapped);
      }
    }
  });
  
  return { type, unitCode, eventRows, bloodDonationRows };
}
