'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Home,
  MapPin,
  Calendar,
  Clock,
  User,
  Users,
  HeartPulse,
  CheckSquare,
  Stethoscope,
  FileText,
  Building2,
  Pill,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user, t, pendingSyncCount } = useApp();

  // Define nav items according to Role (Section 9)
  const getNavItems = () => {
    if (user?.role === 'HEALTH_WORKER') {
      return [
        { label: 'Dashboard', href: '/worker', icon: <Home className="w-5 h-5" /> },
        { label: 'Patients', href: '/worker/patients', icon: <Users className="w-5 h-5" /> },
        { label: 'Vitals', href: '/worker/vitals', icon: <HeartPulse className="w-5 h-5" /> },
        { label: 'Tasks', href: '/worker/tasks', icon: <CheckSquare className="w-5 h-5" /> },
        {
          label: 'Sync',
          href: '/worker/sync',
          icon: (
            <div className="relative">
              <RefreshCw className="w-5 h-5" />
              {pendingSyncCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              )}
            </div>
          ),
        },
      ];
    }

    if (user?.role === 'DOCTOR') {
      return [
        { label: 'Dashboard', href: '/doctor', icon: <Home className="w-5 h-5" /> },
        { label: 'Queue', href: '/doctor/queue', icon: <Clock className="w-5 h-5" /> },
        { label: 'Consult', href: '/doctor/consult', icon: <Stethoscope className="w-5 h-5" /> },
        { label: 'Records', href: '/doctor/records', icon: <FileText className="w-5 h-5" /> },
      ];
    }

    if (user?.role === 'FACILITY_ADMIN' || user?.role === 'SYSTEM_ADMIN') {
      return [
        { label: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" /> },
        { label: 'Facilities', href: '/admin/facilities', icon: <Building2 className="w-5 h-5" /> },
        { label: 'Medicines', href: '/admin/inventory', icon: <Pill className="w-5 h-5" /> },
        { label: 'Quality', href: '/admin/quality', icon: <BarChart3 className="w-5 h-5" /> },
      ];
    }

    // Default: Patient Navigation (Section 9)
    return [
      { label: t('nav.home'), href: '/patient', icon: <Home className="w-5 h-5" /> },
      { label: t('nav.nearby'), href: '/patient/facilities', icon: <MapPin className="w-5 h-5" /> },
      { label: t('nav.appointments'), href: '/patient/appointments', icon: <Calendar className="w-5 h-5" /> },
      { label: t('nav.health'), href: '/patient/timeline', icon: <HeartPulse className="w-5 h-5" /> },
      { label: t('nav.profile'), href: '/patient/profile', icon: <User className="w-5 h-5" /> },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/patient' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[56px] ${
                isActive ? 'text-teal-700 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
