import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useActivity, useSlots, useCreateBooking, useCreateOrder, useVerifyPayment } from '../api/queries';
import { useBookingStore, useAuthStore } from '../stores';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { SkeletonCard } from '../components/Skeletons';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Generate next 8 days
function getDates() {
  const dates = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.getDate(),
    });
  }
  return dates;
}

function isPeakHour(time: string) {
  const h = parseInt(time);
  return h >= 18 && h < 21;
}

function isPastSlot(dateStr: string, timeStr: string) {
  const now = new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  const slotDate = new Date(y, m - 1, d, h, min);
  return slotDate < now;
}

// STEP 1: Select court/table
function StepUnit({ activity, onNext }: { activity: any; onNext: () => void }) {
  const { selectedUnit, setSelectedUnit, selectedDate } = useBookingStore();
  const { data: slotsData } = useSlots(activity._id, selectedDate);
  const slots = slotsData?.data;

  const accent = activity.accent || '#E11D48';
  const units = Array.from({ length: activity.totalUnits }, (_, i) => i + 1);

  const getAvailableCount = (unitNumber: number) => {
    if (!slots) return null;
    const unitSlots = slots.units.find((u: any) => u.unitNumber === unitNumber)?.slots || [];
    let count = 0;
    unitSlots.forEach((slot: any) => {
      const isPast = isPastSlot(selectedDate, slot.startTime);
      const isBooked = slot.isBooked && slot.status !== 'pending';
      const isPending = slot.status === 'pending';
      if (!isPast && !isBooked && !isPending) {
        count++;
      }
    });
    return count;
  };

  const surfaces: Record<string, string> = {
    Badminton: 'Synthetic',
    Snooker: 'Baize',
    Pickleball: 'Hardcourt',
  };

  const dimensions: Record<string, string> = {
    Badminton: '13.4m × 6.1m',
    Snooker: '3.7m × 1.8m',
    Pickleball: '13.4m × 6.1m',
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
        Select {activity.type === 'court' ? 'Court' : 'Table'}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>
        Choose your preferred unit
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {units.map((unit) => {
          const isSelected = selectedUnit === unit;
          return (
            <motion.div
              key={unit}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedUnit(unit); try { navigator.vibrate?.(10); } catch {} }}
              style={{
                padding: '18px 16px',
                borderRadius: 16,
                border: isSelected ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.1)',
                background: isSelected ? `${accent}18` : 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 16px ${accent}40` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: isSelected ? accent : '#fff' }}>
                  {activity.type === 'court' ? 'Court' : 'Table'} {unit}
                </span>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#E11D48',
                    boxShadow: '0 0 6px rgba(225, 29, 72,0.6)',
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                {surfaces[activity.name] || 'Standard'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                {dimensions[activity.name] || '—'}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: slots ? (getAvailableCount(unit)! > 0 ? '#E11D48' : '#F59E0B') : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                {slots ? (getAvailableCount(unit)! > 0 ? `${getAvailableCount(unit)} slots available` : 'Fully booked today') : 'Checking availability...'}
              </div>
              {isSelected && (
                <div style={{ marginTop: 8, fontSize: 11, color: accent, fontWeight: 600 }}>
                  ✓ Selected
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%' }}
        disabled={!selectedUnit}
        onClick={onNext}
      >
        Continue to Date & Time →
      </button>
    </div>
  );
}

// STEP 2: Date + time picker
function StepDateTime({ activity, onNext }: { activity: any; onNext: () => void }) {
  const { selectedUnit, selectedDate, selectedSlots, setSelectedDate, toggleSlot, setTotalAmount } = useBookingStore();
  const dates = useMemo(() => getDates(), []);

  const { data: slotsData, isLoading } = useSlots(activity._id, selectedDate);
  const slots = slotsData?.data;

  const unitSlots = slots?.units.find((u) => u.unitNumber === selectedUnit)?.slots || [];
  const peakMultiplier = slots?.peakHours?.multiplier || 1.5;

  const currentSlotPrices = useMemo(() => {
    return selectedSlots.map((st) => {
      const price = isPeakHour(st) ? activity.pricePerSlot * peakMultiplier : activity.pricePerSlot;
      return price;
    });
  }, [selectedSlots, activity.pricePerSlot, peakMultiplier]);

  const totalAmount = currentSlotPrices.reduce((a, b) => a + b, 0);

  const handleNext = () => {
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }
    setTotalAmount(totalAmount);
    onNext();
  };

  const accent = activity.accent || '#E11D48';

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Select Date & Time</h2>

      {/* Date strip */}
      <div style={{ marginBottom: 24, overflowX: 'auto' }} className="no-scrollbar">
        <div style={{ display: 'flex', gap: 10, paddingBottom: 4 }}>
          {dates.map((d) => {
            const isSelected = selectedDate === d.full;
            return (
              <motion.button
                key={d.full}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(d.full)}
                style={{
                  minWidth: 60,
                  padding: '10px 8px',
                  borderRadius: 14,
                  border: isSelected ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? `${accent}20` : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                  color: isSelected ? accent : 'rgba(255,255,255,0.6)',
                  boxShadow: isSelected ? `0 0 10px ${accent}30` : 'none',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: 11, marginBottom: 4 }}>{d.day}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{d.date}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time grid */}
      {isLoading ? (
        <SkeletonCard height={300} />
      ) : (
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 12, display: 'flex', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }} />
              Available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: `${accent}30`, border: `1px solid ${accent}` }} />
              Selected
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'rgba(245,158,11,0.2)', border: '1px solid #F59E0B' }} />
              Pending
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'rgba(255,77,109,0.2)', border: '1px solid #FF4D6D' }} />
              Maintenance
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'rgba(255,255,255,0.04)' }} />
              Booked
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {unitSlots.map((slot, i) => {
              const isPast = isPastSlot(selectedDate, slot.startTime);
              const isMaintenance = slot.status === 'maintenance';
              const isBooked = slot.isBooked && slot.status !== 'pending' && !isMaintenance;
              const isPending = slot.status === 'pending';
              const isSelected = selectedSlots.includes(slot.startTime);
              const isPeak = isPeakHour(slot.startTime);

              return (
                <motion.div
                  key={slot.startTime}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => {
                    if (isPast || isMaintenance) {
                      toast.error(isMaintenance ? 'Slot under maintenance' : 'Cannot book past time slots');
                      return;
                    }
                    if (isPending) {
                      toast.error('Slot is pending payment, try again in a few mins');
                      return;
                    }
                    if (isBooked) {
                      toast.error('Slot already booked');
                      return;
                    }
                    toggleSlot(slot.startTime);
                    try { navigator.vibrate?.(10); } catch {}
                  }}
                  className={`slot-cell ${isPast || isMaintenance ? 'slot-booked' : isPending ? 'slot-pending' : isBooked ? 'slot-booked' : isSelected ? 'slot-selected' : 'slot-available'}`}
                  style={{
                    ...(isSelected ? { borderColor: accent, color: accent, background: `${accent}20`, boxShadow: `0 0 8px ${accent}30` } : {}),
                    ...(isPending ? { borderColor: '#F59E0B', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', opacity: 0.7 } : {}),
                    ...(isPast ? { opacity: 0.3 } : {}),
                    ...(isMaintenance ? { borderColor: '#FF4D6D', color: '#FF4D6D', background: 'rgba(255,77,109,0.1)', opacity: 0.7 } : {}),
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{slot.startTime}</div>
                  {isMaintenance && <div style={{ fontSize: 9, color: '#FF4D6D', marginTop: 2 }}>MAINT</div>}
                  {isPeak && !isBooked && !isMaintenance && (<div style={{ fontSize: 9, color: '#F59E0B', marginTop: 2 }}>PEAK</div>)}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price footer */}
      <AnimatePresence>
        {selectedSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              marginTop: 20,
              padding: '16px',
              background: `${accent}12`,
              border: `1px solid ${accent}30`,
              borderRadius: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''} × ₹{activity.pricePerSlot}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, color: accent }}>₹{totalAmount}</span>
            </div>
            {currentSlotPrices.some((_, i) => isPeakHour(selectedSlots[i])) && (
              <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 4 }}>* Peak pricing applied (1.5×) for 6-9 PM slots</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 20 }}
        onClick={handleNext}
      >
        Confirm Selection →
      </button>
    </div>
  );
}

// STEP 3: Confirm & Pay
function StepConfirm({
  activity,
  onSuccess,
}: {
  activity: any;
  onSuccess: (bookingId: string) => void;
}) {
  const { user } = useAuthStore();
  const { selectedUnit, selectedDate, selectedSlots, totalAmount } = useBookingStore();
  const { mutateAsync: createBooking, isPending: creatingBooking } = useCreateBooking();
  const { mutateAsync: createOrder, isPending: creatingOrder } = useCreateOrder();
  const { mutateAsync: verifyPayment, isPending: verifying } = useVerifyPayment();
  const accent = activity.accent || '#E11D48';

  const startTime = selectedSlots[0];
  const lastSlot = selectedSlots[selectedSlots.length - 1];
  const endHour = parseInt(lastSlot) + 1;
  const endTime = `${String(endHour).padStart(2, '0')}:00`;

  const handlePay = async () => {
    try {
      // 1. Create booking
      const bookingRes = await createBooking({
        activityId: activity._id,
        unitNumber: selectedUnit,
        date: selectedDate,
        startTime,
        endTime,
        totalAmount,
      });
      const bookingId = bookingRes.data._id;

      // 2. Create Razorpay order
      const orderRes = await createOrder({ bookingId, amount: totalAmount });
      const { orderId, key } = orderRes.data;

      // 3. Open Razorpay checkout or mock
      if (key === 'rzp_test_placeholder' || !window.Razorpay) {
        // Mock payment success (demo mode)
        await verifyPayment({
          razorpay_order_id: orderId,
          razorpay_payment_id: null,
          razorpay_signature: null,
          bookingId,
        });
        onSuccess(bookingId);
        return;
      }

      // Real Razorpay
      const options = {
        key,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Battle Box Arena',
        description: `${activity.name} — ${selectedDate}`,
        order_id: orderId,
        handler: async (response: any) => {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId,
          });
          onSuccess(bookingId);
        },
        prefill: { contact: user?.phone },
        theme: { color: '#E11D48' },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Booking Summary</h2>

      <div className="glass-card" style={{ 
        padding: '32px', 
        marginBottom: 24, 
        background: 'rgba(255,255,255,0.01)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: 16, 
            background: `${accent}15`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: 28,
            border: `1px solid ${accent}30`
          }}>
            {activity.emoji || '🏅'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{activity.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{activity.type === 'court' ? 'Standard Court' : 'Professional Table'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Court/Table', value: `Unit #${selectedUnit}`, icon: '📍' },
            { label: 'Date', value: selectedDate, icon: '📅' },
            { label: 'Time Slot', value: `${startTime} – ${endTime}`, icon: '🕒' },
            { label: 'Duration', value: `${selectedSlots.length} hour${selectedSlots.length > 1 ? 's' : ''}`, icon: '⏳' },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{icon}</span> {label}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{value}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 32,
            paddingTop: 24,
            borderTop: '2px dashed rgba(255,255,255,0.1)'
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>TOTAL PAYABLE</div>
            <div style={{ fontSize: 11, color: accent, fontWeight: 600 }}>Taxes & Fees included</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>₹{totalAmount}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12,
          fontSize: 12,
          color: 'rgba(245,158,11,0.9)',
          marginBottom: 20,
        }}
      >
        ⚠️ Slots are reserved for 5 minutes. Complete payment to confirm.
      </div>

      <motion.button
        className="btn-primary"
        style={{ width: '100%', fontSize: 16 }}
        onClick={handlePay}
        disabled={creatingBooking || creatingOrder || verifying}
        whileTap={{ scale: 0.97 }}
      >
        {creatingBooking || creatingOrder || verifying ? '⚡ Processing...' : `Pay ₹${totalAmount}`}
      </motion.button>
    </div>
  );
}

// SUCCESS SCREEN
function SuccessScreen({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const { resetFlow } = useBookingStore();

  const confettiItems = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: i % 3 === 0 ? '#E11D48' : i % 3 === 1 ? '#FACC15' : '#F59E0B',
    left: `${10 + Math.random() * 80}%`,
    delay: `${Math.random() * 0.8}s`,
    size: `${4 + Math.random() * 8}px`,
  }));

  return (
    <div style={{ textAlign: 'center', padding: '40px 0', position: 'relative', overflow: 'hidden' }}>
      {/* Confetti */}
      {confettiItems.map((c) => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            left: c.left,
            top: '-20px',
            width: c.size,
            height: c.size,
            background: c.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${0.8 + Math.random() * 0.6}s ${c.delay} ease-in forwards`,
          }}
        />
      ))}

      <motion.div
        className="burst-anim"
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #E11D48, #FACC15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 40px rgba(225, 29, 72,0.5)',
        }}
      >
        <CheckCircle size={48} color="#0A0A0F" strokeWidth={2.5} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}
        className="gradient-text"
      >
        Booking Confirmed!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 8 }}
      >
        You're all set to play!
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 32,
          wordBreak: 'break-all',
        }}
      >
        ID: {bookingId.slice(-6).toUpperCase()}
      </motion.div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn-secondary"
          style={{ flex: 1 }}
          onClick={() => { resetFlow(); onDone(); }}
        >
          View Bookings
        </button>
        <button
          className="btn-primary"
          style={{ flex: 1 }}
          onClick={() => { resetFlow(); window.location.href = '/home'; }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const { data: activityData, isLoading } = useActivity(id || '');
  const activity = activityData?.data;

  if (isLoading) {
    return (
      <div>
        <Header />
        <BottomNav />
        <div className="page-content" style={{ padding: '72px 16px 72px', maxWidth: 640, margin: '0 auto' }}>
          <SkeletonCard height={200} />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48 }}>🏟️</div>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>Activity not found</p>
      </div>
    );
  }

  const accent = activity.accent || '#E11D48';
  const steps = ['Court', 'Date & Time', 'Pay'];

  return (
    <div>
      <Header />
      <BottomNav />
      <div className="page-content" style={{ padding: '72px 16px 80px', maxWidth: 640, margin: '0 auto' }}>
        {/* Back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => (step > 1 && !confirmedBookingId ? setStep(step - 1) : navigate('/home'))}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>
              {activity.emoji || '🏅'} Book {activity.name}
            </h1>
            {!confirmedBookingId && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                Step {step} of 3 — {steps[step - 1]}
              </p>
            )}
          </div>
        </div>

        {/* Step indicator */}
        {!confirmedBookingId && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 999,
                  background: i + 1 <= step ? accent : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {confirmedBookingId ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <SuccessScreen bookingId={confirmedBookingId} onDone={() => navigate('/bookings')} />
            </motion.div>
          ) : step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StepUnit activity={activity} onNext={() => setStep(2)} />
            </motion.div>
          ) : step === 2 ? (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StepDateTime activity={activity} onNext={() => setStep(3)} />
            </motion.div>
          ) : (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StepConfirm
                activity={activity}
                onSuccess={(bookingId) => {
                  setConfirmedBookingId(bookingId);
                  toast.success('Booking Confirmed! 🎉');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
