'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Calendar, Clock, Video, Building2, MapPin, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PatientAppointmentsPage() {
  const { user } = useApp();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reschedule Modal
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const patientId = user?.patientId || 'demo-id';
        const res = await fetch(`/api/appointments?patientId=${patientId}`);
        if (res.ok) {
          const json = await res.json();
          setAppointments(json.data);
        }
      } catch (err) {
        console.error('Failed to load appointments:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAppointments();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
        );
      }
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !newDate) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppt.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDate }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === selectedAppt.id ? { ...a, date: newDate, status: 'RESCHEDULED' } : a))
        );
        setSelectedAppt(null);
      }
    } catch (err) {
      console.error('Reschedule failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Appointments & Consultations</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track upcoming OPD visits, teleconsultation tokens, and past consultation history.
          </p>
        </div>
        <Link href="/patient/facilities">
          <Button size="sm">Book New Appointment</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-slate-500 animate-pulse">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">You do not have any upcoming appointments.</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Book an assisted teleconsultation with a hospital specialist or schedule an in-person visit.
          </p>
          <Link href="/patient/facilities">
            <Button size="sm">Find Nearby Public Facilities</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card key={appt.id} className="p-5 space-y-4 border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      appt.status === 'CONFIRMED'
                        ? 'urgent'
                        : appt.status === 'COMPLETED'
                        ? 'routine'
                        : appt.status === 'CANCELLED'
                        ? 'emergency'
                        : 'neutral'
                    }
                  >
                    {appt.status}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-slate-700">{appt.appointmentNumber}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    {appt.type === 'TELECONSULT' ? (
                      <span className="text-teal-700 font-semibold flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" /> Teleconsultation
                      </span>
                    ) : (
                      <span className="text-sky-700 font-semibold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> In-Person OPD
                      </span>
                    )}
                  </span>
                </div>

                {appt.queueToken && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-900 rounded-full text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Token: {appt.queueToken}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Date & Time</span>
                  <span className="font-bold text-slate-900 text-sm">{appt.date}</span>
                  <span className="text-slate-600 block">{appt.timeSlot}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">Facility</span>
                  <span className="font-bold text-slate-900 text-sm">{appt.facility?.name}</span>
                  <span className="text-slate-500 block">{appt.facility?.type?.replace(/_/g, ' ')}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">Doctor / Department</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {appt.practitioner?.fullName || 'General OPD'}
                  </span>
                  <span className="text-teal-700 font-medium block">
                    {appt.practitioner?.specialty || 'General Medicine'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                <span className="font-semibold text-slate-900 block mb-0.5">Reason for Visit:</span>
                {appt.reason}
              </div>

              {/* Actions */}
              {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-200 hover:bg-red-50"
                    onClick={() => handleCancel(appt.id)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAppt(appt);
                      setNewDate(appt.date);
                    }}
                  >
                    Reschedule
                  </Button>
                  {appt.type === 'TELECONSULT' && (
                    <Link href={`/patient/ai-intake`}>
                      <Button size="sm" leftIcon={<Video className="w-3.5 h-3.5" />}>
                        Join Teleconsult
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title="Reschedule Appointment">
        <form onSubmit={handleReschedule} className="space-y-4">
          <p className="text-xs text-slate-600">
            Rescheduling appointment for <strong>{selectedAppt?.facility?.name}</strong>.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedAppt(null)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Save New Date
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
