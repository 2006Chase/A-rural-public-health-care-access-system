import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Appointment not found.' }, { status: 404 });
  }

  // Verify ownership if patient
  if (auth.user.role === 'PATIENT' && auth.user.patientId !== appointment.patientId) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized to cancel this appointment.' }, { status: 403 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  // Also cancel queue entry if present
  await prisma.queueEntry.updateMany({
    where: { appointmentId: id },
    data: { status: 'CANCELLED' },
  });

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'APPOINTMENT_CANCELLED',
    resource: 'Appointment',
    resourceId: id,
    facilityId: appointment.facilityId,
  });

  return NextResponse.json({ success: true, message: 'Appointment cancelled successfully.', data: updated });
}
