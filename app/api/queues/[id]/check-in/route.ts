import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const { queueEntryId, appointmentId } = body;

  const targetEntry = queueEntryId
    ? await prisma.queueEntry.findUnique({ where: { id: queueEntryId } })
    : await prisma.queueEntry.findFirst({ where: { queueId: id, appointmentId } });

  if (!targetEntry) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Queue entry not found.' }, { status: 404 });
  }

  const updated = await prisma.queueEntry.update({
    where: { id: targetEntry.id },
    data: {
      status: 'WAITING',
      checkInTime: new Date(),
    },
  });

  if (targetEntry.appointmentId) {
    await prisma.appointment.update({
      where: { id: targetEntry.appointmentId },
      data: { status: 'CHECKED_IN' },
    });
  }

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'QUEUE_CHECK_IN',
    resource: 'QueueEntry',
    resourceId: targetEntry.id,
    metadata: { tokenDisplay: targetEntry.tokenDisplay },
  });

  return NextResponse.json({ success: true, message: 'Patient checked in successfully.', data: updated });
}
