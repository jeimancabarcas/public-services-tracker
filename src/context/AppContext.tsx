import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  UtilityReading, 
  ServiceConfig, 
  UserProfile, 
  ReminderSettings, 
  ActiveTab, 
  ServiceType,
  ConsumptionStatus,
  MonthlyTrendData,
  CloudSyncStatus
} from '../types';
import { INITIAL_READINGS, INITIAL_SERVICES, INITIAL_PROFILE, INITIAL_REMINDERS } from '../data/initialData';
import { auth, db } from '../lib/firebase';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  User 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  readings: UtilityReading[];
  services: Record<string, ServiceConfig>;
  profile: UserProfile;
  reminders: ReminderSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isNewEntryModalOpen: boolean;
  setIsNewEntryModalOpen: (open: boolean) => void;
  selectedReadingForDetail: UtilityReading | null;
  setSelectedReadingForDetail: (reading: UtilityReading | null) => void;
  editingReading: UtilityReading | null;
  setEditingReading: (reading: UtilityReading | null) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (open: boolean) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
  
  // Cloud & Auth state
  firebaseUser: User | null;
  cloudStatus: CloudSyncStatus;
  isAuthLoading: boolean;
  authError: string | null;
  showAuthScreen: boolean;
  setShowAuthScreen: (show: boolean) => void;
  isGuest: boolean;

  // Social Auth actions (Google & Facebook)
  loginWithGoogle: (estratoPreference?: number) => Promise<void>;
  loginWithFacebook: (estratoPreference?: number) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logoutUser: () => Promise<void>;
  clearAuthError: () => void;

  // Actions
  addReading: (readingData: Omit<UtilityReading, 'id' | 'createdAt' | 'status' | 'consumption'>) => UtilityReading;
  updateReading: (id: string, readingData: Partial<UtilityReading>) => void;
  deleteReading: (id: string) => void;
  updateProfile: (profile: UserProfile) => void;
  updateServiceConfig: (serviceId: ServiceType, updates: Partial<ServiceConfig>) => void;
  updateReminders: (reminders: ReminderSettings) => void;
  resetToSampleData: () => void;

  // Calculation helpers
  calculateCost: (service: ServiceType, consumption: number, unitPrice: number, estratoOverride?: number) => {
    baseCost: number;
    estrato: number;
    subsidizedKwh: number;
    subsidyDiscount: number;
    totalCost: number;
  };

  // Computed data
  getLatestReadingForService: (service: ServiceType) => UtilityReading | undefined;
  getComparisonForService: (service: ServiceType) => {
    current: UtilityReading | undefined;
    previous: UtilityReading | undefined;
    consumptionDiff: number;
    percentageDiff: number;
    status: ConsumptionStatus;
  };
  getMonthlyTrends: () => MonthlyTrendData[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  READINGS: 'hogarmedido_readings_v1',
  SERVICES: 'hogarmedido_services_v1',
  PROFILE: 'hogarmedido_profile_v1',
  REMINDERS: 'hogarmedido_reminders_v1',
  GUEST_MODE: 'hogarmedido_guest_mode_v1',
};

const mapAuthErrorToSpanish = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'La ventana de inicio de sesión fue cerrada antes de completar la autenticación.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de inicio de sesión. Por favor permite popups para este sitio.';
    case 'auth/cancelled-popup-request':
      return 'La solicitud de inicio de sesión fue cancelada.';
    case 'auth/account-exists-with-different-credential':
      return 'Ya existe una cuenta con la misma dirección de correo electrónico pero con credenciales de inicio de sesión diferentes.';
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado en Firebase Authentication. Añádelo en los dominios autorizados de la consola de Firebase.';
    case 'auth/operation-not-allowed':
      return 'El proveedor de inicio de sesión (Google o Facebook) no está habilitado en la consola de Firebase Authentication.';
    case 'auth/network-request-failed':
      return 'Error de conexión con el servidor. Por favor verifica tu red e intenta de nuevo.';
    default:
      return error?.message || 'Ocurrió un error al autenticar con el proveedor.';
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>('syncing');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.GUEST_MODE) === 'true';
  });

  const [readings, setReadings] = useState<UtilityReading[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.READINGS);
      return stored ? JSON.parse(stored) : INITIAL_READINGS;
    } catch {
      return INITIAL_READINGS;
    }
  });

  const [services, setServices] = useState<Record<string, ServiceConfig>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return stored ? JSON.parse(stored) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return stored ? JSON.parse(stored) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [reminders, setReminders] = useState<ReminderSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return stored ? JSON.parse(stored) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [selectedReadingForDetail, setSelectedReadingForDetail] = useState<UtilityReading | null>(null);
  const [editingReading, setEditingReading] = useState<UtilityReading | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Ref to avoid cyclic updates between local state and firestore listeners
  const isInitialSnapshotHandled = useRef(false);

  // Sync to localStorage as continuous backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(readings));
    } catch (e) {
      console.error('Failed to persist readings locally', e);
    }
  }, [readings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.error('Failed to persist services locally', e);
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to persist profile locally', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.error('Failed to persist reminders locally', e);
    }
  }, [reminders]);

  // Firebase Authentication & Firestore real-time synchronization
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setFirebaseUser(user);
        setCloudStatus('connected');
        // If user is authenticated with email, update profile email/name
        if (!user.isAnonymous && user.email) {
          setProfile((prev) => ({
            ...prev,
            email: user.email || prev.email,
            name: user.displayName || prev.name,
          }));
        }
      } else {
        // If not logged in and not guest, check if we need anonymous login
        try {
          const credential = await signInAnonymously(auth);
          setFirebaseUser(credential.user);
          setCloudStatus('connected');
        } catch (err) {
          console.warn('Firebase Auth sign-in error:', err);
          setCloudStatus('offline');
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const loginWithGoogle = async (estratoPreference?: number) => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setFirebaseUser(user);
      setIsGuest(false);
      localStorage.removeItem(STORAGE_KEYS.GUEST_MODE);

      // Synchronize profile data
      const chosenEstrato = estratoPreference || profile.estrato || 3;
      const updatedProfile: UserProfile = {
        ...profile,
        name: user.displayName || profile.name,
        email: user.email || profile.email,
        estrato: chosenEstrato,
      };

      setProfile(updatedProfile);

      // Save/merge to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updatedProfile, { merge: true });

      setShowAuthScreen(false);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      const msg = mapAuthErrorToSpanish(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const loginWithFacebook = async (estratoPreference?: number) => {
    setAuthError(null);
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setFirebaseUser(user);
      setIsGuest(false);
      localStorage.removeItem(STORAGE_KEYS.GUEST_MODE);

      const chosenEstrato = estratoPreference || profile.estrato || 3;
      const updatedProfile: UserProfile = {
        ...profile,
        name: user.displayName || profile.name,
        email: user.email || profile.email,
        estrato: chosenEstrato,
      };

      setProfile(updatedProfile);

      // Save/merge to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updatedProfile, { merge: true });

      setShowAuthScreen(false);
    } catch (err: any) {
      console.error('Facebook Sign-in error:', err);
      const msg = mapAuthErrorToSpanish(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const loginAsGuest = async () => {
    setAuthError(null);
    try {
      if (!firebaseUser) {
        const cred = await signInAnonymously(auth);
        setFirebaseUser(cred.user);
      }
      setIsGuest(true);
      localStorage.setItem(STORAGE_KEYS.GUEST_MODE, 'true');
      setShowAuthScreen(false);
    } catch (err: any) {
      console.warn('Guest login error:', err);
      setIsGuest(true);
      localStorage.setItem(STORAGE_KEYS.GUEST_MODE, 'true');
      setShowAuthScreen(false);
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setIsGuest(false);
    localStorage.removeItem(STORAGE_KEYS.GUEST_MODE);
    setFirebaseUser(null);
    setShowAuthScreen(true);
    showToast('Sesión cerrada correctamente.', 'info');
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  // Set up Firestore listeners when Firebase user is authenticated
  useEffect(() => {
    if (!firebaseUser) return;

    setCloudStatus('syncing');
    const userId = firebaseUser.uid;

    // 1. Listen to readings collection
    const readingsColRef = collection(db, 'users', userId, 'readings');
    const unsubReadings = onSnapshot(
      readingsColRef,
      async (snapshot) => {
        if (snapshot.empty && !isInitialSnapshotHandled.current) {
          isInitialSnapshotHandled.current = true;
          // Seed local readings to Firestore on first run
          try {
            const batch = writeBatch(db);
            readings.forEach((item) => {
              const itemDoc = doc(db, 'users', userId, 'readings', item.id);
              batch.set(itemDoc, item);
            });
            await batch.commit();
          } catch (e) {
            console.warn('Failed to seed initial readings to Firestore', e);
          }
        } else if (!snapshot.empty) {
          isInitialSnapshotHandled.current = true;
          const cloudList: UtilityReading[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UtilityReading;
            cloudList.push({
              ...data,
              id: docSnap.id,
            });
          });
          // Sort by date descending
          cloudList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setReadings(cloudList);
        }
        setCloudStatus('connected');
      },
      (error) => {
        console.warn('Firestore readings sync error:', error);
        setCloudStatus('offline');
      }
    );

    // 2. Listen to profile doc
    const profileDocRef = doc(db, 'users', userId);
    const unsubProfile = onSnapshot(
      profileDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const cloudProfile = docSnap.data() as UserProfile;
          setProfile((prev) => ({ ...prev, ...cloudProfile }));
        } else {
          // Initialize profile doc
          try {
            await setDoc(profileDocRef, profile, { merge: true });
          } catch (e) {
            console.warn('Failed to initialize profile in Firestore', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore profile sync error:', error);
      }
    );

    // 3. Listen to settings doc (services & reminders)
    const servicesDocRef = doc(db, 'users', userId, 'settings', 'services');
    const unsubServices = onSnapshot(
      servicesDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()?.services;
          if (data) {
            setServices(data);
          }
        } else {
          try {
            await setDoc(servicesDocRef, { services }, { merge: true });
          } catch (e) {
            console.warn('Failed to initialize services in Firestore', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore services sync error:', error);
      }
    );

    const remindersDocRef = doc(db, 'users', userId, 'settings', 'reminders');
    const unsubReminders = onSnapshot(
      remindersDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()?.reminders;
          if (data) {
            setReminders(data);
          }
        } else {
          try {
            await setDoc(remindersDocRef, { reminders }, { merge: true });
          } catch (e) {
            console.warn('Failed to initialize reminders in Firestore', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore reminders sync error:', error);
      }
    );

    return () => {
      unsubReadings();
      unsubProfile();
      unsubServices();
      unsubReminders();
    };
  }, [firebaseUser]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const calculateStatus = (service: ServiceType, consumption: number): ConsumptionStatus => {
    const cfg = services[service] || INITIAL_SERVICES[service];
    if (consumption <= cfg.thresholds.optimoMax) {
      return 'optimo';
    } else if (consumption <= cfg.thresholds.moderadoMax) {
      return 'moderado';
    }
    return 'alto';
  };

  const calculateCost = (
    service: ServiceType,
    consumption: number,
    unitPrice: number,
    estratoOverride?: number
  ): {
    baseCost: number;
    estrato: number;
    subsidizedKwh: number;
    subsidyDiscount: number;
    totalCost: number;
  } => {
    const currentEstrato = estratoOverride !== undefined ? estratoOverride : (profile.estrato || 3);
    const baseCost = Number((consumption * unitPrice).toFixed(2));
    const cfg = services[service] || INITIAL_SERVICES[service];

    // Subsidy logic for electricity (luz):
    // Estrato 3 or less receives a 15% discount on the tariff (unit price) for the first 173 kWh
    if (
      service === 'luz' &&
      cfg?.subsidyConfig?.enabled !== false &&
      currentEstrato <= (cfg?.subsidyConfig?.maxEstrato ?? 3)
    ) {
      const maxSub = cfg?.subsidyConfig?.maxSubsidizedKwh ?? 173;
      const percentage = cfg?.subsidyConfig?.percentage ?? 15;
      const discountRate = unitPrice * (percentage / 100);
      const subsidizedKwh = Math.min(consumption, maxSub);
      const subsidyDiscount = Number((subsidizedKwh * discountRate).toFixed(2));
      const totalCost = Number(Math.max(0, baseCost - subsidyDiscount).toFixed(2));

      return {
        baseCost,
        estrato: currentEstrato,
        subsidizedKwh,
        subsidyDiscount,
        totalCost,
      };
    }

    return {
      baseCost,
      estrato: currentEstrato,
      subsidizedKwh: 0,
      subsidyDiscount: 0,
      totalCost: baseCost,
    };
  };

  const addReading = (readingData: Omit<UtilityReading, 'id' | 'createdAt' | 'status' | 'consumption'>): UtilityReading => {
    const consumption = Math.max(0, readingData.currReading - readingData.prevReading);
    const status = calculateStatus(readingData.service, consumption);
    const costDetails = calculateCost(
      readingData.service,
      consumption,
      readingData.unitPrice,
      readingData.estrato
    );
    
    const newEntry: UtilityReading = {
      ...readingData,
      id: `read-${Date.now()}`,
      consumption,
      status,
      baseCost: readingData.baseCost ?? costDetails.baseCost,
      estrato: readingData.estrato ?? costDetails.estrato,
      subsidizedKwh: readingData.subsidizedKwh ?? costDetails.subsidizedKwh,
      subsidyDiscount: readingData.subsidyDiscount ?? costDetails.subsidyDiscount,
      totalCost: readingData.totalCost ?? costDetails.totalCost,
      createdAt: new Date().toISOString(),
    };

    setReadings((prev) => [newEntry, ...prev]);

    // Save to Firestore
    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'readings', newEntry.id);
      setDoc(docRef, newEntry).catch((err) => {
        console.warn('Error persisting reading to Firestore:', err);
      });
    }

    showToast(`Lectura de ${services[readingData.service]?.name || readingData.service} registrada y sincronizada`);
    return newEntry;
  };

  const updateReading = (id: string, readingData: Partial<UtilityReading>) => {
    let updatedItem: UtilityReading | undefined;

    setReadings((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...readingData };
          if (
            readingData.currReading !== undefined || 
            readingData.prevReading !== undefined || 
            readingData.unitPrice !== undefined ||
            readingData.estrato !== undefined
          ) {
            const curr = updated.currReading;
            const prevVal = updated.prevReading;
            updated.consumption = Math.max(0, curr - prevVal);
            updated.status = calculateStatus(updated.service, updated.consumption);
            
            const costDetails = calculateCost(
              updated.service,
              updated.consumption,
              updated.unitPrice,
              updated.estrato
            );
            updated.baseCost = costDetails.baseCost;
            updated.estrato = costDetails.estrato;
            updated.subsidizedKwh = costDetails.subsidizedKwh;
            updated.subsidyDiscount = costDetails.subsidyDiscount;
            updated.totalCost = costDetails.totalCost;
          }
          updatedItem = updated;
          return updated;
        }
        return item;
      })
    );

    // Save to Firestore
    if (firebaseUser && updatedItem) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'readings', id);
      setDoc(docRef, updatedItem, { merge: true }).catch((err) => {
        console.warn('Error updating reading in Firestore:', err);
      });
    }

    showToast('Lectura actualizada');
  };

  const deleteReading = (id: string) => {
    setReadings((prev) => prev.filter((r) => r.id !== id));

    // Delete in Firestore
    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'readings', id);
      deleteDoc(docRef).catch((err) => {
        console.warn('Error deleting reading from Firestore:', err);
      });
    }

    showToast('Registro eliminado', 'info');
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);

    // Save in Firestore
    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid);
      setDoc(docRef, newProfile, { merge: true }).catch((err) => {
        console.warn('Error updating profile in Firestore:', err);
      });
    }

    showToast('Perfil actualizado');
  };

  const updateServiceConfig = (serviceId: ServiceType, updates: Partial<ServiceConfig>) => {
    const updatedServices = {
      ...services,
      [serviceId]: {
        ...services[serviceId],
        ...updates,
        ...(updates.subsidyConfig ? { 
          subsidyConfig: {
            ...(services[serviceId]?.subsidyConfig || { enabled: true, maxEstrato: 3, maxSubsidizedKwh: 173, percentage: 15 }),
            ...updates.subsidyConfig
          } 
        } : {})
      }
    };

    setServices(updatedServices);

    // Save to Firestore
    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'settings', 'services');
      setDoc(docRef, { services: updatedServices }, { merge: true }).catch((err) => {
        console.warn('Error updating services in Firestore:', err);
      });
    }

    showToast(`Configuración de ${services[serviceId]?.name || serviceId} guardada`);
  };

  const updateReminders = (newReminders: ReminderSettings) => {
    setReminders(newReminders);

    // Save to Firestore
    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'settings', 'reminders');
      setDoc(docRef, { reminders: newReminders }, { merge: true }).catch((err) => {
        console.warn('Error updating reminders in Firestore:', err);
      });
    }

    showToast('Preferencias de recordatorios guardadas');
  };

  const resetToSampleData = () => {
    setReadings(INITIAL_READINGS);
    setServices(INITIAL_SERVICES);
    setProfile(INITIAL_PROFILE);
    setReminders(INITIAL_REMINDERS);

    if (firebaseUser) {
      const batch = writeBatch(db);
      INITIAL_READINGS.forEach((item) => {
        const itemDoc = doc(db, 'users', firebaseUser.uid, 'readings', item.id);
        batch.set(itemDoc, item);
      });
      const profileDoc = doc(db, 'users', firebaseUser.uid);
      batch.set(profileDoc, INITIAL_PROFILE, { merge: true });
      const servicesDoc = doc(db, 'users', firebaseUser.uid, 'settings', 'services');
      batch.set(servicesDoc, { services: INITIAL_SERVICES }, { merge: true });
      const remindersDoc = doc(db, 'users', firebaseUser.uid, 'settings', 'reminders');
      batch.set(remindersDoc, { reminders: INITIAL_REMINDERS }, { merge: true });
      batch.commit().catch(console.warn);
    }

    showToast('Datos restaurados');
  };

  const getLatestReadingForService = (service: ServiceType): UtilityReading | undefined => {
    const list = readings
      .filter((r) => r.service === service)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list[0];
  };

  const getComparisonForService = (service: ServiceType) => {
    const list = readings
      .filter((r) => r.service === service)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const current = list[0];
    const previous = list[1];

    if (!current) {
      return {
        current: undefined,
        previous: undefined,
        consumptionDiff: 0,
        percentageDiff: 0,
        status: 'optimo' as ConsumptionStatus,
      };
    }

    if (!previous || previous.consumption === 0) {
      return {
        current,
        previous,
        consumptionDiff: 0,
        percentageDiff: 0,
        status: current.status,
      };
    }

    const diff = current.consumption - previous.consumption;
    const pct = Number(((diff / previous.consumption) * 100).toFixed(1));

    return {
      current,
      previous,
      consumptionDiff: diff,
      percentageDiff: pct,
      status: current.status,
    };
  };

  const getMonthlyTrends = (): MonthlyTrendData[] => {
    const monthsMap = new Map<string, { luz: number; agua: number; gas: number; luzCost: number; aguaCost: number; gasCost: number; name: string }>();
    
    // Sort chronological
    const sorted = [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate recent 6 calendar month names default if empty
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    sorted.forEach((item) => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mName = monthNames[d.getMonth()];

      if (!monthsMap.has(key)) {
        monthsMap.set(key, { luz: 0, agua: 0, gas: 0, luzCost: 0, aguaCost: 0, gasCost: 0, name: mName });
      }

      const entry = monthsMap.get(key)!;
      if (item.service === 'luz') {
        entry.luz += item.consumption;
        entry.luzCost += item.totalCost;
      } else if (item.service === 'agua') {
        entry.agua += item.consumption;
        entry.aguaCost += item.totalCost;
      } else if (item.service === 'gas') {
        entry.gas += item.consumption;
        entry.gasCost += item.totalCost;
      }
    });

    const result: MonthlyTrendData[] = [];
    monthsMap.forEach((val, key) => {
      result.push({
        monthKey: key,
        monthName: val.name,
        luz: val.luz,
        agua: val.agua,
        gas: val.gas,
        luzCost: val.luzCost,
        aguaCost: val.aguaCost,
        gasCost: val.gasCost,
      });
    });

    // Return the latest 6 months or fallback to demo distribution
    if (result.length >= 6) {
      return result.slice(-6);
    }
    
    // Default 6 months corresponding to screenshot (Ene to Jun)
    return [
      { monthKey: '2023-01', monthName: 'Ene', luz: 220, agua: 11.2, gas: 38, luzCost: 28.6, aguaCost: 16.8, gasCost: 30.4 },
      { monthKey: '2023-02', monthName: 'Feb', luz: 240, agua: 10.5, gas: 44, luzCost: 31.2, aguaCost: 15.7, gasCost: 35.2 },
      { monthKey: '2023-03', monthName: 'Mar', luz: 250, agua: 15.0, gas: 39, luzCost: 37.5, aguaCost: 21.7, gasCost: 30.4 },
      { monthKey: '2023-04', monthName: 'Abr', luz: 300, agua: 13.5, gas: 42, luzCost: 45.0, aguaCost: 19.5, gasCost: 31.5 },
      { monthKey: '2023-05', monthName: 'May', luz: 290, agua: 14.0, gas: 45, luzCost: 37.7, aguaCost: 20.3, gasCost: 32.1 },
      { monthKey: '2023-06', monthName: 'Jun', luz: 342, agua: 12.5, gas: 35, luzCost: 45.2, aguaCost: 18.5, gasCost: 28.0 },
    ];
  };

  return (
    <AppContext.Provider
      value={{
        readings,
        services,
        profile,
        reminders,
        activeTab,
        setActiveTab,
        isNewEntryModalOpen,
        setIsNewEntryModalOpen,
        selectedReadingForDetail,
        setSelectedReadingForDetail,
        editingReading,
        setEditingReading,
        isHelpModalOpen,
        setIsHelpModalOpen,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        toasts,
        showToast,
        dismissToast,
        firebaseUser,
        cloudStatus,
        isAuthLoading,
        authError,
        showAuthScreen,
        setShowAuthScreen,
        isGuest,
        loginWithGoogle,
        loginWithFacebook,
        loginAsGuest,
        logoutUser,
        clearAuthError,
        addReading,
        updateReading,
        deleteReading,
        updateProfile,
        updateServiceConfig,
        updateReminders,
        resetToSampleData,
        calculateCost,
        getLatestReadingForService,
        getComparisonForService,
        getMonthlyTrends,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
