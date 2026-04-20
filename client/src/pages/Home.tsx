import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Zap } from 'lucide-react';
import { useActivities } from '../api/queries';
import { useAuthStore, useBookingStore } from '../stores';
import { useMyBookings } from '../api/queries';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { SportCardSkeleton } from '../components/Skeletons';
import type { Activity, Booking } from '../types';

const SPORT_BG: Record<string, string> = {
  Badminton: 'linear-gradient(135deg, rgba(225, 29, 72,0.15), rgba(225, 29, 72,0.03))',
  Snooker: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.03))',
  Pickleball: 'linear-gradient(135deg, rgba(250, 204, 21,0.15), rgba(250, 204, 21,0.03))',
};

function SportCard({ activity }: { activity: Activity }) {
  const navigate = useNavigate();
  const setSelectedActivity = useBookingStore((s) => s.setSelectedActivity);
  const accent = activity.accent || '#E11D48';

  const handleBook = () => {
    setSelectedActivity(activity._id);
    navigate(`/book/${activity._id}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleBook}
      style={{
        minWidth: 200,
        background: SPORT_BG[activity.name] || 'rgba(255,255,255,0.04)',
        border: `1px solid ${accent}30`,
        borderRadius: 20,
        padding: 20,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        flex: '0 0 auto',
      }}
    >
      {/* Large emoji background */}
      <div
        style={{
          position: 'absolute',
          right: -10,
          top: -10,
          fontSize: 72,
          opacity: 0.12,
          lineHeight: 1,
          transform: 'rotate(15deg)',
          userSelect: 'none',
        }}
      >
        {activity.emoji || '🏅'}
      </div>

      <div style={{ fontSize: 36, marginBottom: 12 }}>
        {activity.emoji || '🏅'}
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{activity.name}</h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 4 }}>
        {activity.totalUnits} {activity.type}s available
      </p>
      <p style={{ fontSize: 14, fontWeight: 600, color: accent, marginBottom: 16 }}>
        From ₹{activity.pricePerSlot}/hr
      </p>

      <button
        className="btn-primary"
        style={{
          background: accent,
          width: '100%',
          fontSize: 13,
          height: 40,
          borderRadius: 10,
        }}
        onClick={(e) => { e.stopPropagation(); handleBook(); }}
      >
        Book Now <ChevronRight size={14} />
      </button>
    </motion.div>
  );
}

function HeroBanner() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'Athlete';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: 'linear-gradient(135deg, #0D1F17 0%, #0A0A1A 50%, #141428 100%)',
        borderRadius: 20,
        padding: '28px 24px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(225, 29, 72,0.12)',
      }}
    >
      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225, 29, 72,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250, 204, 21,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
          Welcome back, <span style={{ color: '#E11D48' }}>{firstName}</span>
        </p>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 16,
            letterSpacing: '-0.5px',
          }}
        >
          <span className="gradient-text">Book.</span>{' '}
          <span style={{ color: '#fff' }}>Play.</span>{' '}
          <span style={{ color: '#fff', opacity: 0.8 }}>Dominate.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 20 }}>
          Premium sports courts at your fingertips
        </p>
      </motion.div>

      <motion.div
        style={{ display: 'flex', gap: 12, alignItems: 'center' }}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(225, 29, 72,0.12)',
            border: '1px solid rgba(225, 29, 72,0.2)',
            borderRadius: 999,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 600,
            color: '#E11D48',
          }}
        >
          <Zap size={12} fill="#E11D48" /> LIVE SLOTS
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          3 sports · 9 courts
        </span>
      </motion.div>
    </motion.div>
  );
}

function QuickStats({ bookings }: { bookings: Booking[] }) {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === today && b.bookingStatus !== 'cancelled').length;
  const upcoming = bookings.filter((b) => b.date >= today && b.bookingStatus === 'confirmed' && b.paymentStatus === 'success').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      style={{ display: 'flex', gap: 12, marginBottom: 24 }}
    >
      {[
        { label: "Today's Bookings", value: todayBookings, accent: '#E11D48' },
        { label: 'Upcoming Games', value: upcoming, accent: '#FACC15' },
      ].map((stat) => (
        <div
          key={stat.label}
          className="glass-card"
          style={{ flex: 1, padding: '16px', textAlign: 'center' }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: stat.accent }}>{stat.value}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{stat.label}</div>
        </div>
      ))}
    </motion.div>
  );
}

export default function HomePage() {
  const { data: activitiesData, isLoading } = useActivities();
  const { data: bookingsData } = useMyBookings();
  const bookings = bookingsData?.data || [];

  return (
    <div>
      <Header />
      <BottomNav />

      <div
        className="page-content"
        style={{
          padding: '72px 16px 72px',
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        <HeroBanner />

        {/* Quick stats */}
        <QuickStats bookings={bookings} />

        {/* Sport cards */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Choose Your Sport</h2>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto' }} className="no-scrollbar">
              {[1, 2, 3].map((i) => <SportCardSkeleton key={i} />)}
            </div>
          ) : (
            <motion.div
              style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}
              className="no-scrollbar"
            >
              {(activitiesData?.data || []).map((activity, i) => (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <SportCard activity={activity} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Recent activity */}
        {bookings.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookings.slice(0, 3).map((booking) => {
                const activity = booking.activityId as any;
                const accent = activity?.accent || '#E11D48';
                return (
                  <motion.div
                    key={booking._id}
                    className="glass-card"
                    style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${accent}20`,
                        border: `1px solid ${accent}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {activity?.emoji || '🏅'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{activity?.name} — Court {booking.unitNumber}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                        {booking.date} · {booking.startTime}–{booking.endTime}
                      </div>
                    </div>
                    <span
                      className={`pill ${booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'success' ? 'pill-success' : booking.bookingStatus === 'cancelled' ? 'pill-error' : 'pill-warning'}`}
                    >
                      {booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'success' ? 'Confirmed' : booking.bookingStatus}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
