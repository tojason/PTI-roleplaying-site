# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Police Training App** - A comprehensive, mobile-first training application for law enforcement officers to practice and master essential radio communication skills including 10-codes, phonetic alphabet, and voice protocols.

### Current Status
✅ **Production Ready** - Full-featured application with comprehensive onboarding system

### Key Technologies
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** with custom police training design system
- **Framer Motion** for animations and tutorial system
- **Zustand** for state management with persistence
- **PostgreSQL** with Prisma ORM
- **NextAuth.js** for authentication

## Architecture Overview

### Application Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API routes
│   ├── dashboard/         # Main dashboard
│   ├── practice/          # Training modules
│   ├── login/ & register/ # Authentication
│   └── profile/           # User management
├── components/            # React components
├── hooks/                 # Custom React hooks
├── services/              # Business logic
├── store/                 # Zustand state management
└── types/                 # TypeScript definitions
```

### Key Features Implemented
1. **Interactive Onboarding Tutorial System** (6-step guided experience)
2. **Comprehensive Debugging Tools** (TutorialDebugger, TutorialDemo)
3. **Mobile-Responsive Design** with smart positioning
4. **Voice Recognition System** for pronunciation training
5. **Progress Tracking & Analytics**
6. **Authentication & User Management**

## Interactive Onboarding Tutorial System

### Implementation Details

#### Core Components
- **TutorialOverlay**: Main tutorial orchestration component with Framer Motion animations
- **TutorialTooltip**: Mobile-responsive tooltip with intelligent positioning
- **TutorialDebugger**: Real-time state monitoring and debugging tools
- **TutorialDemo**: Manual testing component for development

#### Technical Architecture
```typescript
// Core Tutorial Types
interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  showPrevious?: boolean;
}

// State Management with Zustand
interface TutorialState {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  hasSeenTutorial: boolean;
}
```

#### Key Services & Hooks
- **useTutorial.ts**: Main tutorial state management hook
- **useLocalStorage.ts**: Browser storage persistence
- **tutorialService.ts**: Positioning logic and viewport calculations
- **tutorialStore.ts**: Zustand store for tutorial state

#### Positioning System
Advanced positioning algorithm that:
- Calculates optimal tooltip placement to avoid screen edges
- Handles mobile viewport constraints
- Adapts to different screen sizes and orientations
- Provides fallback positioning for edge cases

### Tutorial Flow (6 Steps)
1. **Welcome** - Introduction to the app
2. **Practice Modules** - Overview of training options
3. **Quick Practice** - Dashboard shortcuts
4. **Navigation** - Bottom navigation system
5. **User Menu** - Profile and settings access
6. **Completion** - Welcome message and next steps

### Auto-Trigger Logic
```typescript
// Triggers tutorial for first-time users
useEffect(() => {
  const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
  if (!hasSeenTutorial && user) {
    setShowTutorial(true);
  }
}, [user]);
```

## Debugging & Development Tools

### TutorialDebugger Component
Real-time monitoring system with:
- **Live State Display**: Current tutorial step and completion status
- **Browser Storage Inspector**: localStorage and sessionStorage contents
- **Manual Controls**: Step navigation and state reset options
- **Visual Indicators**: Debug overlays and positioning helpers

### TutorialDemo Component
Development testing tool with:
- **Manual Step Navigation**: Previous/Next controls
- **State Reset Functionality**: Quick testing workflows
- **Visual Debugging**: Overlay positioning validation
- **Performance Monitoring**: Animation timing and smoothness

### Debug Console Commands
```javascript
// Reset tutorial state
localStorage.removeItem('hasSeenTutorial');

// Enable debug mode
localStorage.setItem('tutorialDebug', 'true');

// View current tutorial state
console.log(JSON.parse(localStorage.getItem('tutorialState') || '{}'));

// Force tutorial restart
window.location.reload();
```

## Agent Collaboration Methodology

### Multi-Agent Development Approach
This project successfully implemented a systematic multi-agent collaboration pattern:

#### Agent Specializations
- **ux-researcher**: User experience analysis, flow optimization, user journey mapping
- **ui-designer**: Visual design, animations, mobile responsiveness, accessibility
- **frontend-developer**: Implementation, debugging tools, technical architecture

#### Collaboration Workflow
1. **Research Phase**: UX analysis and requirements gathering
2. **Design Phase**: Visual design and interaction patterns
3. **Development Phase**: Implementation and technical solutions
4. **Testing Phase**: Debugging tools and quality assurance
5. **Iteration Phase**: Refinement based on testing results

#### Key Lessons Learned
- **Specialized Expertise**: Each agent contributed unique domain knowledge
- **Systematic Approach**: Structured workflow prevented scope creep
- **Quality Focus**: Emphasis on debugging tools improved development velocity
- **User-Centric Design**: UX research informed technical decisions
- **Iterative Problem Solving**: Complex UI issues resolved through systematic analysis
- **Evidence-Based Debugging**: Real browser inspection guided technical decisions

## UI/UX Solutions Implemented

### Mobile-First Design Challenges Solved
1. **Viewport Constraints**: Smart positioning system that adapts to screen edges
2. **Touch Interactions**: 44px minimum touch targets for accessibility
3. **Animation Performance**: Optimized Framer Motion configs for mobile devices
4. **State Persistence**: localStorage integration for cross-session continuity

### Positioning Algorithm Innovations
```typescript
// Intelligent tooltip positioning
const calculatePosition = (targetRect: DOMRect, tooltipSize: Size) => {
  const viewport = getViewport();
  const position = getOptimalPosition(targetRect, tooltipSize, viewport);
  return applyFallbackPositioning(position, viewport);
};
```

### Mobile Navigation Positioning Solution
Fixed debug element positioning conflicts with bottom navigation:
```typescript
// Final positioning solution for debug elements
<div className="fixed bottom-24 left-4 z-50 sm:bottom-4" style={{ zIndex: 60 }}>
```
- **Mobile**: `bottom-24` (96px) provides clearance above navigation (57-91px total height)
- **Desktop**: `sm:bottom-4` maintains original positioning for larger screens
- **Z-Index**: `zIndex: 60` ensures elements appear above navigation (`z-50`)

### Animation System Design
- **Consistent Timing**: 300-500ms transitions for professional feel
- **Performance Optimized**: Hardware-accelerated transforms
- **Accessibility Aware**: Respects user motion preferences
- **Mobile Optimized**: Reduced complexity for mobile devices

## Technical Decisions & Rationale

### Technology Choices
1. **Framer Motion** chosen over CSS animations for:
   - React integration and component lifecycle awareness
   - Complex animation orchestration capabilities
   - Better performance on mobile devices
   - Accessibility features built-in

2. **Browser localStorage** for tutorial state because:
   - No backend complexity for simple state management
   - Immediate availability without network requests
   - Simple debugging and testing workflows
   - Appropriate for non-critical user preference data

3. **Zustand** for state management due to:
   - Lightweight footprint for mobile performance
   - TypeScript integration without boilerplate
   - Persistent state capabilities with middleware
   - Simple debugging and development experience

### Architecture Patterns Applied
- **Custom Hooks Pattern**: Separated logic from UI components
- **Service Layer Pattern**: Business logic in dedicated services
- **Compound Component Pattern**: Flexible tutorial system composition
- **Provider Pattern**: Global state management with Zustand

## Common Commands & Development Workflow

### Standard Development
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run lint            # Run ESLint
```

### Database Management
```bash
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio GUI
```

### Tutorial System Development
```bash
npm run tutorial:debug   # Enable tutorial debugging mode
npm run tutorial:reset   # Reset tutorial state for testing
```

### Testing & Debugging
```bash
# Enable tutorial debugging in browser
localStorage.setItem('tutorialDebug', 'true');

# Reset tutorial for testing
localStorage.removeItem('hasSeenTutorial');

# View tutorial state
console.log(localStorage.getItem('tutorialState'));
```

## Best Practices Established

### Code Organization
- **Feature-based Structure**: Components organized by domain
- **Type Safety**: Comprehensive TypeScript coverage
- **Separation of Concerns**: Clear boundaries between UI, logic, and state
- **Reusable Components**: DRY principle applied consistently

### Performance Optimizations
- **Lazy Loading**: Dynamic imports for non-critical components
- **Animation Optimization**: Hardware acceleration and reduced complexity
- **Bundle Optimization**: Code splitting and tree shaking
- **Mobile Performance**: Touch event optimization and reduced JavaScript

### Accessibility Standards
- **WCAG Compliance**: Focus management and keyboard navigation
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Motion Preferences**: Respects user's reduced motion settings
- **Touch Accessibility**: Appropriate touch target sizes

## Future Development Considerations

### Scalability Planning
- **Component Library**: Extract reusable tutorial components
- **Internationalization**: Multi-language tutorial content
- **Advanced Analytics**: Tutorial completion and effectiveness metrics
- **A/B Testing**: Different tutorial flows and optimizations

### Technical Debt Management
- **Code Documentation**: Comprehensive inline documentation
- **Testing Coverage**: Unit and integration tests for tutorial system
- **Performance Monitoring**: Real-user metrics and optimization
- **Security Review**: Regular security audits and updates

## Integration Guidelines

### Adding New Tutorial Steps
1. Define step configuration in tutorial service
2. Add corresponding target elements with data attributes
3. Update TypeScript types if needed
4. Test positioning across different viewport sizes
5. Validate accessibility compliance

### Extending Debug Tools
1. Add new monitoring capabilities to TutorialDebugger
2. Extend console commands for specific scenarios
3. Update visual indicators for new features
4. Document debugging workflows

### Collaboration with Future Agents
- Follow established agent specialization patterns
- Use systematic workflow for complex features
- Maintain focus on user experience and mobile performance
- Document technical decisions and rationale

## Troubleshooting & Common Issues

### Tutorial Not Appearing
1. Check browser console for tutorial state logs (🎯 prefix)
2. Verify localStorage: `localStorage.getItem('hasSeenTutorial')`
3. Reset tutorial state: `localStorage.removeItem('hasSeenTutorial')`
4. Enable debug mode: Use TutorialDebugger component

### Debug Elements Not Visible
1. Check z-index conflicts with navigation (should be 60+ for debug elements)
2. Verify mobile positioning: `bottom-24` on mobile, `bottom-4` on desktop
3. Inspect computed styles for positioning conflicts
4. Test on different viewport sizes and devices

### Positioning Issues
1. **Navigation Overlap**: Ensure adequate clearance (96px+ on mobile)
2. **Z-Index Problems**: Debug elements should use `zIndex: 60` minimum
3. **Responsive Breakpoints**: Use `sm:` prefix for desktop overrides
4. **Safe Areas**: Consider device safe area insets for modern mobile devices

### State Management Issues
1. **Tutorial State**: Check Zustand store persistence
2. **localStorage**: Verify browser storage availability and capacity
3. **Component Re-renders**: Monitor tutorial hook dependencies
4. **Memory Leaks**: Check for cleanup in useEffect hooks