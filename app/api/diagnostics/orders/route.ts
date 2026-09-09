import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRoles } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId') || (auth.user.role === 'PATIENT' ? auth.user.patientId : null);
  const facilityId = searchParams.get('facilityId');
  const status = searchParams.get('status');

  const whereClause: any = {};
  if (patientId) whereClause.patientId = patientId;
  if (facilityId) whereClause.facilityId = facilityId;
  if (status) whereClause.status = status;

  const orders = await prisma.diagnosticOrder.findMany({
    where: whereClause,
    orderBy: { orderedAt: 'desc' },
    include: {
      patient: { select: { id: true, fullName: true, phone: true, nationalHealthId: true, gender: true } },
      facility: { select: { id: true, name: true, phone: true, type: true } },
      practitioner: { select: { fullName: true, specialty: true } },
    },
  });

  return NextResponse.json({ success: true, count: orders.length, data: orders });
}

export async function POST(req: NextRequest) {
  const auth = await requireRoles(req, ['DOCTOR', 'HEALTH_WORKER']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { patientId, facilityId, testName, testCategory, priority, instructions, encounterId } = body;

    if (!patientId || !facilityId || !testName) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Patient, facility, and test name are required.' }, { status: 400 });
    }

    const doctorProfile = await prisma.practitioner.findFirst({ where: { userId: auth.user.userId } });
    const practitionerId = doctorProfile?.id || auth.user.practitionerId || (await prisma.practitioner.findFirst())?.id;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const orderNumber = `DIAG-${dateFormatted}-${randomSuffix}`;

    const order = await prisma.diagnosticOrder.create({
      data: {
        orderNumber,
        encounterId: encounterId || null,
        patientId,
        practitionerId: practitionerId || '',
        facilityId,
        testName,
        testCategory: testCategory || 'RADIOLOGY',
        priority: priority || 'ROUTINE',
        status: 'ORDERED',
        instructions: instructions || 'Standard protocol examination',
        orderedAt: new Date(),
      },
      include: {
        patient: true,
        facility: true,
      },
    });

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'DIAGNOSTIC_ORDERED',
      resource: 'DiagnosticOrder',
      resourceId: order.id,
      facilityId,
      metadata: { orderNumber, testName },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    console.error('Diagnostic order creation error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to create diagnostic order.' }, { status: 500 });
  }
}
