'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export const ConnectivityBanner: React.FC = () => {
  const { connectivity, pendingSyncCount, triggerSync, t } = useApp();

  // Non-alarming subtle styling
  if (connectivity === 'ONLINE' && pendingSyncCount === 0) {
    return null; // Don't clutter header when fully clean and online
  }

  const configs = {
    ONLINE: {
      icon: <Wifi className="w-3.5 h-3.5 text-emerald-600" />,
      text: pendingSyncCount > 0 ? `${pendingSyncCount} changes waiting to sync` : t('common.online'),
      bg: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/60',
    },
    OFFLINE: {
      icon: <WifiOff className="w-3.5 h-3.5 text-amber-700" />,
      text: t('common.offline'),
      bg: 'bg-amber-50 text-amber-900 border-amber-200/80',
    },
    SYNCING: {
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />,
      text: t('common.syncing'),
      bg: 'bg-blue-50 text-blue-800 border-blue-200/60',
    },
    SYNC_ERROR: {
      icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
      text: t('common.syncError'),
      bg: 'bg-red-50 text-red-800 border-red-200/60',
    },
  };

  const current = configs[connectivity] || configs.ONLINE;

  return (
    <div className={`w-full py-1 px-4 text-xs flex items-center justify-between border-b ${current.bg} transition-all`}>
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2 font-medium">
          {current.icon}
          <span>{current.text}</span>
          {pendingSyncCount > 0 && (
            <span className="bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {pendingSyncCount} offline
            </span>
          )}
        </div>
        {pendingSyncCount > 0 && connectivity !== 'OFFLINE' && (
          <button
            onClick={triggerSync}
            className="text-xs font-semibold underline hover:text-blue-900 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Sync Now
          </button>
        )}
      </div>
    </div>
  );
};
