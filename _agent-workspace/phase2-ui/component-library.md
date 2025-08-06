# Instructor Dashboard Component Library

## Overview
Component specifications for the Police Training App instructor dashboard, designed to extend the existing student app component system while adding instructor-specific functionality for data visualization, student management, and administrative workflows.

## Navigation Components

### InstructorNavbar
**Purpose**: Top navigation bar with instructor-specific features and role indicator

#### Visual Design
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Police Training Instructor    🔔 [3] 🎯 Sarah Rodriguez (Instructor)    ≡   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Specifications
- **Height**: 64px (56px content + 8px bottom border)
- **Background**: White with subtle shadow (`--shadow-card-base`)
- **Border Bottom**: 1px solid `--color-border`
- **Typography**: 
  - App title: `--font-size-h3` (20px), `--font-weight-authority` (600)
  - User name: `--font-size-body` (16px), `--font-weight-data` (500)
  - Role indicator: `--font-size-body-sm` (14px), color `--color-instructor-secondary`

#### Components & Interactions
1. **App Title & Logo** (left)
   - Logo icon (24px) + "Police Training Instructor"
   - Click: Navigate to dashboard home

2. **Notification Bell** (right side)
   - Icon: Bell (20px)
   - Badge: Red dot with count for unread alerts
   - Click: Open notification dropdown
   - States: Default, hover (`--color-instructor-hover`), active

3. **Quick Actions** (right side, desktop only)
   - Target icon (20px) for quick assignment creation
   - Plus icon (20px) for adding students
   - Hover: Show tooltip with action description

4. **User Profile Menu** (right edge)
   - Avatar/initials circle (32px) + name + role badge
   - Dropdown: Profile, Settings, Switch to Student View, Logout
   - Role badge: "Instructor" with distinct styling

#### Responsive Behavior
- **Mobile**: Hide quick actions, condense user info to initials only
- **Tablet**: Show partial user name, keep essential quick actions
- **Desktop**: Full layout with all elements visible

#### Implementation Notes
- Z-index: 40 (above page content, below modals)
- Sticky positioning on scroll
- Keyboard navigation support
- ARIA labels for all interactive elements

---

### BottomNavigation (Mobile Adaptation)
**Purpose**: Mobile navigation tabs adapted from student app with instructor-specific icons

#### Tab Configuration
```
┌─────────────────────────────────────────┐
│ [🏠] [👥] [📊] [📋] [⚙️]               │
│ Home Students Analytics Reports Settings │
└─────────────────────────────────────────┘
```

#### Specifications
- **Height**: 59px base + safe area inset
- **Background**: White with top border
- **Icons**: 24px, active state uses `--color-instructor-primary`
- **Labels**: `--font-size-caption` (12px)
- **Badge Support**: Red dots on Home and Students tabs

---

## Student Management Components

### StudentCard
**Purpose**: Compact student overview card for lists and grids

#### Visual Design
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌───┐ Johnson, Michael                    🟢  ████████░░ 85%     │
│ │JM │ Badge #4521 • Traffic Division      Active   [View] [Msg] │
│ └───┘ Enrolled: Jan 15 • Last seen: 2m ago                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Specifications
- **Dimensions**: 
  - Desktop: 300px width, auto height
  - Mobile: Full width, 120px height
- **Padding**: `--space-card-padding` (16px)
- **Background**: White with `--shadow-card-base`
- **Border Radius**: 8px
- **Hover Effect**: Elevate to `--shadow-widget-raised` + scale(1.02)

#### Components
1. **Student Avatar** (left)
   - Size: 48px circle
   - Initials if no photo
   - Background: Generated from name hash
   - Border: 2px solid based on status color

2. **Primary Information**
   - Name: `--font-size-body` (16px), `--font-weight-data` (500)
   - Badge/ID: `--font-size-body-sm` (14px), `--color-instructor-secondary`
   - Department: `--font-size-body-sm` (14px), `--color-text-secondary`

3. **Status Indicator** (top right)
   - Colored dot (8px) with status
   - Colors: `--color-activity-*` based on student state
   - Label: Active, Recent, Idle, Inactive

4. **Progress Bar** (top right)
   - Width: 80px, Height: 6px
   - Background: `--color-progress-bg`
   - Fill: `--color-progress-fill` or status-based color
   - Percentage label: `--font-size-body-sm`

5. **Metadata** (bottom)
   - Enrollment date and last activity
   - Typography: `--font-size-caption` (12px), `--color-text-secondary`

6. **Quick Actions** (bottom right)
   - View Profile: Eye icon button
   - Send Message: Message icon button
   - Button size: 32px, icon 16px
   - Hover: Background color change

#### States
- **Default**: Standard shadow and colors
- **Hover**: Elevated shadow, slight scale increase
- **At Risk**: Amber left border (4px), warning icon
- **Critical**: Red left border (4px), alert icon
- **Selected**: Blue border (2px), checkbox visible

#### Responsive Adaptations
- **Mobile**: Single column layout, actions below metadata
- **Tablet**: Two-column content, actions on right
- **Desktop**: Full horizontal layout

---

## Data Visualization Components

### AnalyticsChart
**Purpose**: Wrapper component for consistent chart styling across dashboard

#### Specifications
- **Container**: 
  - Background: White
  - Border Radius: 8px
  - Shadow: `--shadow-chart-container`
  - Padding: `--space-chart-margin` (16px)

#### Chart Header
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Completion Trends           [30 Days ▼] [📥 Export]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│               Chart Content Area                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Header Components
1. **Chart Icon + Title**
   - Icon: 20px, color `--color-data-primary`
   - Title: `--font-size-chart-title` (16px), `--font-weight-data` (500)

2. **Time Period Selector** (right side)
   - Dropdown: Last 7 Days, 30 Days, 90 Days, 1 Year
   - Style: Minimal border, `--font-size-body-sm`

3. **Export Action** (right edge)
   - Download icon (16px) + "Export" label
   - Click: Export chart data as CSV/PNG
   - Hover: Subtle background highlight

#### Chart Content Area
- **Min Height**: 200px (mobile), 300px (desktop)
- **Responsive**: Maintains aspect ratio across screen sizes
- **Loading State**: Skeleton animation with shimmer effect
- **Empty State**: Illustration + message + action button

#### Footer (optional)
- **Data Source**: "Last updated: 2 minutes ago"
- **Legend**: Horizontal layout with colored dots
- **Typography**: `--font-size-chart-legend` (12px)

#### Integration Notes
- Compatible with Chart.js, Recharts, or similar libraries
- Consistent color palette using design token colors
- Animation duration: `--transition-chart-animation` (500ms)
- Accessibility: Proper ARIA labels and keyboard navigation

---

### StatCard
**Purpose**: Dashboard KPI display cards with trend indicators

#### Visual Design
```
┌─────────────────────────────────────┐
│ Completion Rate                     │
│                                     │
│     85%        ↗ +5%               │
│   Large Value   Trend Indicator    │
│                                     │
│ vs last month                      │
└─────────────────────────────────────┘
```

#### Specifications
- **Dimensions**: 240px × 140px (desktop), full width × 120px (mobile)
- **Background**: White with gradient accent
- **Shadow**: `--shadow-widget-resting`
- **Border Radius**: 8px
- **Padding**: `--space-widget-padding` (24px)

#### Content Structure
1. **Label** (top)
   - Typography: `--font-size-metric-label` (14px)
   - Color: `--color-text-secondary`
   - Position: Top left

2. **Primary Value** (center)
   - Typography: `--font-size-kpi-value` (48px)
   - Font Weight: 700 (bold)
   - Color: `--color-instructor-primary`

3. **Trend Indicator** (center right)
   - Arrow icon: ↗ ↘ → (16px)
   - Value: `--font-size-kpi-trend` (16px)
   - Colors: Green (up), Red (down), Gray (neutral)

4. **Comparison Text** (bottom)
   - Typography: `--font-size-caption` (12px)
   - Color: `--color-text-secondary`
   - Format: "vs last [period]"

#### Variants
- **Primary**: Default styling with blue accent
- **Success**: Green accent for positive metrics
- **Warning**: Amber accent for attention-needed metrics  
- **Danger**: Red accent for critical metrics

#### Interactive States
- **Hover**: Slight elevation increase, cursor pointer
- **Click**: Navigate to detailed view or expand info
- **Loading**: Skeleton animation with pulse effect

---

## Data Display Components

### DataTable
**Purpose**: Sortable, filterable table for student lists and data display

#### Specifications
- **Background**: White
- **Border**: `--border-default` on all sides
- **Border Radius**: 8px
- **Shadow**: `--shadow-card-base`

#### Table Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ [📋 Bulk Actions] [🔍 Search] [⚙️ Columns] [📥 Export]         │
├─────────────────────────────────────────────────────────────────┤
│ □ │ Photo │ Name ↓         │ Status   │ Progress │ Actions      │
├─────────────────────────────────────────────────────────────────┤
│ ☑ │ [JM]  │ Johnson, M.    │ 🟢 Active │ 85% ████ │ [👁] [💬]     │
│ ☑ │ [LC]  │ Chen, L.       │ 🔴 Risk   │ 62% ███  │ [👁] [⚠️]      │
└─────────────────────────────────────────────────────────────────┘
```

#### Header Components
1. **Bulk Actions** (left)
   - Checkbox for select all
   - Action dropdown: Message Selected, Assign Practice, Export
   - Show when ≥1 row selected

2. **Search Bar** (center-left)
   - Placeholder: "Search students..."
   - Icon: Magnifying glass (16px)
   - Real-time filtering

3. **Column Manager** (center-right)
   - Gear icon to show/hide columns
   - Drag to reorder columns
   - Save view preferences

4. **Export Action** (right)
   - Download icon + "Export" label
   - Format options: CSV, PDF, Excel

#### Table Headers
- **Typography**: `--font-size-table-header` (12px), uppercase, `--font-weight-authority`
- **Background**: `--color-surface` (light gray)
- **Padding**: `--space-table-cell` (12px)
- **Sort Indicators**: ↑ ↓ arrows, active sort highlighted
- **Resize**: Draggable column separators

#### Table Rows
- **Height**: 56px (mobile), 48px (desktop)
- **Padding**: `--space-table-cell` (12px)
- **Border**: Bottom border between rows
- **Hover**: Background color change
- **Selection**: Checkbox + row highlight

#### Column Types
1. **Selection**: Checkbox column (40px width)
2. **Avatar**: Student photo/initials (64px width)
3. **Text**: Name, department, etc. (flexible width)
4. **Status**: Colored badge/dot (100px width)
5. **Progress**: Bar + percentage (120px width)
6. **Actions**: Icon buttons (100px width)

#### Responsive Behavior
- **Mobile**: Hide less important columns, card-based fallback
- **Tablet**: Show essential columns, horizontal scroll
- **Desktop**: Full table with all columns visible

#### Accessibility Features
- **Keyboard Navigation**: Tab through headers and rows
- **Screen Reader**: Proper table markup and ARIA labels
- **Sort Announcement**: "Sorted by name, ascending"
- **Row Selection**: Clear indication of selected state

---

## Action Components

### ActionButton
**Purpose**: Consistent button styling for various instructor actions

#### Base Specifications
- **Height**: 44px (touch-friendly minimum)
- **Padding**: `--button-padding` (12px 16px)
- **Border Radius**: 6px
- **Typography**: `--font-size-body` (16px), `--font-weight-data` (500)
- **Transition**: `--transition-hover` (200ms)

#### Primary Variant
```css
background: var(--color-instructor-primary);
color: white;
border: none;
shadow: var(--shadow-button-hover) on hover;
```

#### Secondary Variant
```css
background: transparent;
color: var(--color-instructor-primary);
border: 1px solid var(--color-instructor-primary);
```

#### Danger Variant
```css
background: var(--color-error-500);
color: white;
border: none;
```

#### Icon Button Variant
- **Size**: 40px × 40px
- **Icon**: 20px, centered
- **Border Radius**: 50% (circular) or 6px (rounded)
- **Tooltip**: Show action description on hover

#### Button States
1. **Default**: Base styling per variant
2. **Hover**: Slightly darker background, elevation increase
3. **Active**: Pressed appearance with inset shadow
4. **Disabled**: 50% opacity, no interactions
5. **Loading**: Spinner animation, disabled interactions

#### Bulk Action Variant
- **Width**: Auto-fit content
- **Batch Operations**: "Message 5 Students", "Assign to 12 Students"
- **Confirmation**: Show count and action before execution

---

## Notification Components

### NotificationBadge
**Purpose**: Alert indicators for navigation and cards

#### Specifications
- **Size**: 20px circle (small), 24px circle (medium)
- **Position**: Top-right corner of parent element
- **Background**: `--color-alert-critical` (red)
- **Typography**: `--font-size-caption` (12px), white text, bold
- **Animation**: Gentle pulse effect for new notifications

#### Variants
1. **Dot**: Simple colored circle, no number
2. **Count**: Number display (1-99, then "99+")
3. **Status**: Different colors based on urgency level
   - Critical: Red
   - High: Orange  
   - Medium: Amber
   - Low: Blue

#### Positioning
```css
position: absolute;
top: -4px;
right: -4px;
z-index: 10;
```

#### Accessibility
- **Screen Reader**: "5 new notifications" text
- **High Contrast**: Solid border in high contrast mode

---

### ProgressRing
**Purpose**: Circular progress indicator for completion percentages

#### Visual Design
```
    85%
  ●─────●
 ●       ●
●         ●  Completion
 ●       ●   Progress
  ●─────●
```

#### Specifications
- **Size**: 64px (small), 80px (medium), 120px (large)
- **Stroke Width**: 4px (small), 6px (medium), 8px (large)
- **Background Ring**: `--color-progress-bg` (light gray)
- **Progress Ring**: Color based on percentage:
  - 90-100%: `--color-performance-excellent` (green)
  - 80-89%: `--color-performance-good` (green)
  - 70-79%: `--color-performance-satisfactory` (cyan)
  - 60-69%: `--color-performance-improvement` (amber)
  - <60%: `--color-performance-at-risk` (red)

#### Center Content
- **Percentage**: Large number (24px font)
- **Label**: Small text below percentage (12px)
- **Typography**: `--font-weight-authority` for percentage

#### Animation
- **Load Animation**: Ring fills from 0 to target percentage (1000ms duration)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Update Animation**: Smooth transition between values (500ms)

#### Accessibility
- **ARIA**: Progress role with current value and maximum
- **Screen Reader**: "85 percent complete"

---

## Implementation Guidelines

### Component Hierarchy
1. **Base Components**: Buttons, inputs, cards (reusable primitives)
2. **Composite Components**: StudentCard, StatCard (business logic)
3. **Layout Components**: Grids, navigation (structure)
4. **Page Components**: Dashboard widgets (feature-specific)

### Styling Approach
- **CSS Modules**: Component-scoped styles
- **Design Tokens**: Use CSS custom properties for consistency
- **Responsive**: Mobile-first approach with breakpoint mixins
- **Theme Support**: Prepare for dark mode implementation

### State Management
- **Loading States**: Skeleton animations for all data components
- **Error States**: Clear error messages with recovery actions
- **Empty States**: Helpful illustrations and next steps
- **Success States**: Confirmation messages and visual feedback

### Accessibility Standards
- **WCAG 2.1 AA**: Minimum compliance level
- **Keyboard Navigation**: All components keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: 4.5:1 minimum ratio for text
- **Touch Targets**: 44px minimum for mobile interactions

### Performance Considerations
- **Virtual Scrolling**: For large data tables (100+ rows)
- **Lazy Loading**: Charts and images load on demand
- **Memoization**: Prevent unnecessary re-renders
- **Bundle Splitting**: Separate chunks for different component groups

This component library provides a comprehensive foundation for building the instructor dashboard while maintaining consistency with the existing student app design system and meeting the specific needs of instructors for data visualization and student management.