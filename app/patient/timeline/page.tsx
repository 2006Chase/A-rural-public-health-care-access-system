'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  HeartPulse,
  Pill,
  FileText,
  Share2,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Filter,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function PatientTimelinePage() {
  const { user, t } = useApp();
  const [events, setEvents] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const patientId = user?.patientId || 'demo-id';
        const res = await fetch(`/api/patients/${patientId}/timeline`);
        if (res.ok) {
          const json = await res.json();
          setEvents(json.data);
        }
      } catch (err) {
        console.error('Timeline fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTimeline();
  }, [user]);

  const filteredEvents =
    filterType === 'ALL' ? events : events.filter((e) => e.type === filterType);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return <Stethoscope className="w-4 h-4 text-teal-600" />;
      case 'PRESCRIPTION':
        return <Pill className="w-4 h-4 text-sky-600" />;
      case 'DIAGNOSTIC':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'REFERRAL':
        return <Share2 className="w-4 h-4 text-purple-600" />;
      case 'FOLLOW_UP':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      default:
        return <HeartPulse className="w-4 h-4 text-slate-600" />;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="govt">Longitudinal Health Record</Badge>
          <span className="text-xs text-slate-500 font-medium">ABDM Interoperability Ready</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Medical Timeline</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Chronological record of consultations, prescriptions, lab results, and referrals across all public facilities.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            filterType === 'ALL'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Events ({events.length})
        </button>
        <button
          onClick={() => setFilterType('CONSULTATION')}
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            filterType === 'CONSULTATION'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Consultations
        </button>
        <button
          onClick={() => setFilterType('PRESCRIPTION')}
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            filterType === 'PRESCRIPTION'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Prescriptions
        </button>
        <button
          onClick={() => setFilterType('DIAGNOSTIC')}
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            filterType === 'DIAGNOSTIC'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Diagnostics
        </button>
        <button
          onClick={() => setFilterType('REFERRAL')}
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            filterType === 'REFERRAL'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Referrals
        </button>
      </div>

      {/* Timeline Stream */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-xs animate-pulse">Loading medical timeline...</div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-800">No events found in this category.</p>
          <p className="text-xs text-slate-500">Your consultations and tests will appear here chronologically.</p>
        </Card>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredEvents.map((evt) => {
            const isExpanded = expandedId === evt.id;
            const dateStr = new Date(evt.timestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center shadow-xs">
                  {getEventIcon(evt.type)}
                </div>

                <Card className="p-4 sm:p-5 border-slate-200/90 shadow-2xs space-y-3">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => toggleExpand(evt.id)}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          {dateStr}
                        </span>
                        <Badge variant={evt.status === 'SIGNED' || evt.status === 'FINISHED' || evt.status === 'RESULT_READY' ? 'routine' : 'urgent'}>
                          {evt.status}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                      <p className="text-xs text-slate-500">{evt.subtitle}</p>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Detailed Clinical Context (Expandable) */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-700 animate-in fade-in duration-150">
                      {evt.type === 'CONSULTATION' && (
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl">
                          <p><strong>Chief Complaint:</strong> {evt.details.chiefComplaint}</p>
                          <p><strong>Assessment:</strong> {evt.details.assessment}</p>
                          {evt.details.vitalsSummary && <p><strong>Vitals:</strong> {evt.details.vitalsSummary}</p>}
                          {evt.details.plan && <p><strong>Plan:</strong> {evt.details.plan}</p>}
                        </div>
                      )}

                      {evt.type === 'PRESCRIPTION' && (
                        <div className="space-y-2 bg-slate-50 p-3 rounded-xl">
                          <p><strong>Diagnosis:</strong> {evt.details.diagnosisSummary}</p>
                          <p><strong>Instructions:</strong> {evt.details.instructions}</p>
                          <div className="pt-1">
                            <span className="font-bold block mb-1">Prescribed Medicines ({evt.details.medicationCount}):</span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                              {evt.details.items?.map((item: any, i: number) => (
                                <li key={i}>
                                  <strong>{item.name}</strong> ({item.dosage}) — {item.frequency} for {item.duration}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-2">
                            <Link href="/patient/prescriptions">
                              <Button size="sm" variant="outline" className="text-xs">
                                View Prescription QR
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {evt.type === 'DIAGNOSTIC' && (
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl">
                          <p><strong>Order No:</strong> <span className="font-mono">{evt.details.orderNumber}</span></p>
                          <p><strong>Result Summary:</strong> {evt.details.resultSummary || 'Awaiting lab processing'}</p>
                          {evt.details.abnormalFlag && (
                            <span className="inline-block font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Clinical Flag: Needs Doctor Follow-up
                            </span>
                          )}
                        </div>
                      )}

                      {evt.type === 'REFERRAL' && (
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl">
                          <p><strong>Referral ID:</strong> <span className="font-mono">{evt.details.referralNumber}</span></p>
                          <p><strong>Reason:</strong> {evt.details.reason}</p>
                          <p><strong>Clinical Summary:</strong> {evt.details.clinicalSummary}</p>
                          <p><strong>Target Due Date:</strong> {evt.details.dueDate}</p>
                        </div>
                      )}

                      {evt.type === 'FOLLOW_UP' && (
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl">
                          <p><strong>Reason:</strong> {evt.details.reason}</p>
                          {evt.details.notes && <p><strong>Notes:</strong> {evt.details.notes}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
