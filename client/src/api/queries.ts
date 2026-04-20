import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, adminApi } from './axios';
import type { Activity, Booking, SlotsResponse, User, ApiResponse } from '../types';

// ===== AUTH =====
export const useUserLogin = () => {
  return useMutation({
    mutationFn: (phone: string) => api.post('/auth/user/login', { phone }).then(r => r.data),
  });
};

export const useAdminLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.post('/auth/admin/login', { email, password }).then(r => r.data),
  });
};

// ===== ACTIVITIES =====
export const useActivities = () =>
  useQuery<ApiResponse<Activity[]>>({
    queryKey: ['activities'],
    queryFn: () => api.get('/activities').then(r => r.data),
  });

export const useActivity = (id: string) =>
  useQuery<ApiResponse<Activity>>({
    queryKey: ['activity', id],
    queryFn: () => api.get(`/activities/${id}`).then(r => r.data),
    enabled: !!id,
  });

export const useSlots = (id: string, date: string) =>
  useQuery<ApiResponse<SlotsResponse>>({
    queryKey: ['slots', id, date],
    queryFn: () => api.get(`/activities/${id}/slots?date=${date}`).then(r => r.data),
    enabled: !!id && !!date,
    staleTime: 10000,
  });

export const useAdminSlots = (id: string, date: string) =>
  useQuery<ApiResponse<SlotsResponse>>({
    queryKey: ['admin-slots', id, date],
    queryFn: () => adminApi.get(`/activities/${id}/slots?date=${date}`).then(r => r.data),
    enabled: !!id && !!date,
    staleTime: 5000,
    refetchInterval: 15000,
  });

// ===== BOOKINGS =====
export const useMyBookings = () =>
  useQuery<ApiResponse<Booking[]>>({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my').then(r => r.data),
  });

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/bookings', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.post(`/bookings/${id}/cancel`, { reason }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

// ===== PAYMENTS =====
export const useCreateOrder = () =>
  useMutation({
    mutationFn: ({ bookingId, amount }: { bookingId: string; amount: number }) =>
      api.post('/payments/create-order', { bookingId, amount }).then(r => r.data),
  });

export const useVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/payments/verify', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  });
};

// ===== ADMIN: DASHBOARD =====
export const useAdminDashboard = (year?: number, month?: number, date?: string) => {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || (now.getMonth() + 1);
  return useQuery<any>({
    queryKey: ['admin-dashboard', y, m, date],
    queryFn: () => adminApi.get('/admin/dashboard', { params: { year: y, month: m, date } }).then(r => r.data),
    refetchInterval: 30000,
  });
};

// ===== ADMIN: BOOKINGS =====
export const useAdminBookings = (filters: any = {}) =>
  useQuery<ApiResponse<Booking[]>>({
    queryKey: ['admin-bookings', filters],
    queryFn: () => adminApi.get('/admin/bookings', { params: filters }).then(r => r.data),
  });

export const useAdminCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.post(`/admin/bookings/${id}/cancel`, { reason }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
};

// ===== ADMIN: ACTIVITIES =====
export const useAdminActivities = () =>
  useQuery<ApiResponse<Activity[]>>({
    queryKey: ['admin-activities'],
    queryFn: () => adminApi.get('/admin/activities').then(r => r.data),
  });

export const useCreateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.post('/admin/activities', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-activities'] }),
  });
};

export const useUpdateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.put(`/admin/activities/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-activities'] }),
  });
};

export const useDeleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.delete(`/admin/activities/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-activities'] }),
  });
};

// ===== ADMIN: WALK-IN BOOKING =====
export const useCreateWalkinBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.post('/admin/walkin-booking', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
};

// ===== ADMIN: MAINTENANCE BLOCK =====
export const useCreateMaintenanceBlock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.post('/admin/maintenance-block', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
};

// ===== ADMIN: USERS =====
export const useAdminUsers = (search = '') =>
  useQuery<ApiResponse<User[]>>({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.get('/admin/users', { params: { search } }).then(r => r.data),
  });

export const useAdminUserBookings = (userId: string) =>
  useQuery<ApiResponse<Booking[]>>({
    queryKey: ['admin-user-bookings', userId],
    queryFn: () => adminApi.get(`/admin/users/${userId}/bookings`).then(r => r.data),
    enabled: !!userId,
  });

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.delete(`/admin/users/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};
