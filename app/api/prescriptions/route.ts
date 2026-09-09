import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { createSignedQrToken } from '@/lib/qr';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  const facilityId = searchParams.get('facilityId');

  const whereClause: any = {};
  if (patientId) whereClause.patientId = patientId;
  if (facilityId) whereClause.facilityId = facilityId;

  const prescriptions = await prisma.prescription.findMany({
    where: whereClause,
    orderBy: { signedAt: 'desc' },
    include: {
      items: true,
      practitioner: { select: { fullName: true, specialty: true, qualification: true } },
      facility: { select: { name: true, type: true, phone: true } },
      patient: { select: { fullName: true, nationalHealthId: true, gender: true, dateOfBirth: true } },
    },
  });

  return NextResponse.json({ success: true, count: prescriptions.length, data: prescriptions });
}

export async function POST(req: NextRequest) {
  const auth = await requireRoles(req, ['DOCTOR']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { encounterId, patientId, facilityId, diagnosisSummary, instructions, items, followUpDays } = body;

    if (!patientId || !facilityId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Patient, facility, and at least one medicine item are required.' }, { status: 400 });
    }

    const doctorProfile = await prisma.practitioner.findFirst({
      where: { userId: auth.user.userId },
    });

    const practitionerId = doctorProfile?.id || auth.user.practitionerId;
    if (!practitionerId) {
      return NextResponse.json({ code: 'DOCTOR_PROFILE_NOT_FOUND', message: 'Practitioner profile required to issue prescriptions.' }, { status: 400 });
    }

    const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
    const facilityCode = facility?.code || 'FAC-GOV';

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const prescriptionNumber = `RX-${dateFormatted}-${randomSuffix}`;

    // Generate signed, privacy-safe QR token (Section 27, 74, 98)
    const qr = createSignedQrToken(prescriptionNumber, `DOC-${prescriptionNumber}`, facilityCode, patientId, 30);

    // If no encounterId passed, create one
    let targetEncounterId = encounterId;
    if (!targetEncounterId) {
      const newEnc = await prisma.encounter.create({
        data: {
          encounterNumber: `ENC-${dateFormatted}-${randomSuffix}`,
          patientId,
          practitionerId,
          facilityId,
          chiefComplaint: diagnosisSummary || 'Outpatient consultation',
          assessment: diagnosisSummary || 'Clinical evaluation',
          status: 'FINISHED',
        },
      });
      targetEncounterId = newEnc.id;
    }

    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNumber,
        encounterId: targetEncounterId,
        patientId,
        practitionerId,
        facilityId,
        status: 'SIGNED',
        diagnosisSummary: diagnosisSummary || 'Clinical Prescription',
        instructions: instructions || 'Take all medications strictly as directed after food.',
        qrReferenceToken: qr.token,
        qrTokenSignature: qr.signature,
        qrExpiresAt: qr.expiresAt,
        signedAt: new Date(),
        signedBy: doctorProfile ? `${doctorProfile.fullName}, ${doctorProfile.qualification}` : auth.user.name,
        items: {
          create: items.map((item: any) => ({
            medicineName: item.medicineName,
            genericName: item.genericName || item.medicineName,
            dosage: item.dosage || '1 tablet',
            form: item.form || 'TABLET',
            route: item.route || 'ORAL',
            frequency: item.frequency || 'BD',
            durationDays: Number(item.durationDays) || 5,
            instructions: item.instructions || 'After meals',
            quantity: Number(item.quantity) || 10,
            isAvailableInFacility: item.isAvailableInFacility !== undefined ? Boolean(item.isAvailableInFacility) : true,
          })),
        },
      },
      include: {
        items: true,
        practitioner: true,
        facility: true,
      },
    });

    // Automatic Follow-Up Creation (Section 19: Follow up in X days)
    if (followUpDays && Number(followUpDays) > 0) {
      const followUpDate = new Date(Date.now() + Number(followUpDays) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await prisma.followUp.create({
        data: {
          encounterId: targetEncounterId,
          patientId,
          practitionerId,
          facilityId,
          scheduledDate: followUpDate,
          reason: `Follow-up in ${followUpDays} days to assess response to medication for ${diagnosisSummary}`,
          status: 'PENDING',
          priority: 'MEDIUM',
          notes: `Automated follow-up created during electronic prescription #${prescriptionNumber}`,
        },
      });
    }

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'PRESCRIPTION_FINALIZED',
      resource: 'Prescription',
      resourceId: prescription.id,
      facilityId,
      metadata: { prescriptionNumber, itemCount: items.length, followUpDays },
    });

    return NextResponse.json({ success: true, data: prescription }, { status: 201 });
  } catch (error: any) {
    console.error('Prescription issuance error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to issue prescription.' }, { status: 500 });
  }
}
