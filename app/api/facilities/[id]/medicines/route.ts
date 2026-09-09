import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const inventory = await prisma.facilityInventory.findMany({
    where: { facilityId: id },
    include: {
      medicine: true,
    },
    orderBy: { medicine: { name: 'asc' } },
  });

  const formatted = inventory.map((inv) => ({
    id: inv.id,
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

  return NextResponse.json({
    success: true,
    count: formatted.length,
    facilityId: id,
    data: formatted,
    notice: 'Prescription medicines are dispensed free of charge at all government public health facilities.',
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(req, ['FACILITY_ADMIN', 'DOCTOR', 'SYSTEM_ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const { medicineId, quantityInStock, isAvailable } = body;

  if (!medicineId) {
    return NextResponse.json({ code: 'INVALID_INPUT', message: 'Medicine ID is required.' }, { status: 400 });
  }

  const updated = await prisma.facilityInventory.upsert({
    where: {
      facilityId_medicineId: {
        facilityId: id,
        medicineId,
      },
    },
    update: {
      quantityInStock: quantityInStock !== undefined ? Number(quantityInStock) : undefined,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      lastUpdated: new Date(),
    },
    create: {
      facilityId: id,
      medicineId,
      quantityInStock: Number(quantityInStock) || 0,
      isAvailable: Boolean(isAvailable),
      lastUpdated: new Date(),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
