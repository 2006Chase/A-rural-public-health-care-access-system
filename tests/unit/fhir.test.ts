import { describe, it, expect } from 'vitest';
import { FhirMapper } from '@/packages/healthcare/fhir';
import { abdmProvider } from '@/packages/healthcare/abdm';

describe('FHIR R4 & ABDM Interoperability Standards Adapter', () => {
  const samplePatient = {
    id: 'pat-hero-001',
    nationalHealthId: '91-8842-1920-3341',
    fullName: 'Anand Patil',
    phone: '+91 98220 11223',
    gender: 'MALE',
    dateOfBirth: '1972-04-14',
    address: 'House 42, Near Gram Panchayat, Kendur',
    village: 'Kendur',
    district: 'Maharashtra Demo District',
    state: 'Maharashtra',
    pinCode: '412403',
  };

  const sampleFacility = {
    id: 'fac-shirur-rh',
    code: 'FAC-GOV-RH-011',
    name: 'Shirur Rural Hospital',
    type: 'RURAL_HOSPITAL',
    phone: '+91 2138 222100',
    address: 'Station Road, Shirur',
    district: 'Maharashtra Demo District',
    state: 'Maharashtra',
  };

  it('should map internal patient domain model to standard FHIR R4 Patient', () => {
    const fhirPatient = FhirMapper.toFhirPatient(samplePatient);

    expect(fhirPatient.resourceType).toBe('Patient');
    expect(fhirPatient.id).toBe('pat-hero-001');
    expect(fhirPatient.identifier[0].system).toBe('https://healthid.ndhm.gov.in');
    expect(fhirPatient.identifier[0].value).toBe('91-8842-1920-3341');
    expect(fhirPatient.gender).toBe('male');
    expect(fhirPatient.name[0].text).toBe('Anand Patil');
    expect(fhirPatient.address[0].country).toBe('India');
  });

  it('should map facility model to standard FHIR R4 Organization', () => {
    const fhirOrg = FhirMapper.toFhirOrganization(sampleFacility);

    expect(fhirOrg.resourceType).toBe('Organization');
    expect(fhirOrg.name).toBe('Shirur Rural Hospital');
    expect(fhirOrg.identifier[0].value).toBe('FAC-GOV-RH-011');
    expect(fhirOrg.type[0].text).toBe('RURAL_HOSPITAL');
  });

  it('should map clinical encounter to standard FHIR R4 Encounter with proper class code', () => {
    const sampleEncounter = {
      id: 'enc-001',
      patientId: samplePatient.id,
      practitionerId: 'doc-001',
      type: 'TELECONSULT',
      status: 'FINISHED',
      startedAt: new Date(),
    };

    const fhirEncounter = FhirMapper.toFhirEncounter(sampleEncounter, 'Anand Patil', 'Dr. Rajesh Deshmukh');

    expect(fhirEncounter.resourceType).toBe('Encounter');
    expect(fhirEncounter.status).toBe('finished');
    expect(fhirEncounter.class.code).toBe('VR'); // Virtual / Teleconsult
    expect(fhirEncounter.subject.display).toBe('Anand Patil');
  });

  it('should generate care context health record reference via ABDM provider', async () => {
    const recordRef = await abdmProvider.createHealthRecordReference(samplePatient.id, 'Prescription', 'RX-2026-0818-099');
    expect(recordRef.careContextReference).toContain('CARE-CTX-PRESCRIPTION');
    expect(recordRef.patientReference).toBe(samplePatient.id);
    expect(recordRef.hiType).toBe('Prescription');
  });

  it('should request consent and share health record bundle via ABDM provider', async () => {
    const consent = await abdmProvider.requestConsent({
      patientAbhaId: samplePatient.nationalHealthId,
      purpose: 'CareProvision',
      hiTypes: ['Prescription', 'OPConsultation'],
      dateRange: { from: '2026-01-01', to: '2026-12-31' },
      requesterFacilityId: sampleFacility.id,
    });
    expect(consent.status).toBe('GRANTED');
    expect(consent.consentRequestId).toBeDefined();

    const shareResult = await abdmProvider.shareHealthRecord(consent.consentRequestId, '{}');
    expect(shareResult.transactionId).toContain('TX-ABDM');
    expect(shareResult.status).toBe('DELIVERED_TO_HEALTH_REPOSITORY');
  });
});
