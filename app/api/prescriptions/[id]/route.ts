import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;

  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: {
      items: true,
      practitioner: {
        select: {
          fullName: true,
          specialty: true,
          qualification: true,
          licenseNumber: true,
        },
      },
      facility: {
        select: {
          name: true,
          code: true,
          type: true,
          phone: true,
          address: true,
        },
      },
      patient: {
        select: {
          id: true,
          fullName: true,
          nationalHealthId: true,
          gender: true,
          dateOfBirth: true,
          village: true,
          phone: true,
        },
      },
    },
  });

  if (!prescription) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Prescription not found.' }, { status: 404 });
  }

  // Patient access control
  if (auth.user.role === 'PATIENT' && auth.user.patientId !== prescription.patientId) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Unauthorized prescription access.' }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: prescription });
}
