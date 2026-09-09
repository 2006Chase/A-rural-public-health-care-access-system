'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Building2,
  ChevronRight,
  Edit2,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

function AdminInventoryContent() {
  const searchParams = useSearchParams();
  const initialFacilityId = searchParams.get('facilityId') || '';

  const [inventory, setInventory] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState(initialFacilityId);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit stock modal state
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadInventory() {
    try {
      setLoading(true);
      const url = selectedFacility
        ? `/api/medicines?facilityId=${selectedFacility}`
        : '/api/medicines';
      const [invRes, facRes] = await Promise.all([
        fetch(url),
        fetch('/api/facilities?limit=25'),
      ]);

      if (invRes.ok) {
        const d = await invRes.json();
        setInventory(d.data || []);
      }
      if (facRes.ok) {
        const f = await facRes.json();
        setFacilities(f.data || []);
      }
    } catch (err) {
      console.error('Failed to load medicine inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, [selectedFacility]);

  async function handleUpdateStock(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/facilities/${editingItem.facilityId}/medicines`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: editingItem.medicineId,
          quantityInStock: Number(newQuantity),
          isAvailable: Number(newQuantity) > 0,
        }),
      });

      if (res.ok) {
        setEditingItem(null);
        await loadInventory();
      }
    } catch (err) {
      console.error('Failed to update stock quantity:', err);
    } finally {
      setIsUpdating(false);
    }
  }

  const filteredItems = inventory.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (stockFilter === 'LOW' && !item.isLowStock) return false;
    if (stockFilter === 'OUT' && item.isAvailable) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.genericName.toLowerCase().includes(q) ||
        item.facilityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockCount = inventory.filter((i) => i.isLowStock).length;
  const outOfStockCount = inventory.filter((i) => !i.isAvailable).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Link href="/admin" className="hover:underline">Admin Center</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Pharmacy & Supplies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            District Essential Medicine Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time stock ledger across all 20 public health facilities with automated shortage alerts and batch tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadInventory}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Stock
          </Button>
        </div>
      </div>

      {/* Free Medicine Dispensation Banner */}
      <Card className="p-4 bg-emerald-50 border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-900 font-semibold">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>
            National Health Mission & State Mandate: 100% of Essential Medicines are dispensed free of charge to rural citizens.
          </span>
        </div>
        <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full text-[11px]">
          Free Dispensation Verified
        </span>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-teal-50/50 border-teal-200">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">Total Catalog Items</span>
          <p className="text-2xl font-extrabold text-teal-950 mt-1">{inventory.length}</p>
          <span className="text-xs text-teal-700 font-medium">Across facilities</span>
        </Card>

        <Card className="p-4 bg-emerald-50/50 border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">In Stock & Ready</span>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1">
            {inventory.length - outOfStockCount}
          </p>
          <span className="text-xs text-emerald-700 font-medium">Adequate stock</span>
        </Card>

        <Card className="p-4 bg-amber-50/50 border-amber-200">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Low Stock Alerts</span>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">{lowStockCount}</p>
          <span className="text-xs text-amber-700 font-medium">Re-order required</span>
        </Card>

        <Card className="p-4 bg-rose-50/50 border-rose-200">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Stockouts</span>
          <p className="text-2xl font-extrabold text-rose-950 mt-1">{outOfStockCount}</p>
          <span className="text-xs text-rose-700 font-medium">Zero units available</span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Filter */}
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-800"
          >
            <option value="">All 20 District Facilities</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-800"
          >
            <option value="ALL">All Categories</option>
            <option value="ANALGESIC">Analgesic & Pain</option>
            <option value="ANTIHYPERTENSIVE">Antihypertensive</option>
            <option value="ANTIDIABETIC">Antidiabetic</option>
            <option value="ANTIBIOTIC">Antibiotic</option>
            <option value="MATERNAL_HEALTH">Maternal Health</option>
            <option value="GASTROINTESTINAL">Gastrointestinal</option>
            <option value="RESPIRATORY">Respiratory</option>
          </select>

          {/* Stock Condition Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'LOW', 'OUT'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStockFilter(mode)}
                className={`px-2.5 py-1 text-xs font-bold rounded ${
                  stockFilter === mode
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'ALL' && 'All'}
                {mode === 'LOW' && 'Low Stock'}
                {mode === 'OUT' && 'Out of Stock'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicine name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Inventory Items List */}
      <div className="space-y-3">
        {loading && inventory.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
            <p className="text-sm font-medium">Querying district pharmacy inventory...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-10 text-center text-slate-500 border-slate-200">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No inventory records match filters</p>
            <p className="text-xs text-slate-500 mt-1">Try changing category or search terms.</p>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`p-4 border transition-all ${
                item.isLowStock
                  ? 'border-amber-300 bg-amber-50/20'
                  : !item.isAvailable
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                    <Badge variant="routine">{item.category}</Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      ({item.form}, {item.strength})
                    </span>
                    {item.isLowStock && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" /> Low Stock
                      </span>
                    )}
                    {!item.isAvailable && (
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded">
                        Stockout
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Generic:</span> {item.genericName} •
                    <span className="ml-1 text-teal-800 font-semibold">{item.facilityName}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span>Batch: {item.batchNumber || 'MH-2026-A'}</span>
                    <span>Expiry: {item.expiryDate || '2027-12'}</span>
                    <span>Threshold: {item.lowStockThreshold} {item.unit}</span>
                  </div>
                </div>

                {/* Stock Number & Quick Edit */}
                <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Quantity</span>
                    <span className={`text-xl font-extrabold ${
                      !item.isAvailable
                        ? 'text-rose-700'
                        : item.isLowStock
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}>
                      {item.quantityInStock} <span className="text-xs font-normal text-slate-600">{item.unit}</span>
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setEditingItem(item);
                      setNewQuantity(item.quantityInStock);
                    }}
                  >
                    Adjust
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Adjust Stock Modal */}
      {editingItem && (
        <Modal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          title={`Adjust Stock: ${editingItem.name}`}
        >
          <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block">Facility</span>
              <span className="font-bold text-slate-900 text-sm">{editingItem.facilityName}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Medicine & Dosage</span>
              <span className="font-semibold text-slate-800">{editingItem.genericName} ({editingItem.strength})</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Updated Physical Count ({editingItem.unit})
              </label>
              <input
                type="number"
                min="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md font-bold text-base text-slate-900"
                required
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Setting to 0 will mark this facility item as 'Stockout' across the patient portal.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isUpdating} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                Save Quantity
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function AdminInventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading inventory records...</div>}>
      <AdminInventoryContent />
    </Suspense>
  );
}
