import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const order = await prisma.diagnosticOrder.findUnique({
    where: { id },
    include: {
      patient: true,
      facility: true,
      practitioner: true,
    },
  });

  if (!order) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Diagnostic order not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: order });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const { status, resultSummary, abnormalFlag, resultDetailsJson } = body;

  const updateData: any = {};
  if (status) updateData.status = status;
  if (resultSummary !== undefined) updateData.resultSummary = resultSummary;
  if (abnormalFlag !== undefined) updateData.abnormalFlag = Boolean(abnormalFlag);
  if (resultDetailsJson !== undefined) updateData.resultDetailsJson = resultDetailsJson;

  if (status === 'SAMPLE_COLLECTED') updateData.sampleCollectedAt = new Date();
  if (status === 'RESULT_READY') updateData.resultReadyAt = new Date();
  if (status === 'REVIEWED') {
    updateData.reviewedAt = new Date();
    updateData.reviewedById = auth.user.userId;
  }

  const updated = await prisma.diagnosticOrder.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    actorId: auth.user.userId,
    actorRole: auth.user.role,
    action: 'DIAGNOSTIC_STATUS_UPDATED',
    resource: 'DiagnosticOrder',
    resourceId: id,
    metadata: { newStatus: status, abnormalFlag },
  });

  return NextResponse.json({ success: true, message: 'Diagnostic order status updated.', data: updated });
}
