import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(req, ['DOCTOR', 'HEALTH_WORKER', 'FACILITY_ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;

  // Find next waiting entry by priority then token
  const nextEntry = await prisma.queueEntry.findFirst({
    where: { queueId: id, status: 'WAITING' },
    orderBy: [
      { priority: 'asc' }, // EMERGENCY, URGENT, HIGH, ROUTINE
      { tokenNumber: 'asc' },
    ],
    include: {
      patient: true,
      appointment: true,
    },
  });

  if (!nextEntry) {
    return NextResponse.json({ success: true, message: 'No more waiting patients in this queue.', entry: null });
  }

  // Update entry status to CALLED
  const updatedEntry = await prisma.queueEntry.update({
    where: { id: nextEntry.id },
    data: {
      status: 'CALLED',
      calledTime: new Date(),
    },
  });

  // Update Queue currentServingToken
  await prisma.queue.update({
    where: { id },
    data: { currentServingToken: nextEntry.tokenNumber },
  });

  if (nextEntry.appointmentId) {
    await prisma.appointment.update({
      where: { id: nextEntry.appointmentId },
      data: { status: 'IN_QUEUE' },
    });
  }

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'QUEUE_TOKEN_CALLED',
    resource: 'QueueEntry',
    resourceId: nextEntry.id,
    metadata: { tokenDisplay: nextEntry.tokenDisplay, priority: nextEntry.priority },
  });

  return NextResponse.json({ success: true, message: `Token ${nextEntry.tokenDisplay} called.`, data: updatedEntry });
}
