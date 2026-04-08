# Design System - Event Tracker
## Sri Sairam Institutions

This document defines the complete design system for the Event Tracker application. All components, pages, and features must follow these guidelines to ensure consistency.

---

## 🎨 Color Palette

### Primary Colors
```css
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main Primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### Neutral/Gray Colors
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;  /* Secondary text - AVOID for body text */
--gray-600: #4b5563;  /* Muted text - Use sparingly */
--gray-700: #374151;  /* Body text */
--gray-800: #1f2937;  /* Headings */
--gray-900: #111827;  /* Primary text */
```

### Semantic Colors
```css
--success-50: #f0fdf4;
--success-500: #22c55e;  /* Success/Active */
--success-700: #15803d;

--warning-50: #fffbeb;
--warning-500: #f59e0b;  /* Warning */
--warning-700: #b45309;

--error-50: #fef2f2;
--error-500: #ef4444;  /* Error/Danger */
--error-700: #b91c1c;

--info-50: #eff6ff;
--info-500: #3b82f6;  /* Info */
--info-700: #1d4ed8;
```

### Background Colors
```css
--bg-primary: #ffffff;      /* Main background */
--bg-secondary: #f9fafb;    /* Section background */
--bg-tertiary: #f3f4f6;     /* Card hover, subtle backgrounds */
--bg-dark: #0f172a;         /* Sidebar, dark sections */
--bg-dark-hover: #1e293b;   /* Sidebar hover */
```

---

## 📝 Typography

### Font Family
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem;      /* 12px - Labels, badges */
--text-sm: 0.875rem;     /* 14px - Secondary text, table data */
--text-base: 1rem;       /* 16px - Body text (DEFAULT) */
--text-lg: 1.125rem;     /* 18px - Emphasized text */
--text-xl: 1.25rem;      /* 20px - Section headings */
--text-2xl: 1.5rem;      /* 24px - Page titles */
--text-3xl: 1.875rem;    /* 30px - Hero text */
--text-4xl: 2.25rem;     /* 36px - Large displays */
```

### Font Weights
```css
--font-normal: 400;      /* Body text */
--font-medium: 500;      /* Emphasized text, labels */
--font-semibold: 600;    /* Headings, buttons */
--font-bold: 700;        /* Strong emphasis */
```

### Line Heights
```css
--leading-tight: 1.25;   /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Comfortable reading */
```

### Text Colors (Usage)
```css
--text-primary: #111827;    /* gray-900 - Main headings, important text */
--text-secondary: #374151;  /* gray-700 - Body text, descriptions */
--text-tertiary: #6b7280;   /* gray-500 - Muted text, placeholders */
--text-disabled: #9ca3af;   /* gray-400 - Disabled elements */
--text-white: #ffffff;      /* Text on dark backgrounds */
```

**IMPORTANT TEXT RULES:**
- ❌ **NEVER use gray-400 or lighter for body text** - Not accessible!
- ✅ **Use gray-700 or darker for all readable text**
- ✅ **Use gray-900 for headings and emphasis**
- ✅ **Use gray-500 ONLY for non-essential metadata** (e.g., "Updated 2 hours ago")

---

## 📐 Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px - Base unit */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

**Common Usage:**
- Component padding: `space-4` (16px)
- Card padding: `space-6` (24px)
- Section spacing: `space-8` (32px)
- Page margins: `space-6` to `space-8`

---

## 🔲 Border & Radius

### Border Widths
```css
--border-thin: 1px;
--border-medium: 2px;
--border-thick: 4px;
```

### Border Radius
```css
--radius-sm: 0.25rem;   /* 4px - Badges, tags */
--radius-md: 0.375rem;  /* 6px - Buttons, inputs (DEFAULT) */
--radius-lg: 0.5rem;    /* 8px - Cards, modals */
--radius-xl: 0.75rem;   /* 12px - Large containers */
--radius-full: 9999px;  /* Fully rounded - Pills, avatars */
```

### Border Colors
```css
--border-light: #e5e7eb;   /* gray-200 - Default borders */
--border-medium: #d1d5db;  /* gray-300 - Emphasized borders */
--border-dark: #9ca3af;    /* gray-400 - Strong borders */
```

---

## 🎯 Component Specifications

### Buttons

#### Primary Button
```css
Background: --primary-600 (#2563eb)
Text: white
Font Weight: --font-semibold (600)
Padding: 0.5rem 1rem (8px 16px)
Border Radius: --radius-md (6px)
Hover: --primary-700
Disabled: Opacity 50%, cursor not-allowed
```

#### Secondary Button
```css
Background: white
Text: --gray-700
Border: 1px solid --gray-300
Font Weight: --font-semibold (600)
Padding: 0.5rem 1rem
Border Radius: --radius-md
Hover: --gray-50 background
```

#### Danger Button
```css
Background: --error-600 (#dc2626)
Text: white
Font Weight: --font-semibold (600)
Padding: 0.5rem 1rem
Border Radius: --radius-md
Hover: --error-700
```

### Input Fields

```css
Background: white
Border: 1px solid --gray-300
Border Radius: --radius-md (6px)
Padding: 0.5rem 0.75rem (8px 12px)
Font Size: --text-sm (14px)
Text Color: --gray-900

Focus State:
  Border: 2px solid --primary-500
  Ring: 0 0 0 3px --primary-100 (subtle glow)
  Outline: none

Disabled State:
  Background: --gray-100
  Cursor: not-allowed
  Opacity: 60%
```

### Cards

```css
Background: white
Border: 1px solid --gray-200
Border Radius: --radius-lg (8px)
Padding: --space-6 (24px)
Shadow: 0 1px 3px rgba(0,0,0,0.1)

Hover State (interactive cards):
  Shadow: 0 4px 6px rgba(0,0,0,0.1)
  Border: --gray-300
  Transform: translateY(-1px)
```

### Tables

```css
Header Background: --gray-50
Header Text: --gray-700, --font-semibold, --text-xs, uppercase
Row Border: 1px solid --gray-200
Row Hover: --gray-50 background
Cell Padding: 0.75rem 1rem (12px 16px)
Cell Text: --gray-900 (data), --gray-700 (labels)
```

### Badges

```css
Padding: 0.25rem 0.75rem (4px 12px)
Font Size: --text-xs (12px)
Font Weight: --font-medium (500)
Border Radius: --radius-full (pill shape)

Success Badge:
  Background: --success-100
  Text: --success-700
  Border: 1px solid --success-200

Warning Badge:
  Background: --warning-100
  Text: --warning-700
  Border: 1px solid --warning-200

Error Badge:
  Background: --error-100
  Text: --error-700
  Border: 1px solid --error-200

Info Badge:
  Background: --info-100
  Text: --info-700
  Border: 1px solid --info-200
```

### Sidebar Navigation

```css
Background: --bg-dark (#0f172a)
Width: 220px
Padding: --space-4

Logo Section:
  Padding: --space-6 --space-4
  Border Bottom: 1px solid rgba(255,255,255,0.1)
  Text: white, --text-xl, --font-bold

Nav Items:
  Padding: 0.75rem 1rem
  Border Radius: --radius-md
  Text: --gray-300
  Font Size: --text-sm
  Font Weight: --font-medium
  
  Hover:
    Background: --bg-dark-hover (#1e293b)
    Text: white
  
  Active:
    Background: --primary-600
    Text: white

User Section (bottom):
  Padding: --space-4
  Border Top: 1px solid rgba(255,255,255,0.1)
  Text: --gray-400, --text-sm
```

---

## 📱 Responsive Breakpoints

```css
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Extra large */
```

**Mobile-First Approach:**
- Design for mobile first
- Progressively enhance for larger screens
- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`

---

## ♿ Accessibility Standards

### Text Contrast
- **Body text minimum**: 4.5:1 contrast ratio (WCAG AA)
- **Large text (18px+)**: 3:1 contrast ratio
- **Interactive elements**: Clear focus states with visible outlines

### Focus States
```css
All interactive elements must have visible focus:
  outline: 2px solid --primary-500
  outline-offset: 2px
```

### Color Usage
- Never rely on color alone to convey information
- Use icons + text + color together
- Ensure sufficient contrast for all text

---

## 🎨 Design Patterns

### Page Layout
```
┌─────────────────────────────────────┐
│ Page Header (bg-white, border-b)   │
│ - Title (text-2xl, font-bold)      │
│ - Breadcrumb/Actions               │
│ Padding: space-6                   │
├─────────────────────────────────────┤
│                                     │
│ Content Area (bg-secondary)        │
│ Padding: space-6                   │
│                                     │
│ ┌──────────────┐ ┌──────────────┐ │
│ │ Card         │ │ Card         │ │
│ │              │ │              │ │
│ └──────────────┘ └──────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Form Layout
- Label above input (--text-sm, --font-medium, --gray-700)
- Help text below input (--text-sm, --gray-500)
- Error messages (--text-sm, --error-600)
- Required fields marked with red asterisk
- Button group aligned right

### Data Display
- Use tables for structured data
- Use cards for grouped information
- Use lists for sequential items
- Add empty states with illustrations/icons

---

## 🚀 Implementation Guidelines

### DO's
✅ Use Tailwind utility classes for consistency  
✅ Follow the color palette strictly  
✅ Use semantic color names (text-primary, not text-gray-900)  
✅ Add hover states to all interactive elements  
✅ Implement loading states for async actions  
✅ Use icons from Lucide React library  
✅ Test on mobile, tablet, and desktop  

### DON'Ts
❌ Don't use arbitrary color values  
❌ Don't use light gray (400-500) for body text  
❌ Don't skip focus states on interactive elements  
❌ Don't use inconsistent spacing  
❌ Don't mix different icon libraries  
❌ Don't create custom components without checking existing UI library  

---

## 📚 Component Library Reference

All components should be built using the UI components in:
```
src/components/ui/index.tsx
```

Available components:
- Button (Primary, Secondary, Danger)
- Input (Text, Email, Password, Number, Date)
- Select (Dropdown)
- Textarea
- Card
- Badge
- Table
- Modal (if needed)
- Alert (if needed)

---

## 🎯 Quick Reference: Text Color Usage

| Element | Color | Tailwind Class | Hex |
|---------|-------|----------------|-----|
| Page Titles | Gray 900 | `text-gray-900` | #111827 |
| Headings | Gray 900 | `text-gray-900` | #111827 |
| Body Text | Gray 700 | `text-gray-700` | #374151 |
| Secondary Text | Gray 600 | `text-gray-600` | #4b5563 |
| Muted/Meta Text | Gray 500 | `text-gray-500` | #6b7280 |
| Placeholders | Gray 400 | `text-gray-400` | #9ca3af |
| Disabled Text | Gray 400 | `text-gray-400` | #9ca3af |
| Table Headers | Gray 700 | `text-gray-700` | #374151 |
| Table Data | Gray 900 | `text-gray-900` | #111827 |

**Default Rule: When in doubt, use `text-gray-700` for readable text!**

---

_Last Updated: April 2026_  
_Version: 1.0.0_

---

## 📊 Table Design (Updated - April 4, 2026)

Based on the new UI requirements, comprehensive table design with all features.

### Table Container
```jsx
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      {/* Content */}
    </table>
  </div>
</div>
```

### Table Header
```jsx
<thead className="bg-gray-50 border-b border-gray-200">
  <tr>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
      Column Name
    </th>
  </tr>
</thead>
```

### Sortable Header
```jsx
<th 
  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
  onClick={() => handleSort('fieldName')}
>
  <div className="flex items-center">
    Column Name
    {sortField !== field && <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />}
    {sortField === field && sortOrder === 'asc' && <ChevronUp className="h-4 w-4 ml-1" />}
    {sortField === field && sortOrder === 'desc' && <ChevronDown className="h-4 w-4 ml-1" />}
  </div>
</th>
```

### Table Body
```jsx
<tbody className="divide-y divide-gray-200">
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-3 text-gray-900">
      Content
    </td>
  </tr>
</tbody>
```

### Column Types

#### Text Column (Left Aligned)
```jsx
<td className="px-4 py-3 text-gray-900">
  {text}
</td>
```

#### Link Column (Event Code, ID)
```jsx
<td className="px-4 py-3">
  <Link href={`/events/${id}`} className="text-blue-600 hover:underline font-medium">
    {eventCode}
  </Link>
</td>
```

#### Number Column (Center Aligned)
```jsx
<td className="px-4 py-3 text-center text-gray-900">
  {number}
</td>
```

#### Amount Column (Right Aligned)
```jsx
<td className="px-4 py-3 text-right text-gray-900">
  ₹{amount.toLocaleString()}
</td>
```

#### Truncated Column
```jsx
<td className="px-4 py-3 text-gray-900 max-w-xs truncate" title={fullText}>
  {text}
</td>
```

#### Badge Column
```jsx
<td className="px-4 py-3 text-center">
  <Badge variant={variant}>
    {status}
  </Badge>
</td>
```

#### Multi-Badge Column (SDG Goals)
```jsx
<td className="px-4 py-3">
  <div className="flex flex-wrap gap-1">
    {goals.map((g, i) => (
      <Badge key={i} variant="secondary" className="text-xs">
        Goal {g.goalNumber}
      </Badge>
    ))}
  </div>
</td>
```

#### Actions Column
```jsx
<td className="px-4 py-3">
  <div className="flex gap-2 justify-center">
    <Button size="sm" variant="outline" className="h-8 px-2">
      <Eye className="h-4 w-4" />
    </Button>
    <Button size="sm" variant="outline" className="h-8 px-2">
      <Edit className="h-4 w-4" />
    </Button>
    <Button size="sm" variant="destructive" className="h-8 px-2">
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</td>
```

---

## 🎯 Stats Cards Layout

### Grid Container
```jsx
<div className="grid grid-cols-7 gap-4">
  {/* Cards */}
</div>
```

### Total Card (Bordered)
```jsx
<Card className="border-2 border-gray-300">
  <div className="p-4">
    <div className="text-3xl font-bold text-gray-900">{count}</div>
    <div className="text-sm text-gray-600">Total</div>
  </div>
</Card>
```

### Status Cards (Left Border)
```jsx
<Card className="border-l-4 border-l-{color}-500">
  <div className="p-4">
    <div className="text-3xl font-bold text-{color}-600">{count}</div>
    <div className="text-sm text-gray-600">Label</div>
  </div>
</Card>
```

### Stats Card Colors
- **Total**: `border-gray-300` (2px all sides)
- **Published/Active**: `border-l-green-500`, `text-green-600`
- **Draft**: `border-l-gray-500`, `text-gray-600`
- **Archived/Expiring**: `border-l-orange-500`, `text-orange-600`
- **Students**: `border-l-blue-500`, `text-blue-600`
- **Faculty**: `border-l-purple-500`, `text-purple-600`
- **External**: `border-l-indigo-500`, `text-indigo-600`

---

## 🔍 Filter Bar

### Layout
```jsx
<div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
  {/* Filter Components */}
</div>
```

### Dropdown Filter
```jsx
<div className="flex items-center gap-2">
  <label className="text-sm font-medium text-gray-700">Label:</label>
  <Select value={value} onChange={handler} className="w-40">
    <option value="">All Options</option>
    {/* Options */}
  </Select>
</div>
```

### Search Input
```jsx
<div className="flex-1 min-w-[300px]">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <Input
      type="text"
      placeholder="Search by..."
      value={search}
      onChange={handler}
      className="pl-10"
    />
  </div>
</div>
```

### Record Count
```jsx
<div className="text-sm text-gray-600">
  <strong>{count}</strong> records
</div>
```

### Clear Filters Button
```jsx
{hasFilters && (
  <Button onClick={clearFilters} variant="outline" size="sm">
    Clear Filters
  </Button>
)}
```

---

## 📄 Pagination

### Layout
```jsx
<div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
  {/* Results Info */}
  <div className="text-sm text-gray-700">
    Showing <strong>{start}</strong> to <strong>{end}</strong> of <strong>{total}</strong> results
  </div>
  
  {/* Page Controls */}
  <div className="flex gap-2">
    <Button
      onClick={prevPage}
      disabled={currentPage === 1}
      variant="outline"
      size="sm"
    >
      <ChevronLeft className="h-4 w-4" />
      Previous
    </Button>
    
    {/* Page Numbers */}
    <div className="flex items-center gap-1">
      {pageNumbers.map(num => (
        <Button
          key={num}
          onClick={() => goToPage(num)}
          variant={currentPage === num ? "default" : "outline"}
          size="sm"
          className="w-8 h-8 p-0"
        >
          {num}
        </Button>
      ))}
    </div>
    
    <Button
      onClick={nextPage}
      disabled={currentPage === totalPages}
      variant="outline"
      size="sm"
    >
      Next
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
</div>
```

### Pagination Logic
- Show maximum 5 page buttons
- Current page always visible
- Show first 5 if at start
- Show last 5 if at end
- Show current ±2 if in middle

---

## 🎨 Badge Variants

### Status Badges
```jsx
{/* Published/Active - Green */}
<Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
  Published
</Badge>

{/* Draft - Gray */}
<Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
  Draft
</Badge>

{/* Expired/Error - Red */}
<Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
  Expired
</Badge>

{/* Expiring/Warning - Orange */}
<Badge variant="warning" className="bg-orange-100 text-orange-800 border-orange-200">
  Expiring
</Badge>
```

### Info Badges (SDG Goals)
```jsx
<Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
  Goal {number}
</Badge>
```

---

## 🔘 Action Buttons

### Primary Action (Upload, Create)
```jsx
<Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
  <Upload className="h-4 w-4" />
  Upload
</Button>
```

### Success Action
```jsx
<Button className="bg-green-600 hover:bg-green-700 text-white">
  <CheckCircle className="h-4 w-4" />
  Approve
</Button>
```

### Secondary Action (Download, Export)
```jsx
<Button variant="outline" className="flex items-center gap-2">
  <Download className="h-4 w-4" />
  Download
</Button>
```

### Icon-Only Button (Small)
```jsx
<Button size="sm" variant="outline" className="h-8 px-2">
  <Eye className="h-4 w-4" />
</Button>
```

### Destructive Action
```jsx
<Button size="sm" variant="destructive" className="h-8 px-2">
  <Trash2 className="h-4 w-4" />
</Button>
```

---

## 📐 Column Widths (Innovation Ecosystem)

| Column | Width | Alignment | Type |
|--------|-------|-----------|------|
| S.No | 40px fixed | Left | Number |
| Event Code | 100px | Left | Link |
| Date | 100px | Left | Date |
| Year | 70px | Left | Number |
| Activity Name | 200px min, flex | Left | Text (truncate) |
| Type | 120px | Left | Text |
| SDG Goals | 120px | Left | Badges |
| Students | 80px | Center | Number |
| Faculty | 80px | Center | Number |
| External | 80px | Center | Number |
| Total | 80px | Center | Number (bold) |
| Location | 150px min | Left | Text (truncate) |
| Hours/Person | 100px | Center | Decimal |
| Total Hours | 100px | Center | Number (bold) |
| Amount Spent | 120px | Right | Currency |
| Beneficiaries | 150px min | Left | Text (truncate) |
| No. of Beneficiaries | 120px | Center | Number |
| Status | 100px | Center | Badge |
| Links | 80px | Center | Icons |
| Actions | 120px | Center | Buttons |

---

## 📱 Responsive Behavior

### Desktop (≥ 1024px)
- Show all columns
- Fixed column widths
- Horizontal scroll if needed

### Tablet (768px - 1023px)
- Hide less critical columns
- Keep essential data visible
- Adjust column widths

### Mobile (< 768px)
- Stack filters vertically
- Card view instead of table
- Show critical info only
- Full-width buttons

---

## ⚡ Performance Optimizations

### Client-Side Features
- **Filtering**: Client-side for <1000 records
- **Sorting**: Client-side with useMemo
- **Pagination**: Client-side slicing
- **Search**: Debounced input (300ms delay)

### Large Datasets (>1000 records)
- Server-side filtering
- Server-side sorting
- Server-side pagination
- Virtual scrolling for tables

---

## 🎨 Data Formatting Standards

### Dates
- Format: `DD.MM.YYYY`
- Example: `23.12.2024`
- Function: `format(date, 'dd.MM.yyyy')`

### Numbers
- Thousands separator: comma
- Example: `1,180`
- Function: `number.toLocaleString()`

### Currency
- Symbol: `₹` (Indian Rupee)
- Format: `₹15,000`
- Function: `₹${amount.toLocaleString()}`

### Decimals
- Hours: 1 decimal place (e.g., `2.5`)
- Amounts: No decimals (whole rupees)
- Percentages: 1-2 decimal places

### Truncation
- Long text: CSS `truncate` class
- Always include `title` attribute with full text
- Max width: Defined per column

