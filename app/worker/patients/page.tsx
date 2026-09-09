'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search, UserPlus, HeartPulse, QrCode, Filter, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function WorkerPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Patient Registration Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('FEMALE');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [village, setVillage] = useState('Kendur');
  const [chronicConditions, setChronicConditions] = useState('');
  const [riskLevel, setRiskLevel] = useState('ROUTINE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyRegistered, setNewlyRegistered] = useState<any>(null);

  useEffect(() => {
    async function loadPatients() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('q', searchQuery);
        if (riskFilter) queryParams.set('riskLevel', riskFilter);

        const res = await fetch(`/api/patients?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setPatients(json.data);
        }
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(loadPatients, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, riskFilter]);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          gender,
          dateOfBirth,
          village,
          chronicConditions,
          riskLevel,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setNewlyRegistered(json.data);
        setPatients((prev) => [json.data, ...prev]);
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="routine">Patient Management</Badge>
            <span className="text-xs text-slate-500 font-medium">Kendur Health Sub-centre</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Rural Patient Registry</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Search registered citizens, monitor high-risk cohorts, and issue ABHA identifiers.
          </p>
        </div>

        <Button size="sm" onClick={() => { setIsRegisterOpen(true); setNewlyRegistered(null); }} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
          Register New Patient
        </Button>
      </div>

      {/* Search & Risk Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, village, or ABHA ID..."
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="">All Risk Cohorts</option>
          <option value="HIGH">High Risk Cohort Only</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="ROUTINE">Routine Follow-up</option>
        </select>
      </div>

      {/* Patient Cards List */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-slate-500 animate-pulse">Loading patient registry...</div>
      ) : patients.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-500">No patients found matching your search query.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patients.map((p) => (
            <Card key={p.id} className="p-4 space-y-2.5 border-slate-200 shadow-2xs hover:border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{p.fullName}</h3>
                  <p className="text-[11px] font-mono text-slate-500">ABHA: {p.nationalHealthId}</p>
                </div>
                <Badge variant={p.riskLevel === 'HIGH' ? 'emergency' : p.riskLevel === 'MEDIUM' ? 'urgent' : 'routine'}>
                  {p.riskLevel}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                <div>
                  <span className="text-slate-400 block">Village</span>
                  <span className="font-semibold text-slate-800">{p.village}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-800">{p.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gender</span>
                  <span className="font-semibold text-slate-800">{p.gender}</span>
                </div>
              </div>

              {p.chronicConditions && (
                <p className="text-[11px] text-teal-800 bg-teal-50/60 p-1.5 rounded-lg border border-teal-100">
                  {p.chronicConditions}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <Link href={`/worker/vitals?patientId=${p.id}`}>
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    <HeartPulse className="w-3.5 h-3.5 mr-1 text-teal-600" /> Record Vitals
                  </Button>
                </Link>
                <Link href={`/patient/timeline`}>
                  <Button size="sm" className="text-xs h-8">
                    View History $\to$
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register New Rural Citizen">
        {newlyRegistered ? (
          <div className="text-center space-y-3 py-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Registered!</h3>
              <p className="text-xs text-slate-600">
                ABHA Health ID generated: <strong className="font-mono text-slate-900">{newlyRegistered.nationalHealthId}</strong>
              </p>
            </div>
            <Button size="sm" onClick={() => setIsRegisterOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRegisterPatient} className="space-y-3">
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <Input label="Village Name" value={village} onChange={(e) => setVillage(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white focus:outline-none"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <Input label="Date of Birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Risk Cohort</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white focus:outline-none"
              >
                <option value="ROUTINE">Routine Follow-up</option>
                <option value="MEDIUM">Medium (Chronic Condition / Elderly)</option>
                <option value="HIGH">High Risk (Maternal Complication / Hypertension)</option>
              </select>
            </div>
            <Input
              label="Chronic Conditions / Notes"
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              placeholder="e.g. Hypertension, Diabetes, Pregnancy 32 weeks"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsRegisterOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Complete Registration
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
