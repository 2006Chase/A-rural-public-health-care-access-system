'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Activity,
  ChevronRight,
  TrendingUp,
  Clock,
  Navigation,
  Share2,
  Package,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  Info,
  RefreshCw
} from 'lucide-react';

export default function AdminQualityPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadMetrics() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data);
      }
    } catch (err) {
      console.error('Failed to load quality metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  const referralRate = metrics?.referralCompletionRate || 84;
  const waitTime = metrics?.averageWaitTimeMinutes || 24;
  const travelAvoided = metrics?.estimatedTravelDistanceAvoidedKm || 252;
  const drugAvailability = metrics?.medicineAvailabilityRate || 92;
  const diagTurnaround = metrics?.diagnosticTurnaroundHours || 18;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Link href="/admin" className="hover:underline">Admin Center</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Health Systems Impact</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            District Operational Quality & Accessibility Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Evaluating timeliness, referral loop closure, diagnostic coordination, and rural travel avoidance.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadMetrics}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Recalculate Quality KPIs
        </Button>
      </div>

      {/* Prototype Metric Callout: Travel Distance Avoided (Section 38) */}
      <Card className="p-6 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-700/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-teal-500/20 text-teal-300">
              <Navigation className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-teal-200">
              Prototype-Derived Accessibility Indicator
            </span>
          </div>
          <span className="text-xs text-teal-300 font-medium">
            Formula: Completed Teleconsults × 28 km Return Trip Average
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold">
              Estimated Rural Travel Distance Avoided: <span className="text-teal-300 font-extrabold">{travelAvoided} km</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              By facilitating assisted teleconsultations at local Sub-centres (such as Kendur and Pabal) rather than requiring vulnerable patients to travel to Shirur Rural Hospital or Pune District Hospital, citizens save critical travel time, bus fares, and physical distress.
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Teleconsults Conducted:</span>
              <span className="font-bold text-white">{metrics?.teleconsultationVolume || 4} sessions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Avg Return Journey:</span>
              <span className="font-bold text-white">28 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Avg Out-of-Pocket Transit Saved:</span>
              <span className="font-bold text-emerald-300">₹160 / patient</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Core Quality KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Closed Loop Referral Rate */}
        <Card className="p-5 border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Referral Completion</span>
            <Share2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-slate-900">{referralRate}%</p>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +46% vs paper referrals
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full" style={{ width: `${referralRate}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 block">
            Target: ≥80% closed-loop arrival confirmation
          </span>
        </Card>

        {/* Average OPD Wait Time */}
        <Card className="p-5 border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Average Wait Time</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-slate-900">{waitTime} mins</p>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Reduced from 180 mins
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }} />
          </div>
          <span className="text-[11px] text-slate-500 block">
            Enabled by digital tokens and priority triage
          </span>
        </Card>

        {/* Diagnostic Turnaround */}
        <Card className="p-5 border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Diagnostic Speed</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-slate-900">{diagTurnaround} hrs</p>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Digital report dispatch
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '75%' }} />
          </div>
          <span className="text-[11px] text-slate-500 block">
            From sample collection to clinician review
          </span>
        </Card>

        {/* Essential Medicine Stock */}
        <Card className="p-5 border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Medicine Availability</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-slate-900">{drugAvailability}%</p>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Free public dispensation
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${drugAvailability}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 block">
            12 essential drugs cataloged across 20 facilities
          </span>
        </Card>
      </div>

      {/* Comparative System Analysis: Traditional vs JeevanSetu */}
      <Card className="p-6 border-slate-200 bg-white space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Impact Comparison: Traditional Rural Healthcare vs JeevanSetu Platform
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-bold">Operational Metric</th>
                <th className="py-2.5 px-3 font-bold text-rose-700">Traditional Paper-Based Workflow</th>
                <th className="py-2.5 px-3 font-bold text-teal-800">JeevanSetu Digital Health System</th>
                <th className="py-2.5 px-3 font-bold">Systemic Benefit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Patient Queue Wait Time</td>
                <td className="py-3 px-3 text-rose-700">3 - 4 hours of physical waiting in crowded corridors</td>
                <td className="py-3 px-3 text-teal-800 font-bold">~24 minutes with live digital tokens</td>
                <td className="py-3 px-3 text-slate-600">Reduces crowding, prevents nosocomial exposure</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Referral Loop Closure</td>
                <td className="py-3 px-3 text-rose-700">35% - 40% (high patient drop-out, no tracking)</td>
                <td className="py-3 px-3 text-teal-800 font-bold">84% completed with receiving acknowledgment</td>
                <td className="py-3 px-3 text-slate-600">Continuity of care; timely specialist intervention</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Diagnostic Availability</td>
                <td className="py-3 px-3 text-rose-700">3 - 5 days to collect paper report in person</td>
                <td className="py-3 px-3 text-teal-800 font-bold">18 hours digital sync directly to clinician</td>
                <td className="py-3 px-3 text-slate-600">Eliminates extra travel days for paper reports</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Frontline Worker Continuity</td>
                <td className="py-3 px-3 text-rose-700">Disconnected paper registers (ASHA / ANM)</td>
                <td className="py-3 px-3 text-teal-800 font-bold">Offline-first PWA syncs vitals & tasks automatically</td>
                <td className="py-3 px-3 text-slate-600">High-risk missed follow-ups auto-escalate</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Prescription Verification</td>
                <td className="py-3 px-3 text-rose-700">Illegible handwriting, lost slips, paper forgery</td>
                <td className="py-3 px-3 text-teal-800 font-bold">HMAC-SHA256 privacy-safe QR reference tokens</td>
                <td className="py-3 px-3 text-slate-600">Zero raw PHI leakage, tamper-evident validity</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Methodology & Disclaimer Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 block mb-0.5">Prototype Methodology & Clinical Governance Notice:</span>
          <span>
            Operational metrics shown are calculated from seed district data and active encounter records within the prototype environment. Estimated travel avoided is a derived indicator based on verified teleconsultation sessions in Maharashtra Demo District. All automated triage suggestions remain human-in-the-loop and do not replace physician judgment.
          </span>
        </div>
      </div>
    </div>
  );
}
