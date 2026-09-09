import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const ownership = searchParams.get('ownership'); // GOVERNMENT or PRIVATE
  const type = searchParams.get('type');
  const department = searchParams.get('department');
  const hasEmergency = searchParams.get('emergency') === 'true';
  const hasTeleconsult = searchParams.get('teleconsult') === 'true';
  const sort = searchParams.get('sort') || 'distance'; // distance, queue, name

  // Reference coordinates: Kendur Village (18.7900, 74.2200) for demo distance calculations
  const userLat = parseFloat(searchParams.get('lat') || '18.7900');
  const userLng = parseFloat(searchParams.get('lng') || '74.2200');

  const whereClause: any = {};
  if (ownership) whereClause.ownership = ownership;
  if (type) whereClause.type = type;
  if (hasEmergency) whereClause.hasEmergency = true;
  if (hasTeleconsult) whereClause.hasTeleconsult = true;

  if (query) {
    whereClause.OR = [
      { name: { contains: query } },
      { address: { contains: query } },
      { district: { contains: query } },
    ];
  }

  if (department) {
    whereClause.departments = {
      some: { name: { contains: department } },
    };
  }

  const facilities = await prisma.facility.findMany({
    where: whereClause,
    include: {
      departments: { select: { id: true, name: true, headDoctor: true, isAvailable: true } },
      practitioners: {
        where: { isAvailable: true },
        select: { id: true, fullName: true, specialty: true, teleconsultActive: true },
      },
      queues: {
        where: { status: 'ACTIVE' },
        select: { totalTokens: true, currentServingToken: true },
      },
    },
  });

  // Haversine distance formula to calculate distance in km and estimated travel time
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  const enriched = facilities.map((fac) => {
    const distanceKm = calculateDistance(userLat, userLng, fac.latitude, fac.longitude);
    // Estimated rural travel time: 30 km/h average speed on rural roads
    const travelTimeMinutes = Math.round((distanceKm / 30) * 60);

    const activeQueue = fac.queues[0];
    const queueWaitingCount = activeQueue ? Math.max(0, activeQueue.totalTokens - activeQueue.currentServingToken) : 0;
    const estimatedQueueWaitMinutes = queueWaitingCount * 8;

    // Deterministic ranking score (Section 25)
    let rankingScore = 100 - distanceKm * 1.5 - queueWaitingCount * 0.5;
    if (fac.ownership === 'GOVERNMENT') rankingScore += 15; // Government prioritization
    if (fac.hasTeleconsult) rankingScore += 10;
    if (fac.hasEmergency) rankingScore += 5;

    return {
      id: fac.id,
      name: fac.name,
      code: fac.code,
      type: fac.type,
      ownership: fac.ownership,
      address: fac.address,
      district: fac.district,
      phone: fac.phone,
      emergencyPhone: fac.emergencyPhone,
      hasEmergency: fac.hasEmergency,
      hasTeleconsult: fac.hasTeleconsult,
      hasDiagnostics: fac.hasDiagnostics,
      hasPharmacy: fac.hasPharmacy,
      operatingHours: fac.operatingHours,
      bedCount: fac.bedCount,
      distanceKm,
      travelTimeMinutes,
      queueWaitingCount,
      estimatedQueueWaitMinutes,
      departments: fac.departments,
      availableDoctorsCount: fac.practitioners.length,
      rankingScore,
      lastUpdated: fac.lastUpdated,
      staleWarning: false, // Updated live from DB
    };
  });

  // Sort
  if (sort === 'distance') {
    enriched.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sort === 'queue') {
    enriched.sort((a, b) => a.queueWaitingCount - b.queueWaitingCount);
  } else {
    enriched.sort((a, b) => b.rankingScore - a.rankingScore);
  }

  return NextResponse.json({
    success: true,
    count: enriched.length,
    userLocation: { lat: userLat, lng: userLng, label: 'Kendur Village' },
    data: enriched,
  });
}
