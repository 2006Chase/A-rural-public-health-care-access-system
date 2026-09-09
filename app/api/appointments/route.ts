import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId') || (auth.user.role === 'PATIENT' ? auth.user.patientId : null);
  const practitionerId = searchParams.get('practitionerId') || (auth.user.role === 'DOCTOR' ? auth.user.practitionerId : null);
  const facilityId = searchParams.get('facilityId') || (auth.user.role === 'FACILITY_ADMIN' ? auth.user.facilityId : null);
  const status = searchParams.get('status');
  const date = searchParams.get('date');

  const whereClause: any = {};
  if (patientId) whereClause.patientId = patientId;
  if (practitionerId) whereClause.practitionerId = practitionerId;
  if (facilityId) whereClause.facilityId = facilityId;
  if (status) whereClause.status = status;
  if (date) whereClause.date = date;

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }],
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          nationalHealthId: true,
          village: true,
          gender: true,
          dateOfBirth: true,
          riskLevel: true,
        },
      },
      practitioner: {
        select: {
          id: true,
          fullName: true,
          specialty: true,
        },
      },
      facility: {
        select: {
          id: true,
          name: true,
          type: true,
          phone: true,
          address: true,
          ownership: true,
        },
      },
      queueEntry: true,
    },
  });

  return NextResponse.json({ success: true, count: appointments.length, data: appointments });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { patientId, practitionerId, facilityId, departmentId, date, timeSlot, type, reason } = body;

    const targetPatientId = patientId || auth.user.patientId;
    if (!targetPatientId || !facilityId || !date || !reason) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Patient, facility, date, and appointment reason are required.' },
        { status: 400 }
      );
    }

    // Generate unique appointment number: APT-YYYY-MMDD-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = date.replace(/-/g, '');
    const appointmentNumber = `APT-${dateFormatted}-${randomSuffix}`;

    // Get or create today's queue for this facility
    let activeQueue = await prisma.queue.findFirst({
      where: { facilityId, date, status: 'ACTIVE' },
    });

    if (!activeQueue) {
      activeQueue = await prisma.queue.create({
        data: {
          facilityId,
          departmentId: departmentId || null,
          date,
          status: 'ACTIVE',
          totalTokens: 0,
          currentServingToken: 0,
        },
      });
    }

    const nextTokenNumber = activeQueue.totalTokens + 1;
    const tokenDisplay = `OPD-${nextTokenNumber.toString().padStart(3, '0')}`;

    // Update queue total tokens
    await prisma.queue.update({
      where: { id: activeQueue.id },
      data: { totalTokens: nextTokenNumber },
    });

    const appointment = await prisma.appointment.create({
      data: {
        appointmentNumber,
        patientId: targetPatientId,
        practitionerId: practitionerId || null,
        facilityId,
        departmentId: departmentId || null,
        date,
        timeSlot: timeSlot || '10:00 - 10:30',
        type: type || 'IN_PERSON',
        status: 'CONFIRMED',
        reason,
        queueToken: tokenDisplay,
        estimatedWaitMinutes: (nextTokenNumber - activeQueue.currentServingToken) * 10,
      },
    });

    // Create QueueEntry
    await prisma.queueEntry.create({
      data: {
        queueId: activeQueue.id,
        appointmentId: appointment.id,
        patientId: targetPatientId,
        tokenNumber: nextTokenNumber,
        tokenDisplay,
        priority: 'ROUTINE',
        status: 'WAITING',
        checkInTime: new Date(),
        estimatedWaitMinutes: (nextTokenNumber - activeQueue.currentServingToken) * 10,
      },
    });

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'APPOINTMENT_BOOKED',
      resource: 'Appointment',
      resourceId: appointment.id,
      facilityId,
      metadata: { appointmentNumber, type: appointment.type, queueToken: tokenDisplay },
    });

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error: any) {
    console.error('Appointment booking error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to book appointment.' }, { status: 500 });
  }
}
