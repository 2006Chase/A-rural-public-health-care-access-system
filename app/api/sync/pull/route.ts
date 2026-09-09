import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since');
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Pull facilities reference data (cached offline)
  const facilities = await prisma.facility.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      type: true,
      ownership: true,
      address: true,
      phone: true,
      emergencyPhone: true,
      latitude: true,
      longitude: true,
      hasEmergency: true,
      hasTeleconsult: true,
      operatingHours: true,
    },
  });

  // Pull government services (cached offline)
  const governmentServices = await prisma.governmentService.findMany({
    where: { isActive: true },
  });

  // Pull authorized patients for assigned worker or doctor
  let patients: any[] = [];
  if (auth.user.role === 'HEALTH_WORKER' || auth.user.role === 'DOCTOR') {
    patients = await prisma.patient.findMany({
      take: 25,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        nationalHealthId: true,
        fullName: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        village: true,
        bloodGroup: true,
        riskLevel: true,
        chronicConditions: true,
        allergies: true,
      },
    });
  }

  return NextResponse.json({
    success: true,
    syncedAt: new Date().toISOString(),
    data: {
      facilities,
      governmentServices,
      patients,
    },
  });
}
