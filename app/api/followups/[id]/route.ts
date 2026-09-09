import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const { status, notes, scheduledDate } = body;

  const updateData: any = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;
  if (scheduledDate) updateData.scheduledDate = scheduledDate;

  const updated = await prisma.followUp.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'FOLLOW_UP_STATUS_UPDATED',
    resource: 'FollowUp',
    resourceId: id,
    metadata: { newStatus: status },
  });

  return NextResponse.json({ success: true, message: 'Follow-up status updated.', data: updated });
}
