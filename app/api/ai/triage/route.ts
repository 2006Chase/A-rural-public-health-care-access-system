import { NextRequest, NextResponse } from 'next/server';
import { performSafetyTriage } from '@/lib/ai-triage';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, preferredLanguage, patientLat, patientLng } = body;

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      return NextResponse.json({ code: 'INVALID_INPUT', message: 'Symptoms description is required.' }, { status: 400 });
    }

    // 1. Run deterministic safety triage
    const triageResult = performSafetyTriage(symptoms);

    // 2. Fetch facilities matching the recommended department
    const matchingDepartmentKeyword = triageResult.recommendedDepartment.split('/')[0].trim();
    const matchingFacilities = await prisma.facility.findMany({
      where: {
        OR: [
          { departments: { some: { name: { contains: matchingDepartmentKeyword } } } },
          triageResult.urgency === 'emergency' ? { hasEmergency: true } : {},
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        ownership: true,
        address: true,
        phone: true,
        emergencyPhone: true,
        hasEmergency: true,
        hasTeleconsult: true,
        latitude: true,
        longitude: true,
      },
      take: 6,
    });

    // 3. Log audit event for AI interaction (no PHI, strictly operational metadata - Section 24)
    await logAuditEvent({
      actorId: 'ANONYMOUS_OR_PATIENT',
      actorRole: 'PATIENT',
      action: 'AI_TRIAGE_EVALUATED',
      resource: 'AITriageEngine',
      resourceId: `SESSION-${Date.now()}`,
      metadata: {
        urgency: triageResult.urgency,
        recommendedDepartment: triageResult.recommendedDepartment,
        confidence: triageResult.confidence,
        escalationRequired: triageResult.escalationRequired,
      },
    });

    return NextResponse.json({
      success: true,
      triage: triageResult,
      matchingFacilities,
    });
  } catch (error: any) {
    console.error('AI Triage error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Triage service failed.' }, { status: 500 });
  }
}
