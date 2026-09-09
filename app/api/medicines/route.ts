import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const facilityId = searchParams.get('facilityId');

  const whereClause: any = {};
  if (facilityId) whereClause.facilityId = facilityId;

  const inventories = await prisma.facilityInventory.findMany({
    where: whereClause,
    include: {
      medicine: true,
      facility: {
        select: { id: true, name: true, type: true, district: true },
      },
    },
    orderBy: { medicine: { name: 'asc' } },
  });

  let formatted = inventories.map((inv) => ({
    id: inv.id,
    facilityId: inv.facilityId,
    facilityName: inv.facility.name,
    facilityType: inv.facility.type,
    medicineId: inv.medicineId,
    name: inv.medicine.name,
    genericName: inv.medicine.genericName,
    category: inv.medicine.category,
    form: inv.medicine.form,
    strength: inv.medicine.strength,
    quantityInStock: inv.quantityInStock,
    unit: inv.medicine.standardUnit,
    isAvailable: inv.isAvailable && inv.quantityInStock > 0,
    isLowStock: inv.quantityInStock > 0 && inv.quantityInStock <= inv.lowStockThreshold,
    lowStockThreshold: inv.lowStockThreshold,
    batchNumber: inv.batchNumber,
    expiryDate: inv.expiryDate,
    lastUpdated: inv.lastUpdated,
  }));

  if (search) {
    const q = search.toLowerCase();
    formatted = formatted.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.facilityName.toLowerCase().includes(q)
    );
  }

  if (category) {
    formatted = formatted.filter((m) => m.category === category);
  }

  return NextResponse.json({
    success: true,
    count: formatted.length,
    data: formatted,
  });
}
