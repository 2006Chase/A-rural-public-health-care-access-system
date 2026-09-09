import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;

  const encounter = await prisma.encounter.findUnique({
    where: { id },
    include: {
      patient: true,
      practitioner: true,
      facility: true,
      prescriptions: { include: { items: true } },
      diagnosticOrders: true,
      referrals: true,
      followUps: true,
      observations: true,
    },
  });

  if (!encounter) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Teleconsultation session not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: encounter,
    videoRoom: {
      roomId: `ROOM-JEEVANSETU-${encounter.id.substring(0, 8)}`,
      provider: 'WebRTC Simulated Carrier Mesh Adapter (Section 57)',
      status: 'CONNECTED',
    },
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const { assessment, clinicalNotes, plan, status } = body;

  const updated = await prisma.encounter.update({
    where: { id },
    data: {
      assessment: assessment || undefined,
      clinicalNotes: clinicalNotes || undefined,
      plan: plan || undefined,
      status: status || undefined,
      endedAt: status === 'FINISHED' ? new Date() : undefined,
    },
  });

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'TELECONSULT_UPDATED',
    resource: 'Encounter',
    resourceId: id,
    facilityId: updated.facilityId,
    metadata: { status: updated.status },
  });

  return NextResponse.json({ success: true, data: updated });
}
