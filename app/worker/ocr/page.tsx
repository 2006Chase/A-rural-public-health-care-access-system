'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  FileScan,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Save,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default function PaperDocumentOcrPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [patientId, setPatientId] = useState('demo-patient');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editable verification fields
  const [doctorName, setDoctorName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<any[]>([]);

  const handleSimulateOcr = async () => {
    setIsScanning(true);
    setIsSaved(false);

    try {
      const res = await fetch('/api/documents/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: 'demo-handwritten-rx.jpg' }),
      });

      if (res.ok) {
        const json = await res.json();
        setOcrData(json.ocr);
        setDoctorName(json.ocr.doctorName.value);
        setFacilityName(json.ocr.facilityName.value);
        setDiagnosis(json.ocr.diagnosis.value);
        setMedicines(
          json.ocr.medicines.map((m: any) => ({
            name: m.name.value,
            confidence: m.name.confidence,
            dosage: m.dosage.value,
            frequency: m.frequency.value,
            duration: m.duration.value,
            instructions: m.instructions.value,
          }))
        );
      }
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmAndSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          title: `Digitized Prescription - ${facilityName}`,
          type: 'PAPER_PRESCRIPTION',
          fileUrl: '/sample-prescriptions/demo-rx-1.jpg',
          extractedDataJson: { doctorName, facilityName, diagnosis, medicines },
          ocrConfidenceScore: ocrData?.overallConfidence || 0.88,
          verificationStatus: 'VERIFIED',
        }),
      });

      if (res.ok) {
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to save verified document:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-14">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="routine">Document Digitization</Badge>
          <span className="text-xs text-slate-500 font-medium">Human-in-the-Loop OCR Protocol</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Paper Prescription & Report Scanner</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Digitize physical paper slips, lab notes, and discharge summaries with human clinical verification.
        </p>
      </div>

      {/* Upload & OCR Trigger Card */}
      <Card className="p-6 border-slate-200 shadow-sm space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Upload Handwritten Paper Prescription</h3>
            <p className="text-xs text-slate-500 mt-0.5">Supports high-resolution camera photos, PNG, JPG, or PDF</p>
          </div>

          <div className="pt-2">
            <Button
              size="md"
              onClick={handleSimulateOcr}
              isLoading={isScanning}
              leftIcon={<FileScan className="w-4 h-4" />}
            >
              Scan & Extract Clinical Data
            </Button>
          </div>
        </div>
      </Card>

      {/* OCR Human Verification Stage (Section 28 & 68) */}
      {ocrData && (
        <Card className="p-6 border-indigo-200 bg-indigo-50/20 shadow-sm space-y-5 animate-in fade-in">
          {/* Verification Notice */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Human Verification Required (Section 28):</span>
              <p className="leading-relaxed">
                Review extracted values against the original document. You can edit any field before adding it to the
                patient's longitudinal health record.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Doctor Name</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  94% Confidence
                </span>
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Facility</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  91% Confidence
                </span>
              </label>
              <input
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Diagnosis / Clinical Impression</span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
                82% Confidence
              </span>
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Extracted Medicines List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Detected Medicines ({medicines.length})
            </span>
            <div className="space-y-2">
              {medicines.map((m, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => {
                        const updated = [...medicines];
                        updated[idx].name = e.target.value;
                        setMedicines(updated);
                      }}
                      className="font-bold text-xs text-slate-900 border-b border-slate-300 focus:outline-none focus:border-teal-500 pb-0.5"
                    />
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        m.confidence < 0.8
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {Math.round(m.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Dosage</span>
                      <input
                        type="text"
                        value={m.dosage}
                        onChange={(e) => {
                          const updated = [...medicines];
                          updated[idx].dosage = e.target.value;
                          setMedicines(updated);
                        }}
                        className="w-full border-b border-slate-200 text-xs py-0.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Frequency</span>
                      <input
                        type="text"
                        value={m.frequency}
                        onChange={(e) => {
                          const updated = [...medicines];
                          updated[idx].frequency = e.target.value;
                          setMedicines(updated);
                        }}
                        className="w-full border-b border-slate-200 text-xs py-0.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Duration</span>
                      <input
                        type="text"
                        value={m.duration}
                        onChange={(e) => {
                          const updated = [...medicines];
                          updated[idx].duration = e.target.value;
                          setMedicines(updated);
                        }}
                        className="w-full border-b border-slate-200 text-xs py-0.5 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm & Save Button */}
          {isSaved ? (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified document added to patient's longitudinal timeline!
              </span>
              <Link href="/patient/timeline">
                <Button size="sm">View Health Timeline</Button>
              </Link>
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-2 border-t border-indigo-100">
              <Button size="md" onClick={handleConfirmAndSave} isLoading={isSubmitting} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Confirm & Add to Medical Timeline
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
