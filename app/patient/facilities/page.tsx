'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  PhoneCall,
  Video,
  ShieldAlert,
  ChevronRight,
  ArrowUpDown,
  Building2,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

function FacilitiesDiscoveryContent() {
  const { t } = useApp();
  const searchParams = useSearchParams();
  const initialOwnership = searchParams.get('ownership') || '';
  const initialSpecialty = searchParams.get('department') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState(initialOwnership);
  const [typeFilter, setTypeFilter] = useState('');
  const [hasEmergencyOnly, setHasEmergencyOnly] = useState(false);
  const [hasTeleconsultOnly, setHasTeleconsultOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // distance, queue, ranking
  const [facilities, setFacilities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFacilities() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('q', searchQuery);
        if (ownershipFilter) queryParams.set('ownership', ownershipFilter);
        if (typeFilter) queryParams.set('type', typeFilter);
        if (hasEmergencyOnly) queryParams.set('emergency', 'true');
        if (hasTeleconsultOnly) queryParams.set('teleconsult', 'true');
        if (initialSpecialty) queryParams.set('department', initialSpecialty);
        queryParams.set('sort', sortBy);

        const res = await fetch(`/api/facilities?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setFacilities(json.data);
        }
      } catch (err) {
        console.error('Failed to load facilities:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchFacilities, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, ownershipFilter, typeFilter, hasEmergencyOnly, hasTeleconsultOnly, sortBy, initialSpecialty]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="govt">Public & Private Network</Badge>
          <span className="text-xs text-slate-500 font-medium">Maharashtra Demo District</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Find Nearby Healthcare Facilities</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Discover primary health centres, rural hospitals, and diagnostic labs. Compare distances and live digital queue wait times.
        </p>
      </div>

      {/* Search & Main Filter Controls */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Universal Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by facility name, village, or department..."
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Ownership Filter */}
          <select
            value={ownershipFilter}
            onChange={(e) => setOwnershipFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Ownership (Govt & Private)</option>
            <option value="GOVERNMENT">Government Healthcare First</option>
            <option value="PRIVATE">Private Network</option>
          </select>

          {/* Facility Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Facility Levels</option>
            <option value="SUB_CENTRE">Sub-Centre (HWC)</option>
            <option value="PHC">Primary Health Centre (PHC)</option>
            <option value="RURAL_HOSPITAL">Rural Hospital (RH)</option>
            <option value="SUB_DISTRICT_HOSPITAL">Sub-District Hospital</option>
            <option value="DISTRICT_HOSPITAL">District Referral Hospital</option>
            <option value="DIAGNOSTIC_CENTRE">Diagnostic & Imaging</option>
          </select>

          {/* Emergency Toggle */}
          <button
            onClick={() => setHasEmergencyOnly(!hasEmergencyOnly)}
            className={`px-3 py-2 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors ${
              hasEmergencyOnly
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> 24x7 Emergency
          </button>

          {/* Teleconsult Toggle */}
          <button
            onClick={() => setHasTeleconsultOnly(!hasTeleconsultOnly)}
            className={`px-3 py-2 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors ${
              hasTeleconsultOnly
                ? 'bg-teal-50 border-teal-300 text-teal-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Teleconsult Available
          </button>

          {/* Sorting */}
          <div className="ml-auto flex items-center gap-1.5 text-slate-500 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="distance">Nearest Distance</option>
              <option value="queue">Shortest Queue</option>
              <option value="ranking">Smart Recommendation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Facilities List Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-slate-500 animate-pulse">
          Loading healthcare facilities...
        </div>
      ) : facilities.length === 0 ? (
        <Card className="p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-800">No facilities match your active filters.</p>
          <p className="text-xs text-slate-500">Try broadening your search term or clearing the emergency/type filters.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setOwnershipFilter('');
              setTypeFilter('');
              setHasEmergencyOnly(false);
              setHasTeleconsultOnly(false);
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map((fac) => (
            <Card key={fac.id} hoverable className="p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={fac.ownership === 'GOVERNMENT' ? 'govt' : 'private'}>
                      {fac.ownership === 'GOVERNMENT' ? 'Public Health' : 'Private'}
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {fac.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">{fac.distanceKm} km</span>
                    <span className="text-[10px] text-slate-500 block">~{fac.travelTimeMinutes} min trip</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{fac.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {fac.address}
                  </p>
                </div>

                {/* Badges: Emergency, Teleconsult, Doctors */}
                <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
                  {fac.hasEmergency && (
                    <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold border border-red-200 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> 24x7 Emergency
                    </span>
                  )}
                  {fac.hasTeleconsult && (
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold border border-teal-200 flex items-center gap-1">
                      <Video className="w-3 h-3" /> Teleconsult
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    {fac.availableDoctorsCount} Doctors Available
                  </span>
                </div>

                {/* Queue Burden (Section 20) */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>OPD Queue: <strong className="text-slate-900">{fac.queueWaitingCount} patients waiting</strong></span>
                  </div>
                  <span className="font-bold text-teal-800">~{fac.estimatedQueueWaitMinutes} min wait</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <a href={`tel:${fac.phone}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full" leftIcon={<PhoneCall className="w-3.5 h-3.5" />}>
                    {t('common.call')}
                  </Button>
                </a>
                <Link href={`/patient/facilities/${fac.id}`} className="flex-1">
                  <Button size="sm" className="w-full" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FacilitiesDiscoveryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Healthcare Facilities...</div>}>
      <FacilitiesDiscoveryContent />
    </Suspense>
  );
}
