'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  HeartHandshake,
  Compass,
  Clock,
  QrCode,
  WifiOff,
  Globe2,
  Stethoscope,
  Activity,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const { switchDemoRole } = useApp();

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Smart India Hackathon Prototype • Problem Statement #SIH2026
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
          Healthcare access should <span className="text-teal-600">not depend on distance</span>.
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Connect patients, frontline health workers, doctors, and public healthcare facilities through one unified,
          continuous care journey.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/patient">
            <Button size="lg" className="shadow-md">
              Launch Patient Experience <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline">
              5-Minute Interactive Demo
            </Button>
          </Link>
        </div>

        {/* Quick Role Switch Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Persona Jump:</span>
          <button
            onClick={() => switchDemoRole('PATIENT')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            Rural Patient (Anand)
          </button>
          <button
            onClick={() => switchDemoRole('HEALTH_WORKER')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            ASHA Worker (Sunita)
          </button>
          <button
            onClick={() => switchDemoRole('DOCTOR')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            Doctor (Dr. Rajesh)
          </button>
          <button
            onClick={() => switchDemoRole('FACILITY_ADMIN')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            Hospital Admin
          </button>
        </div>
      </section>

      {/* Connected Care Journey (Section 146) */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <Badge variant="govt">Connected Continuity</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How JeevanSetu Connects Care</h2>
          <p className="text-sm text-slate-600">
            A person should not have to repeatedly travel long distances, wait in queues, or carry fragmented paper
            records across facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Smart Intake & Triage</h3>
            <p className="text-xs text-slate-600">
              Safe AI intake identifies required specialties and transparently directs patients to nearby public health
              centres or assisted teleconsult.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Assisted Teleconsultation</h3>
            <p className="text-xs text-slate-600">
              ASHA workers capture vitals at the village sub-centre and connect patients directly to hospital
              specialists.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Signed Digital Rx & QR</h3>
            <p className="text-xs text-slate-600">
              Doctors issue electronic prescriptions with cryptographically signed, privacy-safe QR references (never
              exposing raw clinical data).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
              4
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Closed-Loop Follow-ups</h3>
            <p className="text-xs text-slate-600">
              Automated 14-day follow-ups, diagnostic tracking, and district hospital referrals with high-risk ASHA task
              escalation.
            </p>
          </div>
        </div>
      </section>

      {/* Product Value Cards (Section 113) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="routine">Realized Prototype Impact</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Built For Rural Realities</h2>
          <p className="text-sm text-slate-600">
            Every feature directly strengthens public healthcare delivery and overcomes infrastructure bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Reduced Travel Burden</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Virtual teleconsultation and transparent facility capability discovery prevent unnecessary 30+ km
              travel to crowded district civil hospitals.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Transparent Digital Queues</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Live OPD token progression and estimated waiting times eliminate hours spent waiting in physical clinic
              corridors.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Offline-First Resilience</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              PWA architecture with Dexie IndexedDB sync queues allows frontline workers to record vitals and view
              patient records without connectivity.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Multilingual By Architecture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete externalized localization in Marathi (मराठी), Hindi (हिंदी), and English with automatic fallback
              and zero hardcoded strings.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Signed QR Privacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cryptographically signed, opaque token references allow cross-facility records linking without exposing
              raw patient diagnoses in the QR.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">FHIR & ABDM Ready</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardized HL7 FHIR R4 mapping adapters and ABDM integration interfaces ready for future national
              onboarding.
            </p>
          </Card>
        </div>
      </section>

      {/* Role Access Cards */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-teal-400 font-semibold text-xs uppercase tracking-wider">Role-Based Experiences</span>
          <h2 className="text-2xl sm:text-3xl font-bold">Explore By Persona</h2>
          <p className="text-slate-400 text-sm">
            Each role in the healthcare continuity chain has a purpose-built, accessible workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/patient"
            className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 space-y-3 transition-colors block"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              P
            </div>
            <h3 className="font-bold text-base">Patient Portal</h3>
            <p className="text-xs text-slate-400">
              Government vs Private care discovery, AI triage, teleconsult requests, digital prescriptions, and timeline.
            </p>
          </Link>

          <Link
            href="/worker"
            className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 space-y-3 transition-colors block"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              W
            </div>
            <h3 className="font-bold text-base">Health Worker (ASHA)</h3>
            <p className="text-xs text-slate-400">
              Register patients, scan QR, capture vitals offline, assist teleconsults, and monitor high-risk cohorts.
            </p>
          </Link>

          <Link
            href="/doctor"
            className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 space-y-3 transition-colors block"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              D
            </div>
            <h3 className="font-bold text-base">Doctor Clinical Desk</h3>
            <p className="text-xs text-slate-400">
              3-panel clinical layout, urgent queue priority, signed digital prescriptions, diagnostic orders, and
              referrals.
            </p>
          </Link>

          <Link
            href="/admin"
            className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 space-y-3 transition-colors block"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              A
            </div>
            <h3 className="font-bold text-base">Facility & Quality Admin</h3>
            <p className="text-xs text-slate-400">
              OPD queue loads, medicine inventory with stock alerts, audit logs, and estimated travel distance avoided.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
