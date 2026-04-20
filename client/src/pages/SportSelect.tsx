import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useActivities } from '../api/queries';
import { useBookingStore } from '../stores';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { SportCardSkeleton } from '../components/Skeletons';

export default function SportSelectPage() {
  const navigate = useNavigate();
  const { setSelectedActivity } = useBookingStore();
  const { data, isLoading } = useActivities();
  const activities = data?.data || [];

  return (
    <div>
      <Header />
      <BottomNav />
      <div className="page-content" style={{ padding: '64px 16px 80px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Book a Session</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Select your sport to get started</p>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map((i) => <SportCardSkeleton key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activities.map((activity, i) => {
              const accent = activity.accent || '#E11D48';
              return (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedActivity(activity._id);
                    navigate(`/book/${activity._id}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 20,
                    borderRadius: 20,
                    background: `linear-gradient(135deg, ${accent}12, rgba(255,255,255,0.03))`,
                    border: `1px solid ${accent}25`,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: 44, flexShrink: 0 }}>{activity.emoji || '🏅'}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{activity.name}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                      {activity.totalUnits} {activity.type}s · {activity.openTime || '06:00'}-{activity.closeTime || '23:00'}
                    </p>
                    <span style={{ fontSize: 15, fontWeight: 700, color: accent }}>From ₹{activity.pricePerSlot}/hr</span>
                  </div>
                  <ChevronRight size={20} color={accent} style={{ flexShrink: 0 }} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
