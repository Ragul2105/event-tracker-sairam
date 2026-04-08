#!/usr/bin/env node

/**
 * Innovation Ecosystem Events - Excel Template Generator
 * Run: node scripts/generate-template.js
 */

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Sample data rows
const sampleData = [
  {
    "S.No": 1,
    "SDG Goal No": "17 Goals",
    "Date": "08.02.2024",
    "Year": 2024,
    "Activity Name": "Sairam SDG Ideathon 3.0 - Inauguration",
    "Type of Activity": "Ideathon",
    "Students": 1100,
    "Faculty": 80,
    "External": 0,
    "Total": 1180,
    "Location": "Sri Sairam Engineering College - West Tambaram - Chennai",
    "Hours Per Person": 2,
    "Total Hours Engaged": 2360,
    "Amount Spent": 0,
    "Beneficiaries": "All first-year students at Sri Sairam Engineering College",
    "No. of Beneficiaries": 1180,
    "Report Link": "https://innovation.sairamgroup.in/sdg/ideathon-3-0/",
    "Social Media Link": "https://www.instagram.com/p/example/",
  },
  {
    "S.No": 2,
    "SDG Goal No": "Goal 4, Goal 17",
    "Date": "15.03.2024",
    "Year": 2024,
    "Activity Name": "Innovation Workshop on AI & ML",
    "Type of Activity": "Workshop",
    "Students": 150,
    "Faculty": 12,
    "External": 3,
    "Total": 165,
    "Location": "Innovation Lab, Main Campus",
    "Hours Per Person": 4,
    "Total Hours Engaged": 660,
    "Amount Spent": 15000,
    "Beneficiaries": "Second and third year CSE and AIDS students",
    "No. of Beneficiaries": 165,
    "Report Link": "",
    "Social Media Link": "",
  },
];

// Create workbook
const wb = XLSX.utils.book_new();

// Create main sheet with sample data
const ws = XLSX.utils.json_to_sheet(sampleData);

// Set column widths for better readability
ws["!cols"] = [
  { wch: 6 },  // S.No
  { wch: 15 }, // SDG Goal No
  { wch: 12 }, // Date
  { wch: 6 },  // Year
  { wch: 40 }, // Activity Name
  { wch: 20 }, // Type of Activity
  { wch: 10 }, // Students
  { wch: 10 }, // Faculty
  { wch: 10 }, // External
  { wch: 10 }, // Total
  { wch: 50 }, // Location
  { wch: 15 }, // Hours Per Person
  { wch: 18 }, // Total Hours
  { wch: 15 }, // Amount Spent
  { wch: 50 }, // Beneficiaries
  { wch: 18 }, // No. of Beneficiaries
  { wch: 50 }, // Report Link
  { wch: 50 }, // Social Media Link
];

XLSX.utils.book_append_sheet(wb, ws, "Sample Data");

// Create instructions sheet
const instructions = [
  {
    "Field Name": "📋 REQUIRED FIELDS",
    "Description": "Must be filled for each event",
    "Example / Notes": "",
  },
  {
    "Field Name": "S.No",
    "Description": "Serial number (for reference only)",
    "Example / Notes": "1, 2, 3, ...",
  },
  {
    "Field Name": "SDG Goal No",
    "Description": 'SDG Goal numbers or "17 Goals" for all goals',
    "Example / Notes": 'Goal 1, Goal 4, Goal 17 OR "17 Goals"',
  },
  {
    "Field Name": "Date",
    "Description": "Event date in DD.MM.YYYY format",
    "Example / Notes": "08.02.2024",
  },
  {
    "Field Name": "Year",
    "Description": "Year of the event",
    "Example / Notes": "2024",
  },
  {
    "Field Name": "Activity Name",
    "Description": "Full name/title of the activity or event",
    "Example / Notes": "Sairam SDG Ideathon 3.0",
  },
  {
    "Field Name": "Type of Activity",
    "Description": "Category/type of activity",
    "Example / Notes": "Workshop, Seminar, Webinar, Competition, etc.",
  },
  {
    "Field Name": "",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "👥 PARTICIPANTS",
    "Description": "Breakdown of participants",
    "Example / Notes": "",
  },
  {
    "Field Name": "Students",
    "Description": "Number of students who participated",
    "Example / Notes": "100",
  },
  {
    "Field Name": "Faculty",
    "Description": "Number of faculty members who participated",
    "Example / Notes": "10",
  },
  {
    "Field Name": "External",
    "Description": "Number of external participants (guests, experts, etc.)",
    "Example / Notes": "5",
  },
  {
    "Field Name": "Total",
    "Description": "Total participants (Students + Faculty + External)",
    "Example / Notes": "115",
  },
  {
    "Field Name": "",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "📍 LOCATION & TIME",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "Location",
    "Description": "Venue/place where the event was held",
    "Example / Notes": "Main Auditorium, Sri Sairam Engineering College",
  },
  {
    "Field Name": "Hours Per Person",
    "Description": "Duration of the event in hours",
    "Example / Notes": "2, 3.5, 4",
  },
  {
    "Field Name": "Total Hours Engaged",
    "Description": "Total hours = Total Participants × Hours Per Person",
    "Example / Notes": "115 × 2 = 230",
  },
  {
    "Field Name": "",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "💰 FINANCIAL",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "Amount Spent",
    "Description": "Total amount spent on the event (in Rupees)",
    "Example / Notes": "5000",
  },
  {
    "Field Name": "",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "🎯 BENEFICIARIES",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "Beneficiaries",
    "Description": "Description of who benefited from the event",
    "Example / Notes": "First year students from all departments",
  },
  {
    "Field Name": "No. of Beneficiaries",
    "Description": "Number of people who benefited",
    "Example / Notes": "115",
  },
  {
    "Field Name": "",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "🔗 OPTIONAL FIELDS",
    "Description": "Can be left empty if not available",
    "Example / Notes": "",
  },
  {
    "Field Name": "Report Link",
    "Description": "URL to event report or documentation",
    "Example / Notes": "https://drive.google.com/file/d/...",
  },
  {
    "Field Name": "Social Media Link",
    "Description": "URL to social media post about the event",
    "Example / Notes": "https://instagram.com/post/...",
  },
  {
    "Field Name": "",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "💡 TIPS",
    "Description": "",
    "Example / Notes": "",
  },
  {
    "Field Name": "Date Format",
    "Description": "Always use DD.MM.YYYY format",
    "Example / Notes": "08.02.2024 NOT 2024-02-08",
  },
  {
    "Field Name": "SDG Goals",
    "Description": 'Use "17 Goals" if all goals are addressed',
    "Example / Notes": 'Or list specific goals: "Goal 1, Goal 4"',
  },
  {
    "Field Name": "Empty Values",
    "Description": "Leave optional fields blank if not applicable",
    "Example / Notes": "Don't write 'N/A' or 'Nil', just leave empty",
  },
];

const wsInstructions = XLSX.utils.json_to_sheet(instructions);
wsInstructions["!cols"] = [{ wch: 25 }, { wch: 50 }, { wch: 50 }];
XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

// Create output directory if it doesn't exist
const publicDir = path.join(__dirname, "..", "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write file
const filename = "innovation-ecosystem-template.xlsx";
const filepath = path.join(publicDir, filename);
XLSX.writeFile(wb, filepath);

console.log("✅ Excel template created successfully!");
console.log(`📁 File saved to: ${filepath}`);
console.log(`\n🌐 Access at: http://localhost:3000/${filename}`);
console.log("\nYou can now:");
console.log("1. Download the file from the public URL above");
console.log("2. Or find it in the public/ folder");
console.log("3. Fill it with your event data");
console.log("4. Upload it using the Import Excel feature");
