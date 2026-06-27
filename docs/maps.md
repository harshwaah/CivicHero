# CivicHero Google Maps Platform (GMP) System Manual

This document details the first-class Google Maps Platform (GMP) integration within the **CivicHero** application. It serves as a technical blueprint for the shared mapping architecture, performance paradigms, marker customization, operational heatmap overlay, and geographic extension APIs.

---

## 1. System Architecture

The maps system leverages a highly modular, decoupled architecture where presentation, coordinate tracking, and platform services are strictly separated. 

```
[UI Views: Citizen / Admin]
       │
       ▼
[Polymorphic <CivicMap> Component]
       │
       ├─► [MapProvider Context] ──► [Process Env Key Setup]
       │
       ├─► [ClusteredMarkers (MarkerClusterer API)]
       │
       └─► [DeckGlOverlay (deck.gl HeatmapLayer via GoogleMapsOverlay)]
```

### 1.1 `MapProvider` (`lib/providers/maps/mapProvider.tsx`)
- **Key Bootstrapping**: Securely loads the Google Maps Platform API key server-side or from client environment declarations (`GOOGLE_MAPS_PLATFORM_KEY`), exposing it safely within the `<APIProvider>` boundary.
- **Style Management**: Provides global state controllers for swapping map styles (`streets` / `roadmap`, `satellite` / `hybrid`, `terrain`).
- **Polymorphic `<CivicMap>` Wrapper**: Unifies the mapping canvas, ensuring the same core component compiles cleanly and runs in both the Citizen app and the Administrative Mission Control.

---

## 2. Shared Map Components

To prevent code duplication, CivicHero isolates all Google Maps references to reusable abstractions.

### 2.1 `<CivicMap>`
- **Polymorphic Nature**: Configurable for standard citizen interactions (viewing local feeds, clicking pins to inspect detail) and administrative operations (analyzing clusters, monitoring active dispatches).
- **Interactive Gestures**: Handles `interactive` constraints, disabling default controls, pan gestures, and zoom menus for lightweight read-only cards, while enabling full operation for Mission Control.
- **Locate Me (`LocateMeControl`)**: Interacts directly with the HTML5 Geolocation API, calling `map.panTo()` with user-consented coordinates to zoom instantly into nearby issues.
- **Custom Controls**: Elegantly styles overlay panels such as map style toggle widgets directly onto the canvas margins using absolute CSS bindings.

---

## 3. Marker and Clustering System

### 3.1 Visual Pin Theme
To maintain a high-fidelity aesthetic, CivicHero bypasses default Google Pins in favor of `<Pin>` vectors styled dynamically to match our urgency levels:
- **Resolved**: `#10b981` (Emerald Green)
- **Critical**: `#ef4444` (High-Alert Red)
- **High**: `#f97316` (Operational Orange)
- **Medium**: `#f59e0b` (Amber Yellow)
- **Low**: `#3b82f6` (Civic Blue)

### 3.2 Marker Clustering (`components/ClusteredMarkers.tsx`)
- **API Wrapper**: Integrates `@googlemaps/markerclusterer`.
- **Dynamic Updates**: Watches stateful references to generated `AdvancedMarkerElement` DOM objects and schedules registration updates automatically on bounds transitions.
- **Visual Stacking**: Collapses crowded pins into unified numerical badges when zoomed out, resolving rendering bottlenecks and visual noise in high-density sectors.

---

## 4. Operational Heatmaps (`components/DeckGlOverlay.tsx`)

For high-volume spatial monitoring, administrators can toggle a dynamic heatmap visualization.

- **Technology**: Built using `@deck.gl/google-maps` (GoogleMapsOverlay) and `@deck.gl/aggregation-layers` (HeatmapLayer).
- **Weighting Coefficients**: Calculates real-time intensity parameters based on:
  - **Issue Severity** (Urgency levels mapped to multiplier weights).
  - **Co-Signing / Upvotes** (Higher community engagement elevates heatmap heat).
  - **Resolution Status** (Excludes resolved points dynamically to focus operational resources on live hotspots).
- **Performance**: Rendered via WebGL direct shaders, handling thousands of discrete spatial points at 60fps.

---

## 5. Reporting Flow & Direct Geocoding

The report submission wizard (`app/citizen/report/page.tsx`) incorporates location tracking directly:
1. **Interactive Node Placement**: Citizens can double-click or drag markers to place precise incident markers.
2. **Reverse Geocoding**: Relies on the `MapService.geocodeAddress` to translate typed street locations into coordinates or vice-versa.
3. **GPS Fallbacks**: Integrates the `navigator.geolocation` system to automatically suggest the reporter's immediate vicinity as the reporting focal point.

---

## 6. Filtering & State Synchronization

- **Reactive Syncing**: Issue lists and map markers listen to the exact same filtered state variables. 
- **Two-Way Binding**:
  - Selecting an issue in the scrolling list automatically centers the map on its pin and highlights the marker.
  - Selecting a map pin highlights the issue in the scrolling list or opens the issue card overlay instantly.
- **Administrative Filters**: Allows operators to segment by department, urgency level, assignment status, and geographic sector on the operational map, updating visual markers and detail boards concurrently.

---

## 7. Future AI Geographical Services

Ready for Phase 6, `MapService` (`lib/services/mapService.ts`) exposes foundational geospatial methods:
- **Nearby Issue Lookup**: Restricts queries to specified radial bounding spheres.
- **Duplicate Candidate Search**: Detects existing reports within a 50-meter threshold to prevent spam.
- **Department Region Lookup**: Maps coordinates into municipal service boundaries to automate department dispatching.
