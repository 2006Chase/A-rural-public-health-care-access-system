'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { localDb } from '@/lib/db';
import {
  HeartPulse,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

function VitalsCaptureContent() {
  const { user, connectivity, pendingSyncCount, triggerSync, t } = useApp();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  // Offline simulation toggle
  const [forceOffline, setForceOffline] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [patients, setPatients] = useState<any[]>([]);
  const [systolicBp, setSystolicBp] = useState('130');
  const [diastolicBp, setDiastolicBp] = useState('84');
  const [heartRate, setHeartRate] = useState('76');
  const [temperature, setTemperature] = useState('98.4');
  const [spO2, setSpO2] = useState('98');
  const [bloodGlucose, setBloodGlucose] = useState('110');
  const [weightKg, setWeightKg] = useState('74');
  const [symptomsNotes, setSymptomsNotes] = useState('Bilateral knee joint stiffness and pain after walking.');

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved_offline' | 'saved_online' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch('/api/patients?limit=15');
        if (res.ok) {
          const json = await res.json();
          setPatients(json.data);
          if (!patientId && json.data.length > 0) {
            setPatientId(json.data[0].id);
          }
        }
      } catch (err) {
        // Fallback to local Dexie cache if offline
        const cached = await localDb.cachedPatients.toArray();
        if (cached.length > 0) {
          setPatients(cached);
          if (!patientId) setPatientId(cached[0].id);
        }
      }
    }
    loadPatients();
  }, [patientId]);

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveStatus('idle');

    const vitalsPayload = {
      patientId,
      code: 'BP_HEART_RATE_SPO2',
      name: 'Vitals Panel',
      value: `BP ${systolicBp}/${diastolicBp} mmHg, HR ${heartRate} bpm, SpO2 ${spO2}%`,
      unit: 'composite',
      interpretation: Number(systolicBp) > 140 ? 'HIGH' : 'NORMAL',
      recordedAt: new Date().toISOString(),
      notes: symptomsNotes,
    };

    const isCurrentlyOffline = forceOffline || connectivity === 'OFFLINE' || !navigator.onLine;

    if (isCurrentlyOffline) {
      // Offline-First Path (Section 42 & 69): Store locally in Dexie IndexedDB
      try {
        await localDb.syncQueue.add({
          localId: `OP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          deviceId: 'KEN-SUB-CENTRE-KIOSK',
          entityType: 'Vitals',
          entityId: patientId,
          operation: 'CREATE',
          payload: vitalsPayload,
          version: 1,
          status: 'PENDING',
          retryCount: 0,
          createdAt: new Date().toISOString(),
        });

        setSaveStatus('saved_offline');
      } catch (err) {
        console.error('Failed to save in local Dexie database:', err);
        setSaveStatus('error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Online Path: Push to server REST API
      try {
        const res = await fetch('/api/sync/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operations: [
              {
                id: `OP-${Date.now()}`,
                deviceId: 'KEN-SUB-CENTRE-KIOSK',
                entityType: 'Vitals',
                entityId: patientId,
                operation: 'CREATE',
                payload: vitalsPayload,
                version: 1,
              },
            ],
          }),
        });

        if (res.ok) {
          setSaveStatus('saved_online');
        } else {
          // Fallback to local Dexie on server failure
          await localDb.syncQueue.add({
            localId: `OP-${Date.now()}`,
            deviceId: 'KEN-SUB-CENTRE-KIOSK',
            entityType: 'Vitals',
            entityId: patientId,
            operation: 'CREATE',
            payload: vitalsPayload,
            version: 1,
            status: 'PENDING',
            retryCount: 0,
            createdAt: new Date().toISOString(),
          });
          setSaveStatus('saved_offline');
        }
      } catch (err) {
        setSaveStatus('saved_offline');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-14">
      {/* Header & Connectivity Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="routine">Frontline Clinical Workflow</Badge>
            <span className="text-xs text-slate-500 font-medium">Offline Resilience Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Record Patient Vitals & Symptoms</h1>
          <p className="text-xs text-slate-600">
            Works 100% offline at rural sub-centres. Changes queue locally in IndexedDB and sync upon reconnection.
          </p>
        </div>

        {/* Offline Simulation Switch for Demonstrating Section 69 */}
        <button
          type="button"
          onClick={() => setForceOffline(!forceOffline)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            forceOffline
              ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {forceOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-700" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
          <span>{forceOffline ? 'Simulation: Offline Active' : 'Simulate Offline'}</span>
        </button>
      </div>

      {/* Offline Saved Banner (Section 44) */}
      {saveStatus === 'saved_offline' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold">{t('common.savedOffline')}</p>
            <p className="text-[11px] text-amber-800">
              Vitals queued in local IndexedDB. When you reconnect or disable simulation, tap "Sync Now" to push to server.
            </p>
          </div>
        </div>
      )}

      {saveStatus === 'saved_online' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <p className="text-xs font-bold">Vitals recorded and synchronized with central hospital server!</p>
        </div>
      )}

      {/* Main Form */}
      <Card className="p-6 border-slate-200 shadow-sm">
        <form onSubmit={handleSaveVitals} className="space-y-4">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.village || 'Village'}) — ABHA: {p.nationalHealthId}
                </option>
              ))}
            </select>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input
              label="Systolic BP (mmHg)"
              type="number"
              value={systolicBp}
              onChange={(e) => setSystolicBp(e.target.value)}
              required
            />
            <Input
              label="Diastolic BP (mmHg)"
              type="number"
              value={diastolicBp}
              onChange={(e) => setDiastolicBp(e.target.value)}
              required
            />
            <Input
              label="Pulse Rate (bpm)"
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              required
            />
            <Input
              label="Temperature (°F)"
              type="text"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
            <Input
              label="Oxygen SpO2 (%)"
              type="number"
              value={spO2}
              onChange={(e) => setSpO2(e.target.value)}
            />
            <Input
              label="Blood Glucose (mg/dL)"
              type="number"
              value={bloodGlucose}
              onChange={(e) => setBloodGlucose(e.target.value)}
            />
          </div>

          {/* Weight & Symptoms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Weight (kg)"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Observed Symptoms / Complaints</label>
              <textarea
                value={symptomsNotes}
                onChange={(e) => setSymptomsNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Auto-versioned event
            </span>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />}>
              Save Vitals Record
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function VitalsCapturePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Vitals Workstation...</div>}>
      <VitalsCaptureContent />
    </Suspense>
  );
}
