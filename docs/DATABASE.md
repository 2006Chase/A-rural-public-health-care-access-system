# JeevanSetu — Database Schema & Data Modeling

## 1. Overview & Multi-Engine Compatibility
**JeevanSetu** utilizes **Prisma ORM** with a schema designed for 100% dialect compatibility between:
- **SQLite (Local Embedded / Hackathon Evaluation)**: Zero setup required; runs instantly out of the box on Windows/macOS/Linux.
- **PostgreSQL 16 (Cloud Production / High Availability)**: Production deployment via Docker Compose or managed cloud databases (AWS RDS, Google Cloud SQL, Supabase).

---

## 2. Entity Relationship Overview (23 Models)

```
       +-----------------------+              +-----------------------+
       |         User          |              |       Facility        |
       | (Auth, Role, Phone)   |              | (Sub-centre, PHC, RH) |
       +-----------+-----------+              +-----------+-----------+
                   |                                      |
         +---------+---------+                            |
         |                   |                            v
         v                   v                +-----------------------+
  +--------------+    +--------------+        |      Department       |
  |   Patient    |    | Practitioner |        | (Ortho, Peds, Gyn)    |
  +-------+------+    +-------+------+        +-----------+-----------+
          |                   |                           |
          +---------+---------+                           |
                    |                                     |
                    v                                     v
          +-------------------+               +-----------------------+
          |    Appointment    | <-----------> |         Queue         |
          +---------+---------+               +-----------+-----------+
                    |                                     |
                    v                                     v
          +-------------------+               +-----------------------+
          |     Encounter     |               |      QueueEntry       |
          +---------+---------+               +-----------------------+
                    |
    +---------------+---------------+---------------+
    |               |               |               |
    v               v               v               v
+-------+      +---------+     +---------+     +----------+
|Observation|  |Condition|     |Prescript|     |Diagnostic|
| (Vitals)  |  | (ICD-10)|     | (Signed)|     |  (X-Ray) |
+-----------+  +---------+     +----+----+     +----------+
                                    |
                                    v
                               +---------+
                               | Prescr. |
                               |  Item   |
                               +---------+
```

---

## 3. Core Tables Reference

### 1. Identity & Patients
- `User`: Base credentials, phone, role (`PATIENT`, `HEALTH_WORKER`, `DOCTOR`, `FACILITY_ADMIN`, `SYSTEM_ADMIN`), bcrypt password hash.
- `Patient`: National ABHA Health ID (`91-XXXX-XXXX-XXXX`), demographic data, village, district, preferred language (`mr`, `hi`, `en`), assigned ASHA worker, risk level (`ROUTINE`, `MEDIUM`, `HIGH`).
- `Practitioner`: Medical council registration number, qualification, clinical specialty, consultation fee, teleconsultation status.

### 2. Facilities & Operations
- `Facility`: Classification (`SUB_CENTRE`, `PHC`, `RURAL_HOSPITAL`, `SUB_DISTRICT_HOSPITAL`, `DISTRICT_HOSPITAL`, `PRIVATE_HOSPITAL`), geographic coordinates, 24x7 emergency flag, teleconsultation hub flag, pharmacy flag, diagnostics flag, bed count.
- `Department`: Clinical wings within a facility.
- `Queue` & `QueueEntry`: Digital OPD token management with priority triage levels (`EMERGENCY`, `URGENT`, `HIGH`, `ROUTINE`), token numbers (`ORTHO-014`), check-in timestamps, and call states (`WAITING`, `CALLED`, `IN_SERVICE`, `COMPLETED`).

### 3. Clinical Continuity
- `Encounter`: Clinical consultation record (chief complaint, clinical notes, assessment, plan, teleconsult vs in-person).
- `Observation`: Vital signs (Systolic/Diastolic BP, Pulse, Weight, SpO2, Temperature) with LOINC codes, units, and timestamps.
- `Condition`: Active and chronic diagnoses with ICD-10 codes (`M17.0` Bilateral Knee Osteoarthritis).
- `Prescription` & `PrescriptionItem`: Electronic prescription items with dosage, route, frequency, duration, digital signature, and cryptographic HMAC-SHA256 QR reference token.
- `DiagnosticOrder`: Lab and radiology requests (e.g. Bilateral Knee X-Ray) with lifecycle progression (`ORDERED` -> `SAMPLE_COLLECTED` -> `RESULT_READY` -> `REVIEWED`).
- `Referral`: Closed-loop patient transfer tracking (`CREATED` -> `ACCEPTED` -> `SCHEDULED` -> `PATIENT_ARRIVED` -> `COMPLETED`).
- `FollowUp`: Automated follow-up scheduler with high-risk escalation tasks dispatched to ASHA workers when appointments are missed.

### 4. Pharmacy & Supplies
- `Medicine`: Essential drug catalog with generic name, strength, category, and form.
- `FacilityInventory`: Stock tracking per facility with low-stock thresholds, batch numbers, and expiry dates.

### 5. Compliance & Security
- `Consent`: ABDM electronic consent artifacts.
- `AuditEvent`: Tamper-evident privacy-safe access and action logging.
- `SyncOperation`: Client-server offline reconciliation queue.

---

## 4. Maharashtra Demo District Seed Dataset
The seeded environment (`scripts/seed.mjs`) contains:
- **20 Realistically Positioned Facilities**: Across Shirur, Kendur, Pabal, Khed, Manchar, Daund, and Pune District.
- **50 Medical Practitioners**: Specialists across Orthopedics, Pediatrics, OB/GYN, General Medicine, Cardiology, and General Surgery.
- **150 Rural Patients**: Realistic demographics and health conditions including our Hero Patient Anand Patil (`91-4829-1049-2810`).
- **12 Essential Medicines**: 100% stock mapped across facilities.
- **5 National Healthcare Schemes**: PM-JAY, JSY, Tele-MANAS, RBSK, NPCDCS.
