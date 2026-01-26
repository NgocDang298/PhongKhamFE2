# Task: Improve Patient Dashboard UI

Refactor the existing `PatientDashboard` into a modern, multi-column "Clean Professional" interface with enhanced features.

## 🎨 DESIGN COMMITMENT: Clinical Precision Dashboard

- **Style**: Clean Professional (Medical/Sharp)
- **Geometry**: Sharp edges (2-4px radius) for a technical/precise feel.
- **Topological Choice**: Asymmetric 70/30 grid layout (Main Content / Sidebar Summary).
- **Risk Factor**: Breaking from a flat list to a structured data dashboard with multiple widgets.
- **Cliché Liquidation**: Removed the basic statistics list and replaced it with a personalized welcome area and health widgets.

## Features to Implement
1. **Dynamic Welcome Header**: Personalized morning/afternoon/evening greeting.
2. **Quick Actions Hub**: Grid of most used functions (Book, History, Profile).
3. **Daily Health Tips Area**: Informational card with a rotation of generic health suggestions.
4. **Interactive Side Summary**: 
   - Mini Calendar overview (static for now).
   - "Next Appointment" spotlight card.
5. **System Notifications**: Placeholder for doctor messages or system alerts.

## Technical Plan
1. **Layout Update**: Use a grid/flex layout with `flex-col lg:flex-row` to achieve the multi-column design.
2. **Component Extraction**: Extract sub-components for cleaner `page.tsx` code.
3. **Animations**: Add subtle staggered reveals using Tailwind transitions.

## Verification Criteria
- [ ] UI reflects "Clean Professional" style.
- [ ] Responsive behavior (stacks on mobile, side-by-side on desktop).
- [ ] All new sections (Health Tips, Quick Actions) are functional or visually ready.
- [ ] No purple used (sticking to Primary/Indigo/Gray/White).
