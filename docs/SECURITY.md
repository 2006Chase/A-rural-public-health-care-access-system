# JeevanSetu — Security & Privacy Architecture

## 1. Security Overview & Regulatory Compliance
**JeevanSetu** is architected to satisfy healthcare data protection standards including the **Digital Information Security in Healthcare Act (DISHA)**, **Digital Personal Data Protection Act (DPDPA 2023)**, and **Ayushman Bharat Digital Mission (ABDM)** guidelines.

Public health systems operating in rural contexts face dual constraints: they must safeguard sensitive patient data while remaining accessible to low-literacy citizens and frontline health workers using shared or mobile devices.

---

## 2. Privacy-Safe Cryptographic QR Token Architecture

### The Problem with Traditional QR Prescriptions
Conventional digital prescriptions frequently encode patient names, national health identifiers, diagnoses, and drug lists directly into the QR matrix. In rural environments:
- Paper slips are handed to family members, auto-rickshaw drivers, and village intermediaries.
- Anyone with a standard smartphone camera can scan and read the patient's full medical history.
- Counterfeit paper slips can easily be generated with modified drug quantities.

### The JeevanSetu Cryptographic Solution
JeevanSetu issues **signed, opaque QR reference tokens** that contain **zero readable Protected Health Information (PHI)**.

```
+-----------------------------------------------------------------------------------+
|                           PRESCRIPTION CREATION (DOCTOR)                          |
|  1. Doctor writes prescription in consultation workstation                        |
|  2. System creates SHA-256 one-way hash of patient ID: Hash(patientId)            |
|  3. System constructs payload: recordId | docId | facilityCode | hash | exp       |
|  4. HMAC-SHA256 signature generated using server secret: HMAC(payload, SECRET)    |
|  5. Payload + Signature base64url encoded -> Opaque QR Matrix                     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                              PHYSICAL QR PAPER SLIP                               |
|  Matrix content:                                                                  |
|  eyJ0eXBlIjoiaGVhbHRoLXJlY29yZC1yZWZlcmVuY2UiLCJyZWNvcmRJZCI6IlJYLT...            |
|  (Contains ZERO patient names, ZERO diagnoses, ZERO medicine names)               |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                       SCANNING AT REFERRAL PHARMACY / LAB                         |
|  1. Authenticated worker/doctor scans QR via JeevanSetu scanner                   |
|  2. Signature recomputed and verified against tamper detection                    |
|  3. Token expiration checked (default: 30 days)                                   |
|  4. Authenticated backend securely resolves record reference under active session |
|  5. Audit event logged: "QR_SCANNED" (Actor: WORKER_ID, Outcome: SUCCESS)         |
+-----------------------------------------------------------------------------------+
```

### Verification Guarantees
- **Zero PHI Exposure**: Third-party camera apps scan the code and observe only an unresolvable base64 reference string.
- **Tamper Evidence**: Modifying the prescription number, facility code, or date breaks the HMAC-SHA256 signature and triggers an immediate alert.
- **Auto-Expiration**: Prescriptions automatically expire after 30 days, preventing unauthorized dispensing of stale regimens.

---

## 3. Role-Based Access Control (RBAC)
All REST API endpoints enforce least-privilege role boundaries using `lib/auth.ts`:

| Role | Permitted Actions | Restricted Actions |
|---|---|---|
| `PATIENT` | View own timeline, search facilities, request appointments, view own signed QR | Cannot access other patients' records, write prescriptions, or order tests |
| `HEALTH_WORKER` | Search village patients, capture vitals, initiate teleconsultations, scan QR | Cannot prescribe medicines or cancel specialist appointments |
| `DOCTOR` | Clinical consultation, issue electronic prescriptions, order diagnostics, referrals | Cannot modify administrative billing or facility credentials |
| `FACILITY_ADMIN`| Manage facility inventory, adjust duty rosters, review facility queue | Cannot tamper with clinical notes or sign medical prescriptions |
| `SYSTEM_ADMIN` | Full district oversight, audit trail inspection, quality metrics | Governed by mandatory audit event logging for all accesses |

---

## 4. Privacy-Safe Audit Trail
All security-sensitive and clinical actions emit an immutable record to the `AuditEvent` table:
- **Actor Identification**: `actorId`, `actorRole`, `facilityId`
- **Action Code**: e.g., `PRESCRIPTION_SIGNED`, `QR_SCANNED`, `QUEUE_CHECK_IN`, `DIAGNOSTIC_ORDERED`
- **Target Resource**: `resource`, `resourceId`
- **Outcome**: `SUCCESS` or `FAILURE`
- **Timestamp**: ISO-8601 UTC timestamp
- **Zero Raw PHI in Metadata**: Audit metadata stores only reference tokens, test names, or count adjustments, never patient identities.

---

## 5. Defense-in-Depth Measures
1. **Password Hashing**: User passwords hashed using `bcryptjs` with salt rounds = 10.
2. **SQL Injection Prevention**: Prisma ORM uses parameterized queries exclusively. Zero raw SQL string interpolation.
3. **Cross-Site Scripting (XSS)**: Next.js and React 19 escape all dynamic data. Sanitized HTML rendering.
4. **Secrets Management**: Cryptographic signing secrets and JWT keys are loaded exclusively from environment variables (`.env`). Default demo fallbacks are restricted to development mode.
