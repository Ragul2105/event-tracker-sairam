# Innovation Ecosystem - Testing Guide

## All Issues Fixed! ✅

### What Was Fixed:
1. ✅ **Route Conflict** - Moved to `/api/unit-events/[unit]/`
2. ✅ **ZodError** - Now sending proper parameters (page, pageSize, unitId)
3. ✅ **Invalid Status** - Changed from "COMPLETED" to "PUBLISHED"
4. ✅ **Database** - Seeded with units and SDG goals
5. ✅ **Row Parsing** - Starting at row 1 instead of row 2

### Server Status:
- ✅ Dev server running on http://localhost:3000
- ✅ No route conflicts
- ✅ Database seeded with 6 units and 17 SDG goals

---

## Quick Test Steps

### 1. Login
```
URL: http://localhost:3000
Email: admin@sairam.edu.in
Password: admin123
```

### 2. Navigate to Innovation Ecosystem
- Click **"Events"** in the left sidebar
- Submenu should expand showing 4 items:
  - Innovation Ecosystem
  - NSS
  - UBA  
  - House Hold Survey
- Click **"Innovation Ecosystem"**

### 3. Page Should Load Successfully
You should see:
- Title: "Innovation Ecosystem Events"
- Filter section with Year dropdown and Search box
- "Download Template" button
- "Import Excel" button
- Empty table (or events if already imported)

### 4. Download Template
- Click **"Download Template"** button
- File should download: `innovation-ecosystem-template.xlsx`
- Open in Excel/Sheets - should have:
  - Sheet 1: "Sample Data" with 2 example events
  - Sheet 2: "Instructions" with field descriptions

### 5. Import Data
- Click **"Import Excel"** button
- Modal opens with file upload
- Click **"Choose File"** and select the downloaded template
- Click **"Upload"** button
- Should see: **"Import successful! 2 events imported."**

### 6. Verify Events Appear
After import, the table should show:
- **2 events**
- Event codes: `26INN0001`, `26INN0002`
- Activity names visible
- Dates, participants, etc.

### 7. Test Filtering
- **Year Filter:** Select "2024" - should show both events
- **Search:** Type "ideathon" - should show first event only
- **Clear filters:** Should show all events again

---

## Expected Data from Template

**Event 1:**
- Code: 26INN0001
- Activity: Sairam SDG Ideathon 3.0 - Inauguration
- Date: 08.02.2024
- Participants: 1180 (1100 students, 80 faculty)
- SDG Goal: 3

**Event 2:**
- Code: 26INN0002
- Activity: Innovation Workshop on AI & ML
- Date: 15.03.2024
- Participants: 165 (150 students, 12 faculty, 3 external)
- SDG Goal: 4

---

## Troubleshooting

### If page doesn't load:
1. Check browser console for errors
2. Check server terminal for errors
3. Verify dev server is running on port 3000

### If import shows "0 events":
1. Check server terminal for detailed logs
2. Should see: "Parsing X rows from Excel..."
3. Should see: "Parsed row 1: <activity name>"
4. If you see Prisma errors, check the FIXES_SUMMARY.md

### If "Unauthorized" error:
1. Make sure you're logged in
2. Clear cookies and login again
3. Check if session is valid

### If unit not found:
1. Run: `npm run db:seed`
2. Verify units were created in database

---

## Browser Console Check

Open Developer Tools (F12) and check:

**No Errors Expected:**
- ✅ No 404 errors
- ✅ No 500 errors  
- ✅ API calls return success

**Expected API Calls:**
1. `GET /api/masters/units` - Gets unit list
2. `GET /api/events?page=1&pageSize=100&unitId=...` - Gets events
3. `POST /api/unit-events/innovation-ecosystem/import` - Imports data

---

## Server Terminal Check

After import, you should see logs like:
```
Parsing 3 rows from Excel...
Parsed row 1: Sairam SDG Ideathon 3.0 - Inauguration
Parsed row 2: Innovation Workshop on AI & ML
Total parsed events: 2
```

---

## What to Check Next

After confirming Innovation Ecosystem works:

1. **Data Persistence:**
   - Refresh page - events should still be there
   - Logout/login - events should still be there

2. **Duplicate Import:**
   - Try importing the same file again
   - Should create 2 more events (26INN0003, 26INN0004)

3. **Event Details:**
   - Click on an event row (if clickable)
   - Should show full event details

4. **Ready for Replication:**
   - Once Innovation Ecosystem fully works
   - Copy pattern to NSS, UBA, Household Survey

---

## Success Criteria ✅

- [ ] Page loads without errors
- [ ] Template downloads successfully  
- [ ] Template opens in Excel
- [ ] Import completes with "2 events imported"
- [ ] Events appear in table
- [ ] Event codes are correct (26INN0001, 26INN0002)
- [ ] Filters work (year, search)
- [ ] No console errors
- [ ] No server errors

---

## Next Phase: Replicate to Other Units

Once all checkboxes above are ✅:

1. Create NSS page (same structure)
2. Create UBA page (same structure)  
3. Create Household Survey page (same structure)
4. Test all imports work correctly
5. Implement Scouts & Guides (different structure - later)
