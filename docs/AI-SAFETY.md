# JeevanSetu — AI Safety, Clinical Governance & Ethics Protocol

## 1. Core Safety Principles
Deploying Artificial Intelligence in rural public healthcare environments introduces critical clinical and ethical liabilities. In low-resource settings, users may place undue trust in automated systems, risking life-threatening diagnostic delay or inappropriate self-treatment.

**JeevanSetu adheres to strict AI Safety Boundaries:**
1. **Zero Autonomous Prescribing**: The system will **never** generate, adjust, or recommend prescription drug dosages to a patient. Only authenticated medical practitioners can create and sign prescriptions.
2. **Zero Autonomous Diagnosing**: The AI triage engine provides **facility and urgency recommendations**, never definitive diagnoses.
3. **Deterministic Safety Rules over Stochastic LLMs**: Red-flag escalation is handled through deterministic keyword and clinical rule tables, immune to model hallucinations or temperature variations.
4. **Mandatory Human-in-the-Loop**: All AI-assisted extraction and triage suggestions require clinician or health worker verification before committing to permanent medical records.

---

## 2. Deterministic Emergency Red-Flag Protocol

When a citizen enters symptoms into the AI intake assistant (`app/patient/ai-intake`), the input is passed through `lib/ai-triage.ts` (and the Python AI microservice `apps/ai-service/triage.py`):

```
                       [Patient Enters Symptoms]
                                  │
                                  ▼
                   ┌──────────────────────────────┐
                   │    Emergency Red-Flag Scan   │
                   └──────────────┬───────────────┘
                                  │
                 Matched Emergency Keyword? (e.g. Chest pain,
                 snakebite, unconscious, severe bleeding)
                                  │
                   ┌──────────────┴──────────────┐
                   │ YES                         │ NO
                   ▼                             ▼
       ┌─────────────────────────┐   ┌─────────────────────────┐
       │   EMERGENCY OVERRIDE    │   │      Triage Router      │
       │ - Chat input locked     │   │ - Orthopedics (Tele)    │
       │ - Red alert banner      │   │ - Maternal / Antenatal  │
       │ - 108 Ambulance button  │   │ - Pediatrics            │
       │ - Nearest 24x7 hospital │   │ - Routine Primary Care  │
       └─────────────────────────┘   └───────────┬─────────────┘
                                                 │
                                                 ▼
                                     ┌─────────────────────────┐
                                     │  Explainable Guidance   │
                                     │  + Department Match     │
                                     └─────────────────────────┘
```

### Emergency Red-Flag Keyword Dictionary
Covering English, Hindi, and Marathi terms:
- `chest pain`, `heart attack`, `छाती में दर्द`, `छातीत दुखणे`
- `difficulty breathing`, `cannot breathe`, `सांस लेने में तकलीफ`, `श्वास घेण्यास त्रास`
- `unconscious`, `fainted`, `बेहोश`, `मूर्च्छा`
- `snake bite`, `सांप का काटना`, `सर्पदंश`
- `seizure`, `convulsions`, `आंचकी`
- `uncontrolled bleeding`, `रक्तस्राव`

---

## 3. Explainability & Transparent Reason Codes
Every triage output is paired with human-readable rationale:
- **Urgency Level**: `EMERGENCY` | `URGENT` | `ROUTINE`
- **Recommended Facility Department**: e.g., `Orthopedics`, `Emergency Medicine`, `Gynecology & Obstetrics`
- **Recommended Care Mode**: `TELECONSULT` (to avoid rural travel fatigue) or `IN_PERSON_PHC`
- **Reason Code**: *"Severe musculoskeletal distress identified with reported difficulty in traveling long distance. Teleconsultation recommended to prevent travel burden."*

---

## 4. Paper Document OCR & Human Verification Protocol

When health workers digitize paper prescriptions or legacy lab reports (`app/worker/ocr`):
1. **Field-Level Confidence Scoring**: Every extracted medication, dose, and frequency is assigned a confidence metric (e.g., *Paracetamol 500mg: 96%*, *Diclofenac: 88%*).
2. **Side-by-Side Verification Interface**: The raw scanned document is presented alongside the extracted form.
3. **Mandatory Clinician Confirmation**: Extracted fields cannot be committed to the longitudinal timeline until the health worker reviews, edits any misrecognized characters, and clicks *"Verify & Commit"*.
