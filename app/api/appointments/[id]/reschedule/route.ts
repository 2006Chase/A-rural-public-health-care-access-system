import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const { newDate, newTimeSlot } = body;

  if (!newDate) {
    return NextResponse.json({ code: 'INVALID_INPUT', message: 'New appointment date is required.' }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Appointment not found.' }, { status: 404 });
  }

  if (auth.user.role === 'PATIENT' && auth.user.patientId !== appointment.patientId) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized to reschedule this appointment.' }, { status: 403 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      date: newDate,
      timeSlot: newTimeSlot || appointment.timeSlot,
      status: 'RESCHEDULED',
    },
  });

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'APPOINTMENT_RESCHEDULED',
    resource: 'Appointment',
    resourceId: id,
    facilityId: appointment.facilityId,
    metadata: { oldDate: appointment.date, newDate },
  });

  return NextResponse.json({ success: true, message: 'Appointment rescheduled successfully.', data: updated });
}
