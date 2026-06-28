# CivicHero Performance & Optimization Guide

This document covers CivicHero's performance optimizations, background upload pipelines, and quota preservation strategies built for production.

---

## 1. Background Image Upload Pipeline

To maximize perceived speed, report submission has a completely parallelized, non-blocking upload flow:

```
[Citizen Selects Photo]
       │
       ├─► (Immediate Background Upload) ──► Firebase Storage
       │                                        │ (Yields progress & secure URL)
       └─► [Concurrently Fills Form Fields] ────┘
               │
               ▼
       [Single Submit Click] ──► Writes Issue document to Firestore with secure URL
```

### Key Performance Benefits
- **Zero Idle Wait Time**: The user never sits behind a blocking spinner. While the user is typing the title or selecting the category, the heavy asset is already being streamed to Cloud Storage.
- **Progressive Feedback**: A fluid micro-progress bar and verification status let the user know the background task is completing natively.
- **Safety Fallback**: If the user submits before the background upload finishes, the submit action pauses gracefully until the active upload resolves.

---

## 2. Event-Driven AI Quota Strategy

We strictly optimize API quotas by eliminating redundant or automated AI calls:

| Action | Prior Behavior | Optimized Behavior | Saving |
| :--- | :--- | :--- | :--- |
| **Scrolling Feed** | Periodic API poll | No AI (Firestore query only) | 100% |
| **Opening Issue Details** | AI Summary regenerated | No AI (Reads from Firestore field) | 100% |
| **Admin Dashboard Load** | Auto-generate Briefing | No AI (Requires explicit click) | 100% |
| **Issue Status Updates** | Regenerate analytics | No AI (Triggered on-demand only) | 100% |

---

## 3. Fallback Multi-Model Gateway

The AI Routing engine ensures high availability even during heavy user traffic or rate limiting:

- **Primary Route**: `gemini-2.5-flash-lite` (extremely cost-efficient and quick).
- **Secondary Route**: `gemini-2.5-flash` (balanced context).
- **Tertiary Route**: `gemini-2.5-pro` (complex reasoning).
- **Edge Routing**: `nemotron-nano-vl`.
- **Mock Generators**: Activates on complete API failures/throttling to return standard structured JSON without breaking client forms.

---

## 4. Firestore Query Caching & Security

- **Real-Time Subscriptions**: Real-time snapshot listeners are optimized to query only modified/added records where appropriate, minimizing network costs.
- **Index Optimization**: Custom indexes are structured for coordinate range searches, query sorting, and status filters.
- **Client-Side Skeletons**: Pre-rendered pulse skeletons match the layout density of real issue lists to minimize cumulative layout shift (CLS).
