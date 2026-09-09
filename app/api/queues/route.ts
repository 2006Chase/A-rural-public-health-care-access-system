import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const whereClause: any = { date };
  if (facilityId) whereClause.facilityId = facilityId;

  let queues = await prisma.queue.findMany({
    where: whereClause,
    include: {
      facility: { select: { id: true, name: true, phone: true } },
      department: { select: { id: true, name: true } },
      entries: {
        orderBy: [
          { priority: 'asc' },
          { tokenNumber: 'asc' },
        ],
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              gender: true,
              dateOfBirth: true,
              phone: true,
              village: true,
              riskLevel: true,
            },
          },
          appointment: {
            select: {
              id: true,
              timeSlot: true,
              type: true,
              reason: true,
            },
          },
        },
      },
    },
  });

  // If no queues found for today, check all queues regardless of date as fallback
  if (queues.length === 0) {
    const fallbackWhere: any = {};
    if (facilityId) fallbackWhere.facilityId = facilityId;
    queues = await prisma.queue.findMany({
      where: fallbackWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        facility: { select: { id: true, name: true, phone: true } },
        department: { select: { id: true, name: true } },
        entries: {
          orderBy: [
            { priority: 'asc' },
            { tokenNumber: 'asc' },
          ],
          include: {
            patient: {
              select: {
                id: true,
                fullName: true,
                gender: true,
                dateOfBirth: true,
                phone: true,
                village: true,
                riskLevel: true,
              },
            },
            appointment: {
              select: {
                id: true,
                timeSlot: true,
                type: true,
                reason: true,
              },
            },
          },
        },
      },
    });
  }

  return NextResponse.json({ success: true, count: queues.length, data: queues });
}
