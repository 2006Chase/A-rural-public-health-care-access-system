# JeevanSetu — FHIR R4 & ABDM Interoperability Specification

## 1. Overview & Healthcare Standards
To ensure nationwide healthcare interoperability and future-proof integration into India's public health stack, **JeevanSetu** adheres to:
- **HL7 FHIR Release 4 (R4)**: Global standard for exchanging electronic health records.
- **Ayushman Bharat Digital Mission (ABDM)**: National standards established by the National Health Authority (NHA), Government of India.
- **SNOMED CT & LOINC**: Standardized terminology for conditions, symptoms, and clinical observations.

---

## 2. Resource Mapping Table

| JeevanSetu Internal Model | FHIR R4 Resource | ABDM Identifier System / Vocabulary |
|---|---|---|
| `Patient` | `Patient` | `https://healthid.ndhm.gov.in` (14-digit ABHA Number) |
| `Facility` | `Organization` | `https://facility.ndhm.gov.in` (National Facility Registry ID) |
| `Practitioner` | `Practitioner` | `https://hpr.ndhm.gov.in` (Healthcare Professional Registry) |
| `Encounter` | `Encounter` | `http://terminology.hl7.org/CodeSystem/v3-ActCode` (`VR` / `AMB`) |
| `Observation` (Vitals) | `Observation` | LOINC (e.g., `8480-6` Systolic BP, `8462-4` Diastolic BP) |
| `Condition` | `Condition` | ICD-10 / SNOMED CT (`M17.0` Bilateral Knee Osteoarthritis) |
| `Prescription` | `MedicationRequest` | India National List of Essential Medicines (NLEM 2022) |
| `DiagnosticOrder` | `ServiceRequest` | LOINC Radiology & Pathology categories |
| `Consent` | `Consent` | ABDM Electronic Consent Framework |

---

## 3. ABDM Milestone Architecture (M1, M2, M3)

JeevanSetu implements clean interface boundaries defined in `packages/healthcare/abdm.ts`:

```
                    +-------------------------------------+
                    |       JEEVANSETU CLINICAL CORE      |
                    +-------------------------------------+
                                       |
                                       v
                    +-------------------------------------+
                    |     IAbdmIntegrationProvider        |
                    +-------------------------------------+
                                       |
         +-----------------------------+-----------------------------+
         |                             |                             |
         v                             v                             v
+------------------+         +--------------------+        +--------------------+
|   MILESTONE 1    |         |    MILESTONE 2     |        |    MILESTONE 3     |
|  ABHA Management |         |  HIP (Data Provider|        |  HIU (Data User)   |
| - ABHA issuance  |         | - Link Care Context|        | - Consent artifact |
| - OTP validation |         | - FHIR bundle pack |        | - Secure transfer  |
| - Demo verification        | - Health repository|        | - Timeline decrypt |
+------------------+         +--------------------+        +--------------------+
```

### 1. Milestone 1: ABHA Registration & Verification
- Validates 14-digit formatted ABHA strings: `91-XXXX-XXXX-XXXX`.
- Links village demographic profiles with national identity without storing raw Aadhaar numbers.

### 2. Milestone 2: Health Information Provider (HIP)
- On prescription signing or encounter completion, creates an ABDM care context:
  `CARE-CTX-PRESCRIPTION-RX-2026-0818`
- Packages clinical observations, medication requests, and diagnostic results into a signed FHIR Document Bundle.

### 3. Milestone 3: Health Information User (HIU)
- Requests patient digital consent for inter-facility referral reviews (`AbdmConsentRequest`).
- Handles consent state lifecycle: `REQUESTED` -> `GRANTED` -> `REVOKED`.

---

## 4. Prototype & Production Boundary Statement

> [!NOTE]
> **Hackathon & Evaluation Notice**:
> In this Smart India Hackathon prototype, the ABDM adapter is backed by `MockAbdmIntegrationProvider` (`ABDM_MOCK_ENABLED="true"`). This allows evaluators to simulate complete ABHA verification, care context linking, and consent workflows without requiring live NHA Sandbox API credentials or external network connectivity.
> 
> The adapter strictly implements the production `IAbdmIntegrationProvider` TypeScript interface, enabling seamless drop-in transition to the official National Health Authority ABDM Gateway via production environment variables.
