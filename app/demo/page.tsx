'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Play,
  CheckCircle2,
  ShieldAlert,
  FileScan,
  WifiOff,
  Stethoscope,
  ArrowRight,
  UserCheck,
  Building2,
  QrCode,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function DemoHubPage() {
  const { switchDemoRole } = useApp();
  const [activeStep, setActiveStep] = useState<number>(1);

  const heroSteps = [
    {
      step: 1,
      title: 'Patient Triage (AI Intake)',
      role: 'PATIENT',
      description: 'Anand Patil (farmer in Kendur) enters severe knee pain and inability to travel.',
      link: '/patient/ai-intake',
      linkText: 'Open AI Symptom Assistant',
    },
    {
      step: 2,
      title: 'Facility Discovery & Govt Care',
      role: 'PATIENT',
      description: 'System prioritizes Shirur Rural Hospital Orthopedics & recommends assisted teleconsultation.',
      link: '/patient/facilities',
      linkText: 'View Ranked Facilities',
    },
    {
      step: 3,
      title: 'Health Worker Vitals Capture',
      role: 'HEALTH_WORKER',
      description: 'Sunita Shinde (ASHA) records patient vitals and connects the video session from the Sub-centre.',
      link: '/worker',
      linkText: 'Open Worker Dashboard',
    },
    {
      step: 4,
      title: 'Doctor 3-Panel Consultation',
      role: 'DOCTOR',
      description: 'Dr. Rajesh reviews summary and timeline, issues digital Rx with signed QR and 14-day follow-up.',
      link: '/doctor/consult',
      linkText: 'Open Clinical Consultation',
    },
    {
      step: 5,
      title: 'Patient Receives Signed Rx & QR',
      role: 'PATIENT',
      description: 'Patient sees prescription with privacy-safe QR code and upcoming care schedule.',
      link: '/patient/prescriptions',
      linkText: 'View Electronic Prescription',
    },
    {
      step: 6,
      title: 'QR Scan at Referral Facility',
      role: 'HEALTH_WORKER',
      description: 'Worker scans QR at hospital, verifies HMAC cryptographic signature, and opens authorized record.',
      link: '/worker/qr-scan',
      linkText: 'Launch QR Scanner',
    },
    {
      step: 7,
      title: 'Diagnostic Order & District Referral',
      role: 'DOCTOR',
      description: 'Digital X-Ray ordered, results reviewed, and closed-loop referral sent to District Hospital.',
      link: '/doctor/records',
      linkText: 'View Diagnostics & Referrals',
    },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Smart India Hackathon Evaluator Hub
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">5-Minute Demonstration Journeys</h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
          Execute each workflow end-to-end against live local database seeds without external healthcare dependencies.
        </p>
      </div>

      {/* Hero Journey 1: Connected Care */}
      <Card className="border-teal-200/80 bg-gradient-to-b from-white to-teal-50/20 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="govt">Primary Hero Journey</Badge>
              <span className="text-xs text-slate-500 font-medium">31 Steps End-to-End</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Rural Knee Pain & Assisted Care Continuity
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Follow Anand Patil from symptom triage $\to$ teleconsult $\to$ electronic prescription $\to$ QR scan $\to$
              X-ray $\to$ district referral.
            </p>
          </div>
          <Link href="/patient/ai-intake">
            <Button size="md" leftIcon={<Play className="w-4 h-4" />}>
              Start Hero Journey
            </Button>
          </Link>
        </div>

        {/* Step-by-Step Interactive Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {heroSteps.map((s) => (
            <div
              key={s.step}
              className={`p-4 rounded-2xl border transition-all ${
                activeStep === s.step
                  ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                  : 'bg-white/70 border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setActiveStep(s.step)}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs">
                  {s.step}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {s.role}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{s.title}</h3>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">{s.description}</p>
              <Link
                href={s.link}
                onClick={() => switchDemoRole(s.role as any)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
              >
                <span>{s.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 Specialized Scenario Demos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Demo 2: Emergency Safety Triage */}
        <Card hoverable className="space-y-4 border-red-200/80 bg-gradient-to-b from-white to-red-50/20">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <Badge variant="emergency">Scenario 2</Badge>
            <h3 className="font-bold text-slate-900 text-base mt-1">Emergency Red-Flag Intake</h3>
            <p className="text-xs text-slate-600 mt-1">
              Patient enters acute chest tightness. AI interrupts chat, halts normal flow, activates 108 emergency
              guidance, and locates nearest 24x7 emergency hospital.
            </p>
          </div>
          <Link href="/patient/ai-intake?demo=emergency" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full text-red-700 border-red-200 hover:bg-red-50">
              Run Emergency Demo
            </Button>
          </Link>
        </Card>

        {/* Demo 3: Paper Prescription OCR */}
        <Card hoverable className="space-y-4 border-indigo-200/80 bg-gradient-to-b from-white to-indigo-50/20">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <FileScan className="w-5 h-5" />
          </div>
          <div>
            <Badge variant="private">Scenario 3</Badge>
            <h3 className="font-bold text-slate-900 text-base mt-1">Paper Prescription OCR</h3>
            <p className="text-xs text-slate-600 mt-1">
              Uploads physical handwritten doctor slip. Extracts medicines and dosages with confidence scores for
              human verification before saving.
            </p>
          </div>
          <Link href="/worker/ocr" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-50">
              Run OCR Scanner Demo
            </Button>
          </Link>
        </Card>

        {/* Demo 4: Offline-First & Sync */}
        <Card hoverable className="space-y-4 border-amber-200/80 bg-gradient-to-b from-white to-amber-50/20">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <Badge variant="urgent">Scenario 4</Badge>
            <h3 className="font-bold text-slate-900 text-base mt-1">Offline Vitals Capture & Sync</h3>
            <p className="text-xs text-slate-600 mt-1">
              Simulate zero connectivity at remote sub-centre. Health worker records vitals locally in Dexie IndexedDB.
              Reconnects and automatically syncs to cloud.
            </p>
          </div>
          <Link href="/worker/vitals" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full text-amber-800 border-amber-200 hover:bg-amber-50">
              Run Offline Sync Demo
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
