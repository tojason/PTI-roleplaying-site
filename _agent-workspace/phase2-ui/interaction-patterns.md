# Instructor Dashboard Interaction Patterns

## Overview
Micro-interactions and animation specifications for the Police Training App instructor dashboard, designed to create a professional, authoritative, and efficient user experience while maintaining consistency with the existing student app interaction patterns.

## Card & Widget Interactions

### Card Hover States
**Professional Elevation and Action Reveal**

#### Standard Card Hover
```css
/* Base State */
.instructor-card {
  transform: translateY(0);
  box-shadow: var(--shadow-widget-resting);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover State */
.instructor-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-widget-raised);
  cursor: pointer;
}
```

**Timing**: 300ms ease-out transition
**Movement**: 2px upward translation
**Shadow**: Transition from resting to raised elevation
**Cursor**: Pointer to indicate interactivity

#### Student Card Hover with Quick Actions
**Interaction Flow**:
1. **Base State**: Student card shows essential information only
2. **Hover Enter**: Card elevates and reveals action buttons
3. **Action Button Hover**: Individual button highlights
4. **Hover Exit**: Actions fade out, card returns to base state

**Implementation**:
```css
.student-card {
  position: relative;
  transition: all 250ms ease-out;
}

.student-card:hover {
  transform: translateY(-1px) scale(1.01);
  box-shadow: var(--shadow-interactive);
}

.student-card .quick-actions {
  opacity: 0;
  transform: translateY(8px);
  transition: all 200ms ease-out;
}

.student-card:hover .quick-actions {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 100ms;
}
```

**Quick Action Buttons**:
- **Staggered Appearance**: Each button animates in 50ms after the previous
- **Scale Animation**: Buttons scale from 0.8 to 1.0 on reveal
- **Icon Animation**: Icons gently bounce on appearance

---

## Chart & Data Visualization Animations

### Chart Loading Animations
**Professional Data Reveal Sequences**

#### Bar Chart Animation
**Sequential Bar Growth**:
1. **Initial State**: All bars at 0 height with base styling
2. **Animation Trigger**: On viewport intersection or data load
3. **Sequential Growth**: Bars grow from left to right with 100ms stagger
4. **Easing**: Cubic-bezier(0.4, 0, 0.2, 1) for smooth, professional feel
5. **Duration**: 800ms total duration per bar

```css
.bar-chart-bar {
  height: 0;
  transform-origin: bottom;
  transition: height 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-chart-bar.animate {
  height: var(--data-height);
}

/* Staggered animation classes */
.bar-chart-bar:nth-child(1) { transition-delay: 0ms; }
.bar-chart-bar:nth-child(2) { transition-delay: 100ms; }
.bar-chart-bar:nth-child(3) { transition-delay: 200ms; }
```

#### Line Chart Animation
**Progressive Line Drawing**:
1. **Path Reveal**: SVG path draws from left to right using stroke-dasharray
2. **Point Appearance**: Data points fade in after line segment reaches them
3. **Tooltip Integration**: Hover tooltips with subtle scale animation
4. **Duration**: 1200ms for complete chart animation

#### Pie Chart Animation
**Smooth Segment Growth**:
1. **Clockwise Reveal**: Segments draw clockwise starting from 12 o'clock
2. **Sequential Segments**: Each segment starts after previous reaches 75%
3. **Legend Sync**: Legend items highlight as corresponding segments appear
4. **Interactive**: Hover states with segment separation (2px gap)

#### KPI Counter Animation
**Professional Number Incrementing**:
```javascript
// Smooth counting animation for KPI values
function animateCounter(element, start, end, duration = 1000) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    element.textContent = Math.round(current) + '%';
    
    if (current >= end) {
      element.textContent = end + '%';
      clearInterval(timer);
    }
  }, 16);
}
```

**Timing**: 1000ms duration with 60fps updates
**Easing**: Built-in mathematical easing for smooth counting
**Format Preservation**: Maintains percentage symbols and decimal places

---

## Table & List Interactions

### Table Row Selection
**Professional Multi-Select Experience**

#### Single Row Selection
**Interaction Sequence**:
1. **Hover State**: Row background lightens (`rgba(30, 41, 59, 0.05)`)
2. **Click State**: Immediate visual feedback with subtle scale
3. **Selected State**: Background color change with left border accent
4. **Batch Actions**: Bulk action bar slides down from table header

#### Multi-Row Selection
**Checkbox Interaction**:
```css
.table-row-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-instructor-primary);
  border-radius: 3px;
  position: relative;
  transition: all 200ms ease-out;
}

.table-row-checkbox:checked {
  background: var(--color-instructor-primary);
  border-color: var(--color-instructor-primary);
}

.table-row-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 5px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  animation: checkmark-draw 200ms ease-out;
}

@keyframes checkmark-draw {
  0% { height: 0; }
  100% { height: 10px; }
}
```

**Bulk Action Bar Animation**:
- **Slide Down**: 300ms ease-out from top of table
- **Content Stagger**: Selection count and action buttons fade in sequentially
- **Persistent State**: Remains visible until selection is cleared

#### Table Sorting Animation
**Column Header Interaction**:
1. **Hover**: Sort arrow fades in next to column label
2. **Click**: Loading spinner replaces arrow during data sort
3. **Complete**: New sort arrow with directional indication
4. **Row Reorder**: Smooth position transitions for affected rows (400ms)

---

## Modal & Overlay Interactions

### Modal Transitions
**Professional Modal Presentation**

#### Modal Opening Sequence
```css
.modal-overlay {
  opacity: 0;
  backdrop-filter: blur(0px);
  transition: all 300ms ease-out;
}

.modal-overlay.open {
  opacity: 1;
  backdrop-filter: blur(4px);
}

.modal-content {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 100ms;
}

.modal-content.open {
  transform: scale(1) translateY(0);
  opacity: 1;
}
```

**Sequence Timing**:
1. **Background Fade**: Overlay fades to 50% opacity (300ms)
2. **Backdrop Blur**: Background blurs for focus (300ms, simultaneous)
3. **Modal Scale**: Content scales from 90% to 100% (300ms, 100ms delay)
4. **Content Fade**: Modal content fades in (200ms, 200ms delay)

#### Modal Closing Sequence
**Reverse Animation**:
- **Trigger**: Close button, ESC key, overlay click
- **Sequence**: Reverse of opening with faster timing (200ms total)
- **Focus Management**: Return focus to triggering element

### Assignment Creation Modal
**Multi-Step Form Flow**

#### Step Transitions
```css
.form-step {
  opacity: 0;
  transform: translateX(20px);
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.form-step.active {
  opacity: 1;
  transform: translateX(0);
}

.form-step.previous {
  opacity: 0;
  transform: translateX(-20px);
}
```

**Step Navigation**:
- **Forward**: Current step slides left, next step slides in from right
- **Backward**: Current step slides right, previous step slides in from left
- **Progress Indicator**: Animated progress bar with step completion checkmarks

#### Form Validation Animation
**Real-time Feedback**:
```css
.form-field.error {
  animation: field-shake 300ms ease-out;
  border-color: var(--color-error-500);
}

@keyframes field-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.error-message {
  opacity: 0;
  transform: translateY(-8px);
  animation: error-slide-in 200ms ease-out forwards;
}

@keyframes error-slide-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Navigation & Menu Interactions

### Top Navigation Dropdowns
**Professional Menu System**

#### User Profile Dropdown
**Interaction Flow**:
1. **Trigger Hover**: Subtle highlight on user profile area
2. **Click**: Dropdown slides down with fade-in (200ms)
3. **Menu Items**: Staggered fade-in with 50ms delays
4. **Outside Click**: Fade-out and slide-up dismissal (150ms)

```css
.profile-dropdown {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
  pointer-events: none;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-dropdown.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dropdown-item {
  opacity: 0;
  transform: translateX(-8px);
  transition: all 150ms ease-out;
}

.dropdown-item:nth-child(1) { transition-delay: 0ms; }
.dropdown-item:nth-child(2) { transition-delay: 50ms; }
.dropdown-item:nth-child(3) { transition-delay: 100ms; }
```

#### Notification Dropdown
**Alert-Specific Animations**:
- **Badge Pulse**: New notifications trigger gentle pulse animation
- **Dropdown Content**: Alerts grouped by priority with visual separators
- **Mark as Read**: Smooth opacity transition for dismissed alerts
- **Empty State**: Animated illustration for "no new alerts"

### Mobile Bottom Navigation
**Touch-Optimized Interactions**

#### Tab Switching Animation
```css
.bottom-nav-tab {
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-nav-tab.active {
  color: var(--color-instructor-primary);
  transform: translateY(-2px);
}

.bottom-nav-tab.active .tab-icon {
  transform: scale(1.1);
}

.bottom-nav-tab.active .tab-label {
  font-weight: 600;
}
```

**Badge Animations**:
- **New Badge**: Scale animation from 0 to 1 with bounce
- **Count Update**: Brief scale pulse when count changes
- **Badge Removal**: Fade and scale out when cleared

---

## Loading & State Animations

### Loading Skeletons
**Professional Loading States**

#### Widget Loading Skeleton
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Skeleton Patterns**:
- **Text Lines**: Varying widths (100%, 85%, 70%) for natural appearance
- **Chart Skeletons**: Simplified bar/line representations
- **Card Skeletons**: Matching layout structure of actual content
- **Staggered Loading**: Different skeleton elements complete at different times

#### Data Loading States
**Progressive Enhancement**:
1. **Skeleton Phase**: Structure appears immediately
2. **Content Load**: Real content fades in while skeleton fades out
3. **Interactive Enable**: Hover states and interactions activate
4. **Complete State**: Full functionality restored

### Toast Notifications
**Non-Intrusive Feedback System**

#### Toast Animation Sequence
```css
.toast {
  transform: translateX(100%);
  opacity: 0;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.toast.show {
  transform: translateX(0);
  opacity: 1;
}

.toast.hide {
  transform: translateX(100%);
  opacity: 0;
  transition: all 200ms ease-in;
}
```

**Toast Types & Behaviors**:
- **Success**: Green accent, checkmark icon, 4-second duration
- **Warning**: Amber accent, warning icon, 6-second duration
- **Error**: Red accent, error icon, manual dismissal required
- **Info**: Blue accent, info icon, 5-second duration

**Stacking Behavior**:
- **Multiple Toasts**: Stack vertically with 8px gaps
- **New Toast**: Pushes existing toasts up
- **Auto-dismiss**: Oldest toast dismissed first
- **Hover Pause**: Toast auto-dismiss pauses on hover

---

## Drag-and-Drop Interactions

### Dashboard Widget Customization
**Professional Drag-and-Drop Experience**

#### Widget Drag States
```css
.widget.dragging {
  transform: rotate(2deg) scale(1.05);
  opacity: 0.8;
  z-index: 1000;
  box-shadow: var(--shadow-modal);
  transition: none;
}

.widget-drop-zone {
  background: rgba(59, 130, 246, 0.1);
  border: 2px dashed var(--color-instructor-primary);
  border-radius: 8px;
  transition: all 200ms ease-out;
}

.widget-drop-zone.active {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.02);
}
```

**Drag Feedback**:
- **Visual Lift**: Widget elevates and tilts slightly
- **Drop Zones**: Highlighted areas with dashed borders
- **Ghost Image**: Semi-transparent widget follows cursor
- **Snap Animation**: Widget snaps into place with 300ms ease-out

#### Student Organization (Cohorts/Groups)
**List Reordering**:
- **Drag Handle**: Clear grip indicator (⋮⋮ icon)
- **List Item States**: Dragging, drop target, default
- **Smooth Reorder**: Other items smoothly move to make space
- **Visual Feedback**: Clear indication of drop position

---

## Touch & Gesture Interactions

### Mobile Gesture Support
**Touch-Optimized Interactions**

#### Swipe Gestures
**Student Card Swipe Actions**:
```css
.student-card {
  transform: translateX(0);
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.student-card.swiped-left {
  transform: translateX(-80px);
}

.swipe-actions {
  position: absolute;
  right: 0;
  width: 80px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 200ms ease-out;
}

.swipe-actions.revealed {
  opacity: 1;
  transform: scale(1);
}
```

**Swipe Behaviors**:
- **Left Swipe**: Reveals action buttons (Message, Assign)
- **Right Swipe**: Quick mark as read/complete
- **Threshold**: 30% of card width to trigger action
- **Elastic**: Card bounces back if swipe is insufficient

#### Pull-to-Refresh
**Data Refresh Gesture**:
```css
.pull-to-refresh {
  transform: translateY(var(--pull-distance));
  transition: transform 200ms ease-out;
}

.refresh-indicator {
  opacity: calc(var(--pull-distance) / 60);
  transform: rotate(calc(var(--pull-distance) * 6deg));
}
```

**Refresh States**:
1. **Pull Begin**: Indicator appears at pull threshold (40px)
2. **Pull Active**: Indicator grows and rotates with pull distance
3. **Release**: Spinner animation while data refreshes
4. **Complete**: Success checkmark before returning to normal

### Keyboard Navigation Enhancement
**Accessibility-First Approach**

#### Focus Management
```css
.focus-ring {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  transition: box-shadow 150ms ease-out;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-instructor-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  transition: top 300ms ease-out;
}

.skip-link:focus {
  top: 6px;
}
```

**Keyboard Shortcuts**:
- **Global**: `/` (search), `?` (help), `Escape` (close modal)
- **Navigation**: `Tab`/`Shift+Tab`, arrow keys for grids
- **Actions**: `Enter` (activate), `Space` (select)
- **Data Tables**: `↑↓` (row navigation), `Space` (select row)

---

## Accessibility & Motion Considerations

### Reduced Motion Support
**Respectful Animation Handling**

```css
@media (prefers-reduced-motion: reduce) {
  .instructor-card,
  .modal-content,
  .chart-animation,
  .loading-shimmer {
    animation: none;
    transition: none;
  }
  
  /* Maintain essential feedback */
  .focus-ring,
  .error-shake {
    animation: none;
    transition: color 0s, border-color 0s, box-shadow 0s;
  }
}
```

**Fallback Interactions**:
- **Instant State Changes**: No transition delays
- **Static Feedback**: Color/border changes without animation
- **Essential Motion Only**: Keep accessibility-critical animations

### High Contrast Mode
**Enhanced Visibility**

```css
@media (prefers-contrast: high) {
  .instructor-card:hover {
    border: 2px solid black;
    box-shadow: none;
  }
  
  .focus-ring {
    box-shadow: 0 0 0 3px black;
    outline: 2px solid white;
    outline-offset: 1px;
  }
}
```

---

## Performance Optimization

### Animation Performance Guidelines
**Smooth 60fps Interactions**

#### GPU Acceleration
```css
.hardware-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
}

/* Use transform and opacity for animations */
.optimized-animation {
  transform: translateY(0);
  opacity: 1;
  transition: transform 300ms ease-out, opacity 300ms ease-out;
}
```

#### Debounced Interactions
```javascript
// Debounced search input
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300);

// Throttled scroll handlers
const throttledScroll = throttle(() => {
  updateScrollState();
}, 16); // 60fps
```

**Performance Targets**:
- **Animation Frame Rate**: 60fps for all interactions
- **Interaction Response**: <100ms for immediate feedback
- **Page Transitions**: <300ms for navigation
- **Data Loading**: <200ms for cached data, <2s for network requests

This comprehensive interaction pattern guide ensures the instructor dashboard provides a professional, efficient, and accessible experience while maintaining consistency with the existing student app patterns and meeting the specific needs of law enforcement training instructors.