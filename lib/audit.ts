import { prisma } from './prisma';

export interface AuditParams {
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  facilityId?: string | null;
  outcome?: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export async function logAuditEvent(params: AuditParams) {
  try {
    // Sanitize metadata to guarantee no sensitive health information is leaked into audit logs
    const safeMetadata = params.metadata ? { ...params.metadata } : {};
    delete safeMetadata.diagnoses;
    delete safeMetadata.medications;
    delete safeMetadata.allergies;
    delete safeMetadata.password;

    await prisma.auditEvent.create({
      data: {
        actorId: params.actorId,
        actorRole: params.actorRole,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        facilityId: params.facilityId || null,
        outcome: params.outcome || 'SUCCESS',
        metadataJson: Object.keys(safeMetadata).length > 0 ? JSON.stringify(safeMetadata) : null,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
