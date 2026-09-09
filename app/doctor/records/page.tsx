'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  FileText,
  Share2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  ChevronRight,
  Building2,
  Calendar,
  Eye,
  Check,
  Filter
} from 'lucide-react';

function DoctorRecordsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'referrals' ? 'referrals' : 'diagnostics';

  const [activeTab, setActiveTab] = useState<'diagnostics' | 'referrals'>(initialTab);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNewDiagModalOpen, setIsNewDiagModalOpen] = useState(false);
  const [isNewRefModalOpen, setIsNewRefModalOpen] = useState(false);

  // New Diagnostic Form
  const [newDiagForm, setNewDiagForm] = useState({
    patientId: '',
    facilityId: '',
    testName: 'Digital X-Ray Knee AP & Lateral Views',
    testCategory: 'RADIOLOGY',
    priority: 'ROUTINE',
    instructions: 'Evaluate joint space narrowing and osteoarthritis progression',
  });

  // New Referral Form
  const [newRefForm, setNewRefForm] = useState({
    patientId: '',
    referringFacilityId: '',
    receivingFacilityId: '',
    requestedSpecialty: 'Orthopedic Surgery',
    priority: 'ROUTINE',
    reason: 'Specialist consultation for advanced joint management',
    clinicalSummary: 'Chronic knee pain refractory to conservative therapy.',
  });

  const [facilities, setFacilities] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      const [diagRes, refRes, facRes, patRes] = await Promise.all([
        fetch('/api/diagnostics/orders'),
        fetch('/api/referrals'),
        fetch('/api/facilities?limit=20'),
        fetch('/api/patients?limit=20'),
      ]);

      if (diagRes.ok) {
        const d = await diagRes.json();
        setDiagnostics(d.data || []);
      }
      if (refRes.ok) {
        const r = await refRes.json();
        setReferrals(r.data || []);
      }
      if (facRes.ok) {
        const f = await facRes.json();
        setFacilities(f.data || []);
        if (f.data?.length > 0) {
          setNewDiagForm(prev => ({ ...prev, facilityId: f.data[0].id }));
          setNewRefForm(prev => ({
            ...prev,
            referringFacilityId: f.data[0].id,
            receivingFacilityId: f.data[1]?.id || f.data[0].id
          }));
        }
      }
      if (patRes.ok) {
        const p = await patRes.json();
        setPatients(p.data || []);
        if (p.data?.length > 0) {
          setNewDiagForm(prev => ({ ...prev, patientId: p.data[0].id }));
          setNewRefForm(prev => ({ ...prev, patientId: p.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading clinical records:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Update diagnostic order status
  async function updateDiagStatus(orderId: string, status: string) {
    try {
      const res = await fetch(`/api/diagnostics/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to update diagnostic order:', err);
    }
  }

  // Update referral status
  async function updateReferralStatus(refId: string, status: string) {
    try {
      const res = await fetch(`/api/referrals/${refId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to update referral:', err);
    }
  }

  // Handle create new diagnostic order
  async function handleCreateDiag(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/diagnostics/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDiagForm),
      });
      if (res.ok) {
        setIsNewDiagModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error('Failed to create diagnostic order:', err);
    }
  }

  // Handle create new referral
  async function handleCreateRef(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRefForm),
      });
      if (res.ok) {
        setIsNewRefModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error('Failed to create referral:', err);
    }
  }

  const filteredDiagnostics = diagnostics.filter((d: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.testName?.toLowerCase().includes(q) ||
      d.patient?.fullName?.toLowerCase().includes(q) ||
      d.orderNumber?.toLowerCase().includes(q)
    );
  });

  const filteredReferrals = referrals.filter((r: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.patient?.fullName?.toLowerCase().includes(q) ||
      r.requestedSpecialty?.toLowerCase().includes(q) ||
      r.referralNumber?.toLowerCase().includes(q) ||
      r.receivingFacility?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Link href="/doctor" className="hover:underline">Doctor Portal</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Clinical Records & Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Diagnostics & Closed-Loop Referrals
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Track patient lab/radiology results and manage continuum of care transfers across rural and district facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'diagnostics' ? (
            <Button
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewDiagModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              Order New Test
            </Button>
          ) : (
            <Button
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewRefModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              Create New Referral
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Diagnostic Orders ({diagnostics.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'referrals'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Closed-Loop Referrals ({referrals.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'diagnostics' ? 'Search tests, patients...' : 'Search referrals, specialty...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Content for Diagnostics Tab */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          {filteredDiagnostics.length === 0 ? (
            <Card className="p-10 text-center text-slate-500 border-slate-200">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">No diagnostic orders found</p>
              <p className="text-xs text-slate-500 mt-1">Click "Order New Test" to request lab or radiology diagnostics.</p>
            </Card>
          ) : (
            filteredDiagnostics.map((order: any) => {
              const isReviewed = order.status === 'REVIEWED';
              const isReady = order.status === 'RESULT_READY';
              const isAnand = order.patient?.fullName?.includes('Anand Patil');

              return (
                <Card
                  key={order.id}
                  className={`p-5 space-y-3 transition-all ${
                    isAnand ? 'border-teal-400 bg-teal-50/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{order.testName}</span>
                        <Badge variant="routine">{order.testCategory}</Badge>
                        <Badge variant={order.priority === 'URGENT' ? 'urgent' : 'routine'}>
                          {order.priority}
                        </Badge>
                        {order.abnormalFlag && (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Abnormal Findings
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        Order #{order.orderNumber} • Ordered on {new Date(order.orderedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        order.status === 'REVIEWED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'RESULT_READY'
                          ? 'bg-sky-100 text-sky-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Patient</span>
                      <span className="font-bold text-slate-900">{order.patient?.fullName}</span>
                      <span className="text-slate-500 block">ABHA: {order.patient?.nationalHealthId || '91-XXXX-XXXX'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Facility / Lab</span>
                      <span className="font-semibold text-slate-900">{order.facility?.name}</span>
                      <span className="text-slate-500 block">{order.facility?.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Clinical Instructions</span>
                      <span className="text-slate-700">{order.instructions || 'Standard imaging/test protocol'}</span>
                    </div>
                  </div>

                  {order.resultSummary && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Diagnostic Result Summary:
                      </span>
                      <p className="text-slate-700 pl-5">{order.resultSummary}</p>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Ordering Practitioner: {order.practitioner?.fullName || 'Dr. Rajesh Deshmukh'}
                    </span>

                    <div className="flex items-center gap-2">
                      {isReady && !isReviewed && (
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                          onClick={() => updateDiagStatus(order.id, 'REVIEWED')}
                        >
                          Mark as Reviewed
                        </Button>
                      )}
                      <Link href={`/doctor/consult?patientId=${order.patientId}`}>
                        <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Open Patient Consult
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Content for Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          {filteredReferrals.length === 0 ? (
            <Card className="p-10 text-center text-slate-500 border-slate-200">
              <Share2 className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">No referrals found</p>
              <p className="text-xs text-slate-500 mt-1">Click "Create New Referral" to refer a patient to a district or tertiary hospital.</p>
            </Card>
          ) : (
            filteredReferrals.map((ref: any) => {
              const stages = ['CREATED', 'ACCEPTED', 'SCHEDULED', 'PATIENT_ARRIVED', 'COMPLETED'];
              const currentStageIdx = stages.indexOf(ref.status);

              return (
                <Card key={ref.id} className="p-5 space-y-4 border-slate-200 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {ref.requestedSpecialty} Referral
                        </span>
                        <Badge variant={ref.priority === 'URGENT' ? 'urgent' : 'routine'}>
                          {ref.priority}
                        </Badge>
                        {ref.patientAcknowledged && (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                            Patient Acknowledged
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        Referral #{ref.referralNumber} • Due Date: {ref.dueDate || 'Within 14 days'}
                      </span>
                    </div>

                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Status: {ref.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Closed-Loop Status Stepper */}
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-1 sm:gap-2">
                      {stages.map((stage, idx) => {
                        const isDone = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;
                        return (
                          <div key={stage} className="text-center">
                            <div
                              className={`h-2 rounded-full mb-1 transition-all ${
                                isDone ? 'bg-teal-600' : 'bg-slate-200'
                              } ${isCurrent ? 'ring-2 ring-teal-400' : ''}`}
                            />
                            <span className={`text-[9px] sm:text-[11px] font-bold block ${
                              isDone ? 'text-teal-900' : 'text-slate-400'
                            }`}>
                              {stage.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium">Patient</span>
                      <span className="font-bold text-slate-900">{ref.patient?.fullName}</span>
                      <span className="text-slate-500 block">Village: {ref.patient?.village || 'Kendur'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Transfer Pathway</span>
                      <span className="font-semibold text-slate-800 block">
                        From: {ref.referringFacility?.name}
                      </span>
                      <span className="font-bold text-teal-800 block flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> To: {ref.receivingFacility?.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Clinical Reason</span>
                      <p className="text-slate-700">{ref.reason}</p>
                    </div>
                  </div>

                  {ref.clinicalSummary && (
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Summary notes:</span> {ref.clinicalSummary}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Referring Doctor: {ref.referringPractitioner?.fullName || 'Dr. Rajesh Deshmukh'}
                    </span>

                    <div className="flex items-center gap-2">
                      {ref.status === 'CREATED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReferralStatus(ref.id, 'ACCEPTED')}
                        >
                          Mark Accepted
                        </Button>
                      )}
                      {ref.status === 'ACCEPTED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReferralStatus(ref.id, 'SCHEDULED')}
                        >
                          Mark Scheduled
                        </Button>
                      )}
                      {ref.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateReferralStatus(ref.id, 'PATIENT_ARRIVED')}
                        >
                          Confirm Patient Arrived
                        </Button>
                      )}
                      {ref.status === 'PATIENT_ARRIVED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => updateReferralStatus(ref.id, 'COMPLETED')}
                        >
                          Mark Completed
                        </Button>
                      )}

                      <Link href={`/doctor/consult?patientId=${ref.patientId}`}>
                        <Button size="sm" variant="outline">
                          View Patient
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* New Diagnostic Order Modal */}
      <Modal
        isOpen={isNewDiagModalOpen}
        onClose={() => setIsNewDiagModalOpen(false)}
        title="Order New Diagnostic Test"
      >
        <form onSubmit={handleCreateDiag} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Patient</label>
            <select
              value={newDiagForm.patientId}
              onChange={(e) => setNewDiagForm({ ...newDiagForm, patientId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.village}, ABHA: {p.nationalHealthId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Diagnostic Facility / Lab</label>
            <select
              value={newDiagForm.facilityId}
              onChange={(e) => setNewDiagForm({ ...newDiagForm, facilityId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
              required
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Test Name</label>
              <input
                type="text"
                value={newDiagForm.testName}
                onChange={(e) => setNewDiagForm({ ...newDiagForm, testName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={newDiagForm.testCategory}
                onChange={(e) => setNewDiagForm({ ...newDiagForm, testCategory: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
              >
                <option value="RADIOLOGY">Radiology (X-Ray, Ultrasound)</option>
                <option value="PATHOLOGY">Pathology / Blood</option>
                <option value="BIOCHEMISTRY">Biochemistry</option>
                <option value="MICROBIOLOGY">Microbiology</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Clinical Instructions & Protocol</label>
            <textarea
              rows={3}
              value={newDiagForm.instructions}
              onChange={(e) => setNewDiagForm({ ...newDiagForm, instructions: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
              placeholder="e.g. Bilateral AP and lateral weight-bearing views..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewDiagModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
              Submit Diagnostic Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Referral Modal */}
      <Modal
        isOpen={isNewRefModalOpen}
        onClose={() => setIsNewRefModalOpen(false)}
        title="Initiate Closed-Loop District Referral"
      >
        <form onSubmit={handleCreateRef} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Patient</label>
            <select
              value={newRefForm.patientId}
              onChange={(e) => setNewRefForm({ ...newRefForm, patientId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.village}, ABHA: {p.nationalHealthId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Referring Facility</label>
              <select
                value={newRefForm.referringFacilityId}
                onChange={(e) => setNewRefForm({ ...newRefForm, referringFacilityId: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
                required
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Receiving Facility</label>
              <select
                value={newRefForm.receivingFacilityId}
                onChange={(e) => setNewRefForm({ ...newRefForm, receivingFacilityId: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
                required
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Requested Specialty</label>
              <input
                type="text"
                value={newRefForm.requestedSpecialty}
                onChange={(e) => setNewRefForm({ ...newRefForm, requestedSpecialty: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={newRefForm.priority}
                onChange={(e) => setNewRefForm({ ...newRefForm, priority: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
              >
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reason for Referral</label>
            <input
              type="text"
              value={newRefForm.reason}
              onChange={(e) => setNewRefForm({ ...newRefForm, reason: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
              placeholder="e.g. Specialist evaluation for joint preservation..."
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Clinical Summary</label>
            <textarea
              rows={3}
              value={newRefForm.clinicalSummary}
              onChange={(e) => setNewRefForm({ ...newRefForm, clinicalSummary: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md font-medium text-slate-800"
              placeholder="Include pertinent history, X-ray findings, current medications..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewRefModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
              Dispatch Referral Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function DoctorRecordsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading clinical records...</div>}>
      <DoctorRecordsContent />
    </Suspense>
  );
}
