import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId') || (auth.user.role === 'PATIENT' ? auth.user.patientId : null);

  const whereClause: any = {};
  if (patientId) whereClause.patientId = patientId;

  const documents = await prisma.document.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      patient: { select: { fullName: true, nationalHealthId: true } },
    },
  });

  return NextResponse.json({ success: true, count: documents.length, data: documents });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { patientId, title, type, fileUrl, extractedDataJson, ocrConfidenceScore, verificationStatus } = body;

    const targetPatientId = patientId || auth.user.patientId;
    if (!targetPatientId || !title) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Patient ID and document title are required.' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        patientId: targetPatientId,
        title: title.trim(),
        type: type || 'PAPER_PRESCRIPTION',
        fileUrl: fileUrl || '/sample-prescriptions/demo-rx-1.jpg',
        mimeType: 'image/jpeg',
        extractedDataJson: extractedDataJson ? JSON.stringify(extractedDataJson) : null,
        ocrConfidenceScore: ocrConfidenceScore || 0.88,
        verificationStatus: verificationStatus || 'PENDING_VERIFICATION',
        verifiedById: verificationStatus === 'VERIFIED' ? auth.user.userId : null,
        verifiedAt: verificationStatus === 'VERIFIED' ? new Date() : null,
      },
    });

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'DOCUMENT_UPLOADED',
      resource: 'Document',
      resourceId: document.id,
      metadata: { type: document.type, status: document.verificationStatus },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error: any) {
    console.error('Document save error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to record document.' }, { status: 500 });
  }
}
