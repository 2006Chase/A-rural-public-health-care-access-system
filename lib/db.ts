import Dexie, { type Table } from 'dexie';

export interface LocalSyncItem {
  id?: number;
  localId: string;
  deviceId: string;
  entityType: 'Vitals' | 'Observation' | 'Patient' | 'Appointment' | 'Document';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  version: number;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
}

export interface CachedFacility {
  id: string;
  name: string;
  code: string;
  type: string;
  ownership: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  latitude: number;
  longitude: number;
  hasEmergency: boolean;
  hasTeleconsult: boolean;
  operatingHours: string;
}

export interface CachedPatient {
  id: string;
  nationalHealthId: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  village: string;
  bloodGroup?: string;
  riskLevel: string;
  chronicConditions?: string;
  allergies?: string;
}

export class JeevanSetuLocalDatabase extends Dexie {
  syncQueue!: Table<LocalSyncItem>;
  cachedFacilities!: Table<CachedFacility>;
  cachedPatients!: Table<CachedPatient>;

  constructor() {
    super('JeevanSetuDB');
    this.version(1).stores({
      syncQueue: '++id, localId, entityType, entityId, status, createdAt',
      cachedFacilities: 'id, name, type, ownership',
      cachedPatients: 'id, nationalHealthId, fullName, phone, riskLevel',
    });
  }
}

export const localDb = new JeevanSetuLocalDatabase();
