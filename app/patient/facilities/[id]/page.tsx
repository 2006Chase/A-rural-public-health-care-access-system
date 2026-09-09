'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  MapPin,
  PhoneCall,
  Video,
  ShieldAlert,
  Clock,
  Calendar,
  Pill,
  Users,
  CheckCircle2,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function FacilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { user, t } = useApp();

  const [facility, setFacility] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'medicines' | 'queue'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookReason, setBookReason] = useState('Consultation for knee and joint discomfort');
  const [bookType, setBookType] = useState<'IN_PERSON' | 'TELECONSULT'>('IN_PERSON');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [facRes, medRes] = await Promise.all([
          fetch(`/api/facilities/${id}`),
          fetch(`/api/facilities/${id}/medicines`),
        ]);

        if (facRes.ok) {
          const json = await facRes.json();
          setFacility(json.data);
        }
        if (medRes.ok) {
          const json = await medRes.json();
          setMedicines(json.data);
        }
      } catch (err) {
        console.error('Failed to load facility detail:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBooking(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: user?.patientId || 'demo-patient',
          facilityId: id,
          date: bookDate,
          timeSlot: '11:00 - 11:30',
          type: bookType,
          reason: bookReason,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setBookingSuccess(json.data);
      }
    } catch (err) {
      console.error('Failed to book appointment:', err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500 animate-pulse">Loading facility details...</div>;
  }

  if (!facility) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm font-semibold text-slate-800">Facility not found.</p>
        <Link href="/patient/facilities">
          <Button variant="outline">Back to Facilities</Button>
        </Link>
      </div>
    );
  }

  const activeQueue = facility.queues && facility.queues[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14">
      {/* Back Button */}
      <Link href="/patient/facilities" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to Facilities
      </Link>

      {/* Main Header Card */}
      <Card className="p-6 space-y-4 border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant={facility.ownership === 'GOVERNMENT' ? 'govt' : 'private'}>
                {facility.ownership === 'GOVERNMENT' ? 'Public Health Care' : 'Private'}
              </Badge>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {facility.type.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{facility.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> {facility.address}, {facility.district} (PIN: {facility.pinCode})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href={`tel:${facility.phone}`}>
              <Button variant="outline" size="sm" leftIcon={<PhoneCall className="w-3.5 h-3.5" />}>
                Call Facility
              </Button>
            </a>
            <Button size="sm" onClick={() => setIsBookingOpen(true)} leftIcon={<Calendar className="w-3.5 h-3.5" />}>
              Book Slot
            </Button>
          </div>
        </div>

        {/* Operating & Capabilities Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-100 pt-4">
          <div>
            <span className="text-slate-500 block">Operating Hours</span>
            <span className="font-semibold text-slate-900">{facility.operatingHours}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Emergency Services</span>
            <span className={`font-semibold ${facility.hasEmergency ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
              {facility.hasEmergency ? '24x7 Available' : 'No Emergency'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Teleconsultation</span>
            <span className={`font-semibold ${facility.hasTeleconsult ? 'text-teal-700 font-bold' : 'text-slate-700'}`}>
              {facility.hasTeleconsult ? 'Active Service' : 'In-Person Only'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Inpatient Beds</span>
            <span className="font-semibold text-slate-900">{facility.bedCount} Beds</span>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Departments & Services
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'doctors'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Doctors ({facility.practitioners?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('medicines')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'medicines'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Medicine Stock ({medicines.length})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'queue'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Queue Status
        </button>
      </div>

      {/* Tab 1: Departments */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Available Clinical Departments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facility.departments?.map((dept: any) => (
              <Card key={dept.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                {dept.headDoctor && (
                  <p className="text-xs text-slate-500">Department Lead: {dept.headDoctor}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Doctors List */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Medical Officers & Specialists on Duty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facility.practitioners?.map((doc: any) => (
              <Card key={doc.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.fullName}</h3>
                    <p className="text-xs text-teal-700 font-medium">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500">{doc.qualification}</p>
                  </div>
                  {doc.teleconsultActive && (
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <Video className="w-3 h-3 text-teal-600" /> Teleconsult
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Fee: <strong>{doc.consultationFee === 0 ? 'Free (Govt)' : `₹${doc.consultationFee}`}</strong></span>
                  <Button size="sm" onClick={() => setIsBookingOpen(true)}>Book Consult</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Medicine Inventory (Section 32) */}
      {activeTab === 'medicines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Essential Medicine Availability</h2>
              <p className="text-xs text-slate-500">
                Dispensed free of charge to patients. Live inventory tracked by hospital pharmacy.
              </p>
            </div>
            <span className="text-xs text-slate-400">Updated: Today</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {medicines.map((med) => (
              <Card key={med.id} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                  <Badge variant={med.isAvailable ? (med.isLowStock ? 'warning' : 'routine') : 'emergency'}>
                    {med.isAvailable ? (med.isLowStock ? 'Low Stock' : 'Available') : 'Out of Stock'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">{med.genericName} • {med.strength}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <span>Stock Quantity: <strong className="text-slate-900">{med.quantityInStock} {med.unit}</strong></span>
                  <span className="text-slate-400">Batch: {med.batchNumber}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Live Digital Queue (Section 20) */}
      {activeTab === 'queue' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live OPD Digital Queue Status</h2>
              <p className="text-xs text-slate-500">General OPD & Orthopedics Queue for Today</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Serving
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
              <span className="text-xs font-semibold text-teal-800 uppercase block mb-1">Now Serving</span>
              <span className="text-3xl font-extrabold text-teal-900">
                OPD-{activeQueue ? activeQueue.currentServingToken.toString().padStart(3, '0') : '012'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <span className="text-xs font-semibold text-sky-800 uppercase block mb-1">Total Tokens Issued</span>
              <span className="text-3xl font-extrabold text-sky-900">
                {activeQueue ? activeQueue.totalTokens : 18}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-semibold text-amber-800 uppercase block mb-1">Est. Wait Time</span>
              <span className="text-3xl font-extrabold text-amber-900">~15 Min</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed text-center">
            Queue tokens advance automatically as doctors complete consultations. If you arrive early, please check in at the counter or via your health worker.
          </p>
        </Card>
      )}

      {/* Appointment Booking Modal */}
      <Modal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} title="Reserve OPD Slot / Teleconsult">
        {bookingSuccess ? (
          <div className="text-center space-y-4 py-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Appointment Confirmed!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your appointment number is <strong className="font-mono text-slate-900">{bookingSuccess.appointmentNumber}</strong>
              </p>
              <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl inline-block text-xs font-bold text-teal-900">
                Queue Token: {bookingSuccess.queueToken} • Est. Wait: ~{bookingSuccess.estimatedWaitMinutes} mins
              </div>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Link href="/patient/appointments">
                <Button size="sm">View My Appointments</Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setIsBookingOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Mode</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBookType('IN_PERSON')}
                  className={`py-2 rounded-xl border text-center transition-colors ${
                    bookType === 'IN_PERSON'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  In-Person Visit
                </button>
                <button
                  type="button"
                  onClick={() => setBookType('TELECONSULT')}
                  className={`py-2 rounded-xl border text-center transition-colors ${
                    bookType === 'TELECONSULT'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Assisted Teleconsult
                </button>
              </div>
            </div>

            <Input
              label="Appointment Date"
              type="date"
              value={bookDate}
              onChange={(e) => setBookDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Symptoms</label>
              <textarea
                value={bookReason}
                onChange={(e) => setBookReason(e.target.value)}
                rows={3}
                required
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBookingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmittingBooking}>
                Confirm Booking
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
