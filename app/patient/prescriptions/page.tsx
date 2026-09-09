'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pill, QrCode, ShieldCheck, Download, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

export default function PatientPrescriptionsPage() {
  const { user, t } = useApp();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        const patientId = user?.patientId || 'demo-id';
        const res = await fetch(`/api/prescriptions?patientId=${patientId}`);
        if (res.ok) {
          const json = await res.json();
          setPrescriptions(json.data);
          if (json.data.length > 0) {
            setSelectedRx(json.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load prescriptions:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPrescriptions();
  }, [user]);

  // Generate QR code data URL whenever selectedRx changes
  useEffect(() => {
    if (selectedRx?.qrReferenceToken) {
      QRCode.toDataURL(selectedRx.qrReferenceToken, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [selectedRx]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="govt">Electronic Prescriptions</Badge>
            <span className="text-xs text-slate-500 font-medium">Digital Medical Council Signed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('prescription.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Show this QR code at any government hospital or pharmacy for verified medicine dispensing and referral continuity.
          </p>
        </div>

        {selectedRx && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Prescription
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-xs animate-pulse">Loading electronic prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <Card className="p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-800">No prescriptions found.</p>
          <p className="text-xs text-slate-500">Your doctor's prescriptions will appear here once issued.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Prescriptions */}
          <div className="space-y-3 lg:col-span-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Recent Prescriptions ({prescriptions.length})
            </span>
            {prescriptions.map((rx) => {
              const isSelected = selectedRx?.id === rx.id;
              const dateStr = new Date(rx.signedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={rx.id}
                  onClick={() => setSelectedRx(rx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-slate-800">{rx.prescriptionNumber}</span>
                    <Badge variant={rx.status === 'SIGNED' ? 'routine' : 'neutral'}>{rx.status}</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{rx.diagnosisSummary}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{rx.facility.name} • {dateStr}</p>
                </div>
              );
            })}
          </div>

          {/* Selected Prescription Detailed Card with QR (Section 29, 74, 98) */}
          {selectedRx && (
            <Card className="p-6 space-y-6 lg:col-span-2 border-slate-200 shadow-sm print:shadow-none print:border-none">
              {/* Rx Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {selectedRx.prescriptionNumber}
                    </span>
                    <Badge variant="routine">Digitally Signed</Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Issued by: <strong className="text-slate-900">{selectedRx.signedBy}</strong>
                  </p>
                  <p className="text-xs text-slate-500">{selectedRx.facility.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Date: {new Date(selectedRx.signedAt).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Privacy-Safe QR Code (Section 27, 74) */}
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Signed Healthcare QR" className="w-28 h-28 rounded-lg shadow-2xs" />
                  ) : (
                    <div className="w-28 h-28 bg-slate-200 animate-pulse rounded-lg flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-600 mt-1.5 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" /> Signed QR
                  </span>
                </div>
              </div>

              {/* QR Security Notice (Section 74) */}
              <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl text-xs text-sky-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Zero PHI Exposure:</strong> {t('prescription.qrNotice')}
                </p>
              </div>

              {/* Diagnosis Summary */}
              <div className="space-y-1 text-xs">
                <span className="text-slate-500 font-semibold block uppercase tracking-wider">
                  Clinical Assessment
                </span>
                <p className="text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedRx.diagnosisSummary}
                </p>
              </div>

              {/* Prescribed Medicines Itemized Table (Section 29) */}
              <div className="space-y-3 text-xs">
                <span className="text-slate-500 font-semibold block uppercase tracking-wider">
                  Prescribed Medicines ({selectedRx.items?.length || 0})
                </span>

                <div className="space-y-2">
                  {selectedRx.items?.map((item: any, i: number) => (
                    <div
                      key={item.id || i}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{item.medicineName}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                            {item.dosage} • {item.form}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs">
                          {item.instructions || 'After meals with water'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-teal-800 text-xs block">{item.frequency}</span>
                        <span className="text-[11px] text-slate-500">{item.durationDays} days ({item.quantity} units)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {selectedRx.instructions && (
                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider">
                    General Instructions & Lifestyle Advice
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {selectedRx.instructions}
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
