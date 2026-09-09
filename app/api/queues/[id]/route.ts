import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const queue = await prisma.queue.findUnique({
    where: { id },
    include: {
      facility: { select: { id: true, name: true, phone: true } },
      department: { select: { id: true, name: true } },
      entries: {
        orderBy: [
          { priority: 'asc' }, // EMERGENCY first, then URGENT, HIGH, ROUTINE
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

  if (!queue) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Queue not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: queue });
}
