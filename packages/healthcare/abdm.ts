// ABDM (Ayushman Bharat Digital Mission) Interoperability Adapter
// Provides clean integration boundaries for M1 (ABHA creation), M2 (HIP records), and M3 (HIU data exchange)

export interface AbdmHealthRecordReference {
  careContextReference: string;
  display: string;
  patientReference: string;
  hiType: 'Prescription' | 'DiagnosticReport' | 'DischargeSummary' | 'OPConsultation';
}

export interface AbdmConsentRequest {
  patientAbhaId: string;
  purpose: 'CareProvision' | 'PublicHealth' | 'Emergency';
  hiTypes: string[];
  dateRange: { from: string; to: string };
  requesterFacilityId: string;
}

export interface AbdmConsentResponse {
  consentRequestId: string;
  status: 'REQUESTED' | 'GRANTED' | 'DENIED' | 'REVOKED';
  timestamp: string;
}

export interface IAbdmIntegrationProvider {
  createHealthRecordReference(patientId: string, recordType: string, recordId: string): Promise<AbdmHealthRecordReference>;
  requestConsent(request: AbdmConsentRequest): Promise<AbdmConsentResponse>;
  shareHealthRecord(consentId: string, fhirBundleJson: string): Promise<{ transactionId: string; status: string }>;
  retrieveAuthorizedRecord(consentArtifactId: string): Promise<{ records: any[] }>;
  resolveFacility(facilityRegistryId: string): Promise<{ name: string; verified: boolean }>;
  resolveProfessional(hprId: string): Promise<{ name: string; specialty: string; verified: boolean }>;
}

export class MockAbdmIntegrationProvider implements IAbdmIntegrationProvider {
  private isDemoMode = true;

  async createHealthRecordReference(patientId: string, recordType: string, recordId: string): Promise<AbdmHealthRecordReference> {
    return {
      careContextReference: `CARE-CTX-${recordType.toUpperCase()}-${recordId.substring(0, 8)}`,
      display: `JeevanSetu ${recordType} Record #${recordId.substring(0, 6)}`,
      patientReference: patientId,
      hiType: recordType === 'Prescription' ? 'Prescription' : 'OPConsultation',
    };
  }

  async requestConsent(request: AbdmConsentRequest): Promise<AbdmConsentResponse> {
    return {
      consentRequestId: `CR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'GRANTED', // Simulated user acceptance for Hackathon demonstration
      timestamp: new Date().toISOString(),
    };
  }

  async shareHealthRecord(consentId: string, fhirBundleJson: string): Promise<{ transactionId: string; status: string }> {
    return {
      transactionId: `TX-ABDM-${Date.now()}`,
      status: 'DELIVERED_TO_HEALTH_REPOSITORY',
    };
  }

  async retrieveAuthorizedRecord(consentArtifactId: string): Promise<{ records: any[] }> {
    return {
      records: [
        {
          source: 'Mock ABDM National Health Repository',
          notice: 'Demo interoperability adapter (Section 52 & 85)',
          verified: true,
        },
      ],
    };
  }

  async resolveFacility(facilityRegistryId: string): Promise<{ name: string; verified: boolean }> {
    return {
      name: 'Demonstration Health Facility (Verified in Mock Registry)',
      verified: true,
    };
  }

  async resolveProfessional(hprId: string): Promise<{ name: string; specialty: string; verified: boolean }> {
    return {
      name: 'Demonstration Medical Practitioner (HPR-Verified)',
      specialty: 'General Medicine / Orthopedics',
      verified: true,
    };
  }
}

export const abdmProvider = new MockAbdmIntegrationProvider();
