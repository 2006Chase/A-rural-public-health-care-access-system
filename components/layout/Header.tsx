'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { LANGUAGES, Language } from '@/packages/i18n';
import { BRANDING } from '@/packages/config';
import { Globe, Bell, Activity, PhoneCall, ShieldAlert } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export const Header: React.FC = () => {
  const { language, setLanguage, user, t } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  // Role portal target path
  const portalPath =
    user?.role === 'DOCTOR'
      ? '/doctor'
      : user?.role === 'HEALTH_WORKER'
      ? '/worker'
      : user?.role === 'FACILITY_ADMIN' || user?.role === 'SYSTEM_ADMIN'
      ? '/admin'
      : '/patient';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Tagline */}
        <Link href={portalPath} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">{BRANDING.appName}</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Public Health
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block leading-none mt-0.5">
              {t('common.appTagline')}
            </p>
          </div>
        </Link>

        {/* Emergency Call Quick CTA */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="tel:108"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Emergency 108</span>
          </a>
          <a
            href="tel:104"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
            <span>Health Helpline 104</span>
          </a>
        </div>

        {/* Action Controls: Language & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector (Section 40) */}
          <div className="relative flex items-center bg-slate-100/80 rounded-xl p-1 border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
              aria-label="Select Language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200/60 transition-colors"
            aria-label="Open Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Profile Avatar / Role Badge */}
          <Link
            href={portalPath}
            className="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs border border-teal-200">
              {user?.name?.substring(0, 2).toUpperCase() || 'JS'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-teal-600 font-medium capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Notifications Modal */}
      <Modal isOpen={showNotifications} onClose={() => setShowNotifications(false)} title="Health Notifications">
        <div className="space-y-3">
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-teal-900">Virtual Teleconsultation Today</span>
              <span className="text-[10px] text-teal-700 font-medium">11:30 AM</span>
            </div>
            <p className="text-xs text-teal-800 mt-1">
              Your consultation with Dr. Rajesh Deshmukh is confirmed. Token ORTHO-014.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-900">X-Ray Report Available</span>
              <span className="text-[10px] text-slate-500">2 days ago</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Digital X-Ray Knee report is ready and reviewed. Added to your health timeline.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-900">District Referral Scheduled</span>
              <span className="text-[10px] text-slate-500">4 days ago</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Referral to District Referral Hospital for Orthopedic Surgery on Sep 22.
            </p>
          </div>
        </div>
      </Modal>
    </header>
  );
};
