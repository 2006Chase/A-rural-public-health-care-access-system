'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Compass,
  Video,
  Calendar,
  ShieldAlert,
  Building2,
  Clock,
  Pill,
  HeartPulse,
  FileText,
  ChevronRight,
  Sparkles,
  MapPin,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export default function PatientHomePage() {
  const { user, t } = useApp();
  const [upcomingCare, setUpcomingCare] = useState<any>(null);
  const [healthSnapshot, setHealthSnapshot] = useState<any>(null);
  const [nearbyFacilities, setNearbyFacilities] = useState<any[]>([]);
  const [govtSchemes, setGovtSchemes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPatientData() {
      try {
        const patientId = user?.patientId || 'temp-id';

        // Load patient summary
        const summaryRes = await fetch(`/api/patients/${patientId}/summary`).catch(() => null);
        if (summaryRes && summaryRes.ok) {
          const json = await summaryRes.json();
          setHealthSnapshot(json.data);
        }

        // Load upcoming appointments
        const apptRes = await fetch(`/api/appointments?patientId=${patientId}&status=CONFIRMED`).catch(() => null);
        if (apptRes && apptRes.ok) {
          const json = await apptRes.json();
          if (json.data && json.data.length > 0) {
            setUpcomingCare(json.data[0]);
          }
        }

        // Load nearby facilities
        const facRes = await fetch('/api/facilities?limit=4&sort=distance').catch(() => null);
        if (facRes && facRes.ok) {
          const json = await facRes.json();
          setNearbyFacilities(json.data.slice(0, 3));
        }

        // Seeded government schemes
        setGovtSchemes([
          {
            title: 'Ayushman Bharat PM-JAY',
            desc: 'Free cashless hospitalization up to ₹5 lakh per family per year.',
            badge: 'Financial Protection',
            helpline: '14555',
          },
          {
            title: 'Janani Suraksha Yojana (JSY)',
            desc: 'Safe motherhood intervention: ₹1,400 institutional delivery assistance.',
            badge: 'Maternal Care',
            helpline: '102',
          },
          {
            title: 'Tele-MANAS Mental Health',
            desc: '24x7 toll-free counseling & psychiatric care in Marathi & Hindi.',
            badge: 'Tele-Counseling',
            helpline: '14416',
          },
        ]);
      } catch (err) {
        console.error('Failed to load patient home data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPatientData();
  }, [user]);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Greeting & Search */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('patientHome.greeting')}, {user?.name || 'Anand Patil'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Kendur Village • ABHA: <span className="font-mono font-semibold">91-4829-1049-2810</span>
            </p>
          </div>
          <Link href="/patient/timeline">
            <Button size="sm" variant="outline" leftIcon={<HeartPulse className="w-3.5 h-3.5 text-teal-600" />}>
              {t('nav.health')}
            </Button>
          </Link>
        </div>

        {/* Universal Search Bar (Section 88) */}
        <Link href="/patient/facilities" className="block">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400" />
            <div className="w-full bg-white border border-slate-300 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-500 shadow-xs hover:border-slate-400 cursor-pointer">
              Search nearby clinics, doctors, tests, or medicine stock...
            </div>
          </div>
        </Link>
      </section>

      {/* Primary Action Buttons (Section 11) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {t('patientHome.whatDoYouNeed')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Find Care */}
          <Link href="/patient/facilities">
            <Card hoverable className="p-4 flex flex-col items-start justify-between h-full bg-sky-50/50 border-sky-100 group">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  {t('patientHome.findCare')}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {t('patientHome.findCareDesc')}
                </p>
              </div>
            </Card>
          </Link>

          {/* Talk to Doctor (Teleconsult) */}
          <Link href="/patient/ai-intake">
            <Card hoverable className="p-4 flex flex-col items-start justify-between h-full bg-teal-50/50 border-teal-100 group">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  {t('patientHome.talkToDoctor')}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {t('patientHome.talkToDoctorDesc')}
                </p>
              </div>
            </Card>
          </Link>

          {/* Book Appointment */}
          <Link href="/patient/facilities?action=book">
            <Card hoverable className="p-4 flex flex-col items-start justify-between h-full bg-indigo-50/50 border-indigo-100 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  {t('patientHome.bookAppointment')}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {t('patientHome.bookAppointmentDesc')}
                </p>
              </div>
            </Card>
          </Link>

          {/* Emergency Help */}
          <Link href="/patient/ai-intake?demo=emergency">
            <Card hoverable className="p-4 flex flex-col items-start justify-between h-full bg-red-50/60 border-red-200 group">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-red-950 text-sm sm:text-base leading-tight">
                  {t('patientHome.emergency')}
                </h3>
                <p className="text-[11px] text-red-800 mt-1 line-clamp-2">
                  Ambulance 108, 24x7 casualty & urgent care
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Care Pathway: Government vs. Private (Section 12) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {t('patientHome.carePathway')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/patient/facilities?ownership=GOVERNMENT">
            <Card hoverable className="p-5 border-sky-300/80 bg-gradient-to-r from-sky-50/60 to-white flex items-start justify-between group">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="govt">Public Healthcare First</Badge>
                  <span className="text-[10px] text-sky-800 font-bold">100% Free / Subsidized</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{t('patientHome.governmentHealthcare')}</h3>
                <p className="text-xs text-slate-600 max-w-sm">
                  Sub-centres, PHCs, Rural & District Hospitals. Free diagnostics, free generic medicines, and ASHA support.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-sky-600 group-hover:translate-x-1 transition-transform mt-2" />
            </Card>
          </Link>

          <Link href="/patient/facilities?ownership=PRIVATE">
            <Card hoverable className="p-5 border-purple-200 bg-gradient-to-r from-purple-50/60 to-white flex items-start justify-between group">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="private">Private Network</Badge>
                  <span className="text-[10px] text-purple-800 font-medium">Registered Facilities</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{t('patientHome.privateHealthcare')}</h3>
                <p className="text-xs text-slate-600 max-w-sm">
                  Empaneled private nursing homes, specialty hospitals, and licensed diagnostic imaging labs.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform mt-2" />
            </Card>
          </Link>
        </div>
      </section>

      {/* Upcoming Care & Live Queue Status (Section 11, 20) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('patientHome.upcomingCare')}
          </h2>
          <Link href="/patient/appointments" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
            {t('patientHome.viewAll')}
          </Link>
        </div>

        {upcomingCare ? (
          <Card className="border-teal-300/80 bg-teal-50/30 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="urgent">Today's Appointment</Badge>
                <span className="text-xs font-mono font-semibold text-slate-600">{upcomingCare.appointmentNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-teal-200 text-teal-900 font-semibold text-xs shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('patientHome.token')}: {upcomingCare.queueToken || 'ORTHO-014'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Doctor & Specialty</span>
                <span className="font-bold text-slate-900 text-sm">
                  {upcomingCare.practitioner?.fullName || 'Dr. Rajesh Deshmukh'}
                </span>
                <span className="text-teal-700 block font-medium">Orthopedics Specialist</span>
              </div>

              <div>
                <span className="text-slate-500 block">Facility & Mode</span>
                <span className="font-bold text-slate-900 text-sm">
                  {upcomingCare.facility?.name || 'Shirur Rural Hospital'}
                </span>
                <span className="text-slate-600 block">Assisted Teleconsultation</span>
              </div>

              <div className="sm:text-right">
                <span className="text-slate-500 block">Estimated Wait</span>
                <span className="font-extrabold text-teal-800 text-base">~10 Minutes</span>
                <span className="text-[11px] text-slate-500 block">Serving Token: ORTHO-012</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-teal-100/60">
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ASHA Sunita connected from Sub-centre
              </span>
              <Link href="/patient/ai-intake">
                <Button size="sm">Connect Teleconsult Room</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-5 text-center text-xs text-slate-500">
            {t('patientHome.noUpcoming')}
          </Card>
        )}
      </section>

      {/* Health Snapshot (Section 11, 16) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {t('patientHome.healthSnapshot')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Active Conditions */}
          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>{t('patientHome.activeConditions')}</span>
            </div>
            <p className="text-sm font-bold text-slate-900">Bilateral Knee Osteoarthritis</p>
            <p className="text-[11px] text-slate-500">Grade II • Conservative joint care protocol</p>
          </Card>

          {/* Recent Prescription */}
          <Link href="/patient/prescriptions">
            <Card hoverable className="p-4 space-y-2 h-full">
              <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>{t('patientHome.recentPrescription')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-900">Rx #RX-2026-0818-099</p>
              <p className="text-[11px] text-teal-700 font-medium">Paracetamol, Calcium+D3, Diclofenac</p>
            </Card>
          </Link>

          {/* Pending Diagnostic Test */}
          <Link href="/patient/timeline">
            <Card hoverable className="p-4 space-y-2 h-full">
              <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>{t('patientHome.pendingTest')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-900">Bilateral Knee X-Ray (AP/Lat)</p>
              <p className="text-[11px] text-emerald-700 font-semibold">Report Ready & Reviewed</p>
            </Card>
          </Link>
        </div>
      </section>

      {/* Nearby Public Health Facilities (Section 11, 13) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('patientHome.nearbyFacilities')}
          </h2>
          <Link href="/patient/facilities" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
            {t('patientHome.viewAll')}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {nearbyFacilities.map((fac) => (
            <Link key={fac.id} href={`/patient/facilities/${fac.id}`}>
              <Card hoverable className="p-4 space-y-2.5 h-full">
                <div className="flex items-center justify-between">
                  <Badge variant={fac.ownership === 'GOVERNMENT' ? 'govt' : 'private'}>
                    {fac.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-700">{fac.distanceKm} km</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{fac.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {fac.address}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                  <span>Queue: <strong className="text-slate-900">{fac.queueWaitingCount} waiting</strong></span>
                  <span className="text-teal-700 font-medium">{fac.travelTimeMinutes} min trip</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Verified Government Schemes Awareness (Section 39, 62) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('patientHome.govtServices')}
          </h2>
          <span className="text-xs text-slate-400">Verified Schemes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {govtSchemes.map((scheme, idx) => (
            <Card key={idx} className="p-4 space-y-2 bg-slate-50/60 border-slate-200/90">
              <Badge variant="govt">{scheme.badge}</Badge>
              <h3 className="text-sm font-bold text-slate-900">{scheme.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{scheme.desc}</p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200">
                <span className="text-slate-500">Helpline: <strong className="text-slate-900">{scheme.helpline}</strong></span>
                <a href={`tel:${scheme.helpline}`} className="text-teal-700 font-semibold hover:underline">Call Free</a>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
