import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;

  if (auth.user.role === 'PATIENT' && auth.user.patientId !== id) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Unauthorized timeline access.' }, { status: 403 });
  }

  const [encounters, prescriptions, diagnosticOrders, referrals, followUps, observations, documents] = await Promise.all([
    prisma.encounter.findMany({
      where: { patientId: id },
      orderBy: { startedAt: 'desc' },
      include: {
        facility: { select: { name: true } },
        practitioner: { select: { fullName: true, specialty: true } },
      },
    }),
    prisma.prescription.findMany({
      where: { patientId: id },
      orderBy: { signedAt: 'desc' },
      include: {
        items: true,
        facility: { select: { name: true } },
        practitioner: { select: { fullName: true } },
      },
    }),
    prisma.diagnosticOrder.findMany({
      where: { patientId: id },
      orderBy: { orderedAt: 'desc' },
      include: { facility: { select: { name: true } } },
    }),
    prisma.referral.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        referringFacility: { select: { name: true } },
        receivingFacility: { select: { name: true, phone: true } },
      },
    }),
    prisma.followUp.findMany({
      where: { patientId: id },
      orderBy: { scheduledDate: 'desc' },
      include: { facility: { select: { name: true } } },
    }),
    prisma.observation.findMany({
      where: { patientId: id },
      orderBy: { recordedAt: 'desc' },
      take: 20,
    }),
    prisma.document.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Transform each domain event into a unified chronological timeline item
  const timelineEvents: any[] = [];

  for (const enc of encounters) {
    timelineEvents.push({
      id: enc.id,
      type: 'CONSULTATION',
      timestamp: enc.startedAt,
      title: `${enc.type === 'TELECONSULT' ? 'Virtual Teleconsultation' : 'Outpatient Consultation'} - ${enc.practitioner.specialty}`,
      subtitle: `${enc.practitioner.fullName} at ${enc.facility.name}`,
      details: {
        chiefComplaint: enc.chiefComplaint,
        assessment: enc.assessment,
        vitalsSummary: enc.vitalsSummary,
        plan: enc.plan,
      },
      status: enc.status,
    });
  }

  for (const rx of prescriptions) {
    timelineEvents.push({
      id: rx.id,
      type: 'PRESCRIPTION',
      timestamp: rx.signedAt,
      title: `Electronic Prescription #${rx.prescriptionNumber}`,
      subtitle: `${rx.signedBy} at ${rx.facility.name}`,
      details: {
        diagnosisSummary: rx.diagnosisSummary,
        instructions: rx.instructions,
        medicationCount: rx.items.length,
        items: rx.items.map((i) => ({
          name: i.medicineName,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: `${i.durationDays} days`,
          available: i.isAvailableInFacility,
        })),
        qrReferenceToken: rx.qrReferenceToken,
      },
      status: rx.status,
    });
  }

  for (const d of diagnosticOrders) {
    timelineEvents.push({
      id: d.id,
      type: 'DIAGNOSTIC',
      timestamp: d.resultReadyAt || d.orderedAt,
      title: `${d.testName} (${d.testCategory})`,
      subtitle: d.facility.name,
      details: {
        orderNumber: d.orderNumber,
        status: d.status,
        resultSummary: d.resultSummary,
        abnormalFlag: d.abnormalFlag,
        instructions: d.instructions,
      },
      status: d.status,
    });
  }

  for (const ref of referrals) {
    timelineEvents.push({
      id: ref.id,
      type: 'REFERRAL',
      timestamp: ref.createdAt,
      title: `Referral to ${ref.receivingFacility.name}`,
      subtitle: `Requested Specialty: ${ref.requestedSpecialty}`,
      details: {
        referralNumber: ref.referralNumber,
        reason: ref.reason,
        clinicalSummary: ref.clinicalSummary,
        dueDate: ref.dueDate,
        destinationPhone: ref.receivingFacility.phone,
        patientAcknowledged: ref.patientAcknowledged,
      },
      status: ref.status,
    });
  }

  for (const f of followUps) {
    timelineEvents.push({
      id: f.id,
      type: 'FOLLOW_UP',
      timestamp: new Date(f.scheduledDate).toISOString(),
      title: `Care Follow-Up (${f.priority} Priority)`,
      subtitle: f.facility.name,
      details: {
        reason: f.reason,
        notes: f.notes,
        isHighRiskEscalated: f.isHighRiskEscalated,
      },
      status: f.status,
    });
  }

  for (const doc of documents) {
    timelineEvents.push({
      id: doc.id,
      type: 'DOCUMENT',
      timestamp: doc.createdAt,
      title: doc.title,
      subtitle: `Type: ${doc.type.replace('_', ' ')} (${doc.verificationStatus})`,
      details: {
        fileUrl: doc.fileUrl,
        ocrConfidence: doc.ocrConfidenceScore,
        verificationStatus: doc.verificationStatus,
      },
      status: doc.verificationStatus,
    });
  }

  // Sort descending by timestamp
  timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'TIMELINE_ACCESSED',
    resource: 'PatientTimeline',
    resourceId: id,
  });

  return NextResponse.json({ success: true, count: timelineEvents.length, data: timelineEvents });
}
