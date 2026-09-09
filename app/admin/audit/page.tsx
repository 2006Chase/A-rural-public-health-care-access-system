'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Download,
  Clock,
  User,
  KeyRound,
  FileCode,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  async function loadLogs() {
    try {
      setLoading(true);
      const url = actionFilter !== 'ALL'
        ? `/api/admin/audit-logs?action=${actionFilter}&limit=100`
        : '/api/admin/audit-logs?limit=100';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  function handleExportJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jeevansetu-audit-trail-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  const filteredLogs = logs.filter((log) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action?.toLowerCase().includes(q) ||
        log.resource?.toLowerCase().includes(q) ||
        log.actorRole?.toLowerCase().includes(q) ||
        log.metadataJson?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Link href="/admin" className="hover:underline">Admin Center</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Compliance & Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Security & Clinical Audit Trail Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Immutable, privacy-safe event stream of digital prescriptions, QR token validations, and clinical records access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Logs
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportJson}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Audit Log (JSON)
          </Button>
        </div>
      </div>

      {/* Security Principles Banner */}
      <Card className="p-4 bg-teal-50 border-teal-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-teal-950 font-semibold">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
          <span>
            DISHA & HIPAA Principle: Audit events record actor role, timestamp, and resource reference. Zero raw patient PHI is stored in audit metadata.
          </span>
        </div>
        <span className="font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-full text-[11px]">
          Privacy-Safe Audit Design
        </span>
      </Card>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Filter Event:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-800"
          >
            <option value="ALL">All Audit Actions</option>
            <option value="PRESCRIPTION_SIGNED">PRESCRIPTION_SIGNED</option>
            <option value="QR_SCANNED">QR_SCANNED</option>
            <option value="DIAGNOSTIC_ORDERED">DIAGNOSTIC_ORDERED</option>
            <option value="QUEUE_TOKEN_CALLED">QUEUE_TOKEN_CALLED</option>
            <option value="QUEUE_CHECK_IN">QUEUE_CHECK_IN</option>
            <option value="FACILITY_CAPABILITIES_UPDATED">FACILITY_CAPABILITIES_UPDATED</option>
            <option value="REFERRAL_STATUS_UPDATED">REFERRAL_STATUS_UPDATED</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor, resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Audit Log Table & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table / List */}
        <div className={`space-y-2 ${selectedLog ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {loading && logs.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
              <p className="text-sm font-medium">Fetching compliance audit stream...</p>
            </Card>
          ) : filteredLogs.length === 0 ? (
            <Card className="p-10 text-center text-slate-500 border-slate-200">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">No audit events found</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting the action filter or search query.</p>
            </Card>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <Card
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3.5 border cursor-pointer transition-all hover:border-teal-400 ${
                    isSelected ? 'border-teal-500 bg-teal-50/30 ring-1 ring-teal-400' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.action}
                      </span>
                      <Badge variant="routine">{log.actorRole}</Badge>
                      <span className="text-slate-500 font-medium">
                        on <span className="text-slate-800 font-bold">{log.resource}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 shrink-0">
                      <span className="font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        {log.outcome}
                      </span>
                    </div>
                  </div>

                  {log.metadataJson && (
                    <p className="text-[11px] font-mono text-slate-500 truncate pt-1.5">
                      Metadata: {log.metadataJson}
                    </p>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Selected Log Inspector */}
        {selectedLog && (
          <div className="lg:col-span-1">
            <Card className="p-5 border-teal-300 bg-white shadow-sm space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-teal-600" /> Event Details
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Event ID</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] break-all">
                    {selectedLog.id}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Action</span>
                  <span className="font-bold text-teal-900">{selectedLog.action}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Actor Role & ID</span>
                  <span className="font-semibold text-slate-800">{selectedLog.actorRole}</span>
                  <span className="text-slate-500 block font-mono text-[11px]">{selectedLog.actorId}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Target Resource</span>
                  <span className="font-semibold text-slate-800">
                    {selectedLog.resource} {selectedLog.resourceId && `(#${selectedLog.resourceId})`}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Timestamp</span>
                  <span className="font-mono text-slate-700">
                    {new Date(selectedLog.timestamp).toISOString()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Audit Metadata (JSON)</span>
                  <pre className="p-3 bg-slate-900 text-teal-300 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.metadataJson || '{}'), null, 2);
                      } catch {
                        return selectedLog.metadataJson || '{}';
                      }
                    })()}
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
