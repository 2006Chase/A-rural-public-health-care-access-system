import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const facility = await prisma.facility.findUnique({
    where: { id },
    include: {
      departments: true,
      practitioners: {
        select: {
          id: true,
          fullName: true,
          specialty: true,
          qualification: true,
          isAvailable: true,
          teleconsultActive: true,
          consultationFee: true,
          languagesSpoken: true,
        },
      },
      queues: {
        where: { status: 'ACTIVE' },
        include: {
          department: { select: { name: true } },
        },
      },
    },
  });

  if (!facility) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Facility not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: facility });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(req, ['FACILITY_ADMIN', 'SYSTEM_ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const body = await req.json();

  const allowedFields = [
    'hasEmergency',
    'hasTeleconsult',
    'hasDiagnostics',
    'hasPharmacy',
    'operatingHours',
    'bedCount',
    'phone',
    'emergencyPhone',
  ];

  const updateData: any = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  const updated = await prisma.facility.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'FACILITY_CAPABILITIES_UPDATED',
    resource: 'Facility',
    resourceId: id,
    metadata: updateData,
  });

  return NextResponse.json({
    success: true,
    message: 'Facility updated successfully.',
    data: updated,
  });
}
