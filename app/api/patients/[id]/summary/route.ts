import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;

  if (auth.user.role === 'PATIENT' && auth.user.patientId !== id) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Unauthorized patient access.' }, { status: 403 });
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      conditions: { where: { clinicalStatus: 'ACTIVE' } },
      observations: { take: 10, orderBy: { recordedAt: 'desc' } },
      prescriptions: {
        where: { status: { in: ['SIGNED', 'ACTIVE'] } },
        take: 3,
        orderBy: { signedAt: 'desc' },
        include: { items: true, facility: { select: { name: true } }, practitioner: { select: { fullName: true } } },
      },
      diagnosticOrders: {
        where: { status: { in: ['ORDERED', 'SCHEDULED', 'SAMPLE_COLLECTED', 'PROCESSING', 'RESULT_READY'] } },
        orderBy: { orderedAt: 'desc' },
        include: { facility: { select: { name: true } } },
      },
      referrals: {
        where: { status: { in: ['CREATED', 'ACCEPTED', 'SCHEDULED', 'PATIENT_ARRIVED', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'desc' },
        include: {
          receivingFacility: { select: { name: true, phone: true } },
          referringFacility: { select: { name: true } },
        },
      },
      followUps: {
        where: { status: 'PENDING' },
        orderBy: { scheduledDate: 'asc' },
        take: 2,
        include: { facility: { select: { name: true } } },
      },
      encounters: {
        take: 3,
        orderBy: { startedAt: 'desc' },
        include: {
          facility: { select: { name: true } },
          practitioner: { select: { fullName: true, specialty: true } },
        },
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Patient not found.' }, { status: 404 });
  }

  // Calculate age from dateOfBirth
  const birthYear = new Date(patient.dateOfBirth).getFullYear();
  const age = new Date().getFullYear() - birthYear;

  // Flatten active medications from active prescriptions
  const activeMedications = patient.prescriptions.flatMap((rx) =>
    rx.items.map((item) => ({
      name: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency,
      instructions: item.instructions,
      prescribedBy: rx.practitioner.fullName,
      facility: rx.facility.name,
      prescribedOn: rx.signedAt,
    }))
  );

  const summary = {
    patient: {
      id: patient.id,
      nationalHealthId: patient.nationalHealthId,
      fullName: patient.fullName,
      age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      village: patient.village,
      district: patient.district,
      allergies: patient.allergies || 'None recorded',
      riskLevel: patient.riskLevel,
      riskReason: patient.riskReason,
    },
    activeConditions: patient.conditions.map((c) => ({
      title: c.title,
      category: c.category,
      severity: c.severity,
      onsetDate: c.onsetDate,
    })),
    recentVitals: patient.observations.map((obs) => ({
      name: obs.name,
      value: obs.value,
      unit: obs.unit,
      interpretation: obs.interpretation,
      recordedAt: obs.recordedAt,
      recordedBy: obs.recordedBy,
    })),
    activeMedications,
    pendingDiagnosticOrders: patient.diagnosticOrders.map((d) => ({
      id: d.id,
      orderNumber: d.orderNumber,
      testName: d.testName,
      category: d.testCategory,
      status: d.status,
      orderedAt: d.orderedAt,
      facility: d.facility.name,
      abnormalFlag: d.abnormalFlag,
      resultSummary: d.resultSummary,
    })),
    activeReferrals: patient.referrals.map((r) => ({
      id: r.id,
      referralNumber: r.referralNumber,
      specialty: r.requestedSpecialty,
      status: r.status,
      dueDate: r.dueDate,
      destinationFacility: r.receivingFacility.name,
      destinationPhone: r.receivingFacility.phone,
      reason: r.reason,
    })),
    nextFollowUp: patient.followUps[0]
      ? {
          id: patient.followUps[0].id,
          scheduledDate: patient.followUps[0].scheduledDate,
          reason: patient.followUps[0].reason,
          facility: patient.followUps[0].facility.name,
          priority: patient.followUps[0].priority,
        }
      : null,
    recentEncounters: patient.encounters.map((e) => ({
      id: e.id,
      encounterNumber: e.encounterNumber,
      date: e.startedAt,
      type: e.type,
      facility: e.facility.name,
      doctor: e.practitioner.fullName,
      specialty: e.practitioner.specialty,
      chiefComplaint: e.chiefComplaint,
      assessment: e.assessment,
    })),
  };

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'PATIENT_SUMMARY_ACCESSED',
    resource: 'Patient',
    resourceId: id,
  });

  return NextResponse.json({ success: true, data: summary });
}
