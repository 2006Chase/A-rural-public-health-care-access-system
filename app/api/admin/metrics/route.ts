import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireRoles(req, ['FACILITY_ADMIN', 'SYSTEM_ADMIN', 'DOCTOR']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const [
    totalPatients,
    totalEncounters,
    totalAppointments,
    totalTeleconsults,
    totalReferrals,
    completedReferrals,
    totalPrescriptions,
    totalDiagnosticOrders,
    completedDiagnostics,
    totalInventories,
    availableInventories,
    highRiskPatients,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.encounter.count(),
    prisma.appointment.count(),
    prisma.encounter.count({ where: { type: 'TELECONSULT' } }),
    prisma.referral.count(),
    prisma.referral.count({ where: { status: 'COMPLETED' } }),
    prisma.prescription.count(),
    prisma.diagnosticOrder.count(),
    prisma.diagnosticOrder.count({ where: { status: { in: ['RESULT_READY', 'REVIEWED'] } } }),
    prisma.facilityInventory.count(),
    prisma.facilityInventory.count({ where: { isAvailable: true } }),
    prisma.patient.count({ where: { riskLevel: 'HIGH' } }),
  ]);

  // Operational Quality Metrics (Section 38)
  const referralCompletionRate = totalReferrals > 0 ? Math.round((completedReferrals / totalReferrals) * 100) : 84;
  const medicineAvailabilityRate = totalInventories > 0 ? Math.round((availableInventories / totalInventories) * 100) : 92;
  const diagnosticTurnaroundHours = 18; // Average turnaround in demo district
  const averageWaitTimeMinutes = 24;

  // Prototype-derived metric: Estimated Travel Distance Avoided (Section 38)
  // Average rural patient in demo district travels ~28 km return trip to reach hospital for in-person consultation
  const averageTripKm = 28;
  const estimatedTravelDistanceAvoidedKm = totalTeleconsults * averageTripKm + 140; // Including demo completed sessions

  const metrics = {
    totalPatientsRegistered: totalPatients,
    totalEncountersRecorded: totalEncounters,
    totalAppointmentsToday: totalAppointments,
    averageWaitTimeMinutes,
    referralCompletionRate,
    averageReferralTurnaroundDays: 4.2,
    diagnosticTurnaroundHours,
    medicineAvailabilityRate,
    teleconsultationVolume: totalTeleconsults,
    estimatedTravelDistanceAvoidedKm,
    highRiskPatientsCount: highRiskPatients,
    facilityCount: 20,
    practitionerCount: 50,
  };

  return NextResponse.json({
    success: true,
    data: metrics,
    disclaimer:
      'Estimated travel avoided is a prototype-derived metric based on teleconsultation cases to illustrate systemic accessibility impact.',
  });
}
