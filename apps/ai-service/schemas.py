from pydantic import BaseModel, Field
from typing import List, Optional

class TriageRequest(BaseModel):
    symptoms: str = Field(..., description="Free text description of symptoms in English, Hindi, or Marathi")
    patient_id: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    known_conditions: Optional[List[str]] = Field(default_factory=list)

class TriageResponse(BaseModel):
    urgency: str = Field(..., description="emergency | urgent | routine")
    urgency_reason: str
    recommended_department: str
    recommended_service_type: str
    confidence: float
    requires_human_review: bool = True
    escalation_required: bool = False
    user_facing_advice: str
    facility_requirements: List[str]

class ExtractedMedication(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    confidence: float

class OcrRequest(BaseModel):
    document_type: str = Field(default="PRESCRIPTION", description="PRESCRIPTION | LAB_REPORT | DISCHARGE_CARD")
    base64_image: Optional[str] = None
    sample_preset: Optional[str] = None

class OcrResponse(BaseModel):
    extracted_text: str
    document_type: str
    doctor_name: Optional[str] = None
    facility_name: Optional[str] = None
    date: Optional[str] = None
    diagnosis: Optional[str] = None
    medications: List[ExtractedMedication]
    overall_confidence: float
    needs_human_verification: bool = True
