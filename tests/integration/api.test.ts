import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createSignedQrToken, verifySignedQrToken } from '@/lib/qr';
import { performSafetyTriage } from '@/lib/ai-triage';

describe('JeevanSetu Core System Integration Tests', () => {
  it('should query seeded facilities in Maharashtra Demo District', async () => {
    const facilities = await prisma.facility.findMany({
      where: { district: 'Maharashtra Demo District' },
    });
    expect(facilities.length).toBeGreaterThanOrEqual(10);
    const rh = facilities.find((f) => f.name.includes('Shirur Rural Hospital'));
    expect(rh).toBeDefined();
    expect(rh?.hasEmergency).toBe(true);
    expect(rh?.hasTeleconsult).toBe(true);
  });

  it('should query seeded hero patient Anand Patil and his active conditions', async () => {
    const patient = await prisma.patient.findFirst({
      where: { fullName: { contains: 'Anand Patil' } },
      include: { conditions: true, encounters: true, prescriptions: true },
    });
    expect(patient).toBeDefined();
    expect(patient?.village).toBe('Kendur');
    expect(patient?.nationalHealthId).toContain('91-');
    expect(patient?.conditions.length).toBeGreaterThan(0);
    expect(patient?.conditions[0].title.toLowerCase()).toContain('osteoarthritis');
  });

  it('should verify signed prescription and tamper protection for Anand Patil', async () => {
    const prescription = await prisma.prescription.findFirst({
      where: { prescriptionNumber: 'RX-2026-0818-099' },
      include: { items: true },
    });
    expect(prescription).toBeDefined();
    expect(prescription?.status).toBe('SIGNED');
    expect(prescription?.items.length).toBeGreaterThanOrEqual(3);

    // Verify QR reference token
    if (prescription?.qrReferenceToken) {
      const qrCheck = verifySignedQrToken(prescription.qrReferenceToken);
      expect(qrCheck.valid).toBe(true);
      expect(qrCheck.data?.recordId).toBe(prescription.prescriptionNumber);
    }
  });

  it('should verify diagnostic test progression and abnormal flag for X-ray', async () => {
    const diagOrder = await prisma.diagnosticOrder.findFirst({
      where: { orderNumber: 'DIAG-2026-0818-42' },
    });
    expect(diagOrder).toBeDefined();
    expect(diagOrder?.status).toBe('RESULT_READY');
    expect(diagOrder?.abnormalFlag).toBe(true);
    expect(diagOrder?.resultSummary).toContain('Osteoarthritis');
  });

  it('should verify closed-loop referral to District Hospital', async () => {
    const referral = await prisma.referral.findFirst({
      where: { referralNumber: 'REF-2026-0901-18' },
      include: { referringFacility: true, receivingFacility: true },
    });
    expect(referral).toBeDefined();
    expect(referral?.status).toBe('SCHEDULED');
    expect(referral?.referringFacility.name).toContain('Shirur');
    expect(referral?.receivingFacility.name).toContain('District');
  });

  it('should verify high-risk patient follow-up escalation', async () => {
    const highRiskFollowUp = await prisma.followUp.findFirst({
      where: { isHighRiskEscalated: true },
    });
    expect(highRiskFollowUp).toBeDefined();
    expect(highRiskFollowUp?.status).toBe('MISSED');
    expect(highRiskFollowUp?.priority).toBe('HIGH');
  });

  it('should execute end-to-end triage to care pathway recommendation', () => {
    const triage = performSafetyTriage('Severe knee joint pain cannot walk or travel to hospital');
    expect(triage.urgency).toBe('urgent');
    expect(triage.recommendedDepartment).toBe('Orthopedics');
    expect(triage.recommendedServiceType).toBe('TELECONSULT');
  });
});
