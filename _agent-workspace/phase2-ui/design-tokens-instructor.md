# Instructor Dashboard Design Tokens

## Overview
Extended design system for the Police Training App instructor dashboard, building upon the existing student app design system while adding instructor-specific elements for data visualization, authority, and professional administrative interfaces.

## Color Palette Extension

### Instructor-Specific Colors
```css
/* Authority & Status Colors */
--color-instructor-primary: #1e293b;     /* Darker slate for authority */
--color-instructor-secondary: #334155;   /* Medium slate for secondary elements */
--color-instructor-accent: #0f766e;      /* Professional teal for accents */

/* Data Visualization Palette */
--color-data-primary: #0ea5e9;          /* Sky blue for primary data */
--color-data-secondary: #8b5cf6;        /* Violet for secondary data */
--color-data-tertiary: #f59e0b;         /* Amber for tertiary data */
--color-data-quaternary: #10b981;       /* Emerald for quaternary data */
--color-data-neutral: #6b7280;          /* Gray for neutral data */

/* Performance Status Colors (Enhanced) */
--color-status-excellent: #059669;      /* Deep green - 90%+ performance */
--color-status-good: #10b981;           /* Standard green - 80-89% */
--color-status-satisfactory: #0891b2;   /* Cyan - 70-79% */
--color-status-needs-improvement: #f59e0b; /* Amber - 60-69% */
--color-status-at-risk: #dc2626;        /* Red - Below 60% */
--color-status-inactive: #9ca3af;       /* Gray - No activity */

/* Alert & Notification Colors */
--color-alert-critical: #dc2626;        /* Critical issues requiring immediate action */
--color-alert-high: #ea580c;            /* High priority issues */
--color-alert-medium: #f59e0b;          /* Medium priority issues */
--color-alert-low: #0891b2;             /* Low priority notifications */
--color-alert-info: #3b82f6;            /* Informational messages */

/* Interactive States */
--color-instructor-hover: #475569;      /* Hover state for instructor elements */
--color-instructor-active: #0f172a;     /* Active state for instructor elements */
--color-instructor-focus: #2563eb;      /* Focus state maintaining accessibility */
```

### Extended Semantic Colors
```css
/* Chart Background Colors (with transparency) */
--color-chart-bg-primary: rgba(14, 165, 233, 0.1);    /* Sky blue background */
--color-chart-bg-secondary: rgba(139, 92, 246, 0.1);  /* Violet background */
--color-chart-bg-success: rgba(16, 185, 129, 0.1);    /* Success background */
--color-chart-bg-warning: rgba(245, 158, 11, 0.1);    /* Warning background */
--color-chart-bg-error: rgba(239, 68, 68, 0.1);       /* Error background */

/* Gradient Definitions */
--gradient-primary: linear-gradient(135deg, #1e293b 0%, #334155 100%);
--gradient-success: linear-gradient(135deg, #059669 0%, #10b981 100%);
--gradient-warning: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
--gradient-data: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
```

## Typography Scale for Data Interfaces

### Instructor-Specific Typography
```css
/* Executive Summary Typography */
--font-size-metric-value: 2.5rem;       /* 40px - Large metric displays */
--font-size-metric-label: 0.875rem;     /* 14px - Metric labels */
--font-size-kpi-value: 3rem;            /* 48px - Key performance indicators */
--font-size-kpi-trend: 1rem;            /* 16px - Trend indicators */

/* Data Table Typography */
--font-size-table-header: 0.75rem;      /* 12px - Table headers */
--font-size-table-data: 0.875rem;       /* 14px - Table data */
--font-size-table-caption: 0.75rem;     /* 12px - Table captions */

/* Chart & Analytics Typography */
--font-size-chart-title: 1rem;          /* 16px - Chart titles */
--font-size-chart-label: 0.75rem;       /* 12px - Chart labels */
--font-size-chart-value: 0.875rem;      /* 14px - Chart values */
--font-size-chart-legend: 0.75rem;      /* 12px - Chart legends */

/* Authority Typography (for headers and important elements) */
--font-size-instructor-header: 1.5rem;  /* 24px - Instructor page headers */
--font-weight-authority: 600;           /* Semibold for authoritative elements */
--font-weight-data: 500;                /* Medium for data emphasis */
```

### Line Height System for Data Density
```css
/* Compact line heights for data-heavy interfaces */
--line-height-compact: 1.2;            /* Dense data display */
--line-height-data: 1.4;               /* Balanced data readability */
--line-height-comfortable: 1.6;        /* Comfortable reading */
--line-height-spacious: 1.8;           /* Spacious for important content */
```

## Spacing System (8px Base Unit)

### Grid Layout Spacing
```css
/* Dashboard Grid Spacing */
--space-widget-gap: 1.5rem;            /* 24px - Gap between widgets */
--space-widget-padding: 1.5rem;        /* 24px - Internal widget padding */
--space-section-gap: 2rem;             /* 32px - Gap between sections */
--space-page-padding: 2rem;            /* 32px - Page container padding */

/* Component Spacing */
--space-card-padding: 1rem;            /* 16px - Card internal padding */
--space-list-item: 0.75rem;            /* 12px - List item padding */
--space-form-field: 1rem;              /* 16px - Form field spacing */
--space-button-padding: 0.75rem 1rem;  /* 12px/16px - Button padding */

/* Data Display Spacing */
--space-metric-gap: 0.5rem;            /* 8px - Gap between metric value/label */
--space-table-cell: 0.75rem;           /* 12px - Table cell padding */
--space-chart-margin: 1rem;            /* 16px - Chart container margins */
--space-legend-gap: 0.5rem;            /* 8px - Gap between legend items */
```

### Responsive Spacing Modifiers
```css
/* Mobile spacing (reduce by 25%) */
@media (max-width: 767px) {
  --space-widget-gap: 1rem;            /* 16px on mobile */
  --space-widget-padding: 1rem;        /* 16px on mobile */
  --space-page-padding: 1rem;          /* 16px on mobile */
}

/* Large desktop spacing (increase by 25%) */
@media (min-width: 1440px) {
  --space-widget-gap: 2rem;            /* 32px on large screens */
  --space-section-gap: 2.5rem;         /* 40px on large screens */
  --space-page-padding: 3rem;          /* 48px on large screens */
}
```

## Elevation & Shadow System

### Card Hierarchy Shadows
```css
/* Base elevation for cards */
--shadow-card-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

/* Widget elevation levels */
--shadow-widget-resting: 0 1px 3px rgba(30, 41, 59, 0.12), 0 1px 2px rgba(30, 41, 59, 0.08);
--shadow-widget-raised: 0 4px 6px rgba(30, 41, 59, 0.15), 0 2px 4px rgba(30, 41, 59, 0.1);
--shadow-widget-elevated: 0 10px 15px rgba(30, 41, 59, 0.2), 0 4px 6px rgba(30, 41, 59, 0.1);

/* Interactive element shadows */
--shadow-button-hover: 0 4px 8px rgba(30, 41, 59, 0.15);
--shadow-dropdown: 0 10px 15px rgba(30, 41, 59, 0.25), 0 4px 6px rgba(30, 41, 59, 0.1);
--shadow-modal: 0 25px 50px rgba(30, 41, 59, 0.3), 0 10px 20px rgba(30, 41, 59, 0.15);

/* Data visualization shadows */
--shadow-chart-container: 0 2px 4px rgba(30, 41, 59, 0.1);
--shadow-tooltip: 0 4px 8px rgba(30, 41, 59, 0.2), 0 2px 4px rgba(30, 41, 59, 0.1);
```

### Focus & Selection Shadows
```css
/* Accessibility-compliant focus indicators */
--shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.3);
--shadow-focus-instructor: 0 0 0 3px rgba(30, 41, 59, 0.3);
--shadow-selection: inset 0 0 0 2px rgba(14, 165, 233, 0.3);
```

## Status Colors for Student Performance

### Performance Level Colors
```css
/* Performance range colors with accessibility considerations */
--color-performance-excellent: #059669;     /* 90-100% - Dark green */
--color-performance-good: #10b981;          /* 80-89% - Green */
--color-performance-satisfactory: #0891b2;  /* 70-79% - Cyan */
--color-performance-improvement: #f59e0b;    /* 60-69% - Amber */
--color-performance-at-risk: #dc2626;       /* Below 60% - Red */

/* Background variants for performance indicators */
--color-performance-excellent-bg: rgba(5, 150, 105, 0.1);
--color-performance-good-bg: rgba(16, 185, 129, 0.1);
--color-performance-satisfactory-bg: rgba(8, 145, 178, 0.1);
--color-performance-improvement-bg: rgba(245, 158, 11, 0.1);
--color-performance-at-risk-bg: rgba(220, 38, 38, 0.1);
```

### Activity Status Colors
```css
/* Student activity indicators */
--color-activity-active: #10b981;          /* Currently practicing */
--color-activity-recent: #0891b2;          /* Recently active (last 4 hours) */
--color-activity-idle: #f59e0b;            /* Idle (4-24 hours) */
--color-activity-inactive: #6b7280;        /* Inactive (24+ hours) */
--color-activity-offline: #94a3b8;         /* Offline/not enrolled */
```

### Progress Indicators
```css
/* Progress bar colors */
--color-progress-bg: #e5e7eb;             /* Progress bar background */
--color-progress-fill: #3b82f6;           /* Progress bar fill */
--color-progress-complete: #10b981;       /* Completed progress */
--color-progress-overdue: #dc2626;        /* Overdue progress */
```

## Component-Specific Design Tokens

### Button Variants
```css
/* Instructor-specific button styles */
--button-instructor-primary: var(--color-instructor-primary);
--button-instructor-hover: var(--color-instructor-hover);
--button-instructor-active: var(--color-instructor-active);

/* Action button variants */
--button-action-primary: #3b82f6;         /* Primary actions */
--button-action-secondary: #6b7280;       /* Secondary actions */
--button-action-danger: #dc2626;          /* Destructive actions */
--button-action-success: #10b981;         /* Confirmation actions */
```

### Border & Divider Styles
```css
/* Professional border styles */
--border-default: 1px solid #e5e7eb;
--border-emphasis: 1px solid #d1d5db;
--border-strong: 2px solid #9ca3af;
--border-instructor: 1px solid #475569;

/* Divider styles for sections */
--divider-light: 1px solid rgba(229, 231, 235, 0.5);
--divider-medium: 1px solid #e5e7eb;
--divider-strong: 1px solid #d1d5db;
```

### Animation & Transition Tokens
```css
/* Smooth transitions for data updates */
--transition-data-update: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-chart-animation: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
--transition-hover: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
--transition-focus: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

/* Loading animation timing */
--animation-loading-duration: 1.2s;
--animation-pulse-duration: 2s;
--animation-bounce-duration: 0.6s;
```

## Accessibility Enhancements

### High Contrast Mode Support
```css
/* High contrast color alternatives */
@media (prefers-contrast: high) {
  --color-instructor-primary: #000000;
  --color-instructor-secondary: #1a1a1a;
  --color-performance-excellent: #006600;
  --color-performance-at-risk: #cc0000;
  --border-default: 2px solid #000000;
}
```

### Reduced Motion Support
```css
/* Simplified animations for accessibility */
@media (prefers-reduced-motion: reduce) {
  --transition-data-update: none;
  --transition-chart-animation: none;
  --animation-loading-duration: 0.1s;
}
```

## Dark Mode Considerations
```css
/* Dark mode color adjustments for future implementation */
@media (prefers-color-scheme: dark) {
  --color-instructor-primary: #f8fafc;
  --color-instructor-secondary: #e2e8f0;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-border: #374151;
  
  /* Adjust shadows for dark mode */
  --shadow-widget-resting: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-widget-raised: 0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

## Implementation Notes

### CSS Custom Properties Usage
- All tokens defined as CSS custom properties for dynamic theming
- Fallback values provided for older browser support
- Consistent naming convention: `--[category]-[element]-[variant]`

### Responsive Token Strategy
- Base tokens work for all screen sizes
- Mobile-specific overrides reduce spacing by ~25%
- Large screen overrides increase spacing by ~25%
- Typography scales appropriately across breakpoints

### Integration with Existing System
- Extends current design tokens without breaking changes
- Maintains compatibility with student app components
- Uses existing color palette as foundation
- Preserves accessibility standards and improvements

This design token system provides a comprehensive foundation for the instructor dashboard while maintaining consistency with the existing police training app design system.