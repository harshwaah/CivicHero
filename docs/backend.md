# CivicHero Backend Implementation Guide

This document establishes the strategic implementation roadmap, schema plans, and architectural guidelines for transitioning the **CivicHero** platform from static mock objects to a real-time, cloud-connected backend.

---

## 1. Firestore Database Strategy

We leverage **Google Cloud Firestore (Enterprise Edition)** in Native Mode as our central transactional database. Firestore offers sub-second latency, document-level real-time subscription synchronization, and an expressive security rules engine.

### Collection Layout & Schema Blueprint
The database structure adheres to a flat, decoupled structure, avoiding unbounded nested arrays inside single documents.

```
/users/{userId} (Document: Citizen Profile)
  ├── name: string
  ├── email: string
  ├── avatarUrl: string
  ├── trustScore: number
  ├── completedReports: number
  ├── verifiedReports: number
  ├── badgeTitle: string
  └── joinedAt: timestamp

/issues/{issueId} (Document: Incident Report)
  ├── title: string
  ├── description: string
  ├── category: string
  ├── urgency: "Low" | "Medium" | "High" | "Critical"
  ├── status: "Live" | "Reported" | "In Progress" | "Resolved"
  ├── timestamp: timestamp
  ├── location: string
  ├── upvotes: number
  ├── commentsCount: number
  ├── imageUrl: string (Firebase Storage public URL)
  ├── verifiedByCount: number
  ├── reporterName: string
  ├── reporterBadge: string
  ├── coordinates: map { lat: number, lng: number }
  ├── trustMetrics: map {
  │     coSigningCount: number,
  │     accuracyRating: number,
  │     verificationConfidence: number,
  │     communityFlagsCount: number,
  │     isVerified: boolean
  │   }
  │
  ├─── /comments/{commentId} (Subcollection: Citizen Comments)
  │      ├── content: string
  │      ├── authorName: string
  │      ├── authorBadge: string
  │      ├── timestamp: timestamp
  │      └── likes: number
  │
  └─── /timeline/{eventId} (Subcollection: Milestone Audit Trails)
         ├── type: string
         ├── title: string
         ├── description: string
         └── timestamp: timestamp
```

### Security Rule Guarantees (ABAC)
1.  **Identity Verification**: All modifications to `/users/{userId}` are strictly guarded by `request.auth.uid == userId`.
2.  **Verified Email Mandate**: User writes require verified emails: `request.auth.token.email_verified == true`.
3.  **Terminal State Locking**: Once an issue's status is set to `Resolved` or `Closed`, it becomes read-only for standard citizens. Only authenticated public safety administrators can update or archive the document.
4.  **Spam Protection (Denial of Wallet Guard)**: Strict payload limits are enforced via `isValidId()` and `.size()` constraints to block injection attacks.

---

## 2. Firebase Storage Strategy

We utilize **Google Cloud Storage (Firebase Storage)** to host high-resolution photos and optical scans uploaded during report submissions.

### Upload Pipeline
1.  **Client-Side Capture**: The citizen captures or uploads an image in the reporting wizard.
2.  **Deterministic File Naming**: Images are stored at `uploads/{issueId}/evidence_photo.jpg` to prevent overlapping namespaces or orphaned blobs.
3.  **Metadata Tagging**: Files are uploaded with custom MIME metadata (`contentType: 'image/jpeg'`) and owner UIDs to enforce secure storage rules.
4.  **Public URL Resolution**: On successful upload, the public HTTPS URL is retrieved via `getDownloadURL()` and written directly to the issue's `imageUrl` field.

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{issueId}/{allPaths=**} {
      allow read: if true; // Public access for community verification feeds
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 3. Google Maps Platform Integration Strategy

The Maps architecture is fully integrated and abstracted via the `<CivicMap>` polymorphic component and `<MapProvider>` state layer. 

### Implementation Highlights
1.  **Dynamic Bootstrap**: Handled via `@vis.gl/react-google-maps` using `<APIProvider>`, resolving rendering blocks and ensuring the script is lazy-loaded only where required.
2.  **Unified Canvas**: Deployed the highly extensible `<CivicMap>` component across both Citizen and Admin pages to maintain one single, modular mapping abstraction.
3.  **Vector Markers**: Custom SVG `<Pin>` nodes with color mappings corresponding directly to civic issue status and urgency (Resolved = Green, Critical = Red, High = Orange, Medium = Amber, Low/Default = Blue).
4.  **Reverse Geocoding**: Integrated geocoding logic inside the report wizard (`app/citizen/report/page.tsx`) to resolve location values to geographic coordinate pins seamlessly.
5.  **Marker Clustering**: Embedded the `@googlemaps/markerclusterer` library into `<ClusteredMarkers>` to group crowded report elements adaptively as users zoom out.
6.  **Hotspots & Heatmaps**: Configured a high-performance WebGL-based deck.gl `<DeckGlOverlay>` layer using `GoogleMapsOverlay` and `HeatmapLayer` to show real-time community hotspot densities on the Mission Control operational board.

---

## 4. Gemini API Integration Strategy

Server-side Gemini 3.5 API calls are proxied through standard Next.js App Router API Routes (`app/api/gemini/route.ts`) to hide the master `GEMINI_API_KEY` from client web browsers.

### Optical Scanner Flow
1.  **API Call Dispatch**: When an image is uploaded, `ReportService` triggers an asynchronous server request containing the image base64.
2.  **Model Selection**: The route utilizes `gemini-3.5-flash` for rapid structured classification.
3.  **System Prompts & Structured Schema**:
    ```typescript
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        "Perform computer vision inspection of this municipal infrastructure concern...",
        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            categoryMatch: { type: "string" },
            severityMatch: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
            confidence: { type: "integer" },
            routingTo: { type: "string" },
            aiSummary: { type: "string" }
          }
        }
      }
    });
    ```

---

## 5. Future Authentication & Mission Control Strategy

While currently operating on client-side state, user authentication will be layered seamlessly when required:
1.  **Google Sign-In**: Powered by `signInWithPopup(auth, googleProvider)` to resolve iframe redirection restrictions.
2.  **Authentication Context**: We will wrap the layout in an `AuthProvider` that listens to `onAuthStateChanged()` and syncs the current session across all repositories.
3.  **Role-Based Access Control (RBAC)**: Administrator status is managed via a dedicated, read-only `/admins/{uid}` collection. This will prevent identity spoofing, as user custom claims can be bypassed but database-level document constraints are absolute.

### Mission Control Repository Synchronization
The Administrator Portal relies entirely on the exact same `IssueRepository` and `TimelineRepository` as the Citizen Portal. 
*   **Reactive Subscriptions**: Both repositories implement a lightweight `subscribe(callback)` pattern, pushing real-time updates directly to React components. This mirrors how Firestore `onSnapshot()` listeners will work, ensuring UI state remains flawlessly synchronized across all active sessions.
*   **Write Operations**: The `IssueService` implements administrative functions such as `updateIssueStatus` and `assignDepartment`. These methods trigger immediate writes to the underlying data layer, which subsequently notifies all active subscribers.
*   **Audit Logging**: Every administrative action utilizes `TimelineService.appendMilestone()` to write directly to the `/issues/{issueId}/timeline` subcollection, ensuring an immutable ledger.
*   **AI Integration**: The `AdministratorCopilot` and `CommunityIntelligenceAgent` provide data-driven insights by reading the aggregated issues collection, keeping operational intelligence tightly coupled to real-time citizen reporting.

---

## 6. Secure Persistence Sanitization (`cleanUndefined`)

In Cloud Firestore, attempting to save an explicit field with a value of `undefined` is strictly forbidden and results in write termination errors. To make our persistence layers highly resilient, we implement a defensive **`cleanUndefined`** sanitization pattern directly in the `IssueRepository` layer:

1. **Automatic Filtering**: Before executing any `setDoc()` or `updateDoc()` database operation, payloads are recursively scanned and stripped of any properties containing `undefined` values.
2. **Support for Asynchronous Fields**: This allows optional or late-attaching properties (e.g., `imageUrl` or `evidenceStatus` when media is still uploading) to coexist inside payload declarations without risk of halting database transactions.

---

## 7. Decoupled Media Retry Strategy

To guarantee zero data loss and flawless civic filings under unstable network conditions, the platform implements a decentralized, state-driven retry strategy:

1. **State Isolation**: When a submission contains an incomplete or failed upload, the incident is logged with `evidenceStatus: 'FAILED'` or `evidenceStatus: 'RETRY_REQUIRED'`.
2. **Self-Service Portals**: 
   * **Citizen Issue Detail Page**: Features an action banner enabling immediate file upload and database patching.
   * **Admin Issue Detail Page**: Enables public works operators to manually upload missing photos.
   * **Diagnostics Panel Sandbox**: Provides developers with an interactive testing tool to run end-to-end retry pipeline simulations and observe live telemetry logs.

---

## Setup Instructions

For full setup instructions regarding environment variables, Firebase setup, Google Maps setup, Gemini API, and synchronization validation, please refer to the [Setup Guide](./setup.md).
