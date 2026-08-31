export type ServiceType = 'luz' | 'agua' | 'gas';

export type ConsumptionStatus = 'optimo' | 'moderado' | 'alto';

export interface UtilityReading {
  id: string;
  service: ServiceType;
  date: string; // ISO format: YYYY-MM-DD
  formattedDate?: string;
  prevReading: number;
  currReading: number;
  consumption: number;
  unit: string;
  unitPrice: number;
  baseCost?: number;
  estrato?: number;
  subsidizedKwh?: number;
  subsidyDiscount?: number;
  totalCost: number;
  status: ConsumptionStatus;
  notes?: string;
  createdAt: string;
}

export interface ServiceConfig {
  id: ServiceType;
  name: string;
  enabled: boolean;
  unit: string;
  defaultUnitPrice: number;
  color: string;
  bgColor: string;
  borderColor: string;
  accentClass: string;
  thresholds: {
    optimoMax: number;
    moderadoMax: number;
  };
  subsidyConfig?: {
    enabled: boolean;
    maxEstrato: number;
    maxSubsidizedKwh: number;
    percentage: number; // 15% del valor de la tarifa
  };
}

export interface UserProfile {
  name: string;
  email: string;
  location: string;
  avatarUrl: string;
  estrato: number; // 1 to 6
}

export interface ReminderSettings {
  pushNotifications: boolean;
  emailDigest: boolean;
  readingReminderDay: number;
}

export type ActiveTab = 'dashboard' | 'registro' | 'historial' | 'configuracion' | 'ayuda';

export type CloudSyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

export interface MonthlyTrendData {
  monthKey: string;
  monthName: string;
  luz: number;
  agua: number;
  gas: number;
  luzCost: number;
  aguaCost: number;
  gasCost: number;
}
