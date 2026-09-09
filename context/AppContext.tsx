'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, getTranslation } from '@/packages/i18n';
import { Role, UserProfile } from '@/packages/types';
import { DEMO_CREDENTIALS } from '@/packages/config';
import { localDb } from '@/lib/db';

type ConnectivityState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNC_ERROR';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  connectivity: ConnectivityState;
  pendingSyncCount: number;
  triggerSync: () => Promise<void>;
  switchDemoRole: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  isLoadingUser: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('mr'); // Default to regional language (Marathi)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [connectivity, setConnectivity] = useState<ConnectivityState>('ONLINE');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  const t = useCallback(
    (keyPath: string) => {
      return getTranslation(keyPath, language);
    },
    [language]
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jeevansetu_lang', lang);
    }
  };

  // Sync queue runner: pushes Dexie queue to server
  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) {
      setConnectivity('OFFLINE');
      return;
    }

    try {
      setConnectivity('SYNCING');
      const pendingItems = await localDb.syncQueue.where('status').equals('PENDING').toArray();
      if (pendingItems.length === 0) {
        setPendingSyncCount(0);
        setConnectivity('ONLINE');
        return;
      }

      const operations = pendingItems.map((item) => ({
        id: item.localId,
        deviceId: item.deviceId,
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
        payload: item.payload,
        version: item.version,
      }));

      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations }),
      });

      if (res.ok) {
        const json = await res.json();
        // Update local items to SYNCED
        for (const item of pendingItems) {
          if (item.id) {
            await localDb.syncQueue.update(item.id, { status: 'SYNCED' });
          }
        }
        const remaining = await localDb.syncQueue.where('status').equals('PENDING').count();
        setPendingSyncCount(remaining);
        setConnectivity('ONLINE');
      } else {
        setConnectivity('SYNC_ERROR');
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setConnectivity('SYNC_ERROR');
    }
  }, []);

  // Check online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setConnectivity('ONLINE');
      triggerSync();
    };
    const handleOffline = () => {
      setConnectivity('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setConnectivity('OFFLINE');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  // Load language and active session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('jeevansetu_lang') as Language;
      if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
        setLanguageState(savedLang);
      }
    }

    async function loadSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          if (json.authenticated && json.user) {
            setUser(json.user);
          } else {
            // Default demo login to PATIENT (Anand Patil) for instant seamless experience
            await switchDemoRole('PATIENT');
          }
        } else {
          await switchDemoRole('PATIENT');
        }
      } catch (err) {
        console.warn('Session check fallback to demo patient:', err);
      } finally {
        setIsLoadingUser(false);
      }
    }

    loadSession();
  }, []);

  // Update pending sync count from Dexie
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const count = await localDb.syncQueue.where('status').equals('PENDING').count();
        setPendingSyncCount(count);
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const switchDemoRole = async (role: Role) => {
    const cred = DEMO_CREDENTIALS.find((c) => c.role === role);
    if (!cred) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cred.phone, password: cred.password, role }),
      });

      if (res.ok) {
        const json = await res.json();
        setUser(json.user);
      }
    } catch (err) {
      console.error('Failed to switch demo role:', err);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      await switchDemoRole('PATIENT');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        user,
        setUser,
        connectivity,
        pendingSyncCount,
        triggerSync,
        switchDemoRole,
        logout,
        isLoadingUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
