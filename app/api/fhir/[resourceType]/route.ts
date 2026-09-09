import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FhirMapper } from '@/packages/healthcare/fhir';

export async function GET(req: NextRequest, context: { params: Promise<{ resourceType: string }> }) {
  const { resourceType } = await context.params;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || searchParams.get('_id');

  try {
    if (resourceType === 'Patient') {
      if (id) {
        const patient = await prisma.patient.findUnique({ where: { id } });
        if (!patient) return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found' }] }, { status: 404 });
        return NextResponse.json(FhirMapper.toFhirPatient(patient));
      }

      const patients = await prisma.patient.findMany({ take: 10 });
      return NextResponse.json({
        resourceType: 'Bundle',
        type: 'searchset',
        total: patients.length,
        entry: patients.map((p) => ({ resource: FhirMapper.toFhirPatient(p) })),
      });
    }

    if (resourceType === 'Organization') {
      if (id) {
        const facility = await prisma.facility.findUnique({ where: { id } });
        if (!facility) return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found' }] }, { status: 404 });
        return NextResponse.json(FhirMapper.toFhirOrganization(facility));
      }

      const facilities = await prisma.facility.findMany({ take: 20 });
      return NextResponse.json({
        resourceType: 'Bundle',
        type: 'searchset',
        total: facilities.length,
        entry: facilities.map((f) => ({ resource: FhirMapper.toFhirOrganization(f) })),
      });
    }

    if (resourceType === 'Observation') {
      const observations = await prisma.observation.findMany({
        where: id ? { id } : {},
        take: 15,
        orderBy: { recordedAt: 'desc' },
      });

      return NextResponse.json({
        resourceType: 'Bundle',
        type: 'searchset',
        total: observations.length,
        entry: observations.map((o) => ({ resource: FhirMapper.toFhirObservation(o) })),
      });
    }

    return NextResponse.json(
      {
        resourceType: 'OperationOutcome',
        issue: [{ severity: 'warning', code: 'not-supported', diagnostics: `FHIR resourceType '${resourceType}' adapter registered for mock ABDM interoperability.` }],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('FHIR API Error:', error);
    return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'fatal', code: 'exception', diagnostics: error.message }] }, { status: 500 });
  }
}
