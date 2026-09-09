import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireRoles(req, ['DOCTOR', 'HEALTH_WORKER', 'FACILITY_ADMIN', 'SYSTEM_ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const riskLevel = searchParams.get('riskLevel');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { fullName: { contains: query } },
      { nationalHealthId: { contains: query } },
      { phone: { contains: query } },
      { village: { contains: query } },
    ];
  }
  if (riskLevel) {
    whereClause.riskLevel = riskLevel;
  }

  const patients = await prisma.patient.findMany({
    where: whereClause,
    take: limit,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      nationalHealthId: true,
      fullName: true,
      dateOfBirth: true,
      gender: true,
      phone: true,
      village: true,
      district: true,
      bloodGroup: true,
      riskLevel: true,
      riskReason: true,
      chronicConditions: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ success: true, count: patients.length, data: patients });
}

export async function POST(req: NextRequest) {
  const auth = await requireRoles(req, ['HEALTH_WORKER', 'DOCTOR', 'FACILITY_ADMIN', 'SYSTEM_ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { fullName, dateOfBirth, gender, phone, village, district, address, pinCode, preferredLanguage, bloodGroup, allergies, chronicConditions, riskLevel, riskReason } = body;

    if (!fullName || !phone || !gender) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Full name, gender, and phone number are required.' }, { status: 400 });
    }

    // Generate ABHA-compatible national health ID: 91-XXXX-XXXX-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const randomMid = Math.floor(1000 + Math.random() * 9000);
    const abhaId = `91-${randomMid}-4920-${randomSuffix}`;

    const newPatient = await prisma.patient.create({
      data: {
        nationalHealthId: abhaId,
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth || '1985-01-01',
        gender: gender.toUpperCase(),
        phone: phone.trim(),
        address: address || `${village}, Maharashtra`,
        village: village || 'Rural Village',
        district: district || 'Maharashtra Demo District',
        pinCode: pinCode || '412403',
        preferredLanguage: preferredLanguage || 'mr',
        bloodGroup: bloodGroup || null,
        allergies: allergies || null,
        chronicConditions: chronicConditions || null,
        riskLevel: riskLevel || 'ROUTINE',
        riskReason: riskReason || null,
        assignedWorkerId: auth.user.userId,
      },
    });

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'PATIENT_REGISTERED',
      resource: 'Patient',
      resourceId: newPatient.id,
      metadata: { nationalHealthId: newPatient.nationalHealthId },
    });

    return NextResponse.json({ success: true, data: newPatient }, { status: 201 });
  } catch (error: any) {
    console.error('Create patient error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to create patient record.' }, { status: 500 });
  }
}
