// FHIR R4 Interoperability Mapper for JeevanSetu
// Adheres to HL7 FHIR Release 4 and India ABDM Health Data Standards

export interface FhirPatient {
  resourceType: 'Patient';
  id: string;
  identifier: Array<{
    system: string;
    value: string;
  }>;
  active: boolean;
  name: Array<{
    use: string;
    text: string;
  }>;
  telecom: Array<{
    system: 'phone' | 'email';
    value: string;
    use?: string;
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address: Array<{
    line: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country: string;
  }>;
}

export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id: string;
  identifier: Array<{
    system: string;
    value: string;
  }>;
  active: boolean;
  name: Array<{
    text: string;
  }>;
  qualification: Array<{
    code: {
      text: string;
    };
  }>;
}

export interface FhirOrganization {
  resourceType: 'Organization';
  id: string;
  identifier: Array<{
    system: string;
    value: string;
  }>;
  name: string;
  type: Array<{
    text: string;
  }>;
  telecom: Array<{
    system: 'phone';
    value: string;
  }>;
  address: Array<{
    text: string;
    district?: string;
    state?: string;
  }>;
}

export interface FhirEncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'in-progress' | 'finished' | 'cancelled';
  class: {
    system: string;
    code: string;
    display: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  participant: Array<{
    individual: {
      reference: string;
      display: string;
    };
  }>;
  period: {
    start: string;
    end?: string;
  };
  reasonCode: Array<{
    text: string;
  }>;
}

export interface FhirObservation {
  resourceType: 'Observation';
  id: string;
  status: 'final';
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
  };
  valueString?: string;
  interpretation?: Array<{
    text: string;
  }>;
}

export interface FhirMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  status: 'active' | 'completed' | 'cancelled' | 'draft';
  intent: 'order';
  medicationCodeableConcept: {
    text: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  authoredOn: string;
  requester: {
    reference: string;
    display: string;
  };
  dosageInstruction: Array<{
    text: string;
    timing?: {
      code?: {
        text: string;
      };
    };
  }>;
}

export interface FhirServiceRequest {
  resourceType: 'ServiceRequest';
  id: string;
  status: 'active' | 'completed' | 'revoked';
  intent: 'order';
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  code: {
    text: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  authoredOn: string;
  requester: {
    reference: string;
  };
  performer?: Array<{
    reference: string;
  }>;
}

export class FhirMapper {
  static toFhirPatient(patient: any): FhirPatient {
    return {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [
        {
          system: 'https://healthid.ndhm.gov.in',
          value: patient.nationalHealthId || 'UNKNOWN',
        },
      ],
      active: true,
      name: [{ use: 'official', text: patient.fullName }],
      telecom: [{ system: 'phone', value: patient.phone, use: 'mobile' }],
      gender: patient.gender === 'MALE' ? 'male' : patient.gender === 'FEMALE' ? 'female' : 'other',
      birthDate: patient.dateOfBirth,
      address: [
        {
          line: [patient.address || patient.village || ''],
          district: patient.district,
          state: patient.state,
          postalCode: patient.pinCode,
          country: 'India',
        },
      ],
    };
  }

  static toFhirOrganization(facility: any): FhirOrganization {
    return {
      resourceType: 'Organization',
      id: facility.id,
      identifier: [
        {
          system: 'https://facility.ndhm.gov.in',
          value: facility.code,
        },
      ],
      name: facility.name,
      type: [{ text: facility.type }],
      telecom: [{ system: 'phone', value: facility.phone }],
      address: [
        {
          text: facility.address,
          district: facility.district,
          state: facility.state,
        },
      ],
    };
  }

  static toFhirEncounter(encounter: any, patientName: string, doctorName: string): FhirEncounter {
    return {
      resourceType: 'Encounter',
      id: encounter.id,
      status: encounter.status === 'FINISHED' ? 'finished' : 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: encounter.type === 'TELECONSULT' ? 'VR' : 'AMB',
        display: encounter.type === 'TELECONSULT' ? 'Virtual' : 'Ambulatory',
      },
      subject: {
        reference: `Patient/${encounter.patientId}`,
        display: patientName,
      },
      participant: [
        {
          individual: {
            reference: `Practitioner/${encounter.practitionerId}`,
            display: doctorName,
          },
        },
      ],
      period: {
        start: new Date(encounter.startedAt).toISOString(),
        end: encounter.endedAt ? new Date(encounter.endedAt).toISOString() : undefined,
      },
      reasonCode: [{ text: encounter.chiefComplaint }],
    };
  }

  static toFhirObservation(obs: any): FhirObservation {
    return {
      resourceType: 'Observation',
      id: obs.id,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: obs.code,
            display: obs.name,
          },
        ],
        text: obs.name,
      },
      subject: {
        reference: `Patient/${obs.patientId}`,
      },
      effectiveDateTime: new Date(obs.recordedAt).toISOString(),
      valueString: `${obs.value} ${obs.unit}`,
      interpretation: [{ text: obs.interpretation }],
    };
  }

  static toFhirMedicationRequest(rx: any, item: any, patientName: string, doctorName: string): FhirMedicationRequest {
    return {
      resourceType: 'MedicationRequest',
      id: `${rx.id}-${item.id || 'item'}`,
      status: rx.status === 'SIGNED' || rx.status === 'ACTIVE' ? 'active' : 'completed',
      intent: 'order',
      medicationCodeableConcept: {
        text: `${item.medicineName} (${item.dosage}, ${item.form})`,
      },
      subject: {
        reference: `Patient/${rx.patientId}`,
        display: patientName,
      },
      authoredOn: new Date(rx.signedAt || rx.createdAt).toISOString(),
      requester: {
        reference: `Practitioner/${rx.practitionerId}`,
        display: doctorName,
      },
      dosageInstruction: [
        {
          text: `${item.frequency} for ${item.durationDays} days. ${item.instructions || ''}`,
          timing: {
            code: {
              text: item.frequency,
            },
          },
        },
      ],
    };
  }
}
