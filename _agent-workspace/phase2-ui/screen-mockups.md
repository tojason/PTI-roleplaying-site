# Instructor Dashboard Screen Mockups

## Overview
Detailed high-fidelity design descriptions for all instructor dashboard screens, building upon the existing police training app aesthetic while adding instructor-specific functionality and authority.

## 1. Instructor Authentication Screens

### Instructor Login Page
**Building on existing `/login` page with instructor-specific elements**

#### Visual Design Description
The page maintains the same visual foundation as the student login but with enhanced authority indicators and instructor-specific messaging.

**Header Section**:
- Police badge icon (48px) in navy blue (`--color-instructor-primary`)
- "Police Training System" headline in display typography (36px)
- Subtitle: "Instructor Portal" in instructor secondary color with authority weight
- Professional tagline: "Empowering Excellence in Law Enforcement Training"

**Login Form**:
- Same card-based design (400px width, centered)
- White background with elevated shadow (`--shadow-widget-elevated`)
- Form title: "Instructor Login" with badge icon
- Input fields maintain existing styling but with instructor color scheme
- Additional "Department ID" field for institutional verification
- Instructor role validation hint text

**Enhanced Features**:
- "Switch to Student Portal" link in bottom right
- Department logo upload option for branding
- "Forgot Instructor Credentials?" specialized flow
- Two-factor authentication requirement badge

#### Mobile Adaptations
- Full-width card on mobile with adjusted padding
- Streamlined form with smart input types
- Touch-optimized button sizing (44px minimum height)

---

### Instructor Registration/Signup
**New page extending existing registration flow**

#### Multi-Step Process
**Step 1: Department Verification**
- Department selection dropdown with common departments pre-loaded
- Badge number verification field
- Supervisor contact information
- Institution validation checkbox

**Step 2: Account Creation**  
- Standard name, email, password fields from existing student registration
- Additional fields: Years of experience, certifications, specializations
- Profile photo upload with professional guidelines

**Step 3: Access Level Setup**
- Role selection: Instructor, Senior Instructor, Training Coordinator
- Permission settings based on role
- Student cohort assignment preferences
- Notification preferences setup

**Visual Consistency**:
- Same step indicator design from existing registration
- Progress bar with instructor color scheme
- Professional validation messaging
- Authority-appropriate success confirmation

---

## 2. Dashboard Home Screen

### Desktop Layout (1200px+)
**6-Widget Grid System with Professional Data Display**

#### Top Navigation Bar
- Full InstructorNavbar component (64px height)
- Professional navy background with white text
- Notification bell with alert count badge (red dot)
- User profile dropdown with clear role indication
- Quick action icons for common tasks

#### Main Content Area (3×2 Widget Grid)
**Row 1: Critical Information & Actions**

**Widget 1: Alert Summary (Left)**
- White card with subtle elevation shadow
- Header: "Critical Alerts" with alert icon (red)
- Three-tier alert system:
  - Critical (red): "2 students at risk of failure" with immediate action buttons
  - Warning (amber): "5 assignments overdue" with review links  
  - Info (blue): "8 new student messages" with quick access
- Alert preview cards with student photos and brief descriptions
- "View All Alerts" action button in instructor primary color

**Widget 2: Quick Actions (Center)**
- Professional action hub with authority styling
- Grid layout of primary actions:
  - "Add Student" with plus icon and upload option
  - "Send Message" with broadcast icon and recipient selector
  - "Create Assignment" with clipboard icon and template options
  - "Generate Report" with chart icon and quick templates
- Recent actions history with timestamps
- Keyboard shortcuts displayed on hover

**Widget 3: Active Students (Right)**
- Real-time student activity monitoring
- Horizontal scroll list of currently practicing students
- Each student shown as mini-card:
  - Circular avatar (40px) with status indicator dot
  - Name and current activity
  - Progress bar and time elapsed
  - Quick action buttons (view, message)
- Summary: "24 of 28 students active" with trend indicator
- "View All Students" navigation link

**Row 2: Analytics & Planning**

**Widget 4: Recent Activity (Left)**
- Professional activity feed with clean typography
- Chronological timeline of last 24 hours:
  - Session completions with accuracy scores
  - Achievement unlocks with celebration icons
  - Assignment submissions with quick grading access
  - System events and notifications
- Each activity has timestamp, student info, and context
- Filter options: All Activities, Completions Only, Issues Only
- "View Detailed Feed" expandable section

**Widget 5: Performance Snapshot (Center)**
- Executive dashboard with key metrics
- Four primary KPIs in card layout:
  - Completion Rate: Large percentage with trend arrow
  - Average Accuracy: Performance indicator with color coding
  - Active Students: Current count vs. total enrolled
  - Certification Rate: Success metric with time period
- Mini sparkline charts showing week-over-week trends
- Color-coded performance indicators using instructor palette
- Click-through navigation to detailed analytics

**Widget 6: Upcoming Tasks (Right)**
- Professional task management with priority indicators
- Categorized task list:
  - High Priority: Red indicator, immediate action needed
  - Medium Priority: Amber indicator, due within 48 hours
  - Normal Priority: Blue indicator, general deadlines
- Task types:
  - Report generation deadlines with auto-generate options
  - Student review meetings with calendar integration
  - Assessment grading with quick access links
  - System maintenance notifications
- Calendar integration with meeting scheduling
- "Manage All Tasks" link to full task manager

#### Visual Hierarchy Elements
- **Card Shadows**: Subtle elevation using `--shadow-widget-resting`
- **Typography**: Authority font weights for headers, data font weights for metrics
- **Color Coding**: Consistent status colors throughout all widgets
- **Spacing**: 24px gaps between widgets, 16px internal padding
- **Responsive Grid**: CSS Grid with auto-fit columns

---

### Tablet Layout (768px - 1023px)
**2×3 Widget Adaptation**

#### Layout Adjustments
**Top Row**: Alert Summary (left) + Quick Actions (right)
**Middle Row**: Active Students (full width, horizontal scroll)
**Bottom Row**: Performance Snapshot (left) + Upcoming Tasks (right)

#### Content Adaptations
- Alert Summary: Condensed to show only critical and high priority
- Quick Actions: 2×2 grid of most important actions
- Active Students: Horizontal card scroll with touch interactions
- Performance: 2×2 KPI grid instead of 4×1
- Recent Activity: Integrated into expandable section within other widgets

#### Interaction Enhancements
- Touch-optimized button sizing (44px minimum)
- Swipe gestures for widget navigation
- Pull-to-refresh for data updates
- Collapsible sections to maximize screen usage

---

### Mobile Layout (320px - 767px)
**Single Column Vertical Stack**

#### Priority-Ordered Widget Stack
1. **Alert Summary**: Condensed critical alerts only
2. **Quick Actions**: 2×2 grid of essential actions
3. **Active Students**: Horizontal scroll cards
4. **Performance**: Single KPI focus with swipe between metrics
5. **Recent Activity**: Last 5 activities with expand option
6. **Upcoming Tasks**: Today's tasks only with "View All" link

#### Mobile-Specific Optimizations
- **Card Design**: Full-width cards with rounded corners
- **Touch Targets**: All interactive elements 44px minimum
- **Typography**: Larger font sizes for readability
- **Navigation**: Bottom tab bar integration
- **Gestures**: Swipe between KPIs, pull-to-refresh data
- **Loading States**: Skeleton screens for each widget

#### Bottom Navigation Integration
- Standard 5-tab layout: Home, Students, Analytics, Reports, Settings
- Active state highlighting with instructor color scheme
- Badge indicators for notifications and alerts
- Consistent with student app navigation patterns

---

## 3. Student List Screen

### Desktop Layout with Advanced Search/Filter Sidebar
**Professional data management interface**

#### Left Sidebar (300px width)
**Search & Filter Panel**

**Search Section**:
- Large search input with magnifying glass icon
- Placeholder: "Search by name, badge, department..."
- Real-time filtering with debounced input
- Search suggestions dropdown with recent searches
- Clear search button with results count

**Filter Categories**:
1. **Student Status** (checkbox group)
   - Active (24) - green indicator
   - At Risk (3) - red indicator  
   - Completed (18) - blue indicator
   - Inactive (2) - gray indicator
   - Badge counts update based on current filters

2. **Progress Range** (checkbox group)
   - 90-100% Excellent (12)
   - 70-89% Good (15)
   - 50-69% Needs Improvement (8)
   - <50% Critical (3)
   - Visual progress bars next to each range

3. **Cohort/Class** (checkbox group)
   - Academy 2024-A (current cohort highlighted)
   - Academy 2024-B
   - Refresher Training 2024
   - Advanced Certification 2024

4. **Department** (expandable tree)
   - All Divisions (parent checkbox)
     - Patrol (12 students)
     - Traffic (8 students)
     - Detective (5 students)
     - K-9 Unit (3 students)

**Filter Actions**:
- "Clear All Filters" link
- "Save Current View" button for quick access
- Recently used filter combinations

#### Main Content Area
**Student Data Table**

**Table Header**:
- Bulk selection checkbox with "Select All" functionality
- Search bar integration with live results count
- Sort dropdown: "Sort by Progress ↓" with multiple options
- View options: Table, Grid, Compact views
- Export button with format options (CSV, PDF, Excel)

**Table Structure** (responsive columns):
1. **Selection**: Checkbox column (40px)
2. **Photo**: Student avatar/initials (64px)
3. **Name & Info**: 
   - Student name (primary text, clickable)
   - Badge number (secondary text)
   - Department (tertiary text, color-coded)
4. **Status**: 
   - Colored status indicator (Active, At Risk, etc.)
   - Last activity timestamp
5. **Progress**:
   - Progress bar with percentage
   - Current module indication
6. **Actions**:
   - View profile button (eye icon)
   - Send message button (message icon)
   - Quick assign button (clipboard icon)

**Table Rows** (56px height each):
- Hover state: Background color change, action buttons appear
- Selection state: Blue background tint, checkbox checked
- At-risk highlighting: Amber left border (4px width)
- Critical highlighting: Red left border with alert icon

**Bulk Actions Bar** (appears when students selected):
- Selection count: "5 students selected"
- Action buttons: "Message Selected", "Bulk Assign", "Export Selected"
- Clear selection option

#### Pagination & Controls
- Results summary: "Showing 20 of 47 students"
- Page size selector: 10, 20, 50 per page
- Standard pagination controls with jump-to-page
- Keyboard navigation support (arrow keys, page up/down)

---

### Mobile Layout
**Card-Based Student List with Collapsible Filters**

#### Filter Integration
- **Filter Toggle**: "🗂 Filters" button opens bottom sheet
- **Active Filters**: Chip display above student list
- **Quick Filters**: Horizontal scroll buttons for common filters

#### Student Cards (Mobile)
**Card Design** (full width, 120px height):
```
┌─────────────────────────────────────────────────────┐
│ ┌───┐ Johnson, Michael              🟢 Active       │
│ │JM │ Badge #4521 • Traffic         ████████░░ 85%  │
│ └───┘ Last seen: 2 minutes ago      [View] [Message]│
└─────────────────────────────────────────────────────┘
```

**Card Components**:
- **Avatar**: 48px circle with status ring
- **Primary Info**: Name, badge, department (stacked)
- **Status & Progress**: Right-aligned with clear indicators
- **Actions**: Horizontal button row
- **Swipe Actions**: Left swipe reveals quick actions

#### Infinite Scroll & Performance
- Load 20 students initially
- Infinite scroll for additional students
- Skeleton loading cards during fetch
- Pull-to-refresh for data updates

---

## 4. Individual Student Profile Screen

### Desktop Layout with Comprehensive Tabs
**Professional student analysis interface**

#### Profile Header (Full Width)
**Student Information Bar**:
- **Left Section**:
  - Large student photo/avatar (80px)
  - Name, badge number, department (stacked text)
  - Enrollment date and last activity
  - Current status badge with color coding
- **Right Section**: 
  - Primary action buttons in horizontal row
  - "📨 Send Message", "📋 Create Assignment"  
  - "🎯 Set Goals", "📞 Contact Supervisor"
  - "📝 Add Note", "× Close Profile"

#### Tab Navigation
**5-Tab System** with consistent styling:
- [Overview] [Progress] [Sessions] [Messages] [Notes]
- Active tab: Instructor primary color with underline
- Inactive tabs: Subtle hover states
- Keyboard navigation with arrow keys

#### Overview Tab Content
**4-Section Grid Layout**:

**Top Row (2 columns)**:
1. **Current Status Card** (Left):
   - Large status indicator with color background
   - Key metrics: "85% Course Complete", "On Track for Completion"
   - Alert indicators: "⚠️ 1 Area Needs Attention"
   - Last activity summary with timestamp

2. **Performance Summary Card** (Right):
   - Overall accuracy with trend arrow
   - Time invested counter
   - Session completion ratio
   - Current learning streak with fire emoji

**Bottom Row (2 columns)**:
3. **Recent Activity Feed** (Left):
   - Chronological activity list (last 10 activities)
   - Activity icons with timestamps
   - Session scores and completion status
   - Quick access to session details

4. **Achievements Display** (Right):
   - Grid of unlocked achievements with icons
   - Achievement dates and descriptions
   - Progress toward next achievements
   - Motivation and recognition elements

**Bottom Section (Full Width)**:
5. **Areas for Improvement Panel**:
   - Identified skill gaps with accuracy percentages
   - Common error patterns with examples
   - Recommended practice plans with creation buttons
   - Intervention history and effectiveness

6. **Supervisor Notes Panel**:
   - Historical notes from supervisors and instructors
   - Note timestamps and author information
   - Add new note functionality
   - Private note indicators

#### Progress Tab Content
**Detailed Analytics Display**:

**Module Completion Grid**:
- Visual grid of all training modules
- Color-coded completion status
- Click-through to module details
- Time spent per module tracking

**Performance Trends**:
- Line charts showing accuracy over time
- Module-specific performance breakdowns
- Comparative analysis vs. cohort average
- Improvement trajectory visualization

**Skill Assessment Matrix**:
- Radar chart of different skill areas
- Competency levels with target indicators
- Gap analysis with recommendations
- Historical skill development tracking

#### Sessions Tab Content
**Detailed Session History**:

**Session List Table**:
- Sortable columns: Date, Module, Duration, Score, Status
- Filter options: Date range, module type, score range
- Session detail expandable rows
- Audio playback for voice sessions (where available)

**Session Analytics**:
- Average session length trends
- Peak performance time analysis
- Error pattern identification
- Engagement level indicators

#### Messages Tab Content
**Communication History**:

**Message Thread Interface**:
- Chronological message display
- Instructor vs. student message styling
- Quick reply functionality
- Automated system message integration

**Communication Tools**:
- Send new message with template options
- Schedule future messages
- Message categories: Encouragement, Correction, Information
- Message effectiveness tracking

#### Notes Tab Content
**Instructor Documentation**:

**Note Categories**:
- Observation notes with timestamps
- Intervention plans with progress tracking
- Meeting notes with action items
- Collaboration notes with other instructors

**Note Management**:
- Rich text editing capabilities
- File attachment support
- Private vs. shared note options
- Note templates for common situations

---

### Mobile Layout
**Single-Tab Focus with Bottom Sheet Details**

#### Mobile Header
- Condensed student info (name, status, progress)
- Quick action buttons (message, assign, note)
- Tab navigation as horizontal scroll

#### Tab Content Adaptation
- **Overview**: Prioritized cards in vertical stack
- **Progress**: Single chart focus with swipe navigation
- **Sessions**: Card-based session list with expansion
- **Messages**: Mobile-optimized chat interface
- **Notes**: Simplified note creation and viewing

#### Bottom Sheet Integration
- Detailed information slides up from bottom
- Maintains context of current tab
- Gesture-based dismissal
- Quick switching between students

---

## 5. Analytics Dashboard Screen

### Desktop Layout with Comprehensive Data Visualization
**Executive-level analytics interface**

#### Page Header
- **Title**: "Training Analytics Dashboard"
- **Time Period Selector**: Prominent dropdown (Last 30 Days, 90 Days, 1 Year)
- **Export Options**: "Generate Report", "Export Data", "Schedule Report"
- **Refresh Indicator**: Last updated timestamp with auto-refresh toggle

#### KPI Summary Strip (Top Section)
**5-Card Horizontal Layout**:

1. **Completion Rate Card**:
   - Large percentage display (85%)
   - Trend arrow with change (+5% vs last month)
   - Mini sparkline chart background
   - Green accent for positive performance

2. **Average Accuracy Card**:
   - Percentage with decimal precision (78.3%)
   - Trend indication with color coding
   - Comparison to department benchmark
   - Performance level indicator

3. **Active Students Card**:
   - Current count with total enrolled (24/28)
   - Engagement trend over time period
   - Peak activity time indicator
   - Activity level distribution

4. **Total Training Hours Card**:
   - Cumulative hours with growth rate
   - Hours per student average
   - Efficiency metrics
   - Time allocation breakdown

5. **Certification Rate Card**:
   - Success percentage with pass/fail ratio
   - Time to certification average
   - First-attempt success rate
   - Certification trend analysis

#### Main Analytics Grid (6-Panel Layout)
**2×3 Responsive Grid System**:

**Row 1: Trends & Patterns**
1. **Completion Trends Chart** (Left):
   - Line chart showing monthly completion rates
   - Multiple cohort comparison lines
   - Seasonal pattern identification
   - Forecast projection (dotted line)
   - Interactive hover tooltips with detailed data

2. **Module Performance Breakdown** (Right):
   - Horizontal bar chart of module accuracy rates
   - Color coding: Green (>80%), Amber (60-80%), Red (<60%)
   - Trend indicators for each module
   - Click-through to module-specific analysis
   - Sort options: Performance, Difficulty, Popularity

**Row 2: Engagement & Distribution**
3. **Daily Activity Patterns** (Left):
   - Heatmap showing peak training hours
   - Day-of-week analysis with patterns
   - Session duration averages
   - Drop-off point identification
   - Optimal scheduling recommendations

4. **Performance Distribution** (Right):
   - Histogram of student performance ranges
   - Bell curve overlay with normal distribution
   - Outlier identification (high/low performers)
   - Comparative cohort analysis
   - Individual student positioning

**Row 3: Insights & Predictions**
5. **Risk Assessment Panel** (Left):
   - At-risk student identification algorithm
   - Early warning indicators dashboard
   - Intervention effectiveness tracking
   - Success prediction modeling
   - Recommended action prioritization

6. **Insights & Recommendations** (Right):
   - AI-generated insights with confidence levels
   - Action item prioritization
   - Success factor identification
   - Curriculum optimization suggestions
   - Resource allocation recommendations

#### Interactive Features
**Chart Interactions**:
- Zoom and pan capabilities for time-series data
- Cross-filtering between related charts
- Drill-down from summary to detail views
- Export individual charts as images/data
- Custom date range selection

**Data Filtering**:
- Global filters affecting all charts
- Cohort selection with multi-select
- Department/division filtering
- Performance range sliders
- Time period comparison modes

---

### Mobile Analytics Layout
**Priority-Based Information Hierarchy**

#### Mobile Header
- Condensed title with essential time period selector
- Quick export button for mobile sharing
- Pull-to-refresh for data updates

#### Priority Content Stack
1. **KPI Summary**: Swipeable card carousel
2. **Key Insight**: Single most important finding
3. **Primary Chart**: Mobile-optimized visualization
4. **Quick Stats**: Essential numbers in grid
5. **Action Items**: Top 3 recommendations

#### Mobile Chart Adaptations
- Simplified chart types optimized for small screens
- Touch-friendly interaction patterns
- Horizontal scroll for time-series data
- Tap-to-reveal detailed information
- Voice-over accessibility for chart data

---

## 6. Assignment Creation Modal

### Modal Design Specifications
**Professional Task Creation Interface**

#### Modal Container
- **Size**: 800px width × 600px height (desktop)
- **Background**: White with `--shadow-modal` elevation
- **Overlay**: Semi-transparent dark background (rgba(0,0,0,0.5))
- **Animation**: Fade in background, scale up modal (300ms duration)
- **Position**: Centered viewport with scroll if needed

#### Modal Header
- **Title**: "Create Practice Assignment" with clipboard icon
- **Close Button**: X icon (top-right) with hover state
- **Progress Indicator**: Step indicator if multi-step process

#### Form Content Areas
**3-Column Layout for Desktop**:

**Left Column: Assignment Details**
1. **Assignment Type Selection**:
   - Radio button group with visual icons
   - Options: 10-Codes Quiz, Phonetic Alphabet, Voice Practice, Mixed Review
   - Each option shows estimated completion time

2. **Difficulty Level**:
   - Slider control with labels: Beginner, Intermediate, Advanced, Expert
   - Dynamic content preview based on selection
   - Adaptive difficulty suggestions based on student performance

3. **Content Customization**:
   - Question count selector (10, 20, 50, custom)
   - Time limits toggle with custom time input
   - Practice mode vs. Assessment mode toggle
   - Retry attempts limitation

**Center Column: Student Selection**
4. **Assignment Recipients**:
   - Multi-select student list with search
   - Cohort selection shortcuts
   - "Select All" and filter options
   - Student status indicators (active, at-risk)

5. **Scheduling Options**:
   - Immediate assignment vs. scheduled release
   - Due date picker with time selection
   - Reminder notification settings
   - Late submission policy options

**Right Column: Advanced Settings**
6. **Performance Tracking**:
   - Detailed analytics toggle
   - Intervention trigger thresholds
   - Automatic feedback settings
   - Success criteria definition

7. **Communication Settings**:
   - Automatic encouragement messages
   - Progress notification frequency
   - Supervisor notification options
   - Completion celebration settings

#### Modal Footer
**Action Button Row**:
- **Secondary Actions** (Left): "Save as Template", "Preview Assignment"
- **Primary Actions** (Right): "Cancel", "Create Assignment"
- **Batch Processing**: "Create & Assign to Next Cohort" option

#### Rich Form Inputs
**Professional Form Controls**:
- **Toggle Switches**: iOS-style toggles for boolean options
- **Multi-Select Dropdowns**: Searchable with chip display
- **Date/Time Pickers**: Professional calendar integration
- **Range Sliders**: Visual feedback with value display
- **Rich Text Areas**: Formatted text input for instructions

#### Validation & Feedback
- **Real-time Validation**: Field-level error states
- **Preview Mode**: Show assignment as students will see it
- **Estimate Display**: Completion time and difficulty estimates
- **Conflict Detection**: Schedule conflicts with other assignments

---

### Mobile Modal Adaptation
**Full-Screen Overlay with Step-by-Step Flow**

#### Mobile Flow
1. **Assignment Type**: Full-screen selection with large touch targets
2. **Recipients**: Searchable student list with bulk selection
3. **Settings**: Simplified options with smart defaults
4. **Review**: Summary screen with edit options
5. **Confirmation**: Success message with next steps

#### Mobile Optimizations
- **Touch-Friendly**: 44px minimum touch targets
- **Simplified UI**: Reduce cognitive load with progressive disclosure
- **Smart Defaults**: Intelligent pre-selection based on history
- **Quick Actions**: Common assignment templates as shortcuts

---

## 7. Report Generation Screen

### Desktop Layout
**Comprehensive Report Builder Interface**

#### Left Sidebar: Report Configuration
**Report Type Selection**:
- Weekly Progress Summary (template thumbnail)
- Monthly Performance Report (template thumbnail)
- Individual Student Analysis (template thumbnail)
- Cohort Comparison Report (template thumbnail)
- Custom Report Builder (blank template)

**Configuration Panel**:
1. **Data Sources**:
   - Student selection with multi-select
   - Date range picker with preset options
   - Module/skill area selection
   - Performance metric selection

2. **Report Format**:
   - Executive Summary (high-level overview)
   - Detailed Analysis (comprehensive data)
   - Visual Dashboard (chart-heavy format)
   - Printable Report (printer-optimized)

3. **Delivery Options**:
   - Generate now for immediate download
   - Schedule recurring reports
   - Email distribution list
   - Department portal integration

#### Main Content Area: Report Preview
**Live Preview Window**:
- Real-time preview of report based on selections
- Page navigation for multi-page reports
- Zoom controls for detailed review
- Edit mode for custom modifications

**Chart & Data Placeholders**:
- Dynamic chart generation based on selected data
- Table formatting with professional styling
- Branding integration (department logo, colors)
- Compliance formatting for official use

#### Right Panel: Report Elements
**Drag-and-Drop Components**:
- Key Performance Indicators (KPI cards)
- Charts & Graphs (bar, line, pie, scatter)
- Data Tables (sortable, filterable)
- Text Blocks (executive summary, conclusions)
- Images & Logos (branding elements)

### Mobile Report Generation
**Simplified Template-Based Approach**

#### Template Selection
- Large template cards with preview images
- Tap to select with immediate configuration
- Smart defaults based on user role and history

#### Quick Configuration
- Essential settings only (who, what, when)
- Smart suggestions based on previous reports
- One-tap scheduling for recurring reports

---

## 8. Settings and Profile Screen

### Instructor Profile Management
**Professional Account Management Interface**

#### Profile Header Section
- **Profile Photo**: Large avatar (120px) with upload/change option
- **Basic Information**: Name, title, department with edit buttons
- **Contact Information**: Email, phone, office location
- **Credentials**: Certifications, experience, specializations

#### Settings Categories (Tabbed Interface)

**Account Settings Tab**:
- Personal information editing
- Password change with security requirements
- Two-factor authentication setup
- Account deactivation options

**Notification Preferences Tab**:
- Email notification toggles by category
- Push notification settings for mobile
- Alert threshold customization
- Quiet hours and weekend preferences

**Dashboard Customization Tab**:
- Widget arrangement with drag-and-drop
- Default view preferences
- Data refresh intervals
- Performance metric priorities

**Integration Settings Tab**:
- LMS integration configuration
- Calendar system connection
- Email system integration
- Department portal settings

**Privacy & Security Tab**:
- Data sharing preferences
- Student data access controls
- Report sharing permissions
- Audit log access

#### Department Integration
**Institutional Settings**:
- Department branding upload
- Institutional policies acknowledgment
- Compliance requirement tracking
- Multi-department access management

---

## Design Consistency Elements

### Visual Hierarchy Principles
1. **Authority**: Instructor elements use darker, more authoritative colors
2. **Clarity**: Information density balanced with readability
3. **Efficiency**: Quick access to frequently used functions
4. **Professionalism**: Conservative design appropriate for law enforcement

### Responsive Design Strategy
- **Mobile-First**: Core functionality accessible on all devices
- **Progressive Enhancement**: Advanced features on larger screens
- **Touch-Optimized**: 44px minimum touch targets
- **Keyboard Accessible**: Full keyboard navigation support

### Animation & Interaction Guidelines
- **Subtle**: Professional animations that don't distract
- **Purposeful**: Animations support understanding and workflow
- **Respectful**: Honor user accessibility preferences
- **Consistent**: Standard timing and easing throughout

### Accessibility Compliance
- **WCAG 2.1 AA**: Minimum compliance standard
- **Color Contrast**: 4.5:1 ratio minimum for all text
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Complete functionality without mouse
- **Motion Sensitivity**: Respect for vestibular disorders

This comprehensive screen mockup guide provides detailed specifications for implementing the instructor dashboard while maintaining consistency with the existing student app and meeting the professional needs of law enforcement training instructors.