import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRoles } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId') || (auth.user.role === 'PATIENT' ? auth.user.patientId : null);
  const receivingFacilityId = searchParams.get('receivingFacilityId');
  const referringFacilityId = searchParams.get('referringFacilityId');
  const status = searchParams.get('status');

  const whereClause: any = {};
  if (patientId) whereClause.patientId = patientId;
  if (receivingFacilityId) whereClause.receivingFacilityId = receivingFacilityId;
  if (referringFacilityId) whereClause.referringFacilityId = referringFacilityId;
  if (status) whereClause.status = status;

  const referrals = await prisma.referral.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      patient: { select: { id: true, fullName: true, nationalHealthId: true, phone: true, village: true, gender: true } },
      referringFacility: { select: { id: true, name: true, type: true, phone: true } },
      receivingFacility: { select: { id: true, name: true, type: true, phone: true, address: true } },
      referringPractitioner: { select: { fullName: true, specialty: true } },
    },
  });

  return NextResponse.json({ success: true, count: referrals.length, data: referrals });
}

export async function POST(req: NextRequest) {
  const auth = await requireRoles(req, ['DOCTOR', 'HEALTH_WORKER']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { patientId, referringFacilityId, receivingFacilityId, requestedSpecialty, priority, reason, clinicalSummary, dueDate, encounterId } = body;

    if (!patientId || !referringFacilityId || !receivingFacilityId || !reason) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Patient, referring facility, receiving facility, and reason are required.' },
        { status: 400 }
      );
    }

    const doctorProfile = await prisma.practitioner.findFirst({ where: { userId: auth.user.userId } });
    const referringPractitionerId = doctorProfile?.id || auth.user.practitionerId || (await prisma.practitioner.findFirst())?.id;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const referralNumber = `REF-${dateFormatted}-${randomSuffix}`;

    const referral = await prisma.referral.create({
      data: {
        referralNumber,
        encounterId: encounterId || null,
        patientId,
        referringPractitionerId: referringPractitionerId || '',
        referringFacilityId,
        receivingFacilityId,
        requestedSpecialty: requestedSpecialty || 'General Medicine / Surgery',
        priority: priority || 'ROUTINE',
        reason,
        clinicalSummary: clinicalSummary || reason,
        dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'CREATED',
        patientAcknowledged: false,
      },
      include: {
        receivingFacility: true,
        referringFacility: true,
        patient: true,
      },
    });

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'REFERRAL_CREATED',
      resource: 'Referral',
      resourceId: referral.id,
      facilityId: referringFacilityId,
      metadata: { referralNumber, receivingFacility: referral.receivingFacility.name },
    });

    return NextResponse.json({ success: true, data: referral }, { status: 201 });
  } catch (error: any) {
    console.error('Referral creation error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to create referral.' }, { status: 500 });
  }
}
