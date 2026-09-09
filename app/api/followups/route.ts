import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRoles } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId') || (auth.user.role === 'PATIENT' ? auth.user.patientId : null);
  const facilityId = searchParams.get('facilityId');
  const status = searchParams.get('status');
  const isHighRisk = searchParams.get('highRisk') === 'true';

  const whereClause: any = {};
  if (patientId) whereClause.patientId = patientId;
  if (facilityId) whereClause.facilityId = facilityId;
  if (status) whereClause.status = status;
  if (isHighRisk) whereClause.isHighRiskEscalated = true;

  const followUps = await prisma.followUp.findMany({
    where: whereClause,
    orderBy: { scheduledDate: 'asc' },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          village: true,
          nationalHealthId: true,
          riskLevel: true,
          riskReason: true,
          chronicConditions: true,
        },
      },
      facility: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  return NextResponse.json({ success: true, count: followUps.length, data: followUps });
}

export async function POST(req: NextRequest) {
  const auth = await requireRoles(req, ['DOCTOR', 'HEALTH_WORKER']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { patientId, facilityId, scheduledDate, reason, priority, notes, isHighRiskEscalated, assignedWorkerId } = body;

    if (!patientId || !facilityId || !scheduledDate || !reason) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Patient, facility, date, and reason are required.' }, { status: 400 });
    }

    const followUp = await prisma.followUp.create({
      data: {
        patientId,
        facilityId,
        scheduledDate,
        reason,
        priority: priority || 'ROUTINE',
        status: 'PENDING',
        isHighRiskEscalated: Boolean(isHighRiskEscalated),
        assignedWorkerId: assignedWorkerId || auth.user.userId,
        notes: notes || null,
      },
      include: {
        patient: true,
        facility: true,
      },
    });

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'FOLLOW_UP_SCHEDULED',
      resource: 'FollowUp',
      resourceId: followUp.id,
      facilityId,
      metadata: { scheduledDate, priority: followUp.priority },
    });

    return NextResponse.json({ success: true, data: followUp }, { status: 201 });
  } catch (error: any) {
    console.error('Follow-up creation error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to schedule follow-up.' }, { status: 500 });
  }
}
