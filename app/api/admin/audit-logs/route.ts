import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireRoles(req, ['SYSTEM_ADMIN', 'FACILITY_ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const resource = searchParams.get('resource');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const whereClause: any = {};
  if (action) whereClause.action = action;
  if (resource) whereClause.resource = resource;

  const logs = await prisma.auditEvent.findMany({
    where: whereClause,
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return NextResponse.json({ success: true, count: logs.length, data: logs });
}
