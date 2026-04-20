import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserPlus, Wrench, RefreshCw, Calendar, Clock, User, Phone, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAdminBookings, useAdminCancelBooking, useAdminActivities,
  useCreateWalkinBooking, useCreateMaintenanceBlock, useAdminSlots,
} from '../../api/queries';
import { SkeletonCard } from '../../components/Skeletons';
import type { Booking, Activity } from '../../types';

/* ===== Helpers ===== */
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

function isPeakHour(t: string) { const h = parseInt(t); return h >= 18 && h < 21; }

function isPastSlot(dateStr: string, timeStr: string) {
  const now = new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  return new Date(y, m - 1, d, h, min) < now;
}

function getDates(count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + i);
    return {
      full: dt.toISOString().split('T')[0],
      day: dt.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: dt.getDate(),
    };
  });
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, color: '#fff',
  fontFamily: 'Inter, sans-serif', fontSize: 13,
  padding: '12px 14px', width: '100%',
  boxSizing: 'border-box', outline: 'none',
  transition: 'all 0.2s ease',
};

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, color: '#fff',
  fontFamily: 'Inter, sans-serif', fontSize: 13,
  padding: '10px 14px', cursor: 'pointer', outline: 'none',
  transition: 'all 0.2s ease',
};

/* ===== MAIN COMPONENT ===== */
export default function AdminBookings() {
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
  };

  const todayStr = getLocalDate();
  const [filters, setFilters] = useState({ status: 'confirmed', date: todayStr, sport: '', unitNumber: '', search: '' });
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showWalkin, setShowWalkin] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);

  const { data, isLoading, refetch } = useAdminBookings(filters);
  const { data: activitiesData } = useAdminActivities();
  const { mutate: cancelBooking, isPending: cancelling } = useAdminCancelBooking();
  const { mutate: createWalkin, isPending: creatingWalkin } = useCreateWalkinBooking();
  const { mutate: createMaintenance, isPending: creatingMaintenance } = useCreateMaintenanceBlock();

  const bookings = data?.data || [];
  const allActivities = activitiesData?.data || [];
  const activeActivities = allActivities.filter((a: Activity) => a.isActive);

  const handleCancel = () => {
    if (!cancelTarget) return;
    cancelBooking(
      { id: cancelTarget._id, reason: cancelReason || 'Admin cancelled' },
      {
        onSuccess: () => { 
          toast.success('Booking cancelled successfully'); 
          setCancelTarget(null); 
          setCancelReason(''); 
          refetch();
        },
        onError: () => toast.error('Failed to cancel booking'),
      }
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ minWidth: 200 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 2, letterSpacing: '-0.02em', color: '#fff' }}>
            Bookings Explorer
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
              {bookings.length} sessions found
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 20, color: '#00FF87', cursor: 'pointer', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700 }}
            >
              <RefreshCw size={11} /> SYNC
            </motion.button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%', justifyContent: 'flex-start', maxWidth: 'none', marginLeft: 0 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
            style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, height: 44, borderRadius: 14, fontWeight: 700, border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={() => setShowMaintenance(true)}
          >
            <Wrench size={16} /> Block Maintenance
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, height: 44, borderRadius: 14, fontWeight: 800, background: '#00FF87', color: '#000' }}
            onClick={() => setShowWalkin(true)}
          >
            <UserPlus size={16} /> New Walk-in
          </motion.button>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12, 
        marginBottom: 24,
      }}>
        {/* Primary Search */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text" placeholder="Search customer, phone, or booking ID..."
            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ 
              ...inputStyle, 
              paddingLeft: 48, 
              height: 48,
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          />
        </div>

        {/* Action Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: 10 
        }}>
          <div style={{ position: 'relative' }}>
            <Tag size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
            <select 
              style={{ ...selectStyle, paddingLeft: 38, width: '100%', height: 44, borderRadius: 14 }} 
              value={filters.status} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="" style={{ background: '#1A1A24' }}>All Status</option>
              <option value="confirmed" style={{ background: '#1A1A24' }}>Confirmed</option>
              <option value="cancelled" style={{ background: '#1A1A24' }}>Cancelled</option>
              <option value="expired" style={{ background: '#1A1A24' }}>Expired</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <Calendar size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
            <input 
              type="date" 
              value={filters.date} 
              onChange={(e) => setFilters({ ...filters, date: e.target.value })} 
              style={{ ...selectStyle, paddingLeft: 38, width: '100%', height: 44, borderRadius: 14 }} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <select 
              style={{ ...selectStyle, width: '100%', height: 44, borderRadius: 14 }} 
              value={filters.sport} 
              onChange={(e) => setFilters({ ...filters, sport: e.target.value, unitNumber: '' })}
            >
              <option value="" style={{ background: '#1A1A24' }}>All Events</option>
              {allActivities.map((a: any) => (
                <option key={a._id} value={a.name} style={{ background: '#1A1A24' }}>{a.emoji || '🏅'} {a.name}</option>
              ))}
            </select>
          </div>

          {(filters.status !== 'confirmed' || filters.date !== todayStr || filters.sport || filters.unitNumber || filters.search) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setFilters({ status: 'confirmed', date: todayStr, sport: '', unitNumber: '', search: '' })}
              style={{ 
                background: 'rgba(255,77,109,0.08)', 
                border: '1px solid rgba(255,77,109,0.2)', 
                borderRadius: 14, 
                color: '#FF4D6D', 
                fontSize: 13, 
                padding: '0 16px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 6, 
                fontWeight: 800,
                height: 44
              }}
            >
              <X size={14} /> RESET
            </motion.button>
          )}
        </div>
      </div>

      {/* Professional Booking Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} height={100} />)}
        </div>
      ) : bookings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '100px 0', background: 'rgba(255,255,255,0.02)', borderRadius: 30, border: '1px dashed rgba(255,255,255,0.1)' }}
        >
          <div style={{ fontSize: 64, marginBottom: 20 }}>🌌</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No Bookings Found</h3>
          <p style={{ color: 'rgba(255,255,255,0.3)', maxWidth: 300, margin: '0 auto' }}>Try adjusting your filters or search terms to find what you're looking for.</p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {bookings.map((booking, idx) => {
            const activity = booking.activityId as any;
            const user = booking.userId as any;
            const accent = activity?.accent || '#00FF87';
            const emoji = activity?.emoji || '🏅';
            const bookingType = (booking as any).bookingType || 'online';
            const timeState = getBookingTimeState(booking);

            let statusLabel = 'Confirmed';
            let statusColor = '#00FF87';
            let statusBg = 'rgba(0,255,135,0.12)';
            if (booking.bookingStatus === 'cancelled') { statusLabel = 'Cancelled'; statusColor = '#FF4D6D'; statusBg = 'rgba(255,77,109,0.12)'; }
            else if (booking.bookingStatus === 'expired') { statusLabel = 'Expired'; statusColor = 'rgba(255,255,255,0.4)'; statusBg = 'rgba(255,255,255,0.06)'; }
            else if (timeState === 'past') { statusLabel = 'Completed'; statusColor = 'rgba(255,255,255,0.4)'; statusBg = 'rgba(255,255,255,0.06)'; }
            else if (timeState === 'running') { statusLabel = '🟢 In Game'; statusColor = '#F59E0B'; statusBg = 'rgba(245,158,11,0.15)'; }

            const typeLabel = bookingType === 'walkin' ? 'WALK-IN' : bookingType === 'maintenance' ? 'MAINTENANCE' : 'ONLINE';
            const typeColor = bookingType === 'walkin' ? '#F59E0B' : bookingType === 'maintenance' ? '#FF4D6D' : '#00D4FF';
            const typeBg = bookingType === 'walkin' ? 'rgba(245,158,11,0.1)' : bookingType === 'maintenance' ? 'rgba(255,77,109,0.1)' : 'rgba(0,212,255,0.08)';

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `4px solid ${accent}`,
                  borderRadius: 20,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle Glow Backdrop */}
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '30%', height: '140%', background: `radial-gradient(circle, ${accent}08 0%, transparent 70%)`, pointerEvents: 'none' }} />

                {/* Card Top: Icon, Sport, Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `${accent}15`, border: `1px solid ${accent}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, flexShrink: 0,
                    }}>
                      {bookingType === 'maintenance' ? '🔧' : emoji}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                          {activity?.name || 'Unknown Activity'}
                        </h3>
                        <span style={{ fontSize: 9, fontWeight: 900, padding: '1px 6px', borderRadius: 5, background: typeBg, color: typeColor }}>
                          {typeLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                        {activity?.type === 'court' ? 'Court' : 'Table'} {booking.unitNumber} · {(booking as any).shortId || booking._id.slice(-6).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800, 
                      background: statusBg, color: statusColor, border: `1px solid ${statusColor}20`,
                      textTransform: 'uppercase'
                    }}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', width: '100%' }} />

                {/* Card Middle: Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                  {/* Customer */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>CUSTOMER</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 600, fontSize: 13 }}>
                      <User size={12} style={{ color: accent }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Guest'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                      <Phone size={11} />
                      {user?.phone || '—'}
                    </div>
                  </div>

                  {/* Slot / Time */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>TIME SLOT</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 800, fontSize: 14 }}>
                      <Clock size={13} style={{ color: accent }} />
                      {booking.startTime} – {booking.endTime}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                      <Calendar size={11} />
                      {booking.date}
                    </div>
                  </div>

                  {/* Payment & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>AMOUNT</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: accent }}>
                        {booking.totalAmount > 0 ? `₹${booking.totalAmount}` : '—'}
                      </div>
                    </div>
                    
                    {booking.bookingStatus === 'confirmed' && timeState === 'future' && bookingType !== 'maintenance' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCancelTarget(booking)}
                        style={{ 
                          background: 'rgba(255,77,109,0.08)', 
                          border: '1px solid rgba(255,77,109,0.2)', 
                          borderRadius: 8, 
                          color: '#FF4D6D', 
                          fontSize: 11, 
                          fontWeight: 700, 
                          padding: '6px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <X size={12} /> CANCEL
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modern Cancel Dialog */}
      <AnimatePresence>
        {cancelTarget && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setCancelTarget(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: 400, padding: 32, position: 'relative', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,77,109,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#FF4D6D' }}>
                   <X size={32} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Cancel Session?</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 }}>
                  This action will free up the slot. Are you sure?
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>REASON FOR CANCELLATION</label>
                <textarea
                  placeholder="E.g., Customer requested cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ ...inputStyle, height: 100, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" style={{ flex: 1, borderRadius: 14 }} onClick={() => setCancelTarget(null)}>KEEP BOOKING</button>
                <button className="btn-danger" style={{ flex: 1, height: 48, borderRadius: 14, fontWeight: 800 }} onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? 'SINKING...' : 'YES, CANCEL'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showWalkin && (
          <WalkinModal
            activities={activeActivities}
            onClose={() => setShowWalkin(false)}
            onSave={(fd: any) => {
              createWalkin(fd, {
                onSuccess: () => { toast.success('Walk-in booking created! 🎾'); setShowWalkin(false); refetch(); },
                onError: (e: any) => toast.error(e?.response?.data?.message || 'Slot conflict or server error'),
              });
            }}
            isPending={creatingWalkin}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMaintenance && (
          <MaintenanceModal
            activities={activeActivities}
            onClose={() => setShowMaintenance(false)}
            onSave={(fd: any) => {
              createMaintenance(fd, {
                onSuccess: () => { toast.success('Maintenance block confirmed 🔧'); setShowMaintenance(false); refetch(); },
                onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to block slot'),
              });
            }}
            isPending={creatingMaintenance}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===== PREMIUM WALK-IN MODAL ===== */
function WalkinModal({ activities, onClose, onSave, isPending }: any) {
  const today = new Date().toISOString().split('T')[0];
  const dates = useMemo(() => getDates(14), []);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [activityId, setActivityId] = useState(activities[0]?._id || '');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const activity = activities.find((a: any) => a._id === activityId);
  const accent = activity?.accent || '#00FF87';
  const units = Array.from({ length: activity?.totalUnits || 1 }, (_, i) => i + 1);

  const { data: slotsData, isLoading: loadingSlots } = useAdminSlots(activityId, selectedDate);
  const slots = slotsData?.data;
  const unitSlots = slots?.units.find((u: any) => u.unitNumber === selectedUnit)?.slots || [];
  const peakMult = slots?.peakHours?.multiplier || 1.5;

  const toggleSlot = (startTime: string) => {
    if (selectedSlots.includes(startTime)) {
      setSelectedSlots(selectedSlots.filter(s => s !== startTime));
    } else {
      if (selectedSlots.length === 0) {
        setSelectedSlots([startTime]);
      } else {
        const sorted = [...selectedSlots].sort();
        const lastH = parseInt(sorted[sorted.length - 1]);
        const firstH = parseInt(sorted[0]);
        const newH = parseInt(startTime);
        if (newH === lastH + 1 || newH === firstH - 1) {
          setSelectedSlots([...selectedSlots, startTime].sort());
        } else {
          setSelectedSlots([startTime]);
        }
      }
    }
  };

  const startTime = selectedSlots.length > 0 ? [...selectedSlots].sort()[0] : '';
  const lastSlot = selectedSlots.length > 0 ? [...selectedSlots].sort()[selectedSlots.length - 1] : '';
  const endTime = lastSlot ? `${String(parseInt(lastSlot) + 1).padStart(2, '0')}:00` : '';

  const totalAmount = useMemo(() => {
    return selectedSlots.reduce((sum, st) => {
      const price = isPeakHour(st) ? (activity?.pricePerSlot || 0) * peakMult : (activity?.pricePerSlot || 0);
      return sum + price;
    }, 0);
  }, [selectedSlots, activity, peakMult]);

  const isPhoneValid = phone.trim().length >= 8;
  const canSubmit = isPhoneValid && selectedSlots.length > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 700, maxHeight: '95vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', borderRadius: 30, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
               <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF87', boxShadow: '0 0 10px #00FF87' }} />
               <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>Walk-in Reservation</h2>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Create an account and book slots in seconds</p>
          </div>
          <motion.button whileHover={{ rotate: 90 }} onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', borderRadius: 12, padding: 10 }}>
            <X size={20} />
          </motion.button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="no-scrollbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* 1. Customer Context */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <User size={16} style={{ color: accent }} />
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>CUSTOMER INFORMATION</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                   <input style={inputStyle} placeholder="Full Guest Name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                   <input style={{ ...inputStyle, border: phone.length === 10 ? `1px solid ${accent}40` : '1px solid rgba(255,255,255,0.08)' }} placeholder="10-digit mobile number *" value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} type="tel" />
                </div>
              </div>
            </section>

            {/* 2. Selection Grid */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Calendar size={16} style={{ color: accent }} />
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>SERVICE & SCHEDULE</h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Sport & Unit Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
                    <select
                      style={{ ...selectStyle, height: 48 }}
                      value={activityId}
                      onChange={e => { setActivityId(e.target.value); setSelectedUnit(1); setSelectedSlots([]); }}
                    >
                      {activities.map((a: any) => <option key={a._id} value={a._id} style={{ background: '#1A1A24' }}>{a.emoji} {a.name}</option>)}
                    </select>

                    <div style={{ display: 'flex', gap: 6 }}>
                      {units.map((u: number) => (
                        <button
                          key={u}
                          onClick={() => { setSelectedUnit(u); setSelectedSlots([]); }}
                          style={{
                            flex: 1, borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                            border: selectedUnit === u ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.06)',
                            background: selectedUnit === u ? `${accent}15` : 'rgba(255,255,255,0.03)',
                            color: selectedUnit === u ? accent : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          # {u}
                        </button>
                      ))}
                    </div>
                </div>

                {/* Date Strip */}
                <div style={{ overflowX: 'auto', paddingBottom: 10, margin: '0 -10px', padding: '0 10px' }} className="no-scrollbar">
                  <div style={{ display: 'flex', gap: 10 }}>
                    {dates.map(d => {
                      const isSel = selectedDate === d.full;
                      return (
                        <motion.button
                          key={d.full}
                          whileHover={{ y: -2 }}
                          onClick={() => { setSelectedDate(d.full); setSelectedSlots([]); }}
                          style={{
                            minWidth: 64, padding: '12px 10px', borderRadius: 16, cursor: 'pointer', textAlign: 'center', flexShrink: 0,
                            border: isSel ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.06)',
                            background: isSel ? `${accent}15` : 'rgba(255,255,255,0.03)',
                            color: isSel ? accent : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontSize: 10, marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>{d.day}</div>
                          <div style={{ fontSize: 18, fontWeight: 900 }}>{d.date}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Slot Grid */}
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 20, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>SELECT TIME SLOTS</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} /> FREE
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: accent }} /> BOOKED
                       </div>
                    </div>
                  </div>

                  {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><RefreshCw className="spin" size={24} style={{ color: accent, opacity: 0.5 }} /></div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: 8 }}>
                      {unitSlots.map((slot: any) => {
                        const isPast = isPastSlot(selectedDate, slot.startTime);
                        const isMaintenance = slot.status === 'maintenance';
                        const isBooked = slot.isBooked && slot.status !== 'pending' && !isMaintenance;
                        const isPending = slot.status === 'pending';
                        const isSelected = selectedSlots.includes(slot.startTime);
                        const isDisabled = isPast || isMaintenance || isBooked || isPending;

                        return (
                          <motion.button
                            key={slot.startTime}
                            whileHover={isDisabled ? {} : { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                            whileTap={isDisabled ? {} : { scale: 0.95 }}
                            onClick={() => { if (!isDisabled) toggleSlot(slot.startTime); }}
                            style={{
                              padding: '14px 0', borderRadius: 12, fontSize: 13, fontWeight: 800,
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              border: isSelected ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.06)',
                              background: isSelected ? `${accent}` : isBooked || isMaintenance ? 'rgba(255,77,109,0.1)' : 'rgba(255,255,255,0.03)',
                              color: isSelected ? '#000' : isDisabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)',
                              opacity: isPast ? 0.3 : 1,
                              transition: 'all 0.1s ease'
                            }}
                          >
                            {slot.startTime}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Summary */}
        <div style={{ padding: '32px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedSlots.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: accent, marginBottom: 4 }}>RESERVATION SUMMARY</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                  {selectedDate} @ {startTime} – {endTime}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  Selected {selectedSlots.length} consecutive unit{selectedSlots.length > 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>TOTAL PAYABLE</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>₹{totalAmount}</div>
              </div>
            </motion.div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 2fr', gap: 16 }}>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4 }}>
              {['cash', 'upi'].map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    flex: 1, height: 40, borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    background: paymentMethod === m ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: paymentMethod === m ? '#fff' : 'rgba(255,255,255,0.3)',
                    border: 'none', transition: 'all 0.2s'
                  }}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary" 
              style={{ height: 48, borderRadius: 14, background: accent, color: '#000', fontWeight: 900, fontSize: 15, cursor: (isPending || !canSubmit) ? 'not-allowed' : 'pointer', opacity: (isPending || !canSubmit) ? 0.5 : 1 }}
              disabled={isPending || !canSubmit}
              onClick={() => onSave({ name, phone, activityId, unitNumber: selectedUnit, date: selectedDate, startTime, endTime, totalAmount, paymentMethod })}
            >
              {isPending ? 'PROCESSING...' : !isPhoneValid ? 'ENTER CUSTOMER PHONE' : selectedSlots.length === 0 ? 'SELECT TIME SLOTS' : `CONFIRM RESERVATION`}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ===== MAINTENANCE MODAL ===== */
function MaintenanceModal({ activities, onClose, onSave, isPending }: any) {
  const today = new Date().toISOString().split('T')[0];
  const [activityId, setActivityId] = useState(activities[0]?._id || '');
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [selectedDate, setSelectedDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('Scheduled maintenance');

  const activity = activities.find((a: any) => a._id === activityId);
  const units = Array.from({ length: activity?.totalUnits || 1 }, (_, i) => i + 1);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 450, padding: 32, position: 'relative', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#FF4D6D', border: '1px solid rgba(255,77,109,0.2)' }}>
                <Wrench size={32} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>Block Maintenance</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 8 }}>Prevent user bookings for specific slots</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>ACTIVITY</label>
            <select style={selectStyle} value={activityId} onChange={e => { setActivityId(e.target.value); setSelectedUnit(1); }}>
              {activities.map((a: any) => <option key={a._id} value={a._id} style={{ background: '#1A1A24' }}>{a.emoji} {a.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>COURT / UNIT</label>
              <select style={selectStyle} value={selectedUnit} onChange={e => setSelectedUnit(Number(e.target.value))}>
                {units.map((u: number) => <option key={u} value={u} style={{ background: '#1A1A24' }}>Unit # {u}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>DATE</label>
               <input type="date" style={selectStyle} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>START TIME</label>
              <input type="time" style={inputStyle} value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>END TIME</label>
              <input type="time" style={inputStyle} value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>DESCRIPTION</label>
            <input style={inputStyle} placeholder="E.g., Routine cleaning..." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button className="btn-secondary" style={{ flex: 1, borderRadius: 14 }} onClick={onClose}>BACK</button>
          <button className="btn-danger" style={{ flex: 1, height: 48, borderRadius: 14, fontWeight: 900 }} disabled={isPending} onClick={() => onSave({ activityId, unitNumber: selectedUnit, date: selectedDate, startTime, endTime, reason })}>
            {isPending ? 'SINKING...' : 'CONFIRM BLOCK'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
