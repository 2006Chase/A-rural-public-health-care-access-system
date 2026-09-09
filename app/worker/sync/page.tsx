'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { localDb, LocalSyncItem } from '@/lib/db';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ArrowRight,
} from 'lucide-react';

export default function WorkerSyncPage() {
  const { connectivity, pendingSyncCount, triggerSync } = useApp();
  const [syncItems, setSyncItems] = useState<LocalSyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadQueue() {
      const items = await localDb.syncQueue.reverse().toArray();
      setSyncItems(items);
    }
    loadQueue();
    const interval = setInterval(loadQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerSync();
    setIsSyncing(false);
  };

  const pendingItems = syncItems.filter((i) => i.status === 'PENDING');
  const syncedItems = syncItems.filter((i) => i.status === 'SYNCED');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="routine">Offline Synchronization Center</Badge>
            <span className="text-xs text-slate-500 font-medium">Dexie IndexedDB $\leftrightarrow$ Cloud Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Local Data & Sync Status</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            View offline change queue, detect conflicting clinical updates, and manually synchronize with hospital servers.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleManualSync}
          isLoading={isSyncing}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Sync Now ({pendingItems.length})
        </Button>
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-teal-50/50 border-teal-100">
          <span className="text-xs text-slate-500 font-medium block">Network State</span>
          <div className="flex items-center gap-2 mt-1">
            {connectivity === 'ONLINE' ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-slate-900">Online & Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-700" />
                <span className="font-extrabold text-amber-900">Offline Mode Active</span>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-amber-50/50 border-amber-100">
          <span className="text-xs text-slate-500 font-medium block">Pending Changes</span>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">{pendingItems.length}</p>
          <span className="text-[11px] text-amber-700">Queued in browser storage</span>
        </Card>

        <Card className="p-4 bg-sky-50/50 border-sky-100">
          <span className="text-xs text-slate-500 font-medium block">Synced Changes</span>
          <p className="text-2xl font-extrabold text-sky-900 mt-1">{syncedItems.length}</p>
          <span className="text-[11px] text-sky-700">Persisted to central database</span>
        </Card>
      </div>

      {/* Sync Queue Stream */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Local Operation Log ({syncItems.length})
        </h2>

        {syncItems.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">
            No local offline operations recorded yet. Record vitals or register a patient to test offline queuing.
          </Card>
        ) : (
          <div className="space-y-2">
            {syncItems.map((item) => (
              <Card key={item.id} className="p-3.5 border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{item.localId}</span>
                    <Badge variant={item.status === 'SYNCED' ? 'routine' : item.status === 'PENDING' ? 'urgent' : 'emergency'}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600">
                    Operation: <strong className="text-slate-900">{item.operation} {item.entityType}</strong> • {item.createdAt}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-slate-700 block">{item.deviceId}</span>
                  <span className="text-[10px] text-slate-400">Ver: {item.version}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
