# CivicHero persistence & Persistence Lifecycles

This document details the database, storage, and persistence mechanics of the **CivicHero** platform. It outlines how we manage the life cycle of civic reports, verification media, non-blocking background threads, fallback simulations, and error-recovery retry strategies.

---

## 1. Issue Lifecycle

A civic report (referred to as an `Issue` or `Incident`) represents a community-vetted public concern. It is persisted as a document under the `/issues/{issueId}` collection path in **Google Cloud Firestore**.

### 1.1 State Transitions
The incident travels through four core operational states, controlled by the `status` field:

```
[Reported] ──► [In Progress] ──► [Resolved] ──► [Closed]
```

1. **Reported**: Automatically assigned upon initial submission. The AI router automatically classifies categories and priorities, and routes the report to the corresponding municipal department.
2. **In Progress**: Set by public safety administrators once a work order is generated and assigned to field crews.
3. **Resolved**: Updated when crews complete physical repairs. The platform notifies the reporter and triggers automated community gratitude tokens.
4. **Closed**: Final archive state following confirmation or grace-period expiration.

### 1.2 Terminal State Locking
To preserve regulatory and historical audit integrity, once an issue reaches a terminal status (`Resolved` or `Closed`), the security rules engine enforces **Terminal State Locking**. 
* **Citizens** can no longer edit or post comments to the issue.
* **Administrators** can modify specific metadata (such as work logs or categories) but standard state modifications are strictly locked.

---

## 2. Evidence Media Lifecycle

Every civic report supports attached photographic evidence to prove authenticity and assist dispatch crews. Because file uploads to cloud storage introduce network latency, the media attachment pipeline is fully decoupled from the core text submission metadata.

```
[Selecting File] ──► [UPLOADING] ──► [AVAILABLE]
                          │
                          └──► [FAILED / RETRY_REQUIRED] (Allows User/Admin Retry)
```

The `evidenceStatus` field tracks the progression of this asset:
* **PENDING**: No file has been selected yet.
* **UPLOADING**: The binary stream is transmitting in the background.
* **AVAILABLE**: The file is safely secured in **Firebase Storage**, the public download URL is retrieved via `getDownloadURL()`, and the issue's `imageUrl` is updated.
* **FAILED**: The transmission was aborted due to network disruption or unconfigured cloud storage.
* **RETRY_REQUIRED**: The database record was written successfully, but the image asset was not attached, prompting a manual recovery flow.

---

## 3. Asynchronous Non-Blocking Background Uploads

To deliver an instant, friction-free submission workflow, CivicHero never forces citizens to wait for progress bars or slow photo uploads before submitting their forms:

1. **Immediate Execution**: As soon as a user selects or takes a photo in the Report Wizard, a background task immediately kicks off the binary upload stream to Firebase Storage.
2. **Parallel Editing**: While the upload transmits in the background, the user is free to continue filling out the description, choosing categories, adjusting the interactive map pinpoint, and reviewing priority.
3. **Smart Coexistence**: 
   * If the upload finishes *before* the user clicks "Submit", the system attaches the finalized URL immediately and marks the status as `AVAILABLE`.
   * If the user clicks "Submit" *while* the upload is still processing, the system does not block the form submission. Instead, it writes the document immediately with `evidenceStatus: 'UPLOADING'` and continues to track/resolve the background upload promise. Once complete, it silently patches the Firestore document with the finalized URL and updates the status to `AVAILABLE`.

---

## 4. Storage Fallback Simulations

CivicHero is built with a resilient, offline-ready architecture. If **Firebase Storage** is temporarily unconfigured or unreachable:
* **Graceful Degradation**: Instead of crashing the page or raising cryptic errors, the system triggers local simulations.
* **Client-Side Simulation**: It utilizes standard browser `URL.createObjectURL(file)` to generate a temporary localized data URL. This allows the citizen to view their uploaded image in the current session.
* **Status Signaling**: The document is marked with `evidenceStatus: 'AVAILABLE'` (Simulated Fallback) or `FAILED`, ensuring the rest of the application's verification UI renders smoothly.

---

## 5. Dynamic Category Placeholder Strategy

If a civic concern does not include a photo, or if the background upload fails, CivicHero maintains visual polish by utilizing our dynamic category-based representative placeholder engine (`getPlaceholderImage`):

* **Contextual Imagery**: Rather than showing broken icons or generic cards, the placeholder engine returns beautiful, high-contrast, pre-vetted images matching the report's specific category (e.g., a pothole illustration for *Road Infrastructure*, a green nature scene for *Parks & Recreation*, or specialized vectors for *Utilities*).
* **Overlay Branding**: When an image is still `UPLOADING` or has `FAILED`, a blurred overlay is applied on top of the placeholder image along with human-readable indicators ("Securing Photo..." or "Missing Evidence Media"), ensuring complete visual honesty without sacrificing page layout.

---

## 6. Decoupled Media Retry Strategy

If an upload fails or is interrupted, CivicHero provides seamless recovery mechanisms across all portals:

### 6.1 Citizen Portal Detail Page
When viewing a report with `FAILED` or `RETRY_REQUIRED` evidence, the citizen is greeted with an inline **"Evidence Media Upload Interrupted"** banner. Clicking **"Retry Upload"** opens the device's camera/file chooser, triggers a targeted re-upload, and automatically patches the Firestore document with the new URL upon completion.

### 6.2 Administrative Portal
Administrators have full capabilities to patch missing evidence on behalf of citizens. The Administrator Issue Detail view contains an action terminal that allows uploading replacement verification media directly, resolving disrupted filings.

### 6.3 Diagnostics Sandbox
An interactive **"Media Retry Pipeline Sandbox"** is built directly into the `/diagnostics` panel. Developers can select any active case docket on the ledger, feed in an arbitrary image file, and watch the live telemetry log as the decoupled retry pipeline uploads the file and patches the target document.
