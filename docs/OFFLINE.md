# JeevanSetu — Offline-First Architecture & Synchronization Engine

## 1. The Rural Connectivity Challenge
Frontline health workers (ASHA and ANM workers) routinely conduct home visits and village health camps in areas with weak cellular reception (2G/3G edge coverage or complete network blackouts).

Traditional cloud-only health applications fail catastrophically in these conditions:
- Form submissions hang and discard captured vital signs.
- Workers revert to loose paper registers that get lost or delayed.
- Emergency referrals and missed follow-ups cannot be coordinated in time.

JeevanSetu implements a resilient **Offline-First PWA Architecture** that guarantees full data capture and review without an active internet connection.

---

## 2. Client-Side Storage Architecture (Dexie.js / IndexedDB)

JeevanSetu leverages an embedded browser database via **Dexie.js** (`lib/db.ts`):

```
+-----------------------------------------------------------------------------------+
|                            INDEXEDDB CLIENT DATA STORES                           |
|                                                                                   |
|  1. facilitiesCache       - Reference data of 20 district facilities & doctors     |
|  2. patientsCache         - Authorized patient demographics & ABHA numbers        |
|  3. draftObservations     - Offline vitals records (BP, Pulse, SpO2, Weight)      |
|  4. syncQueue             - Ordered queue of mutations waiting for upload         |
+-----------------------------------------------------------------------------------+
```

### Sync Queue Item State Machine
```
   [Record Vitals Offline]
              │
              ▼
       ┌──────────────┐
       │   PENDING    │ (Stored locally in IndexedDB)
       └──────┬───────┘
              │ (Network Connection Detected)
              ▼
       ┌──────────────┐
       │   SYNCING    │ (POST /api/sync/push payload)
       └───┬──────┬───┘
           │      │
(Server 200 OK)   (Version Conflict / 500)
           │      │
           │      ▼
           │  ┌──────────────┐
           │  │   CONFLICT   │ (Reconciliation fallback)
           │  └──────────────┘
           ▼
       ┌──────────────┐
       │    SYNCED    │ (Archived in client audit trail)
       └──────────────┘
```

---

## 3. Conflict Resolution & Reconciliation Strategy

### 1. Append-Oriented Clinical Observations
In healthcare records, overwriting historical measurements is dangerous. JeevanSetu treats vital signs and clinical observations as **immutable time-series events**:
- If an ASHA worker records Blood Pressure offline at 10:15 AM and another reading is taken at 11:00 AM at the PHC, both readings are preserved chronologically on the patient's timeline upon synchronization.
- Clinicians observe the complete trajectory (e.g. initial elevated BP followed by repeat reading).

### 2. Version-Checked Optimistic Concurrency
For status updates (e.g. Appointment status, Referral status):
- The client sends the local version timestamp.
- If the server version is newer, the server applies deterministic state precedence (`COMPLETED` > `IN_PROGRESS` > `SCHEDULED`) to avoid status regression.

---

## 4. Real-Time Connectivity Listener
The application shell continuously monitors connection status:
- **`navigator.onLine` Event Listener**: Detects instant network disconnection/reconnection.
- **Subtle Connectivity Banner (`components/layout/ConnectivityBanner.tsx`)**:
  - `ONLINE`: Concealed or subtle green badge.
  - `OFFLINE`: Persistent non-intrusive amber banner: *"Working Offline — Data will sync automatically when reconnected."*
  - `SYNCING`: Animated blue icon showing pending queue count (e.g. *"Syncing 2 offline records..."*).
- **Manual Sync Button**: Health workers can inspect the pending queue and trigger immediate sync via the worker dashboard (`/worker/sync`).
