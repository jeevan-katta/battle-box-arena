import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, Calendar, Users, ShoppingBag,
  Footprints, TrendingUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAdminDashboard } from '../../api/queries';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COLORS = ['#00FF87', '#00D4FF', '#A78BFA', '#FF4D6D', '#F59E0B', '#10B981'];

/* ===== SUB-COMPONENTS ===== */

const StatCard = ({ label, value, sub, icon: Icon, accent }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card"
    style={{
      padding: '16px',
      borderRadius: 18,
      border: '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.03)',
      minHeight: 120,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}
  >
    <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, background: `${accent}10`, borderRadius: '50%', filter: 'blur(20px)' }} />
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
          <Icon size={14} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{label.toUpperCase()}</span>
      </div>
      <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: '#fff', marginBottom: 2 }}>{value}</div>
    </div>
    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{sub}</div>
  </motion.div>
);

const MiniBar = ({ data, accent, onBarClick }: any) => {
  const max = Math.max(...data.map((d: any) => d.revenue), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100, width: '100%' }}>
      {data.map((d: any, i: number) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(d.revenue / max) * 100}%` }}
          transition={{ duration: 0.8, delay: i * 0.01 }}
          onClick={() => onBarClick?.(d._id)}
          style={{
            flex: 1,
            background: d.revenue === max ? accent : `${accent}40`,
            borderRadius: '4px 4px 0 0',
            minWidth: 2,
            cursor: 'pointer',
          }}
          title={`${d._id}: ₹${d.revenue}`}
          whileHover={{ background: accent, scaleY: 1.05 }}
        />
      ))}
    </div>
  );
};

const RevenueDonut = ({ online, walkin }: any) => {
  const total = online + walkin || 1;
  const onlinePct = Math.round((online / total) * 100);
  const walkinPct = 100 - onlinePct;
  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (onlinePct / 100) * circ;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke="#00FF87" strokeWidth={stroke}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{onlinePct}%</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>ONLINE</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00FF87' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Online</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{onlinePct}% of total</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Walk-in</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{walkinPct}% of total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = ({ height = 100 }: { height?: number }) => (
  <div style={{ height, background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
    <motion.div
      animate={{ x: ['-100%', '100%'] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)' }}
    />
  </div>
);

function getBookingTimeState(b: any) {
  const now = new Date();
  const date = b.date; // YYYY-MM-DD
  const start = b.startTime; // HH:MM
  const end = b.endTime; // HH:MM

  const startFull = new Date(`${date}T${start}`);
  const endFull = new Date(`${date}T${end}`);

  if (now < startFull) return 'future';
  if (now > endFull) return 'past';
  return 'running';
}

/* ===== MAIN COMPONENT ===== */

export default function AdminDashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState('');

  const { data, isLoading } = useAdminDashboard(year, month, selectedDate);
  const d = data?.data;

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    const isFuture = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
    if (isFuture) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1 && !selectedDate;

  const filledTrend = useMemo(() => {
    if (!d?.revenueTrend) return [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const map: Record<string, number> = {};
    d.revenueTrend.forEach((item: any) => { map[item._id] = item.revenue; });
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${day}`;
      return { _id: dateStr, revenue: map[dateStr] || 0 };
    });
  }, [d?.revenueTrend, year, month]);

  if (isLoading) return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} height={120} />)}
      </div>
      <SkeletonCard height={200} />
    </div>
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, color: '#fff' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            {selectedDate
              ? `Stats for ${new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : isCurrentMonth ? 'Current month · Live data' : `${MONTHS[month - 1]} ${year}`}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10,
          width: '100%',
          maxWidth: 400
        }}>
          {/* Date Picker */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: '8px 14px',
            height: 44,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
                outline: 'none',
                cursor: 'pointer',
                width: '100%',
                colorScheme: 'dark'
              }}
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                style={{
                  background: 'rgba(255,77,109,0.1)',
                  border: 'none',
                  borderRadius: 8,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF4D6D',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 800 }}>×</span>
              </button>
            )}
          </div>

          {/* Month Picker */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: '2px 8px',
            height: 44,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', padding: 8 }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 11, fontWeight: 900, textAlign: 'center', letterSpacing: '0.05em', color: '#fff', whiteSpace: 'nowrap' }}>
              {MONTHS[month - 1].toUpperCase()}
            </span>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth || (year === now.getFullYear() && month === now.getMonth() + 1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: (isCurrentMonth || (year === now.getFullYear() && month === now.getMonth() + 1)) ? 'not-allowed' : 'pointer',
                color: (isCurrentMonth || (year === now.getFullYear() && month === now.getMonth() + 1)) ? 'transparent' : 'rgba(255,255,255,0.4)',
                display: 'flex',
                padding: 8
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid - 2 columns on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 20
      }}>
        <StatCard
          label="Total Revenue"
          value={`₹${(d?.monthTotalRevenue || 0).toLocaleString('en-IN')}`}
          sub={`Total so far: ₹${(d?.allTimeRevenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          accent="#00FF87"
        />
        <StatCard
          label="Online Sales"
          value={`₹${(d?.onlineRevenue || 0).toLocaleString('en-IN')}`}
          sub={`${d?.onlineBookingsCount || 0} direct bookings`}
          icon={ShoppingBag}
          accent="#00D4FF"
        />
        <StatCard
          label="Walk-in Sales"
          value={`₹${(d?.walkinRevenue || 0).toLocaleString('en-IN')}`}
          sub={`${d?.walkinBookingsCount || 0} counter sales`}
          icon={Footprints}
          accent="#F59E0B"
        />
        <StatCard
          label="Confirmed"
          value={d?.monthBookings || 0}
          sub={`Today: ${d?.todayBookings || 0} active`}
          icon={Calendar}
          accent="#A78BFA"
        />
        <StatCard
          label="Active Users"
          value={d?.totalUsers || 0}
          sub="Total registered"
          icon={Users}
          accent="#FF4D6D"
        />
        <StatCard
          label="Ticket Average"
          value={`₹${d?.monthBookings ? Math.round((d.monthTotalRevenue || 0) / d.monthBookings) : 0}`}
          sub="Avg. value per session"
          icon={TrendingUp}
          accent="#00FF87"
        />
      </div>

      {/* Charts Section - Stacks on mobile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, minWidth: 0 }}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, letterSpacing: '0.02em' }}>DAILY REVENUE TREND</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                {selectedDate ? 'Click bars to switch days' : `Distribution for ${MONTHS[month - 1]} ${year}`}
              </div>
            </div>
            <MiniBar data={filledTrend} accent="#00FF87" onBarClick={setSelectedDate} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              {[1, 8, 15, 22, new Date(year, month, 0).getDate()].map(d => (
                <span key={d} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{d}</span>
              ))}
            </div>
          </motion.div>

          {/* Donut Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: 24,
              overflow: 'hidden'
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, letterSpacing: '0.02em' }}>REVENUE CHANNELS</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Online vs Walk-in split</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <RevenueDonut online={d?.onlineRevenue || 0} walkin={d?.walkinRevenue || 0} />
            </div>
          </motion.div>
        </div>

        {/* Sport-wise Revenue - Full width */}
        {d?.sportRevenue?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, letterSpacing: '0.02em' }}>PERFORMANCE BY SPORT</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Revenue breakdown by activity type</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {d.sportRevenue.map((s: any, i: number) => {
                const totalRev = d.monthTotalRevenue || 1;
                const pct = Math.round((s.revenue / totalRev) * 100);
                const color = s.accent || COLORS[i % COLORS.length];
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{s.emoji || '🏅'}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{s.name}</span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{s.count} sessions</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color }}>₹{s.revenue.toLocaleString('en-IN')}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>({pct}%)</span>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ height: '100%', borderRadius: 3, background: color, boxShadow: `0 0 10px ${color}40` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Bookings Table - With horizontal scroll */}
      {d?.recentBookings?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '24px 0', overflow: 'hidden' }}
        >
          <div style={{ padding: '0 24px 20px' }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, letterSpacing: '0.02em' }}>RECENT ACTIVITY</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Latest {d.recentBookings.length} transactions across the arena</div>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} className="no-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
                  {['ACTIVITY', 'CUSTOMER', 'DATE', 'TIME', 'CHANNEL', 'AMOUNT', 'STATUS'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: 10, letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.recentBookings.map((b: any, bi: number) => {
                  const activity = b.activityId as any;
                  const user = b.userId as any;
                  const timeState = getBookingTimeState(b);
                  let statusLabel = b.bookingStatus;
                  let statusClass = 'pill-neutral';
                  if (b.bookingStatus === 'confirmed') {
                    if (timeState === 'past') { statusLabel = 'Completed'; statusClass = 'pill-neutral'; }
                    else if (timeState === 'running') { statusLabel = 'In Game'; statusClass = 'pill-warning'; }
                    else { statusLabel = 'Confirmed'; statusClass = 'pill-success'; }
                  } else if (b.bookingStatus === 'cancelled') { statusClass = 'pill-error'; }

                  return (
                    <tr key={b._id} style={{ borderBottom: bi === d.recentBookings.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap', fontWeight: 700 }}>
                        {activity?.emoji || '🏅'} {activity?.name}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{user?.name || 'Walk-in'}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{user?.phone || '—'}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', fontWeight: 600 }}>{b.date}</td>
                      <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', fontWeight: 600 }}>{b.startTime}–{b.endTime}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 900,
                          background: b.bookingType === 'walkin' ? 'rgba(245,158,11,0.1)' : b.bookingType === 'maintenance' ? 'rgba(255,77,109,0.1)' : 'rgba(0,212,255,0.08)',
                          color: b.bookingType === 'walkin' ? '#F59E0B' : b.bookingType === 'maintenance' ? '#FF4D6D' : '#00D4FF',
                          textTransform: 'uppercase'
                        }}>
                          {b.bookingType === 'walkin' ? 'Walk-in' : b.bookingType === 'maintenance' ? 'Maint' : 'Online'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#00FF87', fontWeight: 900, fontSize: 14 }}>
                        {b.totalAmount > 0 ? `₹${b.totalAmount}` : '—'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`pill ${statusClass}`} style={{ fontSize: 10, fontWeight: 800 }}>{statusLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
