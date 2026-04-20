import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from '../../api/queries';
import { SkeletonCard } from '../../components/Skeletons';
import type { Activity } from '../../types';

const ACCENTS = ['#00FF87', '#00D4FF', '#F59E0B', '#FF4D6D', '#A78BFA'];

function ActivityModal({ initial, onSave, onClose }: { initial?: Partial<Activity>; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    type: initial?.type || 'court',
    totalUnits: initial?.totalUnits || 1,
    pricePerSlot: initial?.pricePerSlot || 300,
    slotDurationMins: initial?.slotDurationMins || 60,
    accent: initial?.accent || '#00FF87',
    emoji: initial?.emoji || '🏅',
    openTime: initial?.openTime || '06:00',
    closeTime: initial?.closeTime || '23:00',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 440, padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{initial?._id ? 'Edit Activity' : 'Add Activity'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {[
          { label: 'Name', key: 'name', type: 'text', placeholder: 'e.g. Badminton' },
          { label: 'Emoji ICON', key: 'emoji', type: 'text', placeholder: 'e.g. 🏸' },
          { label: 'Units Count', key: 'totalUnits', type: 'number', placeholder: '4' },
          { label: 'Price per Hour (₹)', key: 'pricePerSlot', type: 'number', placeholder: '300' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block' }}>{label}</label>
            <input
              type={type}
              className="arena-input"
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
              placeholder={placeholder}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block' }}>Opening Time</label>
            <input
              type="time"
              className="arena-input"
              value={form.openTime}
              onChange={(e) => setForm({ ...form, openTime: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block' }}>Closing Time</label>
            <input
              type="time"
              className="arena-input"
              value={form.closeTime}
              onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block' }}>Type</label>
          <select
            className="arena-input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'court' | 'table' })}
            style={{ cursor: 'pointer' }}
          >
            <option value="court" style={{ background: '#1A1A24' }}>Court</option>
            <option value="table" style={{ background: '#1A1A24' }}>Table</option>
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block' }}>Slot Duration</label>
          <select
            className="arena-input"
            value={form.slotDurationMins}
            onChange={(e) => setForm({ ...form, slotDurationMins: Number(e.target.value) })}
          >
            <option value={30} style={{ background: '#1A1A24' }}>30 minutes</option>
            <option value={60} style={{ background: '#1A1A24' }}>60 minutes</option>
            <option value={90} style={{ background: '#1A1A24' }}>90 minutes</option>
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8, display: 'block' }}>Accent Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setForm({ ...form, accent: c })}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: c,
                  border: form.accent === c ? '3px solid #fff' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => onSave(form)}>Save Activity</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminActivities() {
  const { data, isLoading } = useAdminActivities();
  const { mutate: create } = useCreateActivity();
  const { mutate: update } = useUpdateActivity();
  const { mutate: remove } = useDeleteActivity();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const activities = data?.data || [];

  const handleSave = (formData: any) => {
    if (editing) {
      update({ id: editing._id, data: formData }, {
        onSuccess: () => { toast.success('Activity updated'); setEditing(null); },
        onError: () => toast.error('Update failed'),
      });
    } else {
      create(formData, {
        onSuccess: () => { toast.success('Activity created! 🎉'); setShowModal(false); },
        onError: () => toast.error('Create failed'),
      });
    }
  };

  const handleToggle = (activity: Activity) => {
    update({ id: activity._id, data: { isActive: !activity.isActive } }, {
      onSuccess: () => toast.success(`${activity.name} ${activity.isActive ? 'deactivated' : 'activated'}`),
    });
  };

  const handleDelete = (id: string) => {
    remove(id, {
      onSuccess: () => { toast.success('Activity deleted'); setDeleteConfirm(null); },
      onError: () => toast.error('Delete failed'),
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Activities</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Manage sports & courts</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Activity
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} height={90} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activities.map((activity) => {
            const accent = activity.accent || '#00FF87';
            return (
              <motion.div
                key={activity._id}
                className="glass-card"
                style={{ 
                  padding: '16px 20px', 
                  display: 'flex', 
                  flexDirection: 'row', 
                  flexWrap: 'wrap',
                  alignItems: 'center', 
                  gap: 16, 
                  opacity: activity.isActive ? 1 : 0.6,
                  borderLeft: `3px solid ${activity.isActive ? accent : 'rgba(255,255,255,0.1)'}`
                }}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: activity.isActive ? 1 : 0.6, y: 0 }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${accent}15`,
                    border: `1px solid ${accent}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {activity.emoji || '🏅'}
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{activity.name}</h3>
                    <span style={{ 
                      fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 6, 
                      background: activity.isActive ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.05)', 
                      color: activity.isActive ? '#00FF87' : 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase'
                    }}>
                      {activity.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500, lineHeight: 1.4 }}>
                    {activity.totalUnits} {activity.type}s · ₹{activity.pricePerSlot}/hr · {activity.slotDurationMins}min · {activity.openTime}-{activity.closeTime}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexShrink: 0, width: '100%', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, marginTop: 4 }}>
                  {/* Specialized Action Buttons row for mobile */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggle(activity)}
                      style={{
                        background: activity.isActive ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: activity.isActive ? '#00FF87' : 'rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    >
                      {activity.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {activity.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                    </button>
                  </div>

                  <button
                    onClick={() => setEditing(activity)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', cursor: 'pointer', padding: '8px 10px', display: 'flex' }}
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(activity._id)}
                    style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.15)', borderRadius: 8, color: '#FF4D6D', cursor: 'pointer', padding: '8px 10px', display: 'flex' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Desktop view override style */}
                <style>{`
                  @media (min-width: 640px) {
                    .glass-card { flex-wrap: nowrap !important; }
                    div[style*="justify-content: flex-end"] { width: auto !important; border-top: none !important; padding-top: 0 !important; margin-top: 0 !important; }
                    div[style*="justify-content: flex-end"] > div { display: none !important; }
                  }
                `}</style>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(showModal || editing) && (
          <ActivityModal
            initial={editing || undefined}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditing(null); }}
          />
        )}

        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card"
              style={{ padding: 28, maxWidth: 360 }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Delete Activity?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
                This will permanently delete the activity and all related data.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button
                  className="btn-danger"
                  style={{ flex: 1, height: 48, borderRadius: 12 }}
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
