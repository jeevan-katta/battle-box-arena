import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Admin } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  admin: Admin | null;
  adminToken: string | null;
  setUser: (user: User, token: string) => void;
  setAdmin: (admin: Admin, token: string) => void;
  logout: () => void;
  logoutAdmin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      admin: null,
      adminToken: null,
      setUser: (user, token) => {
        localStorage.setItem('bba_token', token);
        localStorage.setItem('bba_user', JSON.stringify(user));
        set({ user, token });
      },
      setAdmin: (admin, token) => {
        localStorage.setItem('bba_admin_token', token);
        localStorage.setItem('bba_admin', JSON.stringify(admin));
        set({ admin, adminToken: token });
      },
      logout: () => {
        localStorage.removeItem('bba_token');
        localStorage.removeItem('bba_user');
        set({ user: null, token: null });
      },
      logoutAdmin: () => {
        localStorage.removeItem('bba_admin_token');
        localStorage.removeItem('bba_admin');
        set({ admin: null, adminToken: null });
      },
    }),
    { name: 'bba-auth' }
  )
);

interface BookingFlowState {
  selectedActivity: string | null;
  selectedDate: string;
  selectedUnit: number | null;
  selectedSlots: string[]; // startTime strings
  totalAmount: number;
  setSelectedActivity: (id: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedUnit: (unit: number | null) => void;
  toggleSlot: (startTime: string) => void;
  clearSlots: () => void;
  setTotalAmount: (amount: number) => void;
  resetFlow: () => void;
}

const today = new Date().toISOString().split('T')[0];

export const useBookingStore = create<BookingFlowState>()((set, get) => ({
  selectedActivity: null,
  selectedDate: today,
  selectedUnit: null,
  selectedSlots: [],
  totalAmount: 0,
  setSelectedActivity: (id) => set({ selectedActivity: id, selectedUnit: null, selectedSlots: [], totalAmount: 0 }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedSlots: [], totalAmount: 0 }),
  setSelectedUnit: (unit) => set({ selectedUnit: unit, selectedSlots: [], totalAmount: 0 }),
  toggleSlot: (startTime) => {
    const { selectedSlots } = get();
    if (selectedSlots.includes(startTime)) {
      set({ selectedSlots: selectedSlots.filter((s) => s !== startTime) });
    } else {
      // Consecutive slots only
      if (selectedSlots.length === 0) {
        set({ selectedSlots: [startTime] });
      } else {
        const sorted = [...selectedSlots].sort();
        const lastHour = parseInt(sorted[sorted.length - 1]);
        const newHour = parseInt(startTime);
        const firstHour = parseInt(sorted[0]);
        if (newHour === lastHour + 1 || newHour === firstHour - 1) {
          set({ selectedSlots: [...selectedSlots, startTime].sort() });
        } else {
          set({ selectedSlots: [startTime] });
        }
      }
    }
  },
  clearSlots: () => set({ selectedSlots: [], totalAmount: 0 }),
  setTotalAmount: (amount) => set({ totalAmount: amount }),
  resetFlow: () => set({ selectedActivity: null, selectedDate: today, selectedUnit: null, selectedSlots: [], totalAmount: 0 }),
}));

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    { name: 'bba-theme' }
  )
);

