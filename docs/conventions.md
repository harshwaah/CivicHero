# CivicHero Engineering Handbook & Conventions

This document establishes the official engineering guidelines, architectural patterns, and code conventions for the **CivicHero** platform. It ensures consistency, high readability, and rapid onboarding for both Citizen and Administrator workspaces.

---

## 1. Naming Conventions

### File & Directory Names
*   **Next.js Pages & Routes**: Always use lowercase, kebab-case for routes (e.g. `citizen/issues/[id]/timeline`). Keep the Next.js App Router folders exact (`page.tsx`, `layout.tsx`, `route.ts`).
*   **React Components**: Always use PascalCase for component filenames and exports (e.g. `AISummaryCard.tsx`, `EvidenceCard.tsx`).
*   **Utility & Core Files**: Use camelCase for pure TypeScript helper modules, custom hooks, and mock data collections (e.g. `mockReports.ts`, `designTokens.ts`, `helpers.ts`).

### Code Identifiers
*   **TypeScript Interfaces & Types**: Prefix with capital letter, use PascalCase (e.g. `CivicReport`, `TimelineEvent`, `PresetOption`).
*   **Variables, Constants & State**:
    *   Use camelCase for standard variables and state fields (e.g. `selectedImage`, `activeTab`, `setActiveTab`).
    *   Use SCREAMING_SNAKE_CASE for global static configurations and static lists (e.g. `DESIGN_TOKENS`, `PRESET_OPTIONS`, `CATEGORIES`).

---

## 2. Folder Conventions

Maintain the structured project taxonomy strictly:
```
/
├── app/                      # Next.js App Router (Routing structure, layouts)
│   ├── citizen/              # Citizen Workspace views and portals
│   ├── layout.tsx            # Root HTML entrypoint and global font injections
│   └── page.tsx              # Public Landings & Hero entrypoints
├── components/               # Pure UI components (Extract here if used > 1 time)
│   └── ui/                   # Primitive widgets and third-party UI blocks
├── docs/                     # Technical specifications and guides
│   ├── info.md               # Architecture and functional documentation
│   └── conventions.md        # [THIS FILE] Engineering handbook
├── hooks/                    # Reusable React stateful side-effect hooks
├── lib/                      # Pure data collections, constants, and formatting utilities
└── public/                   # Static vector assets, logos, and illustration placeholders
```

---

## 3. Component Conventions

To ensure components are reusable by both **Citizen** and **Administrator** applications:
1.  **Deconstruct Dependencies**: Components must receive their dynamic properties as props rather than coupling to route params or specific global states where possible.
2.  **Strict Typing**: Every component must explicitly define its property interfaces. Do NOT use `any`.
3.  **Encapsulate State**: Keep local states local (e.g. menu expansions, local interactive toggles). Use callback events for parent communication (e.g. `onTabChange`, `onSelect`).
4.  **No Unnecessary Abstractions**: Do not abstract a component if it is only used once and is highly specific to a single sub-step of a wizard. Extract only if shared or if it exceeds 300 lines of layout spaghetti.

---

## 4. Import Order Standards

Keep imports clean and organized using a standardized group sequence, separated by blank lines:

```typescript
// 1. React & Standard Core Libraries
import React, { useState, useEffect } from 'react';

// 2. Next.js Routing and Utilities
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 3. Third-party Animation & Asset Engines
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle } from 'lucide-react';

// 4. Shared Design Tokens & Component Library
import { DESIGN_TOKENS } from '@/lib/designTokens';
import AISummaryCard from '@/components/AISummaryCard';

// 5. Types, Helpers, and Mock Collections
import { CivicReport } from '@/components/EvidenceCard';
import { getStatusClasses } from '@/lib/helpers';
import { mockReports } from '@/lib/mockReports';
```

---

## 5. Animation Conventions

All custom animations must be hardware-accelerated and feel cohesive.
*   **Framer Motion Version**: Use `motion/react` for import scopes.
*   **Centralized Variants**: Avoid repeating complex inline configuration objects (`transition={{ duration: 0.4 }}`). Import standard variants from `@/lib/animations`:
    *   `ANIMATIONS.pageTransition` for page mount entries.
    *   `ANIMATIONS.modal` for dialog entrances.
    *   `ANIMATIONS.toast` for toast slip-ins.
*   **Accessibility First**: Respect system preferences for reduced motion by checking media queries where applicable.

---

## 6. Styling Conventions

*   **Utility First**: Use **Tailwind CSS** utility classes directly inside components.
*   **Glassmorphic Guidelines**: Use light, clean, semi-transparent layers for floaters and overlays (e.g. `bg-white/85 backdrop-blur-xl border border-slate-100`).
*   **Theme Continuity**: Avoid hardcoded hex colors inside classes. Always use Tailwind theme-mapped semantic aliases or reference the centralized design token values where script-driven styling is necessary.

---

## 7. State Management Conventions

*   **Transient Wizard States**: For workflows like the Incident Reporting wizard, use local state paired with browser history push/replace queries so that back-navigation works.
*   **Form Capture**: Use simple state variables or combined state objects for form elements. Avoid bloated context states unless global state sharing is required.
*   **Local Persistence**: Use standard client-side `localStorage` wrappers for user preferences (e.g. dark themes, saved listings) that need persistence across browser refreshes but do not require cloud hosting.

---

## 8. Documentation Standards

*   Every folder must have a clean readme explaining its architectural bounds.
*   All complex helper functions must include short JSDoc blocks explaining the parameters, return types, and business logic.
*   Code files should be written cleanly with self-explanatory variable names, keeping code comments light, focused on "Why" rather than "What".
