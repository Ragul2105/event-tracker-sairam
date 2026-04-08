import * as XLSX from "xlsx";

export interface ParsedSheet {
  name: string;
  rows: Record<string, unknown>[];
  headers: string[];
}

export interface ParsedWorkbook {
  sheets: ParsedSheet[];
  fileName: string;
}

export function parseExcelBuffer(buffer: ArrayBuffer, fileName: string): ParsedWorkbook {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  
  const sheets: ParsedSheet[] = [];
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: null,
      raw: false,
      dateNF: "yyyy-mm-dd",
    });
    
    // Get headers
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    const headers: string[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: col })];
      headers.push(cell?.v?.toString() || `Column${col + 1}`);
    }
    
    sheets.push({
      name: sheetName,
      rows: jsonData,
      headers,
    });
  }
  
  return { sheets, fileName };
}

export function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function findColumn(headers: string[], ...possibleNames: string[]): string | null {
  const normalized = headers.map(normalizeColumnName);
  
  for (const name of possibleNames) {
    const idx = normalized.indexOf(normalizeColumnName(name));
    if (idx !== -1) {
      return headers[idx];
    }
  }
  
  return null;
}

export function getRowValue(row: Record<string, unknown>, column: string | null): unknown {
  if (!column) return null;
  return row[column] ?? null;
}

export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

export function parseDate(value: unknown): Date | null {
  if (!value) return null;
  
  if (value instanceof Date) return value;
  
  const str = String(value).trim();
  
  // Try various date formats
  const formats = [
    /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
  ];
  
  for (const format of formats) {
    const match = str.match(format);
    if (match) {
      let year: number, month: number, day: number;
      
      if (format.source.startsWith("^(\\d{4})")) {
        [, year, month, day] = match.map(Number) as [unknown, number, number, number];
      } else {
        [, day, month, year] = match.map(Number) as [unknown, number, number, number];
      }
      
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) return date;
    }
  }
  
  // Try native parsing
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function parseYear(value: unknown): number | null {
  if (!value) return null;
  
  const str = String(value).trim();
  
  // Handle year ranges like "2021-22"
  const rangeMatch = str.match(/^(\d{4})/);
  if (rangeMatch) {
    return parseInt(rangeMatch[1], 10);
  }
  
  const num = parseInt(str, 10);
  return num >= 1900 && num <= 2100 ? num : null;
}
