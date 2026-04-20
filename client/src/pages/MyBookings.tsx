import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMyBookings, useCancelBooking } from '../api/queries';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { BookingCardSkeleton } from '../components/Skeletons';
import type { Booking } from '../types';

type Tab = 'upcoming' | 'completed' | 'cancelled';

const getBookingTimeState = (booking: Booking) => {
  const now = new Date();
  const [y, m, d] = booking.date.split('-').map(Number);
  const [sh, smin] = booking.startTime.split(':').map(Number);
  const [eh, emin] = booking.endTime.split(':').map(Number);
  
  const start = new Date(y, m - 1, d, sh, smin);
  const end = new Date(y, m - 1, d, eh, emin);
  
  if (now > end) return 'past';
  if (now >= start && now <= end) return 'running';
  return 'future';
};

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const activity = booking.activityId as any;
  const accent = activity?.accent || '#E11D48';
  const timeState = getBookingTimeState(booking);
  const isUpcoming = timeState === 'future' && booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'success';

  let resolvedStatus = { label: booking.bookingStatus, cls: 'pill-neutral' };
  
  if (booking.bookingStatus === 'confirmed') {
    if (booking.paymentStatus === 'success') {
      if (timeState === 'past') resolvedStatus = { label: 'confirmed', cls: 'pill-neutral' };
      else if (timeState === 'running') resolvedStatus = { label: 'confirmed', cls: 'pill-warning' };
      else resolvedStatus = { label: 'confirmed', cls: 'pill-success' };
    } else {
      resolvedStatus = { label: 'confirmed', cls: 'pill-warning' };
    }
  } else if (booking.bookingStatus === 'cancelled') {
    resolvedStatus = { label: 'cancelled', cls: 'pill-error' };
  } else if (booking.bookingStatus === 'expired') {
    resolvedStatus = { label: 'expired', cls: 'pill-neutral' };
  }
  
  const statusInfo = resolvedStatus;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card"
      style={{ 
        padding: '24px', 
        display: 'flex', 
        gap: 20, 
        alignItems: 'center', 
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 20,
          background: `${accent}20`,
          border: `1.5px solid ${accent}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          flexShrink: 0,
          boxShadow: `0 0 20px ${accent}10`
        }}
      >
        {activity?.emoji || '🏅'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
            {activity?.name} — {activity?.type === 'court' ? 'Court' : 'Table'} {booking.unitNumber}
          </h3>
          <span className={`pill ${statusInfo.cls}`} style={{ fontSize: 10, padding: '4px 10px' }}>{statusInfo.label}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>📅</span> {booking.date}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>🕒</span> {booking.startTime} – {booking.endTime}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL AMOUNT</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>₹{booking.totalAmount}</span>
          </div>
          {isUpcoming && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-danger"
              style={{ height: 40, fontSize: 12, padding: '0 16px', borderRadius: 12, fontWeight: 700, background: 'rgba(255,77,109,0.1)' }}
              onClick={onCancel}
            >
              <X size={14} /> Cancel
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CancelModal({ onClose, onConfirm }: { booking: Booking; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 16px 16px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 440, padding: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={22} color="#F59E0B" />
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Cancel Booking?</h3>
        </div>

        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
          This action cannot be undone. Cancellation policy: No refund within 2 hours of booking time.
        </p>

        <textarea
          placeholder="Reason for cancellation (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: '100%',
            height: 80,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            padding: '12px 14px',
            outline: 'none',
            resize: 'none',
            marginBottom: 16,
          }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Keep Booking
          </button>
          <button
            className="btn-danger"
            style={{ flex: 1, height: 48, borderRadius: 12 }}
            onClick={() => onConfirm(reason)}
          >
            Yes, Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const { data, isLoading } = useMyBookings();
  const { mutate: cancelBooking } = useCancelBooking();
  const bookings = data?.data || [];

  const filtered = {
    upcoming: bookings.filter((b) => getBookingTimeState(b) !== 'past' && b.bookingStatus === 'confirmed' && b.paymentStatus === 'success'),
    completed: bookings.filter((b) => getBookingTimeState(b) === 'past' && b.bookingStatus === 'confirmed'),
    cancelled: bookings.filter((b) => b.bookingStatus === 'cancelled' || b.bookingStatus === 'expired'),
  };

  const handleCancel = (reason: string) => {
    if (!cancelTarget) return;
    cancelBooking(
      { id: cancelTarget._id, reason },
      {
        onSuccess: () => {
          toast.success('Booking cancelled');
          setCancelTarget(null);
        },
        onError: () => toast.error('Failed to cancel booking'),
      }
    );
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'upcoming', label: 'Upcoming', count: filtered.upcoming.length },
    { key: 'completed', label: 'Completed', count: filtered.completed.length },
    { key: 'cancelled', label: 'Cancelled', count: filtered.cancelled.length },
  ];

  return (
    <div>
      <Header />
      <BottomNav />
      <div className="page-content" style={{ padding: '64px 20px 80px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ padding: '32px 0' }}>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.04em' }}
          >
            My Sessions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 500 }}
          >
            Manage your past and upcoming arena sessions
          </motion.p>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 20,
            padding: 6,
            marginBottom: 32,
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative'
          }}
        >
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                flex: 1,
                padding: '12px 10px',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === key ? '#E11D48' : 'transparent',
                color: activeTab === key ? '#fff' : 'rgba(255,255,255,0.4)',
                fontFamily: 'inherit',
                fontWeight: activeTab === key ? 800 : 600,
                fontSize: 14,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                position: 'relative',
                zIndex: 2,
                boxShadow: activeTab === key ? '0 10px 20px rgba(225, 29, 72, 0.2)' : 'none'
              }}
            >
              {label}
              {count > 0 && (
                <span
                  style={{
                    background: activeTab === key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 800
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Booking list */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : filtered[activeTab].length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              textAlign: 'center', 
              padding: '80px 40px', 
              background: 'rgba(255,255,255,0.01)', 
              borderRadius: 32, 
              border: '1px dashed rgba(255,255,255,0.08)' 
            }}
          >
            <div style={{ fontSize: 72, marginBottom: 24, filter: 'grayscale(0.5) opacity(0.5)' }}>🏟️</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Empty Arena</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>
              {activeTab === 'upcoming' 
                ? "You don't have any scheduled sessions yet. Book a court and start playing!" 
                : "No history found in this category."}
            </p>
            {activeTab === 'upcoming' && (
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/home" 
                className="btn-primary" 
                style={{ display: 'inline-flex', textDecoration: 'none', padding: '16px 32px', borderRadius: 16 }}
              >
                Book Your First Session
              </motion.a>
            )}
          </motion.div>
        ) : (
          <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence mode="popLayout">
              {filtered[activeTab].map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onCancel={() => setCancelTarget(booking)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            booking={cancelTarget}
            onClose={() => setCancelTarget(null)}
            onConfirm={handleCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
