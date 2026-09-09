import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;

  const referral = await prisma.referral.findUnique({
    where: { id },
    include: {
      patient: true,
      referringFacility: true,
      receivingFacility: true,
      referringPractitioner: true,
    },
  });

  if (!referral) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Referral not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: referral });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const { status, patientAcknowledged } = body;

  const updateData: any = {};
  if (status) {
    updateData.status = status;
    if (status === 'COMPLETED') updateData.completedAt = new Date();
  }
  if (patientAcknowledged !== undefined) {
    updateData.patientAcknowledged = Boolean(patientAcknowledged);
  }

  const updated = await prisma.referral.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'REFERRAL_STATUS_UPDATED',
    resource: 'Referral',
    resourceId: id,
    metadata: { newStatus: status, patientAcknowledged },
  });

  return NextResponse.json({ success: true, message: 'Referral updated.', data: updated });
}
