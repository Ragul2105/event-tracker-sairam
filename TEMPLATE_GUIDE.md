# Excel Template for Innovation Ecosystem Events

## ✅ Template Fixed!

The Excel template is now **working properly** and can be opened in Excel and Google Sheets.

## 📥 How to Download

### Option 1: From the Application (Recommended)
1. Go to http://localhost:3000/events/innovation-ecosystem
2. Click "Download Template" button
3. The file will download as `innovation-ecosystem-template.xlsx`

### Option 2: Direct URL
Visit: http://localhost:3000/innovation-ecosystem-template.xlsx

### Option 3: From File System
Location: `public/innovation-ecosystem-template.xlsx`

### Option 4: Regenerate Template
Run: `npm run template:generate`

## 📊 Template Structure

The Excel file contains **2 sheets**:

### Sheet 1: Sample Data
- Contains 2 example events
- Shows the exact format expected
- All 18 columns with sample values

### Sheet 2: Instructions
- Detailed field descriptions
- Examples for each field
- Tips for filling the form

## 📋 Column Details

| Column | Description | Example | Required |
|--------|-------------|---------|----------|
| S.No | Serial number | 1, 2, 3 | Yes |
| SDG Goal No | SDG goals addressed | "17 Goals" or "Goal 1, Goal 4" | Yes |
| Date | Event date | 08.02.2024 | Yes |
| Year | Event year | 2024 | Yes |
| Activity Name | Event title | Sairam SDG Ideathon 3.0 | Yes |
| Type of Activity | Category | Workshop, Seminar | Yes |
| Students | Student count | 100 | Yes |
| Faculty | Faculty count | 10 | Yes |
| External | External participants | 5 | Yes |
| Total | Total participants | 115 | Yes |
| Location | Venue | Main Auditorium, SSEC | Yes |
| Hours Per Person | Duration | 2, 3.5 | Yes |
| Total Hours Engaged | Total hours | 230 | Yes |
| Amount Spent | Cost (₹) | 5000 | Yes |
| Beneficiaries | Description | First year students | Yes |
| No. of Beneficiaries | Count | 115 | Yes |
| Report Link | Document URL | https://... | Optional |
| Social Media Link | Post URL | https://... | Optional |

## 💡 Important Notes

### Date Format
- **Always use**: DD.MM.YYYY
- ✅ Correct: `08.02.2024`
- ❌ Wrong: `2024-02-08`, `02/08/2024`

### SDG Goals
- For all goals: `"17 Goals"`
- For specific goals: `"Goal 1, Goal 4, Goal 17"`
- First listed goal becomes primary

### Empty Values
- Leave optional fields blank
- Don't write "N/A", "Nil", or "-"
- Just leave the cell empty

### Total Calculation
- Total = Students + Faculty + External
- Must match the sum

### Hours Calculation
- Total Hours = Total Participants × Hours Per Person
- Example: 115 × 2 = 230

## 🚀 Import Process

1. **Download** the template
2. **Fill** with your event data
3. **Save** the file
4. **Go to** Innovation Ecosystem page
5. **Click** "Import Excel"
6. **Upload** your filled template
7. **Wait** for success message
8. **View** imported events in the table

## ❌ Common Errors

### Date Format Error
- **Problem**: Using wrong date format
- **Solution**: Use DD.MM.YYYY (e.g., 08.02.2024)

### Missing Required Fields
- **Problem**: Empty required columns
- **Solution**: Fill all required fields (see table above)

### Invalid SDG Goals
- **Problem**: Wrong goal format
- **Solution**: Use "17 Goals" or "Goal 1, Goal 4"

### Number Format Error
- **Problem**: Text in number fields
- **Solution**: Ensure numbers are actual numbers, not text

## 🔧 Troubleshooting

### Template won't open in Excel
- **Cause**: Downloaded file is HTML (404 error)
- **Fix**: Regenerate template with `npm run template:generate`

### Template shows "404" in cells
- **Cause**: API returned error page
- **Fix**: Use direct URL or regenerate template

### Import fails
- **Check**: All required fields are filled
- **Check**: Date format is DD.MM.YYYY
- **Check**: Numbers are actual numbers
- **Check**: File is .xlsx format

## 📞 Need Help?

1. Check the Instructions sheet in the Excel file
2. Look at the Sample Data sheet for examples
3. Review this README
4. Check browser console for error messages

## 🎯 Example Event

```
S.No: 1
SDG Goal No: "17 Goals"
Date: 08.02.2024
Year: 2024
Activity Name: Sairam SDG Ideathon 3.0 - Inauguration
Type of Activity: Ideathon
Students: 1100
Faculty: 80
External: 0
Total: 1180
Location: Sri Sairam Engineering College - West Tambaram - Chennai
Hours Per Person: 2
Total Hours Engaged: 2360
Amount Spent: 0
Beneficiaries: All first-year students at Sri Sairam Engineering College
No. of Beneficiaries: 1180
Report Link: https://innovation.sairamgroup.in/sdg/ideathon-3-0/
Social Media Link: https://www.instagram.com/p/example/
```

---

**Template Version**: 1.0  
**Last Updated**: April 2026  
**Compatible with**: Microsoft Excel 2007+, Google Sheets, LibreOffice Calc
