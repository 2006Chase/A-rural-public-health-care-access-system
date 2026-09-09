import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { operations } = body;

    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json({ code: 'INVALID_INPUT', message: 'Operations array is required.' }, { status: 400 });
    }

    const results: any[] = [];

    for (const op of operations) {
      const { id: localOpId, deviceId, entityType, entityId, operation, payload, version } = op;

      try {
        if (entityType === 'Observation' || entityType === 'Vitals') {
          // Worker created or updated vitals offline (Section 69 & 100)
          const newObs = await prisma.observation.create({
            data: {
              patientId: payload.patientId,
              encounterId: payload.encounterId || null,
              category: 'VITAL_SIGNS',
              code: payload.code || 'VITAL_OFFLINE',
              name: payload.name || 'Vital Signs',
              value: payload.value.toString(),
              unit: payload.unit || '',
              interpretation: payload.interpretation || 'NORMAL',
              recordedBy: `${auth.user.name} (Offline Sync)`,
              recordedAt: payload.recordedAt ? new Date(payload.recordedAt) : new Date(),
            },
          });

          results.push({ localOpId, status: 'SYNCED', serverId: newObs.id });
        } else if (entityType === 'Patient') {
          // Conflict checking on Patient updates (Section 43)
          const existingPatient = await prisma.patient.findUnique({ where: { id: entityId } });
          if (!existingPatient) {
            results.push({ localOpId, status: 'FAILED', error: 'Patient not found on server.' });
            continue;
          }

          // Check if server was modified after the offline event was captured
          const serverUpdatedTime = new Date(existingPatient.updatedAt).getTime();
          const offlineClientTime = new Date(op.createdAt || 0).getTime();

          if (serverUpdatedTime > offlineClientTime) {
            // Version Conflict! Preserve both, mark CONFLICT for human review
            await prisma.syncOperation.create({
              data: {
                deviceId: deviceId || 'DEVICE-OFFLINE',
                userId: auth.user.userId,
                entityType,
                entityId,
                operation,
                payloadJson: JSON.stringify(payload),
                status: 'CONFLICT',
                errorMessage: 'Concurrent edit detected. Server has newer timestamp.',
              },
            });
            results.push({ localOpId, status: 'CONFLICT', error: 'Concurrent update on server. Flagged for review.' });
            continue;
          }

          const updated = await prisma.patient.update({
            where: { id: entityId },
            data: {
              allergies: payload.allergies !== undefined ? payload.allergies : undefined,
              chronicConditions: payload.chronicConditions !== undefined ? payload.chronicConditions : undefined,
              riskLevel: payload.riskLevel !== undefined ? payload.riskLevel : undefined,
              riskReason: payload.riskReason !== undefined ? payload.riskReason : undefined,
            },
          });

          results.push({ localOpId, status: 'SYNCED', serverId: updated.id });
        } else {
          // Generic sync event recording
          await prisma.syncOperation.create({
            data: {
              deviceId: deviceId || 'DEVICE-OFFLINE',
              userId: auth.user.userId,
              entityType,
              entityId: entityId || `OFFLINE-${Date.now()}`,
              operation: operation || 'CREATE',
              payloadJson: JSON.stringify(payload),
              status: 'SYNCED',
            },
          });
          results.push({ localOpId, status: 'SYNCED' });
        }
      } catch (opErr: any) {
        console.error('Failed to sync operation:', op, opErr);
        results.push({ localOpId, status: 'FAILED', error: opErr.message });
      }
    }

    await logAuditEvent({
      actorId: auth.user.userId,
      actorRole: auth.user.role,
      action: 'OFFLINE_OPERATIONS_SYNCED',
      resource: 'SyncQueue',
      resourceId: `BATCH-${Date.now()}`,
      metadata: { total: operations.length, synced: results.filter((r) => r.status === 'SYNCED').length },
    });

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ code: 'SYNC_ERROR', message: 'Sync batch failed.' }, { status: 500 });
  }
}
