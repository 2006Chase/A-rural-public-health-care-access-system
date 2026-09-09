'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  Package,
  Activity,
  ShieldCheck,
  Users,
  Clock,
  Share2,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Search
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useApp();
  const [metrics, setMetrics] = useState<any>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    try {
      setLoading(true);
      const [metRes, facRes, logRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/facilities?limit=8'),
        fetch('/api/admin/audit-logs?limit=5'),
      ]);

      if (metRes.ok) {
        const d = await metRes.json();
        setMetrics(d.data);
      }
      if (facRes.ok) {
        const d = await facRes.json();
        setFacilities(d.data || []);
      }
      if (logRes.ok) {
        const d = await logRes.json();
        setRecentLogs(d.data || []);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="routine">District Operations & Health Governance</Badge>
            <span className="text-xs text-slate-500 font-medium">Maharashtra Demo District (Pune Division)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            District Healthcare Command & Quality Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time monitoring of rural health facilities, digital outpatient queues, medicine stockouts, and referral completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAdminData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Metrics
          </Button>

          <Link href="/admin/quality">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold" leftIcon={<Activity className="w-3.5 h-3.5" />}>
              Quality Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-teal-50/50 border-teal-200 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Registered Citizens</span>
          <p className="text-2xl font-extrabold text-teal-900">{metrics?.totalPatientsRegistered || 150}</p>
          <span className="text-[11px] text-teal-700 font-medium">ABHA seeded</span>
        </Card>

        <Card className="p-3.5 bg-sky-50/50 border-sky-200 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Consults</span>
          <p className="text-2xl font-extrabold text-sky-900">{metrics?.totalEncountersRecorded || 18}</p>
          <span className="text-[11px] text-sky-700 font-medium">{metrics?.teleconsultationVolume || 4} virtual visits</span>
        </Card>

        <Card className="p-3.5 bg-indigo-50/50 border-indigo-200 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Referral Completion</span>
          <p className="text-2xl font-extrabold text-indigo-900">{metrics?.referralCompletionRate || 84}%</p>
          <span className="text-[11px] text-indigo-700 font-medium">Closed-loop tracking</span>
        </Card>

        <Card className="p-3.5 bg-emerald-50/50 border-emerald-200 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Drug Availability</span>
          <p className="text-2xl font-extrabold text-emerald-900">{metrics?.medicineAvailabilityRate || 92}%</p>
          <span className="text-[11px] text-emerald-700 font-medium">Essential list</span>
        </Card>

        <Card className="p-3.5 bg-amber-50/50 border-amber-200 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Average Wait Time</span>
          <p className="text-2xl font-extrabold text-amber-900">{metrics?.averageWaitTimeMinutes || 24}m</p>
          <span className="text-[11px] text-amber-700 font-medium">Digital token queues</span>
        </Card>

        <Card className="p-3.5 bg-purple-50/50 border-purple-200 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Travel Avoided</span>
          <p className="text-2xl font-extrabold text-purple-900">{metrics?.estimatedTravelDistanceAvoidedKm || 252} km</p>
          <span className="text-[11px] text-purple-700 font-medium">Teleconsult impact</span>
        </Card>
      </div>

      {/* Admin Quick Navigation Hub */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Administrative Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/facilities">
            <Card className="p-4 hover:border-teal-400 hover:shadow-sm transition-all space-y-2 border-slate-200 h-full">
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Facility Governance</h3>
              <p className="text-xs text-slate-600">
                Manage 20 district health centres, beds, doctor duty rosters, and capability toggles.
              </p>
              <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 pt-1">
                Manage Facilities <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          <Link href="/admin/inventory">
            <Card className="p-4 hover:border-teal-400 hover:shadow-sm transition-all space-y-2 border-slate-200 h-full">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Medicine Stock & Shortages</h3>
              <p className="text-xs text-slate-600">
                Inspect 12 essential medicines across facilities with automated low-stock warnings.
              </p>
              <span className="text-xs font-semibold text-amber-700 flex items-center gap-1 pt-1">
                View Inventory <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          <Link href="/admin/quality">
            <Card className="p-4 hover:border-teal-400 hover:shadow-sm transition-all space-y-2 border-slate-200 h-full">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-800">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Quality & Travel Metrics</h3>
              <p className="text-xs text-slate-600">
                Review operational KPIs: referral turnaround, diagnostic speed, and estimated travel avoided.
              </p>
              <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1 pt-1">
                Inspect Quality <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          <Link href="/admin/audit">
            <Card className="p-4 hover:border-teal-400 hover:shadow-sm transition-all space-y-2 border-slate-200 h-full">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Compliance & Audit Trail</h3>
              <p className="text-xs text-slate-600">
                Tamper-evident logs of signed prescriptions, QR scans, and clinical access events.
              </p>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-1">
                View Audit Trail <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>
        </div>
      </section>

      {/* Critical Attention Alert: High Risk Escalation */}
      <Card className="p-4 border-amber-300 bg-amber-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Automatic High-Risk Patient Escalation Dispatched
            </h4>
            <p className="text-xs text-amber-900">
              Patient Meena Kale (58F, Hypertension BP: 168/104) missed scheduled visit. ASHA worker Sunita Shinde has been assigned an automated home-visit follow-up task.
            </p>
          </div>
        </div>

        <Link href="/worker/tasks" className="shrink-0">
          <Button size="sm" variant="outline" className="text-xs font-bold border-amber-400 text-amber-900 hover:bg-amber-100">
            View Worker Task
          </Button>
        </Link>
      </Card>

      {/* Facility Operations Preview Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            District Facilities Quick Status ({facilities.length})
          </h2>
          <Link href="/admin/facilities" className="text-xs font-semibold text-teal-700 hover:underline">
            View All 20 Facilities
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {facilities.map((fac) => (
            <Card key={fac.id} className="p-4 space-y-2 border-slate-200 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{fac.name}</h3>
                  <span className="text-xs text-slate-500">
                    {fac.type?.replace(/_/g, ' ')} • {fac.address}
                  </span>
                </div>
                <Badge variant={fac.ownership === 'GOVERNMENT' ? 'routine' : 'urgent'}>
                  {fac.ownership}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span className="font-medium">Beds: {fac.bedCount || 10}</span>
                {fac.hasEmergency && (
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    • 24x7 Emergency
                  </span>
                )}
                {fac.hasTeleconsult && (
                  <span className="text-sky-700 font-semibold flex items-center gap-1">
                    • Teleconsult Hub
                  </span>
                )}
                {fac.hasPharmacy && (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    • Free Pharmacy
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Audit Events Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Live Compliance Audit Events
          </h2>
          <Link href="/admin/audit" className="text-xs font-semibold text-teal-700 hover:underline">
            Full Audit Inspector
          </Link>
        </div>

        <Card className="p-4 border-slate-200 bg-white divide-y divide-slate-100">
          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">No recent audit logs recorded.</p>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="routine">{log.action}</Badge>
                  <span className="font-bold text-slate-800">{log.resource}</span>
                  <span className="text-slate-400">by</span>
                  <span className="font-semibold text-slate-700">{log.actorRole}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="text-[11px]">{new Date(log.timestamp).toLocaleTimeString('en-IN')}</span>
                  <span className="font-bold text-emerald-700">{log.outcome}</span>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
