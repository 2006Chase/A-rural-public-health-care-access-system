// Shared Domain Types & Contracts for JeevanSetu

export type Role = 'PATIENT' | 'HEALTH_WORKER' | 'DOCTOR' | 'FACILITY_ADMIN' | 'SYSTEM_ADMIN';

export type UserProfile = {
  id: string;
  email?: string | null;
  phone: string;
  name: string;
  role: Role;
  facilityId?: string | null;
  patientId?: string | null;
  practitionerId?: string | null;
  avatarUrl?: string | null;
};

export type FacilityType =
  | 'SUB_CENTRE'
  | 'PHC'
  | 'RURAL_HOSPITAL'
  | 'SUB_DISTRICT_HOSPITAL'
  | 'DISTRICT_HOSPITAL'
  | 'PRIVATE_HOSPITAL'
  | 'DIAGNOSTIC_CENTRE';

export type OwnershipType = 'GOVERNMENT' | 'PRIVATE';

export type PriorityLevel = 'EMERGENCY' | 'URGENT' | 'HIGH' | 'ROUTINE';

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_QUEUE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export type QueueStatus = 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';

export type DiagnosticStatus =
  | 'ORDERED'
  | 'SCHEDULED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'RESULT_READY'
  | 'REVIEWED'
  | 'CANCELLED';

export type ReferralStatus =
  | 'CREATED'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'PATIENT_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export type RiskLevel = 'ROUTINE' | 'MEDIUM' | 'HIGH';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';

export interface VitalsData {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  temperature?: number;
  spO2?: number;
  respiratoryRate?: number;
  bloodGlucose?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  recordedAt: string;
}

export interface PrescriptionMedicineItem {
  id?: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  form: 'TABLET' | 'SYRUP' | 'INJECTION' | 'CAPSULE' | 'OINTMENT';
  route: 'ORAL' | 'TOPICAL' | 'INTRAVENOUS' | 'INTRAMUSCULAR';
  frequency: 'OD' | 'BD' | 'TID' | 'QID' | 'SOS';
  durationDays: number;
  instructions?: string;
  quantity: number;
  isAvailableInFacility: boolean;
}

export interface SignedQrPayload {
  type: 'health-record-reference';
  recordId: string;
  documentId: string;
  facilityCode: string;
  patientIdHash: string; // Non-reversible hash, zero raw PHI
  version: number;
  issuedAt: string;
  expiresAt: string;
  signature: string; // HMAC-SHA256 signature
}

export interface AITriageResult {
  urgency: 'emergency' | 'urgent' | 'routine';
  urgencyReason: string;
  recommendedDepartment: string;
  recommendedServiceType: 'TELECONSULT' | 'IN_PERSON_PHC' | 'DISTRICT_HOSPITAL' | 'EMERGENCY_CARE';
  requiresHumanReview: boolean;
  confidence: number;
  escalationRequired: boolean;
  userFacingAdvice: string;
  facilityRequirements: string[];
}

export interface OperationalQualityMetrics {
  totalPatientsServed: number;
  averageWaitTimeMinutes: number;
  referralCompletionRate: number;
  averageReferralDays: number;
  diagnosticTurnaroundHours: number;
  medicineAvailabilityRate: number;
  teleconsultationVolume: number;
  estimatedTravelDistanceAvoidedKm: number; // Prototype-derived estimate
  highRiskFollowUpRate: number;
}
