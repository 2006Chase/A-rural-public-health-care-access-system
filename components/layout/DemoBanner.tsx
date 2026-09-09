'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, UserCheck, Stethoscope, HeartHandshake, ShieldCheck, ChevronDown, Zap } from 'lucide-react';
import Link from 'next/link';

export const DemoBanner: React.FC = () => {
  const { user, switchDemoRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-slate-200 border-b border-teal-800/40 text-xs px-4 py-1.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold px-2 py-0.5 rounded-md text-[10px] tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" /> SIH Prototype
          </span>
          <span className="hidden sm:inline text-slate-300 font-normal">
            Maharashtra Demo District (Fictional Data)
          </span>
        </div>

        {/* Quick Demo Role Switcher (Section 65 & 111) */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline">Current Role:</span>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-slate-800/90 hover:bg-slate-700/90 text-white font-medium px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {user?.role === 'PATIENT' && <UserCheck className="w-3.5 h-3.5 text-sky-400" />}
              {user?.role === 'HEALTH_WORKER' && <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />}
              {user?.role === 'DOCTOR' && <Stethoscope className="w-3.5 h-3.5 text-amber-400" />}
              {user?.role === 'FACILITY_ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />}
              {user?.role === 'SYSTEM_ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />}
              <span>{user?.name || 'Switch Role'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isOpen && (
              <div
                className="absolute right-0 mt-1.5 w-60 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                onClick={() => setIsOpen(false)}
              >
                <div className="px-3 py-1 font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                  Select Demo Persona
                </div>
                <button
                  onClick={() => switchDemoRole('PATIENT')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <div>
                    <div className="text-slate-900 font-semibold">Anand Patil (Patient)</div>
                    <div className="text-[10px] text-slate-500">Kendur village, knee pain</div>
                  </div>
                </button>
                <button
                  onClick={() => switchDemoRole('HEALTH_WORKER')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-slate-900 font-semibold">Sunita Shinde (ASHA)</div>
                    <div className="text-[10px] text-slate-500">Frontline worker, offline vitals</div>
                  </div>
                </button>
                <button
                  onClick={() => switchDemoRole('DOCTOR')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <Stethoscope className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-slate-900 font-semibold">Dr. Rajesh Deshmukh</div>
                    <div className="text-[10px] text-slate-500">Orthopedic Specialist (Shirur RH)</div>
                  </div>
                </button>
                <button
                  onClick={() => switchDemoRole('FACILITY_ADMIN')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="text-slate-900 font-semibold">Priya Kulkarni (Admin)</div>
                    <div className="text-[10px] text-slate-500">Hospital Superintendent</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <Link
            href="/demo"
            className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Zap className="w-3 h-3" /> 5-Min Demos
          </Link>
        </div>
      </div>
    </div>
  );
};
