'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Stethoscope,
  Video,
  User,
  HeartPulse,
  Pill,
  FileText,
  Share2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

function DoctorConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const { user, t } = useApp();

  // Selected Patient and Clinical State
  const [patientId, setPatientId] = useState(patientIdParam || '');
  const [patientSummary, setPatientSummary] = useState<any>(null);
  const [patientTimeline, setPatientTimeline] = useState<any[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // Consultation Inputs (Section 36)
  const [chiefComplaint, setChiefComplaint] = useState(
    'Severe bilateral knee pain, difficulty walking more than 200 metres, joint stiffness in morning.'
  );
  const [vitalsSummary, setVitalsSummary] = useState('BP: 130/84 mmHg, Pulse: 76 bpm, Temp: 98.4°F, SpO2: 98%, Weight: 74 kg');
  const [assessment, setAssessment] = useState(
    'Bilateral Knee Osteoarthritis (Kellgren-Lawrence Grade II). Moderate medial compartment narrowing.'
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    'Patient resides in Kendur village with limited transport. Conservative joint preservation protocol recommended before elective surgery consideration.'
  );
  const [followUpDays, setFollowUpDays] = useState('14');

  // Prescription Items Builder
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([
    {
      medicineName: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      dosage: '500 mg',
      form: 'TABLET',
      frequency: 'BD',
      durationDays: 14,
      instructions: 'Twice daily after meals with warm water',
      quantity: 28,
      isAvailableInFacility: true,
    },
    {
      medicineName: 'Calcium + Vitamin D3',
      genericName: 'Calcium Carbonate + Cholecalciferol',
      dosage: '500mg + 250 IU',
      form: 'TABLET',
      frequency: 'OD',
      durationDays: 30,
      instructions: 'Once daily after lunch',
      quantity: 30,
      isAvailableInFacility: true,
    },
    {
      medicineName: 'Diclofenac Sodium 50mg',
      genericName: 'Diclofenac Sodium',
      dosage: '50 mg',
      form: 'TABLET',
      frequency: 'SOS',
      durationDays: 5,
      instructions: 'Only if severe breakthrough pain occurs, take with food',
      quantity: 5,
      isAvailableInFacility: true,
    },
  ]);

  // Diagnostic Order & Referral flags
  const [orderXray, setOrderXray] = useState(true);
  const [createDistrictReferral, setCreateDistrictReferral] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultationSuccess, setConsultationSuccess] = useState<any>(null);

  // Load Patient Clinical Summary and Timeline
  useEffect(() => {
    async function fetchPatientData() {
      setIsLoadingSummary(true);
      try {
        // If no patient ID, default to Anand Patil (demo patient)
        let targetId = patientId;
        if (!targetId) {
          const listRes = await fetch('/api/patients?limit=1');
          if (listRes.ok) {
            const listJson = await listRes.json();
            if (listJson.data && listJson.data.length > 0) {
              targetId = listJson.data[0].id;
              setPatientId(targetId);
            }
          }
        }

        if (targetId) {
          const [summaryRes, timelineRes] = await Promise.all([
            fetch(`/api/patients/${targetId}/summary`),
            fetch(`/api/patients/${targetId}/timeline`),
          ]);

          if (summaryRes.ok) {
            const sumJson = await summaryRes.json();
            setPatientSummary(sumJson.data);
          }
          if (timelineRes.ok) {
            const timeJson = await timelineRes.json();
            setPatientTimeline(timeJson.data);
          }
        }
      } catch (err) {
        console.error('Failed to load patient consultation data:', err);
      } finally {
        setIsLoadingSummary(false);
      }
    }

    fetchPatientData();
  }, [patientId]);

  const addMedicineRow = () => {
    setPrescriptionItems((prev) => [
      ...prev,
      {
        medicineName: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin',
        dosage: '500 mg',
        form: 'CAPSULE',
        frequency: 'TID',
        durationDays: 5,
        instructions: 'After food',
        quantity: 15,
        isAvailableInFacility: true,
      },
    ]);
  };

  const removeMedicineRow = (index: number) => {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedicineRow = (index: number, field: string, value: any) => {
    setPrescriptionItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleFinalizeConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Issue Finalized Prescription with Signed QR (Section 29)
      const rxRes = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          facilityId: user?.facilityId || 'FAC-GOV-RH-001',
          diagnosisSummary: assessment,
          instructions: clinicalNotes,
          items: prescriptionItems,
          followUpDays: Number(followUpDays),
        }),
      });

      const rxJson = await rxRes.json();

      // 2. Order Diagnostic Test if checked (Section 30)
      if (orderXray) {
        await fetch('/api/diagnostics/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            facilityId: user?.facilityId || 'FAC-GOV-RH-001',
            testName: 'Digital X-Ray Knee AP & Lateral Views (Bilateral)',
            testCategory: 'RADIOLOGY',
            priority: 'ROUTINE',
            instructions: 'Weight-bearing views to evaluate medial joint space reduction',
          }),
        }).catch(() => null);
      }

      // 3. Create District Hospital Referral if checked (Section 31)
      if (createDistrictReferral) {
        // Find District Hospital
        const facRes = await fetch('/api/facilities?type=DISTRICT_HOSPITAL');
        const facJson = await facRes.json();
        const districtFacId = facJson.data && facJson.data[0]?.id;

        if (districtFacId) {
          await fetch('/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientId,
              referringFacilityId: user?.facilityId || 'FAC-GOV-RH-001',
              receivingFacilityId: districtFacId,
              requestedSpecialty: 'Orthopedic Surgery & Trauma',
              priority: 'ROUTINE',
              reason: 'Joint preservation and viscosupplementation specialist review',
              clinicalSummary: assessment,
            }),
          }).catch(() => null);
        }
      }

      setConsultationSuccess(rxJson.data);
    } catch (err) {
      console.error('Consultation finalize failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Clinical Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="routine">Clinical Workstation</Badge>
            <span className="text-xs text-slate-500 font-medium">3-Panel Consultation Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Consultation Desk: {patientSummary?.patient?.fullName || 'Anand Patil'}
          </h1>
          <p className="text-xs text-slate-500">
            ABHA: <span className="font-mono font-bold text-slate-800">{patientSummary?.patient?.nationalHealthId || '91-4829-1049-2810'}</span> • Village: {patientSummary?.patient?.village || 'Kendur'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Teleconsult Stream Active (Sub-centre Kiosk)</span>
          </div>
        </div>
      </div>

      {/* 3-Panel Clinical Layout (Section 36 & 66) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PANEL 1 (Left, 3 cols): Patient Clinical Summary */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 space-y-4 border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>{t('consultation.clinicalSummary')}</span>
            </div>

            {isLoadingSummary ? (
              <div className="text-xs text-slate-500 animate-pulse py-4">Loading patient profile...</div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Age & Gender</span>
                  <span className="font-bold text-slate-800">
                    {patientSummary?.patient?.age || 54} Yrs • {patientSummary?.patient?.gender || 'MALE'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Known Allergies</span>
                  <span className="font-semibold text-slate-800">
                    {patientSummary?.patient?.allergies || 'None recorded'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Risk Status</span>
                  <Badge variant={patientSummary?.patient?.riskLevel === 'HIGH' ? 'emergency' : 'urgent'}>
                    {patientSummary?.patient?.riskLevel || 'MEDIUM RISK'}
                  </Badge>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Active Chronic Conditions</span>
                  <div className="space-y-1 mt-0.5">
                    {patientSummary?.activeConditions?.map((c: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-800">
                        {c.title}
                      </div>
                    )) || <span className="text-slate-500">None</span>}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Current Prescribed Medications</span>
                  <div className="space-y-1 mt-0.5">
                    {patientSummary?.activeMedications?.map((m: any, i: number) => (
                      <div key={i} className="p-2 bg-teal-50/50 rounded-lg border border-teal-100 text-[11px]">
                        <strong className="text-slate-900">{m.name}</strong> ({m.dosage})
                        <span className="text-slate-500 block">{m.frequency}</span>
                      </div>
                    )) || <span className="text-slate-500">None</span>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Recent Vitals (Recorded by ASHA)</span>
                  <p className="font-mono text-slate-800 text-xs mt-0.5">
                    BP: 130/84 mmHg<br />
                    Pulse: 76 bpm<br />
                    Weight: 74 kg
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* PANEL 2 (Center, 6 cols): Active Consultation & Action Builders */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleFinalizeConsultation} className="space-y-4">
            <Card className="p-5 space-y-4 border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>{t('consultation.encounterNotes')}</span>
                </div>
                <span className="text-[11px] text-teal-700 font-medium">Virtual Room: Dr. Rajesh Deshmukh</span>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('consultation.chiefComplaint')}
                </label>
                <textarea
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  rows={2}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Recorded Vitals */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('consultation.vitals')}
                </label>
                <input
                  type="text"
                  value={vitalsSummary}
                  onChange={(e) => setVitalsSummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Assessment & Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('consultation.diagnosis')}
                </label>
                <textarea
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  rows={2}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-900"
                />
              </div>

              {/* Electronic Prescription Builder (Section 29) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Prescription Builder ({prescriptionItems.length})
                    </span>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addMedicineRow} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Medicine
                  </Button>
                </div>

                <div className="space-y-2">
                  {prescriptionItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={item.medicineName}
                          onChange={(e) => updateMedicineRow(idx, 'medicineName', e.target.value)}
                          className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 flex-1 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedicineRow(idx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={item.dosage}
                          onChange={(e) => updateMedicineRow(idx, 'dosage', e.target.value)}
                          className="border border-slate-200 bg-white rounded-lg p-1 text-[11px] text-center"
                        />
                        <input
                          type="text"
                          placeholder="Freq (BD/OD)"
                          value={item.frequency}
                          onChange={(e) => updateMedicineRow(idx, 'frequency', e.target.value)}
                          className="border border-slate-200 bg-white rounded-lg p-1 text-[11px] text-center"
                        />
                        <input
                          type="number"
                          placeholder="Days"
                          value={item.durationDays}
                          onChange={(e) => updateMedicineRow(idx, 'durationDays', e.target.value)}
                          className="border border-slate-200 bg-white rounded-lg p-1 text-[11px] text-center"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateMedicineRow(idx, 'quantity', e.target.value)}
                          className="border border-slate-200 bg-white rounded-lg p-1 text-[11px] text-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrated Orders & Follow-Up Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={orderXray}
                    onChange={(e) => setOrderXray(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span>Order Diagnostic: Digital Bilateral Knee X-Ray (AP/Lateral)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={createDistrictReferral}
                    onChange={(e) => setCreateDistrictReferral(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span>Initiate Closed-Loop Referral to District Referral Hospital</span>
                </label>
              </div>

              {/* Follow-up Scheduler (Section 19) */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
                <label className="font-semibold text-slate-700 shrink-0">Automated Follow-up:</label>
                <select
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(e.target.value)}
                  className="rounded-xl border border-slate-300 p-2 text-xs bg-white focus:outline-none"
                >
                  <option value="7">Follow up in 7 days</option>
                  <option value="14">Follow up in 14 days (Recommended)</option>
                  <option value="30">Follow up in 30 days</option>
                  <option value="0">No follow-up required</option>
                </select>
              </div>

              {/* Finalize Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Signs with MCI License & HMAC QR
                </span>
                <Button type="submit" size="md" isLoading={isSubmitting} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  {t('consultation.finalizePrescription')}
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {/* PANEL 3 (Right, 3 cols): Longitudinal Timeline Context */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 space-y-3 border-slate-200 shadow-2xs max-h-[640px] overflow-y-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>{t('consultation.medicalTimeline')}</span>
            </div>

            {patientTimeline.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No previous events found.</p>
            ) : (
              <div className="space-y-3">
                {patientTimeline.map((evt) => (
                  <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {new Date(evt.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <Badge variant={evt.status === 'SIGNED' || evt.status === 'RESULT_READY' ? 'routine' : 'neutral'}>
                        {evt.type}
                      </Badge>
                    </div>
                    <p className="font-bold text-slate-900 leading-tight">{evt.title}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{evt.details?.assessment || evt.details?.diagnosisSummary || evt.details?.resultSummary}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Success Modal with QR Display */}
      <Modal
        isOpen={!!consultationSuccess}
        onClose={() => {
          setConsultationSuccess(null);
          router.push('/doctor');
        }}
        title="Consultation Completed & Prescription Signed"
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Prescription Issued Successfully!</h3>
            <p className="text-xs text-slate-600 mt-1">
              Prescription Number: <strong className="font-mono text-slate-900">{consultationSuccess?.prescriptionNumber}</strong>
            </p>
            <p className="text-xs text-teal-800 font-semibold mt-2">
              Cryptographically signed QR generated. Follow-up scheduled in {followUpDays} days.
            </p>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <Link href="/patient/prescriptions">
              <Button size="sm">View Patient Rx & QR</Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setConsultationSuccess(null);
                router.push('/doctor');
              }}
            >
              Back to Queue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DoctorConsultationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Clinical Workstation...</div>}>
      <DoctorConsultationContent />
    </Suspense>
  );
}
