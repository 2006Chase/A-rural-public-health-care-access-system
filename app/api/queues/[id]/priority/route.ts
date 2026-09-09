import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(req, ['DOCTOR', 'HEALTH_WORKER', 'FACILITY_ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const { queueEntryId, priority, reason } = body;

  if (!queueEntryId || !priority) {
    return NextResponse.json({ code: 'INVALID_INPUT', message: 'queueEntryId and priority are required.' }, { status: 400 });
  }

  const validPriorities = ['EMERGENCY', 'URGENT', 'HIGH', 'ROUTINE'];
  if (!validPriorities.includes(priority)) {
    return NextResponse.json({ code: 'INVALID_PRIORITY', message: `Priority must be one of: ${validPriorities.join(', ')}` }, { status: 400 });
  }

  const updatedEntry = await prisma.queueEntry.update({
    where: { id: queueEntryId },
    data: {
      priority,
      estimatedWaitMinutes: priority === 'EMERGENCY' ? 0 : priority === 'URGENT' ? 5 : undefined,
    },
  });

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'QUEUE_PRIORITY_ESCALATED',
    resource: 'QueueEntry',
    resourceId: queueEntryId,
    metadata: { newPriority: priority, reason },
  });

  return NextResponse.json({ success: true, message: `Priority updated to ${priority}.`, data: updatedEntry });
}
