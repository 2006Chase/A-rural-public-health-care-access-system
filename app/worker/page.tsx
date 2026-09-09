'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  HeartPulse,
  QrCode,
  CheckSquare,
  AlertTriangle,
  RefreshCw,
  Video,
  UserPlus,
  ArrowRight,
  FileScan,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function WorkerDashboardPage() {
  const { user, pendingSyncCount, triggerSync } = useApp();
  const [stats, setStats] = useState<any>({
    patientsToday: 8,
    pendingTasks: 4,
    highRiskCount: 3,
    activeTeleconsults: 1,
  });
  const [highRiskPatients, setHighRiskPatients] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWorkerData() {
      try {
        const [patientsRes, followupsRes] = await Promise.all([
          fetch('/api/patients?limit=6'),
          fetch('/api/followups?highRisk=true'),
        ]);

        if (patientsRes.ok) {
          const json = await patientsRes.json();
          setRecentPatients(json.data.slice(0, 4));
        }
        if (followupsRes.ok) {
          const json = await followupsRes.json();
          setHighRiskPatients(json.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load worker dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkerData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Status (Section 34) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="routine">Frontline Healthcare Portal</Badge>
            <span className="text-xs text-slate-500 font-medium">Kendur Sub-centre & Ayushman Arogya Mandir</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome, {user?.name || 'Sunita Shinde (ASHA)'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Assisted teleconsultation, offline vitals capture, maternal tracking, and high-risk patient follow-ups.
          </p>
        </div>

        {/* Sync Center Quick Trigger */}
        <div className="flex items-center gap-2">
          {pendingSyncCount > 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={triggerSync}
              className="text-amber-800 border-amber-300 bg-amber-50"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            >
              Sync {pendingSyncCount} Offline Changes
            </Button>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> All Records Synced
            </span>
          )}
        </div>
      </div>

      {/* Operational Metrics Cards (Section 34) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-teal-50/50 border-teal-100 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Patients Today</span>
          <p className="text-2xl font-extrabold text-teal-900">14</p>
          <span className="text-[11px] text-teal-700 font-medium">Kendur Sub-centre</span>
        </Card>

        <Card className="p-4 bg-amber-50/50 border-amber-100 space-y-1">
          <span className="text-xs text-slate-500 font-medium">High-Risk Cohort</span>
          <p className="text-2xl font-extrabold text-amber-900">3</p>
          <span className="text-[11px] text-amber-700 font-medium">Hypertension / Antenatal</span>
        </Card>

        <Card className="p-4 bg-sky-50/50 border-sky-100 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Teleconsult Requests</span>
          <p className="text-2xl font-extrabold text-sky-900">1 Active</p>
          <span className="text-[11px] text-sky-700 font-medium">Dr. Rajesh (Orthopedics)</span>
        </Card>

        <Card className="p-4 bg-purple-50/50 border-purple-100 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Pending Tasks</span>
          <p className="text-2xl font-extrabold text-purple-900">4</p>
          <span className="text-[11px] text-purple-700 font-medium">Home visits & reminders</span>
        </Card>
      </div>

      {/* Quick Action Bar (Section 34) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/worker/vitals">
            <Button size="md" className="w-full justify-start text-xs font-bold" leftIcon={<HeartPulse className="w-4 h-4" />}>
              Capture Vitals (Offline)
            </Button>
          </Link>
          <Link href="/worker/qr-scan">
            <Button size="md" variant="secondary" className="w-full justify-start text-xs font-bold" leftIcon={<QrCode className="w-4 h-4" />}>
              Scan Prescription QR
            </Button>
          </Link>
          <Link href="/worker/patients">
            <Button size="md" variant="outline" className="w-full justify-start text-xs font-bold" leftIcon={<UserPlus className="w-4 h-4" />}>
              Register / Search
            </Button>
          </Link>
          <Link href="/worker/ocr">
            <Button size="md" variant="outline" className="w-full justify-start text-xs font-bold" leftIcon={<FileScan className="w-4 h-4" />}>
              Scan Paper Document
            </Button>
          </Link>
        </div>
      </section>

      {/* Active Assisted Teleconsultation Card (Hero Step: Section 66) */}
      <Card className="p-5 border-teal-300 bg-gradient-to-r from-teal-50/60 to-white shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="urgent">Active Assisted Teleconsultation</Badge>
            <span className="text-xs font-bold text-slate-900">Anand Patil (54M, Kendur)</span>
          </div>
          <span className="text-xs text-teal-800 font-semibold flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-teal-600" /> Specialist: Dr. Rajesh Deshmukh (Shirur RH)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Chief Complaint</span>
            <span className="font-bold text-slate-900">Bilateral Knee Osteoarthritis (Severe pain)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Vitals Recorded</span>
            <span className="font-semibold text-slate-900">BP: 130/84 mmHg, Pulse: 76 bpm</span>
          </div>
          <div>
            <span className="text-slate-500 block">Action Needed</span>
            <span className="text-teal-800 font-bold">Assist video stream from sub-centre kiosk</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-100/60">
          <Link href="/worker/vitals?patientId=demo-patient">
            <Button size="sm" variant="outline">Update Vitals</Button>
          </Link>
          <Link href="/doctor/consult">
            <Button size="sm" leftIcon={<Video className="w-3.5 h-3.5" />}>
              Open Teleconsult Stream
            </Button>
          </Link>
        </div>
      </Card>

      {/* High-Risk Cohorts & Tasks (Section 33, 64) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* High Risk Follow-Up Tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              High-Risk Cohort Alerts ({highRiskPatients.length})
            </h2>
            <Link href="/worker/tasks" className="text-xs font-semibold text-teal-700 hover:underline">
              View All Tasks
            </Link>
          </div>

          <div className="space-y-3">
            {highRiskPatients.map((f) => (
              <Card key={f.id} className="p-4 border-amber-200/80 bg-amber-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-sm font-bold text-slate-900">{f.patient.fullName}</span>
                  </div>
                  <Badge variant="emergency">HIGH RISK</Badge>
                </div>
                <p className="text-xs text-slate-600">{f.reason}</p>
                <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
                  <span>Village: <strong className="text-slate-800">{f.patient.village}</strong></span>
                  <span className="text-amber-800 font-semibold">{f.notes || 'Home visit required'}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recently Registered Patients */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Patients ({recentPatients.length})
            </h2>
            <Link href="/worker/patients" className="text-xs font-semibold text-teal-700 hover:underline">
              Search Patient List
            </Link>
          </div>

          <div className="space-y-3">
            {recentPatients.map((p) => (
              <Card key={p.id} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{p.fullName}</span>
                  <Badge variant={p.riskLevel === 'HIGH' ? 'emergency' : p.riskLevel === 'MEDIUM' ? 'urgent' : 'routine'}>
                    {p.riskLevel}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono">ABHA: {p.nationalHealthId}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-1.5">
                  <span>{p.village} • {p.gender}</span>
                  <Link href={`/worker/vitals?patientId=${p.id}`} className="text-teal-700 font-semibold hover:underline">
                    Record Vitals $\to$
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
