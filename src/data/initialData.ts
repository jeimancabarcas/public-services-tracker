import { ServiceConfig, UserProfile, ReminderSettings } from '../types';

export const INITIAL_SERVICES: Record<string, ServiceConfig> = {
  luz: {
    id: 'luz',
    name: 'Luz',
    enabled: true,
    unit: 'kWh',
    defaultUnitPrice: 850, // Tarifa $/kWh
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    accentClass: 'luz-accent',
    thresholds: {
      optimoMax: 200,
      moderadoMax: 300,
    },
    subsidyConfig: {
      enabled: true,
      maxEstrato: 3,
      maxSubsidizedKwh: 173,
      percentage: 15,
    },
  },
  agua: {
    id: 'agua',
    name: 'Agua',
    enabled: true,
    unit: 'm³',
    defaultUnitPrice: 3500, // Tarifa $/m³
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
    accentClass: 'agua-accent',
    thresholds: {
      optimoMax: 15,
      moderadoMax: 25,
    },
  },
  gas: {
    id: 'gas',
    name: 'Gas',
    enabled: true,
    unit: 'm³',
    defaultUnitPrice: 2400, // Tarifa $/m³
    color: '#EF4444',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    accentClass: 'gas-accent',
    thresholds: {
      optimoMax: 30,
      moderadoMax: 50,
    },
  },
};

export const INITIAL_PROFILE: UserProfile = {
  name: 'Usuario',
  email: '',
  location: 'Colombia',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  estrato: 3,
};

export const INITIAL_REMINDERS: ReminderSettings = {
  pushNotifications: true,
  emailDigest: false,
  readingReminderDay: 15,
};

