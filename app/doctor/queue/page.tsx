'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Clock,
  Volume2,
  Video,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Stethoscope,
  ChevronRight,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function DoctorQueuePage() {
  const { user } = useApp();
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [callingNext, setCallingNext] = useState(false);
  const [callMessage, setCallMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'WAITING' | 'CALLED' | 'COMPLETED'>('WAITING');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingPriorityId, setUpdatingPriorityId] = useState<string | null>(null);

  async function fetchQueue() {
    try {
      setLoading(true);
      // Try to fetch active queue from /api/queues
      const res = await fetch('/api/queues');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setQueue(json.data[0]);
          return;
        }
      }
      // Fallback: try default queue-1 or first queue
      const singleRes = await fetch('/api/queues/queue-1').catch(() => null);
      if (singleRes && singleRes.ok) {
        const json = await singleRes.json();
        setQueue(json.data);
      }
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQueue();
  }, []);

  async function handleCallNext() {
    if (!queue?.id) return;
    try {
      setCallingNext(true);
      setCallMessage(null);
      const res = await fetch(`/api/queues/${queue.id}/call-next`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCallMessage(data.message || 'Next token called.');
        await fetchQueue();
      } else {
        setCallMessage(data.message || 'No more waiting patients.');
      }
    } catch (err) {
      setCallMessage('Failed to call next token.');
    } finally {
      setCallingNext(false);
    }
  }

  async function handlePriorityChange(queueEntryId: string, newPriority: string) {
    if (!queue?.id) return;
    try {
      setUpdatingPriorityId(queueEntryId);
      const res = await fetch(`/api/queues/${queue.id}/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueEntryId,
          priority: newPriority,
          reason: 'Doctor clinical triage adjustment',
        }),
      });
      if (res.ok) {
        await fetchQueue();
      }
    } catch (err) {
      console.error('Failed to update priority:', err);
    } finally {
      setUpdatingPriorityId(null);
    }
  }

  const entries = queue?.entries || [];

  const filteredEntries = entries.filter((entry: any) => {
    // Tab filter
    if (activeTab === 'WAITING' && entry.status !== 'WAITING') return false;
    if (activeTab === 'CALLED' && entry.status !== 'CALLED' && entry.status !== 'IN_SERVICE') return false;
    if (activeTab === 'COMPLETED' && entry.status !== 'COMPLETED') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patientName = entry.patient?.fullName?.toLowerCase() || '';
      const token = entry.tokenDisplay?.toLowerCase() || '';
      const village = entry.patient?.village?.toLowerCase() || '';
      return patientName.includes(q) || token.includes(q) || village.includes(q);
    }
    return true;
  });

  const waitingCount = entries.filter((e: any) => e.status === 'WAITING').length;
  const urgentCount = entries.filter((e: any) => e.priority === 'EMERGENCY' || e.priority === 'URGENT').length;
  const completedCount = entries.filter((e: any) => e.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Link href="/doctor" className="hover:underline">Doctor Portal</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Digital OPD Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Live Outpatient Queue Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {queue?.facility?.name || 'Shirur Rural Hospital'} • {queue?.department?.name || 'Orthopedics & General OPD'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            size="md"
            onClick={handleCallNext}
            isLoading={callingNext}
            leftIcon={<Volume2 className="w-4 h-4" />}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
          >
            Call Next Token
          </Button>
        </div>
      </div>

      {/* Call announcement toast */}
      {callMessage && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs sm:text-sm text-teal-900 font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-teal-700 shrink-0" />
            <span>{callMessage}</span>
          </div>
          <button
            onClick={() => setCallMessage(null)}
            className="text-xs text-teal-700 hover:text-teal-900 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-teal-50/60 border-teal-200">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">Now Serving Token</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-950 mt-1">
            {queue?.currentServingToken ? `ORTHO-${String(queue.currentServingToken).padStart(3, '0')}` : 'ORTHO-012'}
          </p>
          <span className="text-xs text-teal-700 font-medium">Room 4 • Dr. Deshmukh</span>
        </Card>

        <Card className="p-4 bg-amber-50/60 border-amber-200">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Waiting Patients</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-1">
            {waitingCount}
          </p>
          <span className="text-xs text-amber-700 font-medium">In waiting hall</span>
        </Card>

        <Card className="p-4 bg-rose-50/60 border-rose-200">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Urgent Triage Overrides</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-950 mt-1">
            {urgentCount}
          </p>
          <span className="text-xs text-rose-700 font-medium">High clinical priority</span>
        </Card>

        <Card className="p-4 bg-emerald-50/60 border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Completed Consults</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1">
            {completedCount}
          </p>
          <span className="text-xs text-emerald-700 font-medium">Today's discharge / referral</span>
        </Card>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          {(['WAITING', 'CALLED', 'ALL', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'WAITING' && `Waiting (${waitingCount})`}
              {tab === 'CALLED' && `Called`}
              {tab === 'ALL' && `All (${entries.length})`}
              {tab === 'COMPLETED' && `Completed (${completedCount})`}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, token, village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Queue Entry List */}
      <div className="space-y-3">
        {loading && entries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
            <p className="text-sm font-medium">Loading live OPD queue records...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No queue entries match this filter</p>
            <p className="text-xs text-slate-500 mt-1">Check another tab or clear search terms.</p>
          </div>
        ) : (
          filteredEntries.map((entry: any) => {
            const isHero = entry.patient?.fullName?.includes('Anand Patil') || entry.tokenDisplay === 'ORTHO-014';
            const isUrgent = entry.priority === 'EMERGENCY' || entry.priority === 'URGENT';
            const isCalled = entry.status === 'CALLED' || entry.status === 'IN_SERVICE';

            return (
              <Card
                key={entry.id}
                className={`p-4 transition-all ${
                  isHero
                    ? 'border-teal-400 bg-teal-50/40 shadow-xs'
                    : isUrgent
                    ? 'border-amber-300 bg-amber-50/20'
                    : isCalled
                    ? 'border-sky-300 bg-sky-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Token + Patient Identity */}
                  <div className="flex items-start gap-3">
                    <div className="text-center shrink-0">
                      <span className="block text-xs font-bold text-slate-500 uppercase">Token</span>
                      <span className={`inline-block text-base font-extrabold px-2.5 py-1 rounded-md border ${
                        entry.priority === 'EMERGENCY'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : entry.priority === 'URGENT'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-teal-100 text-teal-900 border-teal-300'
                      }`}>
                        {entry.tokenDisplay}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {entry.patient?.fullName}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({entry.patient?.gender?.charAt(0)}, {entry.patient?.village || 'Kendur'})
                        </span>
                        <Badge variant={entry.priority === 'EMERGENCY' ? 'emergency' : entry.priority === 'URGENT' ? 'urgent' : 'routine'}>
                          {entry.priority}
                        </Badge>
                        {entry.appointment?.type === 'TELECONSULT' && (
                          <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <Video className="w-3 h-3 text-sky-600" /> Assisted Teleconsult
                          </span>
                        )}
                        {entry.status === 'CALLED' && (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded animate-pulse">
                            CALLED TO ROOM
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700">
                        <span className="font-semibold text-slate-900">Complaint:</span> {entry.appointment?.reason || 'Regular follow-up and clinical review'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Est. wait: {entry.estimatedWaitMinutes || 10} mins
                        </span>
                        {entry.appointment?.timeSlot && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Slot: {entry.appointment.timeSlot}
                          </span>
                        )}
                        {entry.patient?.riskLevel && entry.patient.riskLevel !== 'ROUTINE' && (
                          <span className="font-bold text-amber-700">
                            Risk Level: {entry.patient.riskLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Doctor Actions & Priority Override */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 shrink-0 border-t lg:border-t-0 border-slate-100">
                    {/* Priority Override Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-500">Triage:</label>
                      <select
                        value={entry.priority}
                        disabled={updatingPriorityId === entry.id}
                        onChange={(e) => handlePriorityChange(entry.id, e.target.value)}
                        aria-label="Triage Priority"
                        className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="EMERGENCY">EMERGENCY</option>
                        <option value="URGENT">URGENT</option>
                        <option value="HIGH">HIGH</option>
                        <option value="ROUTINE">ROUTINE</option>
                      </select>
                    </div>

                    {/* Launch Consultation Button */}
                    <Link
                      href={`/doctor/consult?patientId=${entry.patientId}&appointmentId=${entry.appointmentId || ''}`}
                    >
                      <Button
                        size="sm"
                        className="text-xs font-bold"
                        leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Start Consultation
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
