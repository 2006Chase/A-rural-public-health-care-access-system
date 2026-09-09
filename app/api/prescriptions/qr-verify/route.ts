import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { verifySignedQrToken } from '@/lib/qr';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  // Only authenticated healthcare workers or clinical staff can decode and view medical records via QR
  const auth = await requireRoles(req, ['HEALTH_WORKER', 'DOCTOR', 'FACILITY_ADMIN', 'SYSTEM_ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ code: 'INVALID_INPUT', message: 'QR token is required.' }, { status: 400 });
    }

    // 1. Verify cryptographic HMAC signature & expiration (Zero raw PHI inside QR)
    const verification = verifySignedQrToken(token);
    if (!verification.valid || !verification.data) {
      return NextResponse.json({ code: 'INVALID_OR_EXPIRED_QR', message: verification.error || 'Invalid QR code.' }, { status: 400 });
    }

    const { recordId } = verification.data;

    // 2. Fetch authorized prescription from DB by opaque reference
    const prescription = await prisma.prescription.findFirst({
      where: {
        OR: [
          { qrReferenceToken: token },
          { prescriptionNumber: recordId },
        ],
      },
      include: {
        items: true,
        patient: {
          select: {
            id: true,
            fullName: true,
            nationalHealthId: true,
            gender: true,
            dateOfBirth: true,
            bloodGroup: true,
            village: true,
            allergies: true,
            chronicConditions: true,
          },
        },
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
            district: true,
            phone: true,
          },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json({ code: 'RECORD_NOT_FOUND', message: 'No registered prescription found for this token.' }, { status: 404 });
    }

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'QR_RECORD_VERIFIED',
      resource: 'Prescription',
      resourceId: prescription.id,
      facilityId: prescription.facilityId,
      metadata: { prescriptionNumber: prescription.prescriptionNumber, verifiedByRole: auth.user.role },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      data: prescription,
      verificationMetadata: {
        issuedAt: verification.data.issuedAt,
        expiresAt: verification.data.expiresAt,
        facilityCode: verification.data.facilityCode,
      },
    });
  } catch (error: any) {
    console.error('QR verification error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'QR verification failed.' }, { status: 500 });
  }
}
