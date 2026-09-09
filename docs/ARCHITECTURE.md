# JeevanSetu — Architectural Specification

## 1. System Vision & Core Mission
**JeevanSetu** ("Connecting people to the right care") is a digital health platform designed specifically for rural and underserved healthcare ecosystems in India. Addressing the Smart India Hackathon problem statement on rural healthcare access, JeevanSetu solves the systemic friction that causes avoidable patient travel, delay in emergency escalation, broken referral loops, and loss of clinical continuity.

### Core Objectives
1. **Timely Access**: Multi-tier facility discovery, digital queues, and assisted teleconsultation connecting remote Sub-centres directly with Rural Hospitals and District Specialists.
2. **Clinical Continuity**: Longitudinal medical timeline consolidating vitals, prescriptions, diagnostic orders, and referral summaries under patient ABHA health identifiers.
3. **Closed-Loop Referrals**: End-to-end status tracking from initiation at Primary Health Centres to arrival, specialist review, and discharge at District Hospitals.
4. **Diagnostic & Medication Transparency**: Real-time stock levels of essential medicines across all facilities, with automated low-stock warnings and test result notifications.
5. **Offline-First Frontline Empowerment**: High resilience for ASHA/ANM workers operating in areas with zero or intermittent network coverage via IndexedDB client queues.
6. **Strict Safety & Ethical AI**: Zero autonomous medical prescribing or diagnosing; deterministic triage safety red-flags with transparent reason codes.

---

## 2. High-Level Architectural Diagram

```
+------------------------------------------------------------------------------------+
|                                    USER INTERFACES                                 |
|  +------------------+  +--------------------+  +---------------+  +--------------+ |
|  | Patient PWA      |  | Health Worker PWA  |  | Doctor Portal |  | Admin Center | |
|  | (EN, HI, MR)     |  | (ASHA / ANM)       |  | (3-Panel OPD) |  | (Quality KPIs| |
|  +--------+---------+  +---------+----------+  +-------+-------+  +-------+------+ |
+-----------|----------------------|---------------------|------------------|--------+
            |                      |                     |                  |
            +----------------------+----------+----------+------------------+
                                              |
                                              v
+------------------------------------------------------------------------------------+
|                         NEXT.JS 15 FULL-STACK APP ROUTER                           |
|  - React 19 Client & Server Components        - Dexie.js Client-Side Storage       |
|  - Tailwind CSS Responsive Design System      - Service Worker Cache Shell         |
|  - Real-time Connectivity Listener            - Multilingual Context Provider      |
+------------------------------------------------------------------------------------+
                                              |
                                              v
+------------------------------------------------------------------------------------+
|                                REST API LAYER (MODULAR)                            |
|  /api/auth/*         /api/patients/*       /api/facilities/*   /api/appointments/* |
|  /api/queues/*       /api/teleconsult/*    /api/prescriptions* /api/diagnostics/*  |
|  /api/referrals/*    /api/medicines/*      /api/followups/*    /api/admin/*        |
|  /api/sync/*         /api/documents/ocr    /api/fhir/*         /api/ai/triage      |
+------------------------------------------------------------------------------------+
        |                      |                     |                   |
        v                      v                     v                   v
+---------------+      +---------------+     +---------------+   +------------------+
|  AUTH & RBAC  |      | CORE CLINICAL |     | FHIR & ABDM   |   | AI & OCR SERVICE |
| - JWT session |      | - Encounters  |     | - FHIR R4     |   | - Python FastAPI |
| - Facility sc.|      | - Vitals Obs. |     | - ABHA Mock   |   | - Rule Triage    |
| - Audit Trail |      | - Digital Rx  |     | - Consent API |   | - Confidence Sc. |
+---------------+      +---------------+     +---------------+   +------------------+
        |                      |                     |                   |
        +----------------------+----------+----------+-------------------+
                                          |
                                          v
+------------------------------------------------------------------------------------+
|                                   DATA LAYER                                       |
|  - Relational Database (Prisma ORM: SQLite Local Demo / PostgreSQL Production)     |
|  - Client-Side IndexedDB (Dexie: Vitals Drafts, Facilities Cache, Sync Queue)      |
|  - Cryptographic HMAC-SHA256 Signed Opaque QR Codes (Zero PHI in QR Payload)       |
+------------------------------------------------------------------------------------+
```

---

## 3. Monorepo & Directory Structure

```
├── app/                              # Next.js 15 App Router Pages & API Routes
│   ├── (patient)/                    # Patient discovery, appointments, timeline, Rx
│   ├── (worker)/                     # ASHA/ANM dashboard, offline vitals, QR scan, OCR
│   ├── (doctor)/                     # Doctor queue, 3-panel consultation, records
│   ├── (admin)/                      # Operations, facilities, inventory, quality, audit
│   ├── api/                          # REST API endpoints (37 modular routes)
│   ├── layout.tsx                    # Global responsive shell + connectivity banner
│   └── page.tsx                      # Public landing & triage portal
├── apps/
│   └── ai-service/                   # Python FastAPI service for AI triage & OCR
│       ├── main.py                   # FastAPI server entrypoint
│       ├── schemas.py                # Pydantic schema validation
│       ├── triage.py                 # Deterministic triage safety rules
│       └── ocr.py                    # Prescription text parsing & confidence scorer
├── components/                       # Accessible UI components (Tailwind CSS)
│   ├── ui/                           # Button, Card, Badge, Input, Modal
│   ├── layout/                       # Header, BottomNav, ConnectivityBanner, DemoBanner
│   └── clinical/                     # 3-Panel consult, RxBuilder, VitalsForm
├── context/
│   └── AppContext.tsx                # Role switcher, language provider, connectivity state
├── lib/                              # Core backend logic & infrastructure
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # JWT, session verification, RBAC guard
│   ├── audit.ts                      # Privacy-safe audit logger
│   ├── qr.ts                         # Cryptographic HMAC-SHA256 QR signing & verification
│   ├── ai-triage.ts                  # Deterministic clinical safety rules engine
│   └── db.ts                         # Dexie.js IndexedDB client database
├── packages/
│   ├── types/                        # Domain models, enums, API DTOs
│   ├── config/                       # System tokens, demo credentials, district settings
│   ├── i18n/                         # English, Hindi, and Marathi translation dictionaries
│   └── healthcare/                   # FHIR R4 mapper & ABDM adapter interface
├── prisma/
│   ├── schema.prisma                 # Unified Prisma data model (23 tables)
│   └── dev.db                       # Local SQLite database
├── infrastructure/
│   ├── docker/                       # Production Dockerfile & docker-compose.yml
│   └── database/                     # Migration scripts
├── scripts/
│   ├── seed.mjs                      # Realistic seed script for Maharashtra Demo District
│   └── run-e2e-hero.mjs              # Programmatic E2E test runner
└── tests/
    ├── unit/                         # Triage rules, QR verification, FHIR mapper tests
    └── integration/                  # Core API and database integration tests
```

---

## 4. Multi-Tier Public Healthcare Model
The system mirrors the three-tier structure of India's public healthcare system:
1. **Primary Tier (Sub-centres & PHCs)**:
   - Staffed by ASHA/ANM workers and Medical Officers.
   - Outpatient care, antenatal care, immunization, vitals screening, and free essential drug dispensation.
   - Serves as the origin for assisted teleconsultation.
2. **Secondary Tier (Rural Hospitals & Sub-District Hospitals)**:
   - Specialized outpatient clinics (Orthopedics, General Surgery, Pediatrics, Gynecology).
   - Digital X-ray, ultrasound, pathology laboratory, 24x7 emergency beds.
   - Serves as the teleconsultation hub for Sub-centres.
3. **Tertiary Tier (District Referral Hospitals)**:
   - Multi-specialty surgery, advanced trauma, ICU, and complex diagnostics.
   - Destination for closed-loop secondary referrals.
