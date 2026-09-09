# JeevanSetu — REST API Reference

## 1. Overview
All JeevanSetu APIs are RESTful, communicate over JSON, and enforce role-based authentication via session cookies and bearer tokens.

### Common Response Schema
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

---

## 2. Authentication & Session APIs

### `POST /api/auth/login`
Authenticates a user by phone or email. Supports development demo quick-switches.
- **Request Body**:
  ```json
  { "phone": "+91 98220 11223", "password": "Password123!" }
  ```
- **Response**: Set-Cookie with signed JWT token; returns user profile and permissions.

### `GET /api/auth/me`
Retrieves current authenticated session profile, assigned facility, and role.

### `POST /api/auth/logout`
Clears session token cookie.

---

## 3. Patient Care & Timeline APIs

### `GET /api/patients`
List registered patients with filters: `district`, `village`, `riskLevel`, `search`, `limit`.

### `GET /api/patients/:id`
Retrieves patient demographics, ABHA number, assigned ASHA worker, and emergency contacts.

### `GET /api/patients/:id/summary`
Clinical snapshot: active conditions, recent vitals, current medications, pending appointments.

### `GET /api/patients/:id/timeline`
Consolidated longitudinal medical timeline: encounters, prescriptions, vitals, and test results.

---

## 4. Facility Discovery & Digital Queues

### `GET /api/facilities`
Find facilities matching filters: `type`, `ownership` (`GOVERNMENT`/`PRIVATE`), `hasEmergency`, `hasTeleconsult`, `department`.

### `GET /api/facilities/:id`
Comprehensive facility details, departments, active queues, and doctor schedules.

### `PATCH /api/facilities/:id`
*(Admin only)* Updates facility capabilities: `hasEmergency`, `hasTeleconsult`, `hasPharmacy`, `bedCount`.

### `GET /api/queues`
Retrieves live OPD queues across district facilities.

### `GET /api/queues/:id`
Retrieves queue details and all entries ordered by priority (`EMERGENCY` > `URGENT` > `HIGH` > `ROUTINE`).

### `POST /api/queues/:id/call-next`
Calls the next waiting patient in the queue by priority and token number.

### `POST /api/queues/:id/priority`
Doctor/worker override of patient queue priority:
```json
{ "queueEntryId": "entry-uuid", "priority": "EMERGENCY", "reason": "Severe acute chest pain" }
```

### `POST /api/queues/:id/check-in`
Checks patient in upon physical or virtual arrival.

---

## 5. Clinical Encounters, Prescriptions & QR Tokens

### `POST /api/prescriptions`
Issue a signed electronic prescription. Automatically generates an HMAC-SHA256 privacy-safe QR token.
- **Request Body**:
  ```json
  {
    "patientId": "pat-uuid",
    "facilityId": "fac-uuid",
    "encounterId": "enc-uuid",
    "diagnosisSummary": "Bilateral Knee Osteoarthritis",
    "instructions": "Take after meals",
    "items": [
      {
        "medicineName": "Paracetamol 500mg",
        "dosage": "500 mg",
        "form": "TABLET",
        "frequency": "BD",
        "durationDays": 14
      }
    ]
  }
  ```

### `POST /api/prescriptions/qr-verify`
Validates an opaque QR reference token. Checks HMAC signature and expiration:
- **Request Body**: `{ "token": "base64url-token-string" }`
- **Response**: `{ "valid": true, "prescription": { ... } }`

---

## 6. Diagnostic Orders & Closed-Loop Referrals

### `GET /api/diagnostics/orders`
List diagnostic tests ordered, filtered by `patientId`, `facilityId`, `status`.

### `POST /api/diagnostics/orders`
Order new lab or radiology test: `{ "patientId": "...", "testName": "Digital X-Ray Knee AP", "category": "RADIOLOGY" }`

### `PATCH /api/diagnostics/orders/:id`
Update diagnostic status (`SAMPLE_COLLECTED`, `RESULT_READY`, `REVIEWED`) and record results.

### `GET /api/referrals`
List inter-facility referrals.

### `POST /api/referrals`
Create closed-loop referral to secondary/tertiary hospital.

### `PATCH /api/referrals/:id`
Advance referral lifecycle (`ACCEPTED`, `SCHEDULED`, `PATIENT_ARRIVED`, `COMPLETED`).

---

## 7. Sync, AI & Admin Operations

### `POST /api/sync/push`
Upload offline draft vitals from IndexedDB sync queue.

### `POST /api/ai/triage`
Deterministic clinical triage engine. Returns urgency level, recommended department, and explainable advice.

### `POST /api/documents/ocr`
Extracts structured prescription items and confidence scores from paper documents.

### `GET /api/admin/metrics`
Operational KPIs: referral completion rate, average wait time, and estimated rural travel distance avoided (km).

### `GET /api/admin/audit-logs`
Tamper-evident compliance stream of signed prescriptions, QR scans, and patient access events.
