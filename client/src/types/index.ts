export interface User {
  _id: string;
  phone: string;
  name?: string;
  location?: { lat?: number; lng?: number; address?: string };
  createdAt?: string;
}

export interface Activity {
  _id: string;
  name: string;
  type: 'court' | 'table';
  totalUnits: number;
  pricePerSlot: number;
  slotDurationMins: number;
  isActive: boolean;
  accent?: string;
  emoji?: string;
  openTime?: string;
  closeTime?: string;
  createdAt?: string;
}

export interface SlotInfo {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  status?: string;
}

export interface UnitData {
  unitNumber: number;
  slots: SlotInfo[];
}

export interface SlotsResponse {
  activity: Activity;
  date: string;
  units: UnitData[];
  peakHours: { start: string; end: string; multiplier: number };
}

export interface Booking {
  _id: string;
  userId: string | User;
  activityId: string | Activity;
  unitNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  bookingStatus: 'confirmed' | 'cancelled' | 'expired';
  razorpayOrderId?: string;
  cancelReason?: string;
  shortId?: string;
  createdAt?: string;
}

export interface Payment {
  _id: string;
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  status: 'created' | 'success' | 'failed';
}

export interface Admin {
  _id: string;
  email: string;
  name: string;
}

export interface DashboardStats {
  totalRevenue: number;
  todayBookings: number;
  totalUsers: number;
  occupancyRate: number;
  recentBookings: Booking[];
  sportRevenue: { name: string; count: number; revenue: number }[];
  revenueTrend: { _id: string; revenue: number; count: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  page?: number;
}
