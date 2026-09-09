'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LANGUAGES, Language } from '@/packages/i18n';
import { User, Phone, MapPin, HeartPulse, ShieldCheck, Globe, LogOut, CheckCircle2 } from 'lucide-react';

export default function PatientProfilePage() {
  const { user, language, setLanguage, logout } = useApp();
  const [patientData, setPatientData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const patientId = user?.patientId || 'demo-id';
        const res = await fetch(`/api/patients/${patientId}`);
        if (res.ok) {
          const json = await res.json();
          setPatientData(json.data);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Patient Health Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Personal health identifiers, language preference, emergency contacts, and data sharing consent.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={logout} leftIcon={<LogOut className="w-3.5 h-3.5" />}>
          Log Out
        </Button>
      </div>

      {/* Primary Identity Card */}
      <Card className="p-6 space-y-4 border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
            {user?.name?.substring(0, 2).toUpperCase() || 'AP'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <Badge variant="routine">Verified Citizen</Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              ABHA ID: <strong className="text-slate-800 font-bold">{patientData?.nationalHealthId || '91-4829-1049-2810'}</strong>
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {patientData?.address || 'Kendur Village, Shirur Taluka'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-100 pt-4">
          <div>
            <span className="text-slate-400 block">Date of Birth</span>
            <span className="font-semibold text-slate-900">{patientData?.dateOfBirth || '14-Apr-1972'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Gender</span>
            <span className="font-semibold text-slate-900">{patientData?.gender || 'MALE'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Blood Group</span>
            <span className="font-semibold text-slate-900">{patientData?.bloodGroup || 'B+'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Registered Phone</span>
            <span className="font-semibold text-slate-900">{patientData?.phone || '9820011001'}</span>
          </div>
        </div>
      </Card>

      {/* Language Preference (Section 40) */}
      <Card className="p-5 space-y-3 border-slate-200">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Globe className="w-4 h-4 text-teal-600" />
          <span>Preferred System Language</span>
        </div>
        <p className="text-xs text-slate-500">
          Choose your native language. All medical timelines, prescriptions, and navigation assistant flows will adapt.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code as Language)}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                language === l.code
                  ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm">{l.nativeName}</div>
              <div className="text-[10px] opacity-80">{l.label}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Consent & Data Sharing (Section 50) */}
      <Card className="p-5 space-y-3 border-slate-200">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>Consent & Healthcare Data Privacy</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your health data is protected under ABDM data privacy guidelines. You have granted authorized access to
          consulting doctors at Shirur Rural Hospital and your assigned ASHA worker.
        </p>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">Active Referral Consent</span>
          </div>
          <Badge variant="routine">Active (180 Days)</Badge>
        </div>
      </Card>
    </div>
  );
}
