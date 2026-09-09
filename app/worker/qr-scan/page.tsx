'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Pill,
  Building2,
  User,
  ArrowRight,
  Scan,
} from 'lucide-react';

export default function WorkerQrScanPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick helper to fetch the seeded demo prescription token
  const handleLoadDemoToken = async () => {
    try {
      const res = await fetch('/api/prescriptions?limit=1');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTokenInput(json.data[0].qrReferenceToken);
          handleVerify(json.data[0].qrReferenceToken);
        }
      }
    } catch (err) {
      console.error('Failed to load demo token:', err);
    }
  };

  const handleVerify = async (tokenToTest?: string) => {
    const token = tokenToTest || tokenInput;
    if (!token.trim()) return;

    setIsVerifying(true);
    setErrorMsg(null);
    setVerifiedRecord(null);

    try {
      const res = await fetch('/api/prescriptions/qr-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setVerifiedRecord(json);
      } else {
        setErrorMsg(json.message || 'Invalid or revoked QR reference token.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to reach verification service.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-14">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="routine">Secure Clinical QR Verification</Badge>
          <span className="text-xs text-slate-500 font-medium">HMAC-SHA256 Signed Opaque Token</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Scan Patient Healthcare QR</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Decrypt and verify signed prescription references presented by patients visiting your facility.
        </p>
      </div>

      {/* Camera / Token Input Scanner Card */}
      <Card className="p-6 border-slate-200 shadow-sm space-y-4">
        <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center animate-pulse">
            <Scan className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base">QR Optical Scanner Ready</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5">
              Point camera at the patient's digital or printed prescription QR code.
            </p>
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              onClick={handleLoadDemoToken}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
              leftIcon={<QrCode className="w-3.5 h-3.5" />}
            >
              Simulate Scan: Load Anand Patil's Rx QR
            </Button>
          </div>
        </div>

        {/* Manual Token String Paste Fallback */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-700">Or Paste Signed Opaque Token String</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="eyJ0eXBlIjoiaGVhbHRoLXJlY29yZC1yZWZlcmVuY2Ui..."
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
            />
            <Button size="sm" onClick={() => handleVerify()} isLoading={isVerifying}>
              Verify Token
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verified Medical Record Card (Section 27: Retrieve minimum authorized record) */}
      {verifiedRecord && (
        <Card className="p-6 border-teal-300 bg-teal-50/20 shadow-sm space-y-5 animate-in fade-in">
          {/* Verification Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-sm text-slate-900">Cryptographic Signature Valid</span>
                <span className="text-[11px] text-teal-800 block">HMAC-SHA256 verified by JeevanSetu Authority</span>
              </div>
            </div>
            <Badge variant="routine">AUTHORIZED RECORD</Badge>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block">Patient Name</span>
              <strong className="text-slate-900 text-sm">{verifiedRecord.data?.patient?.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">National Health ID</span>
              <span className="font-mono font-bold text-slate-800">{verifiedRecord.data?.patient?.nationalHealthId}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Village</span>
              <span className="text-slate-700 font-medium">{verifiedRecord.data?.patient?.village}</span>
            </div>
          </div>

          {/* Clinical Prescription Content */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block uppercase tracking-wider">
                Prescription #{verifiedRecord.data?.prescriptionNumber}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{verifiedRecord.data?.diagnosisSummary}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Issued by {verifiedRecord.data?.practitioner?.fullName} at {verifiedRecord.data?.facility?.name}
              </p>
            </div>

            {/* Prescribed Medicines */}
            <div className="space-y-1.5 pt-2">
              <span className="font-bold text-slate-800 block">Authorized Medications to Dispense:</span>
              {verifiedRecord.data?.items?.map((item: any, i: number) => (
                <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{item.medicineName}</span>
                    <span className="text-slate-500 text-[11px] block">{item.dosage} • {item.instructions}</span>
                  </div>
                  <span className="text-xs font-bold text-teal-800">{item.frequency} ({item.quantity} qty)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions: Connect to Doctor / Order Diagnostic */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-teal-100">
            <Link href={`/doctor/consult?patientId=${verifiedRecord.data?.patient?.id}`}>
              <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Proceed to Doctor Consultation / Diagnostic Order
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
