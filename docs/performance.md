# CivicHero Performance & Optimization Guide

This document covers CivicHero's production-level performance optimizations, the parallelized background upload pipeline, and the cached operational briefing architecture.

---

## 1. Background Image Upload Pipeline

To maximize perceived speed and remove submission blockages, the citizen report submission decouples photo uploads from the final report submittal.

```
[Citizen Selects Photo]
       │
       ├─► (Immediate Background Upload) ──► Firebase Storage (Ref/Bytes)
       │                                        │ (Yields progress & secure URL)
       └─► [Concurrently Fills Form Fields] ────┘
                │
                ▼
       [Single Submit Click] ──► Hits "Analysis" step
                                   ├─► If complete: Uses cached Storage URL instantly (0ms wait)
                                   └─► If in progress: Awaits background promise with friendly progress logs
```

### Key Lifecycle Operations
- **Immediate Capture Upload**: As soon as a citizen takes a photo or selects an image from their device, the image is compressed and the upload begins **immediately** in the background.
- **Concurrent Editing**: While the upload completes, the citizen is free to choose a category, write descriptions, select urgency, and refine location coordinates without interruption.
- **Smart Image Swapping**: If a citizen swaps the image, the active background upload task is explicitly **canceled** (`uploadTaskRef.current.cancel()`), preventing redundant uploads and preserving network bandwidth.
- **Preset Isolation**: Selection of a preset photo completely bypasses background uploads and sets the status to `'complete'` immediately.

---

## 2. Event-Driven AI Quota & Caching Strategy

We strictly optimize API quotas by eliminating redundant or automated AI calls. The Administrator Copilot behaves like a cached operational intelligence service:

| Action | Prior Behavior | Optimized Behavior | Saving |
| :--- | :--- | :--- | :--- |
| **Scrolling Feed** | Periodic API poll | No AI (Firestore query only) | 100% |
| **Opening Issue Details** | AI Summary regenerated | No AI (Reads from Firestore field) | 100% |
| **Admin Dashboard Load** | Auto-generate Briefing | Hits Firestore Cache (Uses Existing Briefing if within TTL) | **100% (No API Calls)** |
| **Issue Status Updates** | Regenerate analytics | No AI (Updates cached brief status ONLY on critical changes) | 100% |
| **Manual Click "Refresh"** | Auto-triggered | Re-runs AI Router with `forceRefresh: true` and updates cache | Controlled |

### Briefing Cache Specifics
- **Configurable TTL**: Cache TTL is configurable via the `COPILOT_TTL_MS` environment variable, defaulting to **15 minutes**.
- **Server Memory Fallback**: If Firebase is not configured (local mockup mode), the server implements a local memory caching variable (`serverMemoryCache`) to ensure the cache works identically in offline sandbox states.
- **Automatic Invalidation Triggers**: The briefing cache is automatically set to `invalidated: true` when:
  - Any new citizen report is successfully created in Firestore.
  - A critical-level issue changes state (e.g. from Reported to In Progress).

---

## 3. Fallback Multi-Model Gateway

The AI Routing engine ensures high availability even during heavy user traffic or rate limiting:

1. **Gemini Flash Lite** (`gemini-3.1-flash-lite`): Fast, lightweight, low-cost baseline model.
2. **Gemini Flash** (`gemini-3.5-flash`): Balanced speed and capabilities.
3. **Gemini Pro** (`gemini-2.5-pro` / `gemini-1.5-pro`): High-tier reasoning fallback.
4. **Nemotron Nano VL** (`nemotron-nano-vl`): Alternative provider.
5. **Mock/Graceful Fallback**: Activates on complete API failure or missing keys.

### Runtime Key Verification
To avoid latency, the AI Router dynamically inspects the key array upon request. If a provider's key is absent (`GEMINI_API_KEY` or `NEMOTRON_API_KEY`), all corresponding models are skipped **without attempting network calls**, preserving speed and preventing long timeouts.

---

## 4. Firestore Query Caching & Security

- **Real-Time Subscriptions**: Real-time snapshot listeners are optimized to query only modified/added records where appropriate, minimizing network costs.
- **Client-Side Skeletons**: Pre-rendered pulse skeletons match the layout density of real issue lists to minimize cumulative layout shift (CLS).
