# JeevanSetu

## Tagline
"Connecting people to the right care."

---

## Project Overview

**JeevanSetu** is a digital public healthcare access and continuity platform designed specifically for rural, remote, and underserved communities. Developed as a Smart India Hackathon prototype addressing healthcare accessibility and quality, JeevanSetu bridges the divide between rural citizens, frontline community health workers (ASHA/ANM), primary healthcare facilities (Sub-centres and Primary Health Centres), and referral specialists at Sub-District and District Hospitals.

### The Rural Public Healthcare Challenge
In rural and remote districts across India, public healthcare delivery faces systemic friction:
* **Long Travel Distances**: Rural citizens often travel 25–50 km over difficult terrain to district hospitals for conditions manageable at local Sub-centres or PHCs.
* **Specialist Shortages**: Specialist clinicians (orthopedics, pediatrics, obstetrics) are concentrated at district centres, leaving primary centres understaffed.
* **Fragmented Health Records**: Paper slips, handwritten prescriptions, and diagnostic reports are frequently lost, damaged, or unavailable during follow-ups.
* **Long Waiting Times**: Outpatient departments (OPDs) suffer from unmanaged physical queues where patients wait 3–4 hours without visibility into doctor availability.
* **Delayed Referrals**: Referrals from primary facilities to district hospitals operate as "paper handoffs" without loop closure, tracking, or confirmation.
* **Diagnostic Uncertainty**: Rural health posts lack on-site imaging or pathology, forcing repeated round trips to collect paper test reports.
* **Medicine Availability Uncertainty**: Patients travel to clinics only to find essential medicines out of stock.
* **Missed Follow-Ups**: High-risk patients (chronic hypertension, diabetes, antenatal care) drop out of care without community tracking.
* **Language Barriers**: Complex medical documentation is written in English or Latin medical jargon, unintelligible to regional-language speakers.
* **Connectivity Limitations**: Remote villages operate in cellular dead zones (2G or zero network), causing cloud-only mobile apps to fail.

### How JeevanSetu Addresses These Challenges
JeevanSetu provides a cohesive, multi-tier public healthcare workflow:
1. **Assisted Teleconsultation**: Connects patients at local Sub-centres to district specialists via video, supported by ASHA workers.
2. **Digital Queues & Triage**: Digital OPD token allocation with priority escalation (`EMERGENCY`, `URGENT`, `HIGH`, `ROUTINE`).
3. **Longitudinal Record Continuity**: Unified patient timeline associating vitals, electronic prescriptions, lab results, and referrals under national ABHA health identifiers.
4. **Closed-Loop Referrals**: Lifecycle status tracking (`CREATED` -> `ACCEPTED` -> `SCHEDULED` -> `PATIENT_ARRIVED` -> `COMPLETED`).
5. **Medicine Inventory Transparency**: Live facility inventory view with automated low-stock warnings and national free dispensation verification.
6. **Privacy-Safe QR Continuity**: HMAC-SHA256 signed opaque reference tokens that contain zero Protected Health Information (PHI) in the QR matrix.
7. **Offline-First Resilience**: Full client-side IndexedDB caching and sync queue via Dexie.js for uninterrupted frontline vitals capture in zero-connectivity areas.
8. **Ethical AI Boundaries**: Deterministic clinical safety rules with immediate conversation interruption on emergency red flags, with zero autonomous prescribing or diagnosing.

---

## Key Features

### Assisted Teleconsultation
* **Sub-Centre to Hospital Link**: Enables frontline health workers (ASHA/ANM) at rural Sub-centres (e.g., Kendur Sub-centre) to connect patients to specialist physicians at Rural and District Hospitals (e.g., Shirur Rural Hospital).
* **Worker-Assisted Flow**: Health workers capture pre-consultation vitals (BP, pulse, weight) and present patient clinical history to the doctor during the virtual visit.
* **Teleconsultation Adapter**: The prototype includes a WebRTC video interface adapter with simulated video connect for demonstration without external signaling server dependencies.

### Government vs Private Care Discovery
* **Dual Pathway Selector**: Patients can transparently toggle between Government public health facilities (Sub-centres, PHCs, Rural Hospitals, Sub-District Hospitals, District Hospitals) and Empaneled Private Hospitals.
* **Public Service Guarantees**: Highlights free OPD consultations, free essential drug dispensation under the National Health Mission (NHM), and coverage under Ayushman Bharat PM-JAY.

### AI-Assisted Symptom Intake
* **Conversational Natural Language Intake**: Citizens describe their health complaint in simple, conversational language (English, Hindi, or Marathi).
* **Department & Facility Matching**: Evaluates chief complaints and matches them to relevant clinical departments (Orthopedics, Pediatrics, Gynecology, General Medicine).
* **Care Pathway Recommendation**: Identifies whether symptoms can be handled locally via teleconsultation or require in-person facility visits.

### Emergency Escalation
* **Deterministic Red-Flag Protocol**: Immediate evaluation against emergency keywords (chest pain, acute breathlessness, loss of consciousness, convulsions, snakebite, severe trauma).
* **Chat Interruption**: Conversational intake is immediately locked upon detecting red-flag symptoms.
* **Emergency Action Interface**: High-priority alert banner renders the nearest 24x7 emergency hospital with direct call buttons to Emergency Ambulance (`108`) and hospital casualty.

### Appointment & Queue Management
* **Digital Token Allocation**: Generates sequential, department-coded digital tokens (e.g., `ORTHO-014`).
* **Priority Sorting**: Triage engine and doctor overrides order patients by clinical urgency: `EMERGENCY` (0m wait), `URGENT` (5m wait), `HIGH` (10m wait), `ROUTINE` (standard queue).
* **Live OPD Queue Board**: Real-time display showing currently serving token, waiting patient count, and estimated wait times.

### Longitudinal Patient Records
* **Unified Clinical Timeline**: Consolidates past outpatient encounters, vital signs observations, active conditions (ICD-10 coded), electronic prescriptions, and diagnostic orders.
* **ABHA Association**: All clinical entries are anchored to the patient's 14-digit national ABHA identifier (`91-XXXX-XXXX-XXXX`).

### Digital Prescriptions
* **Structured Clinical Builder**: Physicians compose prescriptions specifying medication name, generic formulation, strength, dosage form (tablet, syrup, injection), route, frequency (OD, BD, TID, SOS), duration, and instructions.
* **Digital Signature**: Tracks prescribing clinician's credentials, registration number, facility code, and timestamp.

### Secure QR Record Continuity
* **Cryptographic Opaque Reference**: Prescriptions generate a QR code containing an HMAC-SHA256 signed opaque reference token.
* **Zero PHI in QR Matrix**: The QR code contains no plaintext patient names, national IDs, diagnoses, or drug names.
* **Tamper-Evident & Auto-Expiring**: Modifying any reference field invalidates the cryptographic signature; tokens automatically expire after 30 days.

### Paper Prescription OCR
* **Frontline Digitization**: ASHA/ANM workers can photograph legacy paper prescriptions and diagnostic slips.
* **Confidence Scoring**: Simulated extraction engine parses doctor details, facility name, diagnosis, and medications with per-field confidence scores (e.g., 96%, 91%, 88%).
* **Mandatory Human Verification**: Extracted data is presented in a side-by-side review form; workers must verify and edit fields before committing to the patient's record.

### Diagnostic Tracking
* **Order-to-Result Lifecycle**: Tracks diagnostic orders through discrete stages: `ORDERED` -> `SAMPLE_COLLECTED` -> `PROCESSING` -> `RESULT_READY` -> `REVIEWED`.
* **Abnormal Findings Highlighting**: Automated flags for out-of-range lab markers and abnormal radiology findings (e.g., *Medial joint compartment space narrowing, Grade II Osteoarthritis*).
* **Doctor Review Action**: Physicians can mark results as reviewed with clinical commentary directly from the records workstation.

### Referral Tracking
* **Closed-Loop Referral Continuum**: Replaces paper referral slips with end-to-end status tracking: `CREATED` -> `ACCEPTED` -> `SCHEDULED` -> `PATIENT_ARRIVED` -> `COMPLETED`.
* **Inter-Facility Pathway**: Records referring facility, receiving hospital, requested clinical specialty, urgency, and clinical summary notes.
* **Arrival Confirmation**: Receiving facilities acknowledge patient arrival, closing the loop with the referring clinician.

### Automatic Follow-Up
* **Scheduled Care Intervals**: Doctors configure follow-up dates (e.g., 14-day teleconsult follow-up).
* **Patient & Timeline Integration**: Follow-up appointments display prominently on the patient's upcoming care card and clinical timeline.

### High-Risk Patient Follow-Up
* **Cohort Tracking**: Flags vulnerable patients (`HIGH` risk level) such as uncontrolled hypertension (BP > 160/100), high-risk pregnancy, and pediatric malnutrition.
* **Automated Task Escalation**: If a high-risk patient misses a scheduled follow-up, the system automatically escalates the case and dispatches a home-visit task to the assigned village ASHA worker.

### Medicine Availability
* **District Pharmacy Ledger**: Tracks stock levels for 12 essential medicines across all 20 district health facilities.
* **Shortage & Stockout Alerts**: Categorizes stock as *In Stock*, *Low Stock* (at or below reorder threshold), or *Stockout*.
* **Free Dispensation Compliance**: Enforces National Health Mission policy guaranteeing free dispensation of essential drugs at public facilities.

### Facility Dashboards
* **District Operational Overview**: Command dashboard displaying registered patients, daily encounters, active queue counts, referral closure rates, and medicine availability.
* **Facility Governance**: Facility management with capability toggles (24x7 emergency, teleconsultation, diagnostic lab, pharmacy) and bed count tracking.
* **Operational Quality Metrics**: System-level KPIs including average wait times, referral completion percentages, and prototype-derived **Estimated Travel Distance Avoided (km)**.
* **Security Audit Inspector**: Immutable audit log viewer displaying access events, actor roles, timestamps, and metadata.

### Offline-First Support
* **Client-Side Database**: Dexie.js (IndexedDB wrapper) stores facility reference data, authorized patient caches, and draft vitals.
* **Sync State Machine**: Offline mutations transition through `PENDING` -> `SYNCING` -> `SYNCED` (with `FAILED` and `CONFLICT` handling).
* **Connectivity Indicator**: Real-time banner reflecting connection status (`ONLINE`, `OFFLINE`, `SYNCING`).

### Multilingual Support
* **Tri-Lingual Localization**: Complete user interface translation across **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
* **Zero Hardcoded Strings**: All navigation labels, buttons, emergency notices, and medical categories are externalized in dedicated i18n dictionaries with automatic English fallback.

### FHIR Interoperability
* **HL7 FHIR Release 4 Mappers**: Standardized bidirectional mappers converting internal data models to standard FHIR R4 resources:
  * `Patient` -> `FhirPatient`
  * `Facility` -> `FhirOrganization`
  * `Practitioner` -> `FhirPractitioner`
  * `Encounter` -> `FhirEncounter` (`VR` virtual / `AMB` ambulatory)
  * `Prescription` -> `FhirMedicationRequest`
  * `DiagnosticOrder` -> `FhirServiceRequest`

### ABDM-Ready Architecture
* **Interface-Driven Adapter**: Clean TypeScript interface (`IAbdmIntegrationProvider`) modeling Ayushman Bharat Digital Mission (ABDM) milestones:
  * *Milestone 1 (M1)*: ABHA number verification and health ID resolution.
  * *Milestone 2 (M2)*: Health Information Provider (HIP) care context linking (`CARE-CTX-...`) and FHIR bundle dispatch.
  * *Milestone 3 (M3)*: Health Information User (HIU) consent artifact requests and retrieval.
* **Prototype Boundary**: Implemented via `MockAbdmIntegrationProvider` for standalone evaluation without requiring live National Health Authority (NHA) gateway sandbox certificates.

---

## Why This Matters

| Rural Healthcare Problem | JeevanSetu Response | Implementation Status |
|---|---|---|
| **Long travel distances** | Assisted teleconsultation at Sub-centres + facility discovery | Complete (252 km travel avoided in demo dataset) |
| **Long waiting times** | Digital token queues with priority triage overrides | Complete (Average wait time reduced to ~24 mins) |
| **Fragmented records** | Longitudinal timeline under national ABHA identifiers | Complete (Encounters, vitals, Rx, labs unified) |
| **Delayed referrals** | Closed-loop referral tracking from Sub-centre to District Hospital | Complete (Status progression stepper: 84% completion) |
| **Diagnostic uncertainty** | Digital test ordering, radiology tracking, and abnormal alerts | Complete (Digital X-ray tracking with abnormal flags) |
| **Medicine availability** | Real-time facility inventory ledger with low-stock warnings | Complete (12 essential medicines across 20 facilities) |
| **Missed follow-ups** | Automated follow-up calendar + high-risk ASHA task escalation | Complete (High-risk missed visit dispatches ASHA task) |
| **Language barriers** | Native multilingual support in English, Hindi, and Marathi | Complete (Tri-lingual externalized dictionaries) |
| **Poor connectivity** | PWA shell + IndexedDB (Dexie.js) + background sync queue | Complete (Offline vitals capture with auto-sync) |
| **Limited specialist access** | Assisted teleconsultation linking rural clinics with specialists | Complete (Worker-assisted video consultation model) |

---

## User Roles

JeevanSetu enforces Role-Based Access Control (RBAC) across 5 distinct user roles:

```
                  +-----------------------------------+
                  |           JEEVANSETU              |
                  +-----------------+-----------------+
                                    |
     +-----------------+------------+------------+-----------------+
     |                 |                         |                 |
     v                 v                         v                 v
+---------+    +---------------+           +----------+    +---------------+
| PATIENT |    | HEALTH WORKER |           |  DOCTOR  |    | ADMINISTRATOR |
| (Citizen|    | (ASHA / ANM)  |           | (Special)|    | (Facility /   |
|  Portal)|    | (Mobile PWA)  |           | (3-Panel)|    |  District)    |
+---------+    +---------------+           +----------+    +---------------+
```

### 1. Patient (Citizen)
* **Scope**: Rural citizens and family members.
* **Capabilities**: Self-triage through AI symptom intake, browse nearby government and private health facilities, view active OPD queue tokens, review longitudinal health timeline, inspect electronic prescriptions, and access signed QR codes.
* **Access Boundary**: Scoped strictly to own health records via authenticated session.

### 2. Frontline Health Worker (ASHA / ANM)
* **Scope**: Community health workers operating at village Sub-centres and Health & Wellness Centres (Ayushman Arogya Mandirs).
* **Capabilities**: Search assigned village patients, capture vitals offline (BP, pulse, weight, SpO2), initiate assisted teleconsultations, scan patient QR codes, scan and digitize paper records via OCR, and track high-risk home visit tasks.
* **Access Boundary**: Scoped to assigned village catchment area.

### 3. Doctor (Medical Officer & Specialist)
* **Scope**: Physicians, general medical officers, and specialist consultants at PHCs, Rural Hospitals, and District Hospitals.
* **Capabilities**: Manage live OPD queue, call next token, override triage priorities, conduct 3-panel consultations (Patient Summary, Active Notes/Rx, Longitudinal Timeline), issue signed electronic prescriptions, order laboratory/imaging tests, and create closed-loop district referrals.
* **Access Boundary**: Clinical read/write access scoped to active encounters and facility appointments.

### 4. Facility Administrator
* **Scope**: Medical superintendents and administrative officers at healthcare facilities.
* **Capabilities**: Monitor facility OPD queue throughput, manage physical medicine inventory stock counts, configure operational hours and bed allocations, and toggle facility capabilities (emergency, teleconsultation, diagnostics, pharmacy).

### 5. System Administrator (District Health Officer)
* **Scope**: District healthcare leadership, CMHO, and health system analysts.
* **Capabilities**: District-wide operational oversight across all 20 facilities, inspection of operational quality metrics (referral completion, average wait times, estimated travel distance avoided), feature flag management, and inspection of tamper-evident compliance audit logs.

---

## Hero Demo Journey

The primary demonstration workflow mirrors the realistic journey of **Anand Patil**, a 54-year-old farmer from Kendur village with progressive knee pain:

```
[Patient: Anand Patil]
         │
         ▼
[Step 1: AI Symptom Intake (/patient/ai-intake)]
         │   • Enters: "Severe knee pain, difficulty walking and long-distance travel"
         │   • AI Triage: Evaluated as URGENT -> Recommends Orthopedics
         │   • Pathway: Recommends Assisted Teleconsultation to prevent 28 km travel
         ▼
[Step 2: Facility & Specialist Matching]
         │   • Matching Hub: Shirur Rural Hospital (Orthopedics OPD)
         │   • Local Spoke: Kendur Sub-Centre & Ayushman Arogya Mandir
         ▼
[Step 3: ASHA Health Worker Assistance (/worker/vitals)]
         │   • ASHA Sunita records vitals: BP 130/84 mmHg, Pulse 76 bpm, Weight 74 kg
         │   • Prepares patient for assisted teleconsultation
         ▼
[Step 4: Digital OPD Queue & Token Allocation (/doctor/queue)]
         │   • Token issued: ORTHO-014 (Status: WAITING, Priority: URGENT)
         │   • Doctor clicks "Call Next Token" -> Token called to Room 4
         ▼
[Step 5: Specialist 3-Panel Consultation (/doctor/consult)]
         │   • Dr. Rajesh Deshmukh evaluates vitals, history, and video feed
         │   • Diagnoses: Bilateral Osteoarthritis Knee (Grade II)
         │   • Issues electronic prescription: Paracetamol 500mg, Calcium+D3, Diclofenac SOS
         │   • Generates cryptographically signed, privacy-safe QR reference token
         │   • Orders Digital Bilateral Knee X-Ray
         │   • Schedules 14-day teleconsult follow-up
         ▼
[Step 6: Referral Continuum & Closed-Loop Tracking (/doctor/records)]
         │   • Referral dispatched to Maharashtra District Referral Hospital
         │   • Status advances: CREATED -> ACCEPTED -> SCHEDULED -> PATIENT_ARRIVED
         ▼
[Step 7: Impact Realization (/admin/quality)]
             • District quality indicators update:
             • Estimated Rural Travel Distance Avoided: 252 km
             • Closed-Loop Referral Rate: 84%
```

---

## Architecture

```mermaid
graph TD
    subgraph Client [User Touchpoints]
        P[Patient PWA\nMultilingual EN/HI/MR]
        W[Health Worker PWA\nASHA / ANM]
        D[Doctor Workstation\n3-Panel Clinical Screen]
        A[Admin Center\nQuality & Operations]
    end

    subgraph AppLayer [Next.js 15 Full-Stack App Router]
        UI[Tailwind UI Components\nAccessible Design Tokens]
        IDB[(Client IndexedDB\nDexie.js Sync Queue)]
        SW[Service Worker\nPWA Offline Shell Cache]
        API[Modular REST API Layer\n37 Route Handlers]
    end

    subgraph Services [Core Logic & Integration Adapters]
        AUTH[Auth & RBAC\nJWT + Bcrypt]
        CLINICAL[Clinical Core\nEncounters, Rx, Orders]
        QR_ENG[QR Engine\nHMAC-SHA256 Signed Opaque Tokens]
        AI_ENG[Clinical Triage Engine\nDeterministic Safety Rules]
        FHIR_MAP[FHIR R4 Mapper\nHL7 Standard Resources]
        ABDM_ADP[ABDM Adapter\nMilestones M1, M2, M3 Mock]
        AUDIT[Audit Logger\nPrivacy-Safe Event Stream]
    end

    subgraph Data [Data Persistence]
        DB[(Prisma ORM\nSQLite Local / Postgres Prod)]
    end

    subgraph Microservice [Optional Standalone Service]
        PY[Python FastAPI AI Microservice\nUvicorn :8001]
    end

    P --> UI
    W --> UI
    W --> IDB
    D --> UI
    A --> UI

    UI --> API
    IDB -.->|Background Sync| API
    SW -.-> UI

    API --> AUTH
    API --> CLINICAL
    API --> QR_ENG
    API --> AI_ENG
    API --> FHIR_MAP
    API --> ABDM_ADP
    API --> AUDIT

    AUTH --> DB
    CLINICAL --> DB
    AUDIT --> DB
    AI_ENG -.->|Optional Delegate| PY
```

---

## Technology Stack

| Layer | Technology | Purpose | Discovered Version |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | Full-stack framework, SSR, and server actions | 15.1.7 |
| **UI Library** | React | Component rendering engine | 19.0.0 |
| **Language** | TypeScript | Strict type safety across client, server, and shared models | 5.7.3 |
| **Styling** | Tailwind CSS | Utility-first accessible responsive styling | 3.4.17 |
| **Icons** | Lucide React | Healthcare and interface icon set | 0.475.0 |
| **ORM** | Prisma ORM | Relational database modeling and type-safe query client | 6.4.1 |
| **Database (Evaluation)** | SQLite | Embedded relational database (`prisma/dev.db`) | 3.x |
| **Database (Production)** | PostgreSQL | Production multi-container database | 16-alpine |
| **Client Storage** | Dexie.js | IndexedDB wrapper for offline PWA storage and sync queue | 4.0.11 |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | Cryptographic session tokens and RBAC claims | 9.0.2 |
| **Password Security** | bcryptjs | Password hashing with salt rounds = 10 | 2.4.3 |
| **QR Generation** | qrcode | QR code matrix rendering for signed opaque reference tokens | 1.5.4 |
| **Testing Framework** | Vitest | Unit and integration test runner | 3.0.5 |
| **Python Microservice** | FastAPI / Uvicorn | Standalone Python AI triage & OCR microservice | Python 3.11+ |
| **Data Validation** | Pydantic / Zod | Runtime schema validation | Pydantic 2.6 / Zod 3.24 |
| **Containerization** | Docker / Docker Compose | Multi-stage production container orchestration | Docker Compose v3.8 |

---

## Repository Structure

```text
├── app/                              # Next.js 15 App Router pages and API routes
│   ├── (patient)/                    # Citizen portal: discovery, appointments, timeline, prescriptions
│   ├── (worker)/                     # Health worker dashboard: offline vitals, QR scan, OCR, tasks, sync
│   ├── (doctor)/                     # Doctor workstation: OPD queue, 3-panel consult, records
│   ├── (admin)/                      # Admin center: overview, facilities, inventory, quality, audit
│   ├── api/                          # REST API layer (37 modular route handlers)
│   ├── demo/                         # 5-minute interactive evaluator hub
│   ├── layout.tsx                    # Root layout with connectivity banner and global providers
│   ├── page.tsx                      # Public landing and triage initiation portal
│   └── globals.css                   # Tailwind CSS root styling
├── apps/
│   └── ai-service/                   # Standalone Python FastAPI AI & OCR microservice
│       ├── main.py                   # FastAPI application entrypoint
│       ├── schemas.py                # Pydantic request/response schemas
│       ├── triage.py                 # Deterministic clinical triage engine
│       ├── ocr.py                    # Prescription text extraction and confidence scoring
│       ├── Dockerfile                # Python microservice containerfile
│       └── requirements.txt          # Python dependencies (fastapi, uvicorn, pydantic)
├── components/                       # Modular UI and layout components
│   ├── ui/                           # Button, Card, Badge, Input, Modal primitives
│   ├── layout/                       # Header, BottomNav, ConnectivityBanner, DemoBanner
│   └── clinical/                     # 3-Panel consultation layout and clinical tools
├── context/
│   └── AppContext.tsx                # App state, active role switcher, language provider, connectivity
├── docs/                             # Comprehensive architectural and compliance guides
│   ├── ARCHITECTURE.md               # System topology and multi-tier public health design
│   ├── SECURITY.md                   # Cryptographic QR tokens, RBAC, and audit trail
│   ├── FHIR.md                       # HL7 FHIR R4 mapping and ABDM adapter specification
│   ├── OFFLINE.md                    # Dexie IndexedDB sync engine and conflict resolution
│   ├── AI-SAFETY.md                  # Clinical AI boundaries, red-flags, and human-in-the-loop OCR
│   ├── DATABASE.md                   # Prisma schema reference and seed dataset specification
│   ├── API.md                        # Complete REST API documentation (37 endpoints)
│   ├── DEMO.md                       # 5-minute evaluator walk-through guide
│   └── DEPLOYMENT.md                 # Docker Compose, PostgreSQL setup, and cloud scaling
├── infrastructure/
│   └── docker/                       # Production Dockerfile and docker-compose.yml
├── lib/                              # Core backend and infrastructure libraries
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # JWT verification, session management, and RBAC guards
│   ├── audit.ts                      # Privacy-safe audit logger
│   ├── qr.ts                         # HMAC-SHA256 QR signing and verification engine
│   ├── ai-triage.ts                  # In-app deterministic triage engine
│   └── db.ts                         # Dexie.js client-side IndexedDB database
├── packages/                         # Shared libraries and packages
│   ├── types/                        # TypeScript domain models and contracts
│   ├── config/                       # Central branding, feature flags, and demo credentials
│   ├── i18n/                         # English, Hindi, and Marathi translation dictionaries
│   └── healthcare/                   # FHIR R4 resource mapper and ABDM provider adapter
├── prisma/
│   ├── schema.prisma                 # Unified Prisma data model (23 tables)
│   └── dev.db                       # Pre-seeded SQLite evaluation database
├── public/                           # Static assets, web manifest, and icons
├── scripts/
│   ├── seed.mjs                      # Comprehensive seed script for Maharashtra Demo District
│   └── run-e2e-hero.mjs              # Programmatic 10-step E2E Hero Journey test runner
├── tests/
│   ├── unit/                         # Triage safety, QR verification, and FHIR mapper tests
│   └── integration/                  # Core database and API integration tests
├── package.json                      # NPM dependencies and script definitions
├── tsconfig.json                     # TypeScript compiler configuration
├── vitest.config.ts                  # Vitest configuration with alias resolution
└── README.md                         # Master project documentation
```

---

## Getting Started

### Requirements
* **Node.js**: v18.18.0 or higher (v24.19.0 LTS tested and verified).
* **NPM**: v9.0.0 or higher (invoked as `npm.cmd` on Windows).
* **Python** *(optional)*: v3.10+ if running the standalone Python AI service.
* **Operating System**: Windows, macOS, or Linux.

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Environment Variables
The repository includes a pre-configured `.env` file for immediate local evaluation. A template is provided in `.env.example`:

```env
# Database (SQLite for local evaluation; PostgreSQL for production)
DATABASE_URL="file:./prisma/dev.db"

# Authentication & Cryptographic Keys (Change in production)
JWT_SECRET="jeevansetu-secure-dev-jwt-secret-key-change-in-prod-2026"
QR_SIGNING_KEY="jeevansetu_qr_hmac_sha256_secret_key_demo_2026"

# Application Metadata
NEXT_PUBLIC_APP_NAME="JeevanSetu"
NEXT_PUBLIC_APP_TAGLINE="Connecting people to the right care"
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_DEFAULT_DISTRICT="Maharashtra Demo District"

# Integrations & Boundaries
AI_PROVIDER="mock-rules"
MAPS_PROVIDER="mock-geo"
FHIR_BASE_URL="http://localhost:3000/api/fhir"
ABDM_MOCK_ENABLED="true"
STORAGE_PROVIDER="local"
STORAGE_LOCAL_PATH="./uploads"
PORT=3000
```

### Database Setup
The local SQLite database (`prisma/dev.db`) is already created. To regenerate the Prisma client:
```bash
npx prisma generate
```
To push schema changes to a new database:
```bash
npx prisma db push
```

### Seed Data
The database is pre-seeded with the complete **Maharashtra Demo District** dataset. To re-seed from scratch at any time:
```bash
node scripts/seed.mjs
```

### Run Web Application
Start the development server:
```bash
npm run dev
```
To run the production build:
```bash
npm run build
npm start
```

### Run AI Service (Optional)
The Next.js backend includes an embedded clinical triage engine (`lib/ai-triage.ts`), making the web application 100% self-contained out of the box.

If you wish to run the standalone Python FastAPI microservice alongside Next.js:
```bash
cd apps/ai-service
pip install -r requirements.txt
python main.py
```
*(Runs on `http://localhost:8001`)*.

### Open Application
Open Google Chrome and navigate to:
* **Interactive 5-Minute Evaluator Hub**: `http://localhost:3000/demo`
* **Public Landing Portal**: `http://localhost:3000`

---

## Demo Accounts

The application features a **1-Click Demo Switcher Banner** at the top of every screen. Evaluators can instantly switch roles without typing passwords.

For manual login (`/api/auth/login`), the following pre-configured credentials exist:

| Role | Demo User | Phone Number | Password | Default Portal Path |
|---|---|---|---|---|
| **Patient** | Anand Patil (Hero Patient) | `9820011001` | `Password123!` | `/patient` |
| **Health Worker** | Sunita Shinde (ASHA) | `9820022002` | `Password123!` | `/worker` |
| **Doctor** | Dr. Rajesh Deshmukh (Orthopedics) | `9820033003` | `Password123!` | `/doctor` |
| **Facility Admin** | Priya Kulkarni (Superintendent) | `9820044004` | `Password123!` | `/admin/facilities` |
| **System Admin** | District Health Officer | `9820055005` | `Password123!` | `/admin` |

---

## Demo Scenarios

### Scenario 1: Hero Patient Journey (Anand Patil)
1. Open `http://localhost:3000/demo` and select **"Launch Hero Journey"** (or switch to Citizen mode).
2. Navigate to **AI Symptom Intake** (`/patient/ai-intake`) and submit: *"I have severe bilateral knee pain, difficulty walking and long-distance travel is very painful."*
3. Observe the triage classification: Urgency is **Urgent**, routes to **Orthopedics**, and recommends an **Assisted Teleconsultation**.
4. Switch to **Health Worker (ASHA Sunita)**: Open patient profile, record vitals (BP `130/84 mmHg`, Pulse `76 bpm`), and initiate video connection.
5. Switch to **Doctor (Dr. Rajesh Deshmukh)**: Open **Consultation Workstation** (`/doctor/consult`), evaluate the 3 panels, enter assessment (*Bilateral Osteoarthritis Knee Grade II*), prescribe 3 medications, and click **"Sign & Generate Digital Prescription"**.
6. Observe the generated **HMAC-SHA256 privacy-safe QR code** and bilateral knee digital X-ray order.
7. Switch to **District Admin**: Open **Quality Dashboard** (`/admin/quality`) to observe the updated travel avoided metric (**252 km**).

### Scenario 2: Emergency Red-Flag Escalation
1. Navigate to `/patient/ai-intake`.
2. Enter acute emergency symptoms: *"Severe crushing chest pain radiating to left arm and cold sweats"* (or in Marathi: *"छातीत तीव्र दुखणे आणि श्वास घेण्यास त्रास"*).
3. **Observe**: The conversational input is immediately disabled. A high-priority red alert banner appears, highlighting the nearest 24x7 emergency hospital (**Shirur Rural Hospital Emergency Ward**) with direct **"Call 108 Ambulance"** action buttons.

### Scenario 3: Paper Document OCR Digitization
1. Switch to **Health Worker (ASHA Sunita)** and navigate to **Scan Paper Record** (`/worker/ocr`).
2. Click **"Select Sample: Ortho Prescription"** to load a simulated handwritten doctor slip.
3. Observe side-by-side verification: Extracted medications display individual confidence badges (*Paracetamol 500mg: 96%*, *Calcium+D3: 91%*).
4. Edit any dosage value directly in the form, then click **"Verify & Commit to Clinical Timeline"**.
5. Open `/patient/timeline` to confirm the digitized record is now permanently part of Anand Patil's history.

### Scenario 4: Offline Resilience & Background Sync
1. On the Health Worker portal, navigate to **Record Vitals** (`/worker/vitals`).
2. Toggle the **"Simulate Offline Mode"** switch at the top of the form (or disconnect network).
3. Observe the amber connectivity banner: *"Working Offline — Data will sync automatically when reconnected"*.
4. Enter patient vital signs (BP `120/80 mmHg`, Pulse `72 bpm`) and click **"Save Vitals Record"**.
5. The record is instantly saved locally to IndexedDB with status **"Saved Offline (Pending Sync: 1)"**.
6. Toggle offline mode back to **Online**: Observe the animated blue badge cycle from *Syncing...* to *Synced*. The record is uploaded and reconciled with the database.

### Scenario 5: Multilingual Localization
1. Click the language selector dropdown in the header on any page.
2. Toggle between **English**, **हिंदी (Hindi)**, and **मराठी (Marathi)**.
3. Observe that all navigation labels, triage advice, queue badges, and form headings update instantly without page reloads.

---

## Offline Architecture

```
+------------------------------------------------------------------------------------+
|                         CLIENT INDEXEDDB STORAGE (DEXIE.JS)                        |
|                                                                                    |
|  1. facilitiesCache   - Reference data for 20 district facilities & staff          |
|  2. patientsCache     - Authorized patient demographics & ABHA numbers             |
|  3. draftObservations - Offline vitals readings (BP, Pulse, SpO2, Weight)          |
|  4. syncQueue         - Ordered mutation queue waiting for network upload          |
+------------------------------------------------------------------------------------+
```

### Sync Queue States
* **`PENDING`**: Mutation saved locally in IndexedDB while offline; awaiting connectivity.
* **`SYNCING`**: Network connection detected; batch payload is currently uploading to `/api/sync/push`.
* **`SYNCED`**: Server responded with HTTP 200; mutation marked as synchronized and retained in local audit log.
* **`FAILED`**: Network interrupted during transit; queued for automatic retry with exponential backoff.
* **`CONFLICT`**: Server detected a version discrepancy; routed to conflict resolution handler.

### Conflict Resolution Strategy
* **Append-Oriented Clinical Observations**: Vital signs and clinical measurements are modeled as immutable chronological events. When an offline measurement syncs, it is appended to the patient's timeline with its original recording timestamp rather than overwriting existing records.
* **Version-Checked Status Updates**: Status transitions (e.g. Appointment or Referral status) utilize timestamp precedence to prevent status regression.

---

## AI Safety & Clinical Governance

1. **Zero Autonomous Prescribing**: The AI assistant strictly **never** generates, recommends, or adjusts medication prescriptions. Only licensed medical practitioners can write prescriptions.
2. **Zero Autonomous Diagnosing**: The triage assistant provides **department navigation and urgency recommendations**, never clinical diagnoses.
3. **Deterministic Safety Rules**: Emergency red-flag detection uses deterministic keyword matching across English, Hindi, and Marathi rather than unconstrained LLM text generation.
4. **Immediate Chat Interruption**: When life-threatening symptoms are detected, conversational chat is immediately halted to prevent diagnostic delay.
5. **Human-in-the-Loop OCR Verification**: Extracted text from uploaded paper documents is never committed directly to the database without explicit human review and confirmation by a health worker.
6. **Uncertainty Fallback**: If patient symptom descriptions are ambiguous or unclassified, the assistant explicitly recommends connecting with a local ASHA worker or visiting the nearest PHC.
7. **No Clinical Validation Claim**: The AI features in this prototype are intended strictly for navigation assistance and demonstration; they have not undergone formal clinical trials.

---

## Security

* **Authentication**: Stateless, cryptographically signed JSON Web Tokens (JWT) stored in secure HTTP-only cookies.
* **Role-Based Access Control (RBAC)**: Backend enforcement verifying role permissions on every API route handler via `lib/auth.ts`.
* **Password Hashing**: User passwords hashed using `bcryptjs` with salt rounds = 10.
* **Cryptographic QR Tokens**: Prescriptions generate HMAC-SHA256 signed opaque reference tokens (`lib/qr.ts`). The QR code payload contains zero raw patient identifiers, names, diagnoses, or medications.
* **Privacy-Safe Audit Logging**: Sensitive operations emit an immutable log entry to the `AuditEvent` table recording actor ID, role, action, target resource, outcome, and timestamp. Audit metadata contains no raw patient PHI.
* **Input Validation**: API route payloads are validated using TypeScript interfaces and Zod schemas.
* **SQL Injection Immunity**: Prisma ORM executes parameterized queries exclusively; zero raw SQL string concatenation.
* **Known Limitations**: In this evaluation prototype, JWT secrets and QR signing keys use development default fallbacks if environment variables are omitted. Production deployment requires mandatory key rotation.

---

## Healthcare Interoperability

### FHIR R4 Standards Support: `IMPLEMENTED`
JeevanSetu implements standard bidirectional mapping functions in `packages/healthcare/fhir.ts`:
* **`FhirPatient`**: Maps internal patient demographics, ABHA identifiers (`https://healthid.ndhm.gov.in`), address, and telecom.
* **`FhirOrganization`**: Maps facility details, National Facility Registry identifiers (`https://facility.ndhm.gov.in`), and facility tier types.
* **`FhirPractitioner`**: Maps doctor credentials and Healthcare Professional Registry (HPR) identifiers.
* **`FhirEncounter`**: Maps clinical encounters with standard HL7 ActCode class codes (`VR` Virtual / `AMB` Ambulatory).
* **`FhirMedicationRequest`**: Maps prescribed drugs, dosages, route, frequency, and instructions.
* **`FhirServiceRequest`**: Maps diagnostic laboratory and radiology orders.

### ABDM Adapter Architecture: `MOCKED FOR PROTOTYPE`
* The ABDM integration is architected around a clean TypeScript contract: `IAbdmIntegrationProvider` (`packages/healthcare/abdm.ts`).
* For the Smart India Hackathon prototype, this interface is backed by `MockAbdmIntegrationProvider` (`ABDM_MOCK_ENABLED="true"`).
* This provides realistic simulation of ABHA verification, care context linking (`CARE-CTX-...`), and consent requests without requiring live National Health Authority (NHA) Sandbox API gateway certificates.

### Future Integration: `PLANNED`
* Transitioning to the live ABDM gateway requires implementing the official NHA cryptographic token bridge against the existing `IAbdmIntegrationProvider` interface.

---

## API Reference

The application exposes 37 modular REST API endpoints under `/api`:

| Domain | Route | Methods | Description |
|---|---|---|---|
| **Auth** | `/api/auth/login` | `POST` | Authenticate user via phone/password; sets JWT session |
| | `/api/auth/me` | `GET` | Retrieve current authenticated user profile and role |
| | `/api/auth/logout` | `POST` | Clear session cookie |
| **Patients** | `/api/patients` | `GET`, `POST` | Search registered patients; register new patient |
| | `/api/patients/[id]` | `GET`, `PATCH` | Patient demographics, ABHA number, risk level |
| | `/api/patients/[id]/summary` | `GET` | Clinical snapshot (conditions, vitals, active Rx) |
| | `/api/patients/[id]/timeline` | `GET` | Consolidated longitudinal medical timeline |
| **Facilities** | `/api/facilities` | `GET` | Search facilities by type, emergency, teleconsult |
| | `/api/facilities/[id]` | `GET`, `PATCH` | Facility profile; admin capability toggles |
| | `/api/facilities/[id]/medicines`| `GET`, `PATCH` | Facility medicine inventory and stock levels |
| **Appointments** | `/api/appointments` | `GET`, `POST` | List and schedule outpatient appointments |
| | `/api/appointments/[id]/cancel` | `POST` | Cancel appointment |
| | `/api/appointments/[id]/reschedule` | `POST` | Reschedule appointment date/time slot |
| **Queues** | `/api/queues` | `GET` | Retrieve active district OPD queues |
| | `/api/queues/[id]` | `GET` | Detailed queue entries ordered by priority |
| | `/api/queues/[id]/call-next` | `POST` | Call next waiting patient by priority and token |
| | `/api/queues/[id]/check-in` | `POST` | Check patient in upon physical or virtual arrival |
| | `/api/queues/[id]/priority` | `POST` | Override queue priority triage level |
| **Teleconsult** | `/api/teleconsultations` | `GET`, `POST` | List and create assisted teleconsult sessions |
| | `/api/teleconsultations/[id]` | `GET`, `PATCH` | Session status, room tokens, participant state |
| **Prescriptions**| `/api/prescriptions` | `GET`, `POST` | List prescriptions; issue signed Rx with QR |
| | `/api/prescriptions/[id]` | `GET` | Prescription details, items, digital signature |
| | `/api/prescriptions/qr-verify` | `POST` | Validate HMAC-SHA256 opaque QR reference token |
| **Diagnostics** | `/api/diagnostics/orders` | `GET`, `POST` | List diagnostic orders; order new test |
| | `/api/diagnostics/orders/[id]`| `GET`, `PATCH` | Test details; update status, record results |
| **Referrals** | `/api/referrals` | `GET`, `POST` | List referrals; initiate closed-loop transfer |
| | `/api/referrals/[id]` | `GET`, `PATCH` | Referral details; advance lifecycle status |
| **Medicines** | `/api/medicines` | `GET` | District-wide medicine inventory search |
| **Follow-Ups** | `/api/followups` | `GET`, `POST` | Scheduled follow-up appointments |
| | `/api/followups/[id]` | `GET`, `PATCH` | Follow-up status; high-risk escalation |
| **Sync** | `/api/sync/push` | `POST` | Ingest offline draft vitals from IndexedDB |
| | `/api/sync/pull` | `GET` | Fetch delta updates for client cache |
| **Documents** | `/api/documents` | `GET`, `POST` | Upload and list patient clinical documents |
| | `/api/documents/ocr` | `POST` | Simulated OCR extraction with confidence scores |
| **AI** | `/api/ai/triage` | `POST` | Deterministic clinical triage and safety rules |
| **FHIR** | `/api/fhir/[resourceType]` | `GET` | Export records in standard FHIR R4 JSON format |
| **Admin** | `/api/admin/metrics` | `GET` | System operational KPIs and travel avoided |
| | `/api/admin/audit-logs` | `GET` | Immutable compliance and security audit stream |

---

## Database

* **Engine**: SQLite for local evaluation (`prisma/dev.db`); PostgreSQL 16 compatible for production.
* **ORM**: Prisma ORM with 23 relational models.
* **Major Models**:
  * `User`: System accounts, phone, role, password hash.
  * `Patient`: ABHA number, demographics, village, district, risk level, assigned ASHA.
  * `Practitioner`: Medical registration number, specialty, qualification, teleconsultation flag.
  * `Facility`: Facility tier, GPS coordinates, emergency status, teleconsult hub flag, bed count.
  * `Department`: Clinical wings (Orthopedics, Pediatrics, OB/GYN, General Medicine).
  * `Appointment` & `QueueEntry`: Digital OPD tokens, time slots, priority level, queue status.
  * `Queue`: Active daily outpatient queues.
  * `Encounter`: Clinical consultation records, chief complaints, assessment, notes.
  * `Observation`: LOINC-coded vital signs (BP, pulse, weight, SpO2) and interpretations.
  * `Condition`: ICD-10 coded active diagnoses.
  * `Prescription` & `PrescriptionItem`: Electronic prescriptions, items, signed QR reference tokens.
  * `DiagnosticOrder`: Lab/imaging orders, status progression, abnormal findings flag.
  * `Referral`: Closed-loop patient transfer records across facilities.
  * `FollowUp`: Care follow-up tracking with automated high-risk escalation.
  * `Medicine` & `FacilityInventory`: Essential drug catalog and facility stock counts.
  * `AuditEvent`: Privacy-safe security and compliance access logs.
  * `Consent`: ABDM electronic consent records.
  * `Document`: Uploaded scanned prescriptions and clinical files.
  * `SyncOperation`: Client-server offline sync reconciliation ledger.
  * `GovernmentService`: Verified public health schemes (PM-JAY, JSY, Tele-MANAS, RBSK).
* **Seed Dataset**: Populated by `scripts/seed.mjs` representing **Maharashtra Demo District** (20 facilities, 50 practitioners, 150 patients, 12 essential medicines, complete clinical encounters).

---

## Testing

The repository contains a fully automated test suite:

```bash
# 1. Run Vitest Unit and Integration Tests (24 tests)
npm test

# 2. Run Automated 10-Step Hero Demo Journey Test
npm run test:e2e

# 3. TypeScript Strict Typecheck (Zero errors)
npm run typecheck

# 4. Next.js Production Build Verification (50 pages compiled)
npm run build

# 5. Linting Check
npm run lint

# 6. Combined Full Validation
npm run validate
```

### Test Suite Summary
* **`tests/unit/triage.test.ts` (8 tests)**: Validates English, Hindi, and Marathi red-flag escalation, Orthopedics routing, pediatric safety, and human-in-the-loop fallback.
* **`tests/unit/qr.test.ts` (4 tests)**: Validates HMAC-SHA256 signature generation, zero PHI leakage, tamper rejection, and token expiration.
* **`tests/unit/fhir.test.ts` (5 tests)**: Validates `FhirPatient`, `FhirOrganization`, `FhirEncounter` mapping, and ABDM provider care context generation.
* **`tests/integration/api.test.ts` (7 tests)**: Validates facility queries, hero patient data, signed prescriptions, diagnostic orders, and closed-loop referrals against the database.
* **`scripts/run-e2e-hero.mjs` (10 steps)**: Programmatically verifies the complete Anand Patil clinical journey from AI intake to teleconsultation, prescription, X-ray result, district referral, and travel distance calculation.

---

## Docker

The repository includes production container configuration in `infrastructure/docker/`:

### Multi-Container Architecture (`docker-compose.yml`)
1. **`db`**: PostgreSQL 16 Alpine container with health check probe and persistent volume (`postgres_data`).
2. **`web`**: Multi-stage Node.js 20 Alpine container running Next.js in standalone production mode.
3. **`ai-service`**: Python 3.11 Slim container running the FastAPI microservice via Uvicorn.

### Launching with Docker Compose
```bash
# Build and start all services
docker compose -f infrastructure/docker/docker-compose.yml up -d --build

# Run database schema push inside the web container
docker compose -f infrastructure/docker/docker-compose.yml exec web npx prisma db push

# Seed the database
docker compose -f infrastructure/docker/docker-compose.yml exec web node scripts/seed.mjs
```

---

## Configuration

Important configuration settings in `.env`:

| Variable | Purpose | Evaluation Value | Production Note |
|---|---|---|---|
| `DATABASE_URL` | Prisma database connection string | `file:./prisma/dev.db` | Use `postgresql://user:pwd@host:5432/db` |
| `JWT_SECRET` | Secret key for signing session tokens | Development demo key | Must be set to a secure 64-char hex key |
| `QR_SIGNING_KEY` | HMAC-SHA256 secret for QR reference tokens | Development demo key | Must be set to a secure 64-char hex key |
| `AI_PROVIDER` | AI triage provider mode | `mock-rules` | In-app deterministic rules |
| `MAPS_PROVIDER` | Map service provider mode | `mock-geo` | Coordinate calculation |
| `ABDM_MOCK_ENABLED`| Enable mock ABDM adapter | `true` | Set `false` when connecting to live NHA gateway |
| `STORAGE_PROVIDER` | Document storage provider | `local` | Configure S3/GCS bucket in production |
| `PORT` | Web server listening port | `3000` | Port 3000 |

---

## Project Limitations

In the interest of full academic and technical transparency:
* **Mocked Government Gateways**: ABDM M1, M2, and M3 workflows utilize interface-compliant mock adapters (`MockAbdmIntegrationProvider`). Live NHA gateway integration requires official production onboarding and digital certificates.
* **Simulated Teleconsultation Video**: The teleconsultation interface utilizes a WebRTC adapter with simulated video streaming for hackathon demonstration rather than an external paid video cloud service.
* **Seeded Medicine Inventory**: Medicine stock levels reflect the seeded dataset of 20 facilities in Maharashtra Demo District; live integration with State Drug Logistics Systems (e.g., DVDMS) is not connected.
* **AI is Not a Diagnostic System**: The AI triage component performs urgency classification and department routing based on deterministic safety rules. It does not replace clinical diagnosis by a licensed medical practitioner.
* **Production Deployment Requirements**: Real-world deployment requires formal clinical safety audits, state health department approvals, DISHA compliance certification, and hardened cloud infrastructure.

---

## Future Roadmap

### Phase 1: SIH Prototype (Current)
* [x] Multi-tier facility discovery and care pathway routing.
* [x] Deterministic AI symptom triage with emergency red-flag interruption.
* [x] Assisted teleconsultation linking Sub-centres to Rural Hospitals.
* [x] Digital OPD queue management with priority overrides.
* [x] Electronic prescriptions with HMAC-SHA256 privacy-safe QR reference tokens.
* [x] Closed-loop district referral tracking.
* [x] Offline-first PWA with IndexedDB sync queue for ASHA workers.
* [x] Paper document OCR with confidence scoring and human verification.
* [x] Multilingual localization in English, Hindi, and Marathi.
* [x] HL7 FHIR R4 mappers and ABDM interface adapters.

### Phase 2: Production Hardening
* [ ] PostgreSQL migration and database connection pooling (PgBouncer).
* [ ] WebRTC peer-to-peer audio/video streaming via coturn STUN/TURN servers.
* [ ] Cloud object storage adapter (AWS S3 / Google Cloud Storage) for scanned documents.
* [ ] Automated SMS notification gateway integration via CDAC / NIC SMS Gateway.

### Phase 3: ABDM & Government Integration
* [ ] Direct integration with official National Health Authority (NHA) ABDM Sandbox.
* [ ] Aadhaar-based OTP authentication for ABHA creation.
* [ ] Integration with state e-Aushadhi / DVDMS drug logistics databases.
* [ ] Integration with 108 Emergency Ambulance Dispatch Computer-Aided Dispatch (CAD).

### Phase 4: Native Mobile Application
* [ ] Native Android application for ASHA/ANM workers using React Native / Flutter.
* [ ] Direct Bluetooth pairing with digital medical devices (BP monitors, glucometers, pulse oximeters).
* [ ] On-device voice input for Marathi and Hindi speech-to-text.

### Phase 5: District & State Scale
* [ ] Multi-tenant architecture supporting multiple districts and states.
* [ ] Epidemiological surveillance heatmaps for communicable disease outbreaks.
* [ ] Federated reporting to State Health Mission dashboards.

---

## Smart India Hackathon Alignment

| Smart India Hackathon Requirement | JeevanSetu Implementation |
|---|---|
| **Assisted Teleconsultation** | Implemented: Sub-centre to Rural Hospital video connect assisted by ASHA workers |
| **Appointment & Queue Management** | Implemented: Digital token allocation with priority triage overrides |
| **Digital Triage & Emergency Escalation**| Implemented: Deterministic red-flag detection with instant chat lock and 108 referral |
| **Continuity of Care & Longitudinal Records**| Implemented: Unified medical timeline under national ABHA health identifiers |
| **Closed-Loop Referrals** | Implemented: Stepper-tracked referrals (`CREATED` -> `COMPLETED`) with 84% completion |
| **Diagnostic Coordination** | Implemented: Order-to-result tracking with abnormal finding flags |
| **Medicine Availability Transparency** | Implemented: 12 essential medicines tracked across 20 facilities with low-stock alerts |
| **High-Risk Patient Follow-Up** | Implemented: Automated ASHA home-visit task escalation for missed visits |
| **Facility Operations & Quality Dashboards**| Implemented: District command dashboard, facility governance, and audit log inspector |
| **Multilingual Accessibility** | Implemented: Full localization across English, Hindi, and Marathi |
| **Low-Connectivity Resilience** | Implemented: IndexedDB (Dexie.js) offline caching and background sync queue |
| **Healthcare Interoperability** | Implemented: HL7 FHIR R4 mappers and ABDM M1/M2/M3 interface adapters |
| **Reduced Patient Travel** | Implemented: **252 km** rural travel avoided in demo dataset via teleconsultation |
| **Reduced Outpatient Waiting** | Implemented: Average wait time reduced to 24 minutes via digital tokens |

---

## Important Safety Notice

> [!WARNING]
> **Prototype Demonstration Notice**:  
> **JeevanSetu** is an academic and technical prototype developed for the **Smart India Hackathon**. It does not replace qualified medical professionals, registered medical practitioners, official emergency services (`108`), or government healthcare authorities.
> 
> The artificial intelligence functionality is designed strictly for navigation assistance and facility matching; it **does not independently diagnose illnesses or prescribe medications**. All medical prescriptions and diagnostic orders within the system must be issued by licensed physicians. In medical emergencies, citizens should immediately contact emergency ambulance services (`108`) or proceed to the nearest casualty department.

---

## License

License has not yet been specified.
