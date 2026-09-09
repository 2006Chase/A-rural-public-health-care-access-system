import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      patientProfile: true,
      practitionerProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      facilityId: user.facilityId,
      patientId: user.patientProfile?.id || null,
      practitionerId: user.practitionerProfile?.id || null,
      preferredLanguage: user.patientProfile?.preferredLanguage || 'mr',
    },
  });
}
