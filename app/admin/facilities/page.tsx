'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  ChevronRight,
  Search,
  Filter,
  Check,
  X,
  Phone,
  Clock,
  Bed,
  Video,
  Activity,
  Package,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadFacilities() {
    try {
      setLoading(true);
      const res = await fetch('/api/facilities?limit=30');
      if (res.ok) {
        const json = await res.json();
        setFacilities(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFacilities();
  }, []);

  async function handleToggleCapability(facilityId: string, field: string, currentValue: boolean) {
    try {
      setUpdatingId(`${facilityId}-${field}`);
      const res = await fetch(`/api/facilities/${facilityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (res.ok) {
        setFacilities((prev) =>
          prev.map((f) => (f.id === facilityId ? { ...f, [field]: !currentValue } : f))
        );
      }
    } catch (err) {
      console.error('Failed to update facility capability:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredFacilities = facilities.filter((f) => {
    if (typeFilter !== 'ALL' && f.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.code?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Link href="/admin" className="hover:underline">Admin Center</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Facility Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            District Healthcare Facilities ({facilities.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Configure clinical capabilities, bed allocations, 24x7 emergency coverage, and teleconsultation nodes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadFacilities}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Facilities
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Tiers' },
            { id: 'SUB_CENTRE', label: 'Sub-Centres (ASHA/ANM)' },
            { id: 'PRIMARY_HEALTH_CENTRE', label: 'PHCs' },
            { id: 'RURAL_HOSPITAL', label: 'Rural Hospitals' },
            { id: 'DISTRICT_HOSPITAL', label: 'District Hospitals' },
            { id: 'PRIVATE_HOSPITAL', label: 'Private' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                typeFilter === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search facility name, code, village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Facility Grid */}
      <div className="space-y-4">
        {filteredFacilities.length === 0 ? (
          <Card className="p-10 text-center text-slate-500 border-slate-200">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No facilities match criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting 'All Tiers' or clearing the search query.</p>
          </Card>
        ) : (
          filteredFacilities.map((fac) => (
            <Card key={fac.id} className="p-5 border-slate-200 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{fac.name}</h3>
                    <Badge variant={fac.ownership === 'GOVERNMENT' ? 'routine' : 'urgent'}>
                      {fac.ownership}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">[{fac.code}]</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {fac.type?.replace(/_/g, ' ')} • {fac.address}, Pin: {fac.pinCode}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
                  <span className="flex items-center gap-1 font-semibold">
                    <Bed className="w-3.5 h-3.5 text-slate-400" />
                    {fac.bedCount || 0} Beds
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {fac.phone || '+91 2138 222100'}
                  </span>
                </div>
              </div>

              {/* Capability Toggles */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Clinical Capabilities & Service Availability (Click to Toggle)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {/* Emergency Toggle */}
                  <button
                    disabled={updatingId === `${fac.id}-hasEmergency`}
                    onClick={() => handleToggleCapability(fac.id, 'hasEmergency', fac.hasEmergency)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      fac.hasEmergency
                        ? 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-600 shrink-0" />
                      24x7 Emergency
                    </span>
                    {fac.hasEmergency ? <Check className="w-3.5 h-3.5 text-rose-700" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {/* Teleconsultation Toggle */}
                  <button
                    disabled={updatingId === `${fac.id}-hasTeleconsult`}
                    onClick={() => handleToggleCapability(fac.id, 'hasTeleconsult', fac.hasTeleconsult)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      fac.hasTeleconsult
                        ? 'bg-sky-50 border-sky-200 text-sky-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-sky-600 shrink-0" />
                      Teleconsult Hub
                    </span>
                    {fac.hasTeleconsult ? <Check className="w-3.5 h-3.5 text-sky-700" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {/* Diagnostics Toggle */}
                  <button
                    disabled={updatingId === `${fac.id}-hasDiagnostics`}
                    onClick={() => handleToggleCapability(fac.id, 'hasDiagnostics', fac.hasDiagnostics)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      fac.hasDiagnostics
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-600 shrink-0" />
                      Diagnostic Lab
                    </span>
                    {fac.hasDiagnostics ? <Check className="w-3.5 h-3.5 text-indigo-700" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {/* Pharmacy Toggle */}
                  <button
                    disabled={updatingId === `${fac.id}-hasPharmacy`}
                    onClick={() => handleToggleCapability(fac.id, 'hasPharmacy', fac.hasPharmacy)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      fac.hasPharmacy
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                      Free Pharmacy
                    </span>
                    {fac.hasPharmacy ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Operating Hours and Links */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Hours: {fac.operatingHours || '08:30 - 16:30 OPD'}
                </span>

                <div className="flex items-center gap-2">
                  <Link href={`/patient/facilities/${fac.id}`}>
                    <Button size="sm" variant="outline">
                      Public Profile
                    </Button>
                  </Link>
                  <Link href={`/admin/inventory?facilityId=${fac.id}`}>
                    <Button size="sm" variant="secondary">
                      Check Medicine Stock
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
