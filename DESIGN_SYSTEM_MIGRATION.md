# Design System Migration - Sairam Consistency Update

## Date: 2024-04-05

## Overview
Applied the **Sairam Design System** from eMou Vault to Event Tracker to ensure consistency across all Sairam Institution projects.

---

## Changes Applied

### 1. Typography - Gabarito Font Family ✅

**Font Integration:**
```css
@import url('https://fonts.googleapis.com/css2?family=Gabarito:wght@400;500;600;700&display=swap');
```

**Font Stack:**
```css
font-family: 'Gabarito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Font Specifications:**
- **Primary Font**: Gabarito (Google Fonts)
- **Weights**: 400, 500, 600, 700
- **Base Font Size**: 13px (was 16px)
- **Line Height**: 1.4 (was 1.5)

---

### 2. Color System Update ✅

**Background Colors:**
```css
--background: #f8f9fa          /* Page background (was #ffffff) */
--foreground: #1f2937          /* Primary text (was #111827) */
--header-bg: #f3f4f6          /* Table headers */
--row-hover: #f9fafb          /* Table row hover */
```

**Primary Grays:**
```css
--primary-gray-900: #1f2937   /* Buttons, headings, badges */
--primary-gray-600: #4b5563   /* Secondary text */
--primary-gray-500: #6b7280   /* Disabled text */
--primary-gray-400: #9ca3af   /* Tertiary text */
```

**Button Colors:**
```css
--btn-primary-bg: #1f2937     /* Primary button (was #3b82f6) */
--btn-primary-hover: #111827
--btn-secondary-bg: #ffffff
--btn-secondary-border: #d1d5db
```

**Semantic Colors:**
```css
--success: #10b981            /* emerald-500 (was #22c55e) */
--error: #ef4444              /* red-500 (unchanged) */
--warning: #f59e0b            /* amber-500 (unchanged) */
--info: #3b82f6               /* blue-500 (unchanged) */
```

---

### 3. Sidebar Design ✅

**Background Color:**
- Changed from: `bg-slate-900` (#0f172a)
- Changed to: `#1f2937` (primary gray)

**Border Colors:**
- Changed from: `border-slate-700`
- Changed to: `#374151`

**Text Colors:**
- Primary labels: `#d1d5db`
- Secondary text: `#9ca3af`
- Active state: `#2563eb` (blue-600)
- Hover state: `#374151` background

**Toggle Button:**
- Background: `#1f2937`
- Hover: `#111827`
- Border: `#000000` (2px)

**Navigation States:**
- **Default**: Transparent background, `#d1d5db` text
- **Hover**: `#374151` background, white text
- **Active**: `#2563eb` background, white text

**Submenu:**
- Default: `#9ca3af` text
- Active: `#2563eb` background, white text, weight 500
- Hover: `#374151` background, white text

---

### 4. Button Styles ✅

**Standard Button (.btn):**
```css
padding: 6px 14px;           /* Compact (was 8px 16px) */
font-size: 13px;             /* Smaller (was 14px) */
font-weight: 500;
border-radius: 4px;
transition: all 0.15s ease;
```

**Button Variants:**
- **Primary**: `#1f2937` background, hover `#111827`
- **Secondary**: White background, `#d1d5db` border, hover `#f9fafb`
- **Danger**: Red-600
- **Warning**: Orange-600
- **Info**: Blue-600

---

### 5. Form Elements ✅

**Input/Select/Textarea:**
```css
font-size: 13px;             /* Smaller (was 14px) */
padding: 6px 10px;           /* Compact (was 8px 12px) */
border-radius: 4px;
border: 1px solid #d1d5db;
```

**Focus State:**
```css
border-color: #2563eb;       /* blue-600 */
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
```

**Disabled State:**
```css
background: #f3f4f6;
color: #6b7280;
```

---

### 6. Table Styles ✅

**Table Class: `.sheet-table`**
```css
font-size: 13px;
background: white;
```

**Headers (th):**
```css
background: #f3f4f6;
font-weight: 600;
font-size: 12px;              /* Small headers */
text-transform: uppercase;
letter-spacing: 0.025em;
color: #4b5563;
padding: 6px 10px;           /* Compact */
border: 1px solid #d1d5db;
position: sticky;
top: 0;
z-index: 10;
```

**Cells (td):**
```css
padding: 6px 10px;           /* Compact */
border: 1px solid #d1d5db;
```

**Row States:**
```css
hover: #f9fafb;              /* Subtle hover */
even: #fafbfc;               /* Alternate rows */
```

---

### 7. Custom Scrollbar ✅

**Webkit Scrollbar:**
```css
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #f3f4f6;
}

::-webkit-scrollbar-thumb {
  background-color: #000000;  /* Black thumb */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #1f2937;
}
```

---

### 8. Spacing & Layout ✅

**Border Radius:**
- Buttons: `4px`
- Inputs: `4px`
- Cards: `8px`
- Panels: `8px`
- Badges: `9999px` (pill)

**Transitions:**
- Fast: `0.15s` (hover states)
- Standard: `0.3s` (state changes)

---

### 9. Animations ✅

**Keyframes Added:**
```css
@keyframes slide-in {
  from: translateX(100%), opacity: 0
  to: translateX(0), opacity: 1
}

@keyframes scale-in {
  from: scale(0.9), opacity: 0
  to: scale(1), opacity: 1
}

@keyframes dropdownIn {
  from: opacity: 0, translateY(-4px) scale(0.98)
  to: opacity: 1, translateY(0) scale(1)
}
```

**Animation Classes:**
- `.animate-slide-in`: 0.3s ease-out
- `.animate-scale-in`: 0.2s ease-out
- `.animate-dropdown-in`: 0.15s ease-out

---

### 10. Card & Panel Styles ✅

**Dashboard Panel:**
```css
.dashboard-panel {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 24px;
}
```

**Panel Title:**
```css
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}
```

**Stat Card:**
```css
.stat-card {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 20px;
}
```

---

## Files Modified

### 1. `/src/app/globals.css` ✅
- **Complete rewrite** with Sairam Design System
- Added Gabarito font import
- Updated all CSS variables
- Added button, form, table classes
- Added custom scrollbar styling
- Added animation keyframes
- Added component utility classes

### 2. `/src/components/shared/Layout.tsx` ✅
- Updated sidebar background from slate-900 to `#1f2937`
- Updated border colors to `#374151`
- Updated text colors to design system grays
- Updated hover states with inline styles
- Updated active states to `#2563eb`
- Updated mobile button styling
- Updated main layout background to `#f8f9fa`

### 3. `/DESIGN.md` ✅
- **Replaced** with complete Sairam eMou Vault design system
- Updated title to "Sairam Event Tracker"
- Contains full design documentation
- Typography, colors, spacing, components, patterns

### 4. `/DESIGN_OLD.md` ✅
- **Created** as backup of original design documentation

---

## Design Tokens Reference

### Typography Sizes
| Size | Usage | Weight |
|------|-------|--------|
| 11px | Mini stat labels, small captions | 500, 400 |
| 12px | Table headers, compact titles | 600, 500 |
| 13px | Body text, inputs, table cells, buttons | 400, 500 |
| 14px | Panel titles | 600 |
| 24px | Mini stat values | 700 |
| 32px | Stat card values | 700 |

### Color Palette
| Type | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary Gray | Dark | #1f2937 | Buttons, headings, sidebar |
| Primary Gray | Medium | #4b5563 | Secondary text, headers |
| Primary Gray | Light | #6b7280 | Disabled, labels |
| Background | Page | #f8f9fa | Main background |
| Background | Card | #ffffff | Component backgrounds |
| Background | Header | #f3f4f6 | Table headers |
| Border | Default | #d1d5db | All borders |
| Success | Emerald | #10b981 | Success states |
| Error | Red | #ef4444 | Error states |
| Warning | Amber | #f59e0b | Warning states |
| Info | Blue | #3b82f6 | Info states |

### Spacing
| Component | Padding | Font Size |
|-----------|---------|-----------|
| Button Standard | 6px 14px | 13px |
| Button Compact | 3px 8px | 12px |
| Form Input | 6px 10px | 13px |
| Table Cell | 6px 10px | 13px |
| Table Header | 6px 10px | 12px |
| Panel | 24px | - |

---

## Testing Checklist

### Visual Consistency
- [x] Gabarito font loads correctly
- [x] Font size 13px applied globally
- [x] Sidebar uses #1f2937 background
- [x] Sidebar hover states use #374151
- [x] Active nav items use #2563eb
- [x] Page background is #f8f9fa
- [x] Buttons use correct sizing (6px 14px)
- [x] Tables use 13px font size
- [x] Table headers are 12px uppercase
- [x] Custom scrollbar visible (black thumb)

### Interactive States
- [x] Button hover transitions work
- [x] Input focus shows blue border + ring
- [x] Sidebar nav hover works
- [x] Sidebar toggle animates smoothly
- [x] Table row hover shows #f9fafb
- [x] Links have proper hover states

### Layout & Spacing
- [x] Sidebar width (20px/64px) correct
- [x] Main content margin adjusts
- [x] Button padding consistent
- [x] Form inputs aligned
- [x] Table cells padded correctly
- [x] Cards have 8px border radius

---

## Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (Gabarito font from Google Fonts)
- ✅ Mobile browsers

---

## Migration Benefits

### Consistency
- All Sairam projects now use same design language
- Users experience familiar UI across applications
- Easier maintenance with shared design tokens

### Professional Appearance
- Gabarito font provides modern, clean look
- Consistent spacing creates visual harmony
- Professional color palette (grays instead of blue)

### Developer Experience
- Clear CSS variable naming
- Reusable component classes
- Well-documented design system
- Easy to extend and customize

### Performance
- Single Google Fonts request (Gabarito)
- Optimized font weights (4 weights)
- Minimal CSS with variables
- Fast transitions (0.15s)

---

## Next Steps

### Recommended
1. Update remaining components to use new button classes
2. Apply `.sheet-table` class to all data tables
3. Use dashboard-panel and stat-card classes consistently
4. Replace inline Tailwind classes with design system classes where appropriate

### Optional Enhancements
1. Create React component wrappers for common patterns
2. Add TypeScript types for design tokens
3. Create Storybook for component library
4. Add dark mode support using CSS variables

---

## Documentation

All design specifications documented in:
- **DESIGN.md** - Complete design system reference
- **DESIGN_OLD.md** - Original design (backup)
- **globals.css** - All CSS variables and component classes

## References

- Sairam eMou Vault design system (source)
- Gabarito Font: https://fonts.google.com/specimen/Gabarito
- Tailwind CSS utilities (complementary)
