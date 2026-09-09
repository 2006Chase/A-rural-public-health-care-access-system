import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const encounters = await prisma.encounter.findMany({
    where: {
      type: 'TELECONSULT',
      status: status || undefined,
    },
    orderBy: { startedAt: 'desc' },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          village: true,
          preferredLanguage: true,
          riskLevel: true,
        },
      },
      practitioner: {
        select: {
          id: true,
          fullName: true,
          specialty: true,
        },
      },
      facility: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      appointment: true,
    },
  });

  return NextResponse.json({ success: true, count: encounters.length, data: encounters });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { patientId, practitionerId, facilityId, chiefComplaint, symptoms, vitals } = body;

    const targetPatientId = patientId || auth.user.patientId;
    if (!targetPatientId || !facilityId) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Patient and facility are required.' }, { status: 400 });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const encounterNumber = `TEL-${dateFormatted}-${randomSuffix}`;

    // Find available practitioner in that facility if not specified
    let targetDocId = practitionerId;
    if (!targetDocId) {
      const doc = await prisma.practitioner.findFirst({
        where: { facilityId, isAvailable: true, teleconsultActive: true },
      });
      targetDocId = doc?.id;
    }

    if (!targetDocId) {
      const fallbackDoc = await prisma.practitioner.findFirst({ where: { facilityId } });
      targetDocId = fallbackDoc?.id;
    }

    // Format vitals summary string
    let vitalsSummary = null;
    if (vitals) {
      vitalsSummary = `BP: ${vitals.systolicBp || 120}/${vitals.diastolicBp || 80} mmHg, Pulse: ${vitals.heartRate || 72} bpm, Temp: ${vitals.temperature || 98.4}°F, SpO2: ${vitals.spO2 || 98}%`;
    }

    const encounter = await prisma.encounter.create({
      data: {
        encounterNumber,
        patientId: targetPatientId,
        practitionerId: targetDocId,
        facilityId,
        type: 'TELECONSULT',
        status: 'IN_PROGRESS',
        chiefComplaint: chiefComplaint || 'Assisted teleconsultation request',
        symptoms: symptoms || null,
        vitalsSummary,
        assessment: 'Awaiting doctor clinical evaluation',
        startedAt: new Date(),
      },
      include: {
        patient: true,
        practitioner: true,
        facility: true,
      },
    });

    // If vitals provided, create Observations
    if (vitals) {
      const observationsToCreate = [];
      if (vitals.systolicBp) {
        observationsToCreate.push({
          patientId: targetPatientId,
          encounterId: encounter.id,
          category: 'VITAL_SIGNS',
          code: 'SYSTOLIC_BP',
          name: 'Systolic Blood Pressure',
          value: vitals.systolicBp.toString(),
          unit: 'mmHg',
          interpretation: vitals.systolicBp > 140 ? 'HIGH' : 'NORMAL',
          recordedBy: auth.user.name,
        });
      }
      if (vitals.heartRate) {
        observationsToCreate.push({
          patientId: targetPatientId,
          encounterId: encounter.id,
          category: 'VITAL_SIGNS',
          code: 'HEART_RATE',
          name: 'Pulse Rate',
          value: vitals.heartRate.toString(),
          unit: 'bpm',
          interpretation: 'NORMAL',
          recordedBy: auth.user.name,
        });
      }
      if (observationsToCreate.length > 0) {
        await prisma.observation.createMany({ data: observationsToCreate });
      }
    }

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'TELECONSULT_INITIATED',
      resource: 'Encounter',
      resourceId: encounter.id,
      facilityId,
      metadata: { encounterNumber, patientId: targetPatientId },
    });

    return NextResponse.json({ success: true, data: encounter }, { status: 201 });
  } catch (error: any) {
    console.error('Teleconsult creation error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to initiate teleconsultation.' }, { status: 500 });
  }
}
