'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Stethoscope,
  Users,
  Clock,
  Video,
  FileText,
  Share2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const { user } = useApp();
  const [queueEntries, setQueueEntries] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 18,
    waitingInQueue: 6,
    urgentCases: 2,
    pendingDiagnosticReviews: 3,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDoctorData() {
      try {
        const res = await fetch('/api/queues/queue-1').catch(() => null);
        // Fallback: fetch appointments
        const apptRes = await fetch('/api/appointments?limit=6');
        if (apptRes.ok) {
          const json = await apptRes.json();
          setQueueEntries(json.data);
        }
      } catch (err) {
        console.error('Doctor data load failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDoctorData();
  }, []);

  return (
    <div className="space-y-8 pb-14">
      {/* Header (Section 35) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="routine">Clinical Outpatient & Specialist Portal</Badge>
            <span className="text-xs text-slate-500 font-medium">Shirur Rural Hospital • Orthopedics OPD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {user?.name || 'Dr. Rajesh Deshmukh'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Today's outpatient queue, assisted teleconsultations, electronic prescriptions, and diagnostic reviews.
          </p>
        </div>

        <Link href="/doctor/consult">
          <Button size="md" leftIcon={<Stethoscope className="w-4 h-4" />}>
            Open Next Patient (Anand Patil)
          </Button>
        </Link>
      </div>

      {/* Metrics Row (Section 35) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-teal-50/50 border-teal-100 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Today's Total OPD</span>
          <p className="text-2xl font-extrabold text-teal-900">{stats.todayAppointments}</p>
          <span className="text-[11px] text-teal-700 font-medium">12 completed • 6 waiting</span>
        </Card>

        <Card className="p-4 bg-amber-50/50 border-amber-100 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Urgent Triage Cases</span>
          <p className="text-2xl font-extrabold text-amber-900">{stats.urgentCases}</p>
          <span className="text-[11px] text-amber-700 font-medium">Prioritized in queue</span>
        </Card>

        <Card className="p-4 bg-sky-50/50 border-sky-100 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Virtual Consultations</span>
          <p className="text-2xl font-extrabold text-sky-900">4</p>
          <span className="text-[11px] text-sky-700 font-medium">Kendur & Pabal Sub-centres</span>
        </Card>

        <Card className="p-4 bg-indigo-50/50 border-indigo-100 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Diagnostic Reviews Due</span>
          <p className="text-2xl font-extrabold text-indigo-900">{stats.pendingDiagnosticReviews}</p>
          <span className="text-[11px] text-indigo-700 font-medium">X-Rays & Blood panels</span>
        </Card>
      </div>

      {/* Quick Action Clinical Toolbar */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/doctor/consult">
            <Button size="md" className="w-full justify-start text-xs font-bold" leftIcon={<Stethoscope className="w-4 h-4" />}>
              Start Consultation
            </Button>
          </Link>
          <Link href="/doctor/queue">
            <Button size="md" variant="outline" className="w-full justify-start text-xs font-bold" leftIcon={<Clock className="w-4 h-4" />}>
              Manage Digital Queue
            </Button>
          </Link>
          <Link href="/doctor/records">
            <Button size="md" variant="outline" className="w-full justify-start text-xs font-bold" leftIcon={<FileText className="w-4 h-4" />}>
              Order Diagnostics
            </Button>
          </Link>
          <Link href="/doctor/records?tab=referrals">
            <Button size="md" variant="outline" className="w-full justify-start text-xs font-bold" leftIcon={<Share2 className="w-4 h-4" />}>
              District Referrals
            </Button>
          </Link>
        </div>
      </section>

      {/* Hero Consultation Card (Section 66) */}
      <Card className="p-5 border-teal-300 bg-gradient-to-r from-teal-50/70 to-white shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="urgent">Next in Queue: Assisted Teleconsult</Badge>
            <span className="text-xs font-bold text-slate-900">Token ORTHO-014</span>
          </div>
          <span className="text-xs text-teal-800 font-semibold flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-teal-600" /> Assisted from Kendur Sub-centre (ASHA Sunita)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Patient Name</span>
            <span className="font-bold text-slate-900 text-sm">Anand Patil (54M)</span>
            <span className="text-slate-500 block">Kendur Village</span>
          </div>
          <div>
            <span className="text-slate-400 block">Presenting Complaint</span>
            <span className="font-semibold text-slate-900">Bilateral Knee Pain (Severe travel barrier)</span>
          </div>
          <div>
            <span className="text-slate-400 block">Recent Vitals</span>
            <span className="font-semibold text-slate-900">BP: 130/84, HR: 76, Wt: 74kg</span>
          </div>
          <div className="sm:text-right flex items-center justify-end">
            <Link href="/doctor/consult">
              <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Launch 3-Panel Screen
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* OPD Waiting Queue Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Today's Outpatient Appointments ({queueEntries.length})
          </h2>
          <Link href="/doctor/queue" className="text-xs font-semibold text-teal-700 hover:underline">
            View Full Queue
          </Link>
        </div>

        <div className="space-y-2">
          {queueEntries.map((entry) => (
            <Card key={entry.id} className="p-4 space-y-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={entry.status === 'CONFIRMED' ? 'urgent' : 'routine'}>
                    {entry.queueToken || 'OPD-014'}
                  </Badge>
                  <span className="font-bold text-sm text-slate-900">{entry.patient?.fullName}</span>
                  <span className="text-xs text-slate-500">
                    ({entry.patient?.gender?.charAt(0)}, {entry.patient?.village})
                  </span>
                  {entry.type === 'TELECONSULT' && (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                      <Video className="w-3 h-3" /> Teleconsult
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{entry.reason}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-slate-500">{entry.timeSlot}</span>
                <Link href={`/doctor/consult?patientId=${entry.patientId}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Start Consultation
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
