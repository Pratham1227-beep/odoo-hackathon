# WageWise Design System

> **Know Before You Pay.**  
> **Consistent. Modern. Human-Centric.**

WageWise is designed around the principle:

> **Simpler Payroll. Brighter Workplaces.**

## 1. Design Vision

### Our Vision

> “Empower businesses to manage payroll with complete clarity, compliance, and confidence.”

### Design Principles

1. **Simple** — Reduce complexity in payroll and HR workflows.
2. **Clear** — Make financial and employee information easy to scan and understand.
3. **Human-Centric** — Use approachable interfaces, readable typography, and meaningful feedback.
4. **Consistent** — Reuse the same colors, spacing, components, icons, and interaction patterns.
5. **Modern** — Maintain a clean, lightweight interface with subtle rounded surfaces.
6. **Trustworthy** — Use predictable states, accessible feedback, and clear payroll status indicators.

---

# 2. Brand Identity

## Logo & Wordmark

### Full Logo — Horizontal

Use the complete WageWise logo with:

- WageWise wordmark.
- Purple/blue/green brand icon.
- Tagline: **“Know Before You Pay.”**

### Logo Icon Only

Use the brand icon when:

- Space is limited.
- Displaying an app icon.
- Using a collapsed navigation/sidebar.
- Representing the product in compact UI.

### Wordmark

Text-only treatment:

**WageWise**

with the tagline:

**Know Before You Pay.**

### App Icon

Use the WageWise brand mark inside a rounded-square application icon.

## Logo Usage

- Maintain adequate clear space around the logo.
- Do not distort, stretch, rotate, or recolor the logo.
- Prefer the full logo on desktop navigation and branded surfaces.
- Use the icon-only version for compact or collapsed layouts.

---

# 3. Color System

## 3.1 Primary Colors

| Token | Hex | Usage |
|---|---|---|
| Primary | `#6366F1` | Main brand color, buttons, active states |
| Secondary | `#06B6D4` | Highlights, links, secondary actions |
| Accent | `#10B981` | Success, positive charts, completed states |

### Primary — `#6366F1`

Use for:

- Primary buttons
- Active navigation
- Focus indicators
- Important interactive controls
- Brand accents

### Secondary — `#06B6D4`

Use for:

- Secondary actions
- Links
- Supporting highlights
- Informational accents

### Accent — `#10B981`

Use for:

- Positive metrics
- Completed payroll
- Success indicators
- Positive chart values

---

## 3.2 Neutral Colors

| Token | Hex | Usage |
|---|---|---|
| Navy | `#0F172A` | Headings, primary text |
| Gray 600 | `#475569` | Supporting text, secondary text |
| Gray 300 | `#CBD5E1` | Borders, disabled controls |
| Gray 100 | `#F1F5F9` | Backgrounds, subtle surfaces |
| White | `#FFFFFF` | Cards, sections, primary surfaces |

### Recommended Text Hierarchy

- **Primary text:** Navy `#0F172A`
- **Secondary text:** Gray 600 `#475569`
- **Disabled text:** Gray 300 `#CBD5E1`

---

## 3.3 Semantic Colors

| Token | Hex | Meaning |
|---|---|---|
| Success | `#22C55E` | Paid, approved, completed, successful |
| Warning | `#F59E0B` | Pending, expiring, attention required |
| Error | `#EF4444` | Failed, overdue, validation errors |
| Info | `#3B82F6` | Information, updates, neutral notifications |

### Semantic Usage

**Success**
- Paid
- Active
- Approved
- Successful payroll processing
- Positive confirmations

**Warning**
- Pending
- Expiring Soon
- Missing information
- Attention required

**Error**
- Failed payroll
- Overdue payments
- Form validation errors
- Critical failures

**Info**
- System updates
- Informational messages
- General notifications

---

# 4. Typography

## Font Family

**Inter**

Inter is the primary typeface for WageWise because it is modern, highly readable, and suitable for dashboards containing dense financial and employee information.

## Type Scale

| Style | Size | Weight | Usage |
|---|---:|---:|---|
| H1 | 32px | Bold / 700 | Main page headings |
| H2 | 24px | SemiBold / 600 | Section headings |
| H3 | 20px | SemiBold / 600 | Subsection headings |
| H4 | 18px | Medium / 500 | Component headings |
| Body | 16px | Regular / 400 | Main body text |
| Small | 14px | Regular / 400 | Supporting text |
| Caption | 12px | Regular / 400 | Metadata and helper text |

## Font Weights

| Weight | Value | Usage |
|---|---:|---|
| Light | 300 | Large decorative/supporting text |
| Regular | 400 | Body text |
| Medium | 500 | Labels and moderate emphasis |
| SemiBold | 600 | Headings and important labels |
| Bold | 700 | Strong headings and key metrics |

## Typography Rules

- Use **Navy** for primary headings.
- Use **Gray 600** for secondary/supporting text.
- Use sentence case for most UI labels.
- Use bold or semibold sparingly to establish hierarchy.
- Avoid unnecessary all-caps text.
- Keep financial values visually prominent.

---

# 5. Spacing System

WageWise follows an **8px spacing grid**.

| Token | Size |
|---|---:|
| Space 1 | 4px |
| Space 2 | 8px |
| Space 3 | 12px |
| Space 4 | 16px |
| Space 5 | 24px |
| Space 6 | 32px |
| Space 7 | 48px |

## Spacing Guidelines

- Use **4px** for very tight internal spacing.
- Use **8px** for icon-to-label and compact component spacing.
- Use **12px** for related controls.
- Use **16px** for standard component padding.
- Use **24px** for card and section spacing.
- Use **32px** for major layout separation.
- Use **48px** for large page-level spacing.

---

# 6. Border Radius

| Token | Radius | Recommended Usage |
|---|---:|---|
| Radius XS | 4px | Small controls |
| Radius SM | 8px | Inputs, compact controls |
| Radius MD | 12px | Cards, badges |
| Radius LG | 16px | Larger cards and containers |
| Radius XL | 24px | Hero/feature surfaces |

The interface should feel soft and approachable without becoming excessively rounded.

---

# 7. Iconography

## Icon Style

WageWise uses:

- Rounded line icons.
- Approximately **2px stroke**.
- Clean and consistent geometry.
- Simple, recognizable shapes.
- Consistent visual weight.

## Common Icons

The design system includes icon patterns for:

- Home
- Employees / Users
- Calendar
- Clock
- Documents
- Charts
- Settings
- Notifications
- Search
- Filter
- Download
- Add / Plus
- Menu

## Icon Guidelines

- Use icons to reinforce meaning, not replace important labels.
- Keep icon stroke weight consistent.
- Align icons optically with adjacent text.
- Use brand or semantic colors only when the icon communicates state.
- Avoid mixing filled and outlined icon styles within the same control group.

---

# 8. Buttons

## Button Sizes

The design system demonstrates three primary button sizes:

| Size | Usage |
|---|---|
| Large | Primary/high-priority actions |
| Medium | Default action buttons |
| Small | Compact actions and secondary controls |

## Button Variants

### Primary

- Background: Primary `#6366F1`
- Text: White
- Used for the main action on a screen.

Examples:

- Add Employee
- Process Payroll
- Save Changes
- Submit

### Secondary

- Use a lighter or outlined treatment.
- Suitable for secondary actions.

Examples:

- Cancel
- View Details
- Export

### Icon Button

Use when the action is universally recognizable, such as:

- Add
- Search
- Filter
- Download
- More actions

## Button Behavior

Buttons should provide clear visual feedback for:

- Default
- Hover
- Focused
- Pressed
- Disabled
- Loading

Disabled buttons should use reduced contrast and Gray 300 where appropriate.

---

# 9. Cards

Cards are used to group related information into clear, scannable sections.

## Stat Card

Used for key metrics such as:

- Total Employees
- Payroll Amount
- Pending Payroll
- Attendance Summary

Example structure:

```text
[Icon]   118          ↑ 12%
         Total Employees
         vs last month
```

## Simple Card

Used for concise actions or summaries.

Example:

```text
[Calendar Icon]
Payroll Processed
September 2026                         >
```

## Employee Card

Used to summarize an employee.

Recommended content:

- Employee avatar
- Employee name
- Employee ID
- Job title
- Current status
- More-actions menu

Example:

```text
[Ava]  Ayesha Siddiqui        [Active]  ⋮
       EMP001 · Software Engineer
```

---

# 10. Badges & Status

Badges communicate employee, payroll, and workflow states.

## Status Badges

| Status | Semantic Type |
|---|---|
| Active | Success |
| Inactive | Neutral |
| Pending | Warning |
| Paid | Success |
| Failed | Error |
| On Leave | Primary/Accent |
| Probation | Info |
| Expiring Soon | Warning |
| Overdue | Error |

## Badge Guidelines

- Keep badges compact.
- Use short labels.
- Use semantic colors consistently.
- Do not rely on color alone where status is critical.
- Maintain sufficient contrast between badge text and background.

---

# 11. Input Fields

Input fields use a clean bordered surface with rounded corners.

## Input States

### Default

- White background
- Neutral border
- Placeholder text
- Optional leading icon

### Focused

- Primary-colored border
- Clear focus indicator
- Maintain readable label and value

### Error

- Error-colored border
- Error icon where appropriate
- Supporting error message

Example:

```text
Employee Name
[ User Icon  Enter employee name ]

This field is required.
```

### Disabled

- Gray background
- Reduced contrast
- Non-interactive appearance

## Input Guidelines

- Always provide a meaningful label.
- Use placeholders as examples, not as the only label.
- Clearly communicate validation errors.
- Preserve entered values after validation errors where possible.
- Use icons only when they improve comprehension.

---

# 12. Alerts & Notifications

Alerts communicate system feedback and important payroll events.

## Alert Types

### Success

Example:

> Payroll processed successfully!

Use Success `#22C55E`.

### Warning

Example:

> Some data is missing. Please review.

Use Warning `#F59E0B`.

### Error

Example:

> Failed to process payroll. Try again.

Use Error `#EF4444`.

### Info

Example:

> New update available.

Use Info `#3B82F6`.

## Alert Structure

```text
[Status Icon] Message                         [Close]
```

Alerts should be concise, actionable, and easy to dismiss when dismissal is appropriate.

---

# 13. Navigation

## Sidebar — Expanded

The desktop sidebar contains:

- WageWise logo
- Dashboard
- Employees
- Attendance
- Payroll
- Reports
- Settings

The active page should be visually distinct using the Primary color and a subtle active-state background.

## Sidebar — Collapsed

The collapsed navigation displays icons only.

Guidelines:

- Maintain consistent icon alignment.
- Preserve the same navigation order.
- Provide tooltips for unfamiliar icons.
- Keep active-state styling consistent with the expanded sidebar.

## Top Navigation

The top navigation includes:

- Menu / sidebar control
- Search field
- Global search placeholder

Example:

```text
☰   [ Search employees, payroll, reports... ]
```

Search should support fast access to frequently used HR and payroll information.

---

# 14. Tables

Tables are used for employee and payroll records.

## Employee Table

Recommended columns:

| Employee | Department | Basic Salary | Status | Actions |
|---|---|---:|---|---|
| Ayesha Siddiqui | Engineering | ₹40,000 | Active | ⋮ |
| Rohan Mehta | Marketing | ₹35,000 | Active | ⋮ |
| Sneha Kapoor | Design | ₹32,000 | On Leave | ⋮ |
| Arjun Nair | Sales | ₹38,000 | Pending | ⋮ |

## Table Guidelines

- Keep column labels concise.
- Align text consistently.
- Right-align monetary values.
- Use status badges for workflow states.
- Keep row actions in a predictable location.
- Provide adequate row spacing for readability.
- Support responsive behavior for smaller screens.

---

# 15. Charts

## Payroll Trend

The design system uses a clean bar-chart presentation for payroll trends.

Example characteristics:

- Title: **Payroll Trend**
- Time filter: **Last 6 Months**
- Monthly values
- Highlight the current/latest period
- Display important totals or values using a compact data label

## Chart Guidelines

- Use the brand palette consistently.
- Do not overload charts with unnecessary decoration.
- Include labels and units where useful.
- Provide accessible text alternatives or supporting data.
- Use semantic colors when the chart communicates status.

---

# 16. Empty States

Empty states help users understand that no data is currently available.

## Standard Empty State

Recommended structure:

```text
[Illustration]

No data found

Try adjusting your filters or add new records.

[ + Add Employee ]
```

## Empty State Guidelines

- Explain why the area is empty when possible.
- Provide a relevant next action.
- Use a simple, lightweight illustration.
- Avoid making an empty state look like an error unless it actually represents an error.

---

# 17. Illustrations

Illustrations should be:

- Minimal
- Friendly
- Consistent with the WageWise visual language
- Light enough not to compete with primary content
- Suitable for empty, onboarding, and informational states

Illustrations should support the interface rather than become the primary focus.

---

# 18. Dashboard Components

The dashboard should combine the design system components into a clear information hierarchy.

Recommended dashboard sections:

1. Key employee/payroll statistics
2. Payroll processing summary
3. Employee overview
4. Payroll trend chart
5. Notifications
6. Recent or pending actions

## Information Hierarchy

Use:

- Large typography for key metrics.
- Cards for grouped information.
- Badges for status.
- Charts for trends.
- Tables for detailed records.
- Alerts for important system feedback.

---

# 19. Accessibility

WageWise should be usable by people with different visual and interaction needs.

## Accessibility Requirements

- Maintain sufficient text/background contrast.
- Do not communicate critical status through color alone.
- Provide visible keyboard focus states.
- Ensure interactive elements have meaningful accessible labels.
- Use semantic HTML where applicable.
- Provide labels for form controls.
- Ensure icon-only buttons have accessible names.
- Maintain readable font sizes.
- Avoid excessive visual density.

---

# 20. Responsive Design

The design system should adapt across:

- Desktop
- Laptop
- Tablet
- Mobile

## Responsive Principles

### Desktop

- Expanded sidebar
- Multi-column dashboard cards
- Full data tables
- Charts displayed beside supporting content

### Tablet

- Condensed navigation
- Flexible card grids
- Tables may become horizontally scrollable
- Reduced page padding

### Mobile

- Collapsed navigation
- Single-column cards
- Stacked dashboard sections
- Compact tables or card-based record views
- Full-width primary actions

---

# 21. Design Tokens

The following tokens should be used consistently throughout the WageWise product.

## Color Tokens

```css
--color-primary: #6366F1;
--color-secondary: #06B6D4;
--color-accent: #10B981;

--color-navy: #0F172A;
--color-gray-600: #475569;
--color-gray-300: #CBD5E1;
--color-gray-100: #F1F5F9;
--color-white: #FFFFFF;

--color-success: #22C55E;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;
```

## Typography Tokens

```css
--font-family: "Inter", sans-serif;

--font-size-h1: 32px;
--font-size-h2: 24px;
--font-size-h3: 20px;
--font-size-h4: 18px;
--font-size-body: 16px;
--font-size-small: 14px;
--font-size-caption: 12px;

--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

## Spacing Tokens

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
```

## Radius Tokens

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
```

---

# 22. Component State Model

All interactive components should have predictable states.

| State | Purpose |
|---|---|
| Default | Normal interactive state |
| Hover | Pointer interaction feedback |
| Focused | Keyboard/input focus |
| Active/Pressed | Current interaction |
| Disabled | Temporarily unavailable |
| Loading | Operation in progress |
| Success | Operation completed |
| Warning | Attention required |
| Error | Operation failed or invalid |

Consistency between these states is essential across the entire WageWise product.

---

# 23. UI Content Guidelines

## Language

Use language that is:

- Clear
- Direct
- Professional
- Human
- Action-oriented

Prefer:

> **Process Payroll**

over:

> **Execute Payroll Processing Operation**

Prefer:

> **No data found**

over:

> **There are currently no records available for this module.**

## Error Messages

Good error messages should tell the user:

1. What went wrong.
2. What needs attention.
3. What they can do next.

Example:

> **Failed to process payroll. Try again.**

---

# 24. Visual Hierarchy

Every screen should establish a clear hierarchy:

```text
Page Title
    ↓
Primary Action / Key Information
    ↓
Summary Cards
    ↓
Detailed Data
    ↓
Supporting Information
```

Use typography, spacing, cards, and semantic color to guide attention.

---

# 25. Do / Don't

## Do

- Use Inter consistently.
- Follow the 8px spacing grid.
- Reuse established components.
- Use semantic colors consistently.
- Keep payroll information easy to scan.
- Maintain consistent iconography.
- Use clear status badges.
- Provide actionable empty states.
- Keep forms simple and understandable.

## Don't

- Introduce arbitrary colors without a product reason.
- Mix unrelated icon styles.
- Use inconsistent corner radii.
- Overuse gradients or decorative effects.
- Hide important information behind unnecessary interactions.
- Depend only on color to communicate status.
- Use placeholder text as the only form label.
- Create one-off components when an existing pattern is suitable.

---

# 26. Component Inventory

The WageWise design system currently defines the following major UI components:

### Brand

- Full Logo
- Logo Icon
- Wordmark
- App Icon

### Navigation

- Expanded Sidebar
- Collapsed Sidebar
- Top Navigation
- Search

### Data Display

- Stat Card
- Simple Card
- Employee Card
- Table
- Badge
- Chart

### Forms

- Text Input
- Focused Input
- Error Input
- Disabled Input
- Buttons

### Feedback

- Success Alert
- Warning Alert
- Error Alert
- Info Alert
- Empty State

### Supporting UI

- Icons
- Illustrations
- Status Indicators
- Dropdown/Filter Controls

---

# 27. Example Design System Structure

```text
WageWise
│
├── Brand
│   ├── Logo
│   ├── Wordmark
│   └── App Icon
│
├── Foundations
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Radius
│   └── Icons
│
├── Components
│   ├── Buttons
│   ├── Inputs
│   ├── Cards
│   ├── Badges
│   ├── Alerts
│   ├── Tables
│   └── Navigation
│
├── Data Visualization
│   └── Charts
│
└── Patterns
    ├── Dashboard
    ├── Empty States
    ├── Employee Management
    └── Payroll Workflows
```

---

# 28. Final Design Standard

The WageWise interface should always communicate:

> **Simple payroll. Clear information. Confident decisions.**

Every new screen, feature, or component should follow the established:

- **Brand identity**
- **Color palette**
- **Inter typography**
- **8px spacing grid**
- **4–24px radius system**
- **2px rounded icon style**
- **Consistent component states**
- **Accessible interaction patterns**
- **Human-centered language**

**WageWise — Know Before You Pay.**

*Design for People. Built for Simpler Payroll.*
