from schemas import OcrRequest, OcrResponse, ExtractedMedication

def extract_document_data(req: OcrRequest) -> OcrResponse:
    """
    Extracts clinical information from uploaded paper documents (prescriptions/labs).
    Includes simulated OCR parsing, confidence scoring, and human verification flags.
    """
    if req.sample_preset == "hero_ortho_prescription" or "knee" in (req.base64_image or "").lower():
        return OcrResponse(
            extracted_text="Shirur Rural Hospital - Orthopedics OPD\nDr. Rajesh Deshmukh, MS (Ortho)\nPt: Anand Patil (54M) - Kendur\nRx: Paracetamol 500mg BD x 14d, Calcium + Vit D3 OD x 30d, Diclofenac 50mg SOS x 5d\nAdv: Digital X-Ray Bilateral Knees",
            document_type="PRESCRIPTION",
            doctor_name="Dr. Rajesh Deshmukh",
            facility_name="Shirur Rural Hospital",
            date="2026-08-18",
            diagnosis="Bilateral Osteoarthritis Knee (Grade II)",
            medications=[
                ExtractedMedication(
                    name="Paracetamol 500mg",
                    dosage="500 mg",
                    frequency="BD (Twice Daily)",
                    duration="14 days",
                    confidence=0.96
                ),
                ExtractedMedication(
                    name="Calcium + Vitamin D3",
                    dosage="500mg + 250 IU",
                    frequency="OD (Once Daily)",
                    duration="30 days",
                    confidence=0.91
                ),
                ExtractedMedication(
                    name="Diclofenac Sodium 50mg",
                    dosage="50 mg",
                    frequency="SOS (As needed)",
                    duration="5 days",
                    confidence=0.88
                )
            ],
            overall_confidence=0.92,
            needs_human_verification=True
        )

    # General prescription mock parser
    return OcrResponse(
        extracted_text="Primary Health Centre - OPD Prescription\nDr. Priya Sharma, MBBS\nPt: Meena Kale (58F)\nRx: Amlodipine 5mg OD x 30d, Telmisartan 40mg OD x 30d\nAdv: Low sodium diet, monthly BP check",
        document_type="PRESCRIPTION",
        doctor_name="Dr. Priya Sharma",
        facility_name="Shirur Primary Health Centre",
        date="2026-08-25",
        diagnosis="Essential Hypertension Stage II",
        medications=[
            ExtractedMedication(
                name="Amlodipine 5mg",
                dosage="5 mg",
                frequency="OD (Once Daily)",
                duration="30 days",
                confidence=0.94
            ),
            ExtractedMedication(
                name="Telmisartan 40mg",
                dosage="40 mg",
                frequency="OD (Once Daily)",
                duration="30 days",
                confidence=0.89
            )
        ],
        overall_confidence=0.91,
        needs_human_verification=True
    )
