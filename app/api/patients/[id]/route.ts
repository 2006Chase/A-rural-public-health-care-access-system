import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;

  // Patient least-privilege: A patient can only view their own profile unless role is clinical/admin
  if (auth.user.role === 'PATIENT' && auth.user.patientId !== id) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'You are not authorized to view this patient profile.' }, { status: 403 });
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      conditions: true,
      consents: { where: { status: 'GRANTED' } },
    },
  });

  if (!patient) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Patient not found.' }, { status: 404 });
  }

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'PATIENT_PROFILE_VIEWED',
    resource: 'Patient',
    resourceId: id,
  });

  return NextResponse.json({ success: true, data: patient });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;

  // Authorization check
  if (auth.user.role === 'PATIENT' && auth.user.patientId !== id) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'You can only update your own profile.' }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = ['preferredLanguage', 'emergencyPhone', 'allergies', 'chronicConditions', 'riskLevel', 'riskReason', 'assignedWorkerId'];
  const updateData: any = {};

  for (const field of allowedFields) {
    if (field in body) {
      // Patients cannot self-elevate or alter clinical risk level
      if (auth.user.role === 'PATIENT' && (field === 'riskLevel' || field === 'riskReason' || field === 'assignedWorkerId')) {
        continue;
      }
      updateData[field] = body[field];
    }
  }

  const updatedPatient = await prisma.patient.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'PATIENT_PROFILE_UPDATED',
    resource: 'Patient',
    resourceId: id,
    metadata: { fieldsUpdated: Object.keys(updateData) },
  });

  return NextResponse.json({ success: true, data: updatedPatient });
}
