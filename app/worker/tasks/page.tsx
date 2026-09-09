'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CheckSquare,
  AlertTriangle,
  HeartPulse,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  PhoneCall,
  User,
} from 'lucide-react';

export default function WorkerTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch('/api/followups');
        if (res.ok) {
          const json = await res.json();
          setTasks(json.data);
        }
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, []);

  const handleMarkComplete = async (taskId: string) => {
    try {
      const res = await fetch(`/api/followups/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: 'COMPLETED' } : t))
        );
      }
    } catch (err) {
      console.error('Task update failed:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-14">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="urgent">Frontline Care Protocol</Badge>
          <span className="text-xs text-slate-500 font-medium">High-Risk & Missed Follow-up Tasks</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Health Worker Task Queue</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Prioritized list of home visits, missed medication follow-ups, and maternal check-ins for Kendur village.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-slate-500 animate-pulse">Loading task queue...</div>
      ) : tasks.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-500">All follow-up tasks are completed!</Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={`p-4 sm:p-5 space-y-3 border transition-all ${
                task.status === 'COMPLETED'
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : task.isHighRiskEscalated
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={task.status === 'COMPLETED' ? 'routine' : task.isHighRiskEscalated ? 'emergency' : 'urgent'}>
                    {task.status === 'COMPLETED' ? 'COMPLETED' : task.isHighRiskEscalated ? 'HIGH RISK ESCALATION' : 'PENDING'}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    Due: {task.scheduledDate}
                  </span>
                </div>

                {task.status !== 'COMPLETED' && (
                  <Button size="sm" variant="outline" onClick={() => handleMarkComplete(task.id)}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Mark Visited
                  </Button>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{task.patient.fullName}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{task.reason}</p>
              </div>

              {task.notes && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                  {task.notes}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Village: <strong className="text-slate-800">{task.patient.village}</strong> • Phone: {task.patient.phone}</span>
                <Link href={`/worker/vitals?patientId=${task.patient.id}`} className="text-teal-700 font-semibold hover:underline">
                  Record Home Vitals $\to$
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
