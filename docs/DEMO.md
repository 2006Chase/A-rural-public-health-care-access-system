# JeevanSetu — 5-Minute Evaluator & Hackathon Demo Guide

## Welcome Evaluators
This guide provides a structured, 5-minute walk-through of **JeevanSetu** designed specifically for Smart India Hackathon jury members, healthcare specialists, and system evaluators.

Evaluators can access the **Interactive 1-Click Demo Hub** at `/demo` or switch between the 4 persona accounts directly via the top demo switcher banner.

---

## Pre-Requisites & Starting the Application

To run the platform locally on any machine:
```bash
# 1. Start development server
npm run dev

# 2. Open browser
http://localhost:3000
```
*(The local SQLite database and 20 demo facilities are already seeded and ready to use).*

---

## 4 Guided Evaluator Journeys

### Journey 1: The Core Hero Journey — Anand Patil (Knee Pain & Travel Barrier)
**Goal**: Demonstrate how assisted teleconsultation, digital queues, signed electronic prescriptions, and closed-loop referrals eliminate 28+ km of rural travel for an elderly farmer.

1. **Step 1 — Citizen AI Symptom Intake (`/patient/ai-intake`)**:
   - Log in or switch to **Citizen (Patient)** mode via the top banner.
   - Enter: *"I have severe bilateral knee pain, difficulty walking and long-distance travel is very painful."*
   - Observe the explainable AI triage response: Classified as **Urgent**, routes to **Orthopedics**, and recommends **Assisted Teleconsultation** to prevent rural travel fatigue.
   - Click **"Request Assisted Teleconsult"**.

2. **Step 2 — Frontline Health Worker (ASHA Sunita) Assistance (`/worker`)**:
   - Switch role to **Health Worker (ASHA/ANM)**.
   - Open patient Anand Patil's profile and click **"Record Vitals"** (`/worker/vitals`).
   - Observe recorded vitals: Blood Pressure `130/84 mmHg`, Pulse `76 bpm`, Weight `74 kg`.
   - Initiate the assisted video connection to Shirur Rural Hospital.

3. **Step 3 — Specialist Doctor Consultation (`/doctor/consult`)**:
   - Switch role to **Specialist Doctor (Dr. Rajesh Deshmukh)**.
   - Observe the 3-panel clinical workstation:
     - *Left Panel*: Anand Patil's summary, village (Kendur), ABHA identifier, vitals.
     - *Middle Panel*: Active consultation notes, diagnosis (*Bilateral Knee Osteoarthritis Kellgren-Lawrence Grade II*), 3-drug prescription builder (Paracetamol 500mg, Calcium+Vit D3, Diclofenac SOS).
     - *Right Panel*: Longitudinal medical timeline and previous encounter history.
   - Click **"Sign & Generate Digital Prescription"**.
   - Note the generation of a **cryptographically signed, privacy-safe HMAC-SHA256 QR code** and order for bilateral knee digital X-ray.

4. **Step 4 — Continuum of Care & District Referral (`/doctor/records?tab=referrals`)**:
   - Review the closed-loop referral from Shirur Rural Hospital to Maharashtra District Hospital for orthopedic joint preservation.
   - Track status transition from `SCHEDULED` to `PATIENT_ARRIVED` and `COMPLETED`.

---

### Journey 2: Emergency Red-Flag Triage & Conversation Interruption
**Goal**: Verify hard clinical safety boundaries and deterministic red-flag escalation.

1. Navigate to `/patient/ai-intake` or click the **"Emergency Triage"** card on `/demo`.
2. Enter: *"Severe crushing chest pain radiating to left arm and cold sweat"* (or in Marathi: *"छातीत तीव्र दुखणे आणि श्वास घेण्यास त्रास"*).
3. **Observe**:
   - The conversational input is **immediately interrupted and disabled**.
   - An alarming high-priority emergency banner appears.
   - The nearest 24x7 emergency facility (**Shirur Rural Hospital Emergency Ward**) is highlighted.
   - Direct emergency CTA buttons appear: **"Call Emergency Ambulance (108)"** and **"Get Directions"**.

---

### Journey 3: Paper Document OCR & Frontline Verification
**Goal**: Demonstrate how legacy paper prescriptions and test slips are digitized without risking error.

1. Switch role to **Health Worker** and open **"Scan Paper Record"** (`/worker/ocr`).
2. Click **"Select Sample: Ortho Prescription"** to simulate an uploaded handwritten doctor slip.
3. Observe side-by-side verification screen:
   - Extracted medicines display individual confidence scores (*Paracetamol: 96%*, *Calcium: 91%*).
   - Health worker can edit dosages directly.
   - Click **"Verify & Commit to Clinical Timeline"**.
   - Open patient timeline (`/patient/timeline`) to see the digitized record permanently attached to Anand Patil's medical history.

---

### Journey 4: Offline Resilience & Automatic Sync
**Goal**: Demonstrate reliable vitals capture during complete network blackouts.

1. On the Health Worker Dashboard, click **"Record Vitals"** (`/worker/vitals`).
2. Toggle the **"Simulate Offline Mode"** switch at the top of the form (or disconnect your network/Wi-Fi).
3. Notice the amber connectivity banner: *"Working Offline — Data will sync automatically when reconnected"*.
4. Enter patient vitals (e.g. BP `120/80 mmHg`, Pulse `72 bpm`) and click **"Save Vitals Record"**.
5. Observe: Form saves instantly to client-side IndexedDB with status **"Saved Offline (Pending Sync: 1)"**.
6. Toggle offline mode back to **Online**:
   - Watch the animated sync indicator cycle from *Syncing...* to *Synced*.
   - All captured records are cleanly reconciled with the backend without data loss.

---

## 5. System Quality Indicators & Travel Avoidance (`/admin/quality`)
Visit the District Health Quality Center (`/admin/quality`) to observe:
- **Estimated Rural Travel Distance Avoided**: `252 km` (calculated from completed teleconsultations × 28 km average return journey avoided).
- **Referral Loop Closure**: `84%` completed closed-loop rate (vs. ~35% in paper-based systems).
- **Average Outpatient Wait Time**: `24 minutes` with digital token allocation (vs. 3-4 hours in unmanaged rural queues).
- **Essential Drug Availability**: `92%` availability across 20 district health facilities.
