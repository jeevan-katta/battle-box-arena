import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminUsers, useAdminUserBookings, useDeleteUser } from '../../api/queries';
import { SkeletonCard } from '../../components/Skeletons';
import type { User } from '../../types';

function UserPanel({ user, onClose }: { user: User; onClose: () => void }) {
  const { data } = useAdminUserBookings(user._id);
  const bookings = data?.data || [];
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.phone.slice(-2);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 380,
        background: '#111118',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          <X size={22} />
        </button>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>User Details</h3>
      </div>

      {/* User info */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00FF87, #00D4FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: '#0A0A0F',
          }}
        >
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{user.name || 'Anonymous'}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{user.phone}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            Joined {new Date(user.createdAt || '').toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>

      {/* Booking history */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'rgba(255,255,255,0.7)' }}>
          Booking History ({bookings.length})
        </h4>
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            No bookings yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bookings.map((b) => {
              const activity = b.activityId as any;
              return (
                <div
                  key={b._id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{activity?.name}</span>
                    <span style={{ color: '#00FF87', fontWeight: 700 }}>₹{b.totalAmount}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {b.date} · {b.startTime}–{b.endTime}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className={`pill ${b.bookingStatus === 'confirmed' ? 'pill-success' : b.bookingStatus === 'cancelled' ? 'pill-error' : 'pill-neutral'}`}>
                      {b.bookingStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers(search);
  const { mutate: deleteUser, isPending: deleting } = useDeleteUser();
  const users = data?.data || [];

  const handleDelete = (id: string) => {
    deleteUser(id, {
      onSuccess: () => {
        toast.success('User deleted');
        setDeleteConfirm(null);
        if (selectedUser?._id === id) setSelectedUser(null);
      },
      onError: () => toast.error('Delete failed'),
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Users</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{data?.total || 0} registered athletes</p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 280, width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            className="arena-input"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38, height: 44, fontSize: 13 }}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} height={70} />)}
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
          <p>No users found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map((user) => {
            const initials = user.name
              ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              : user.phone.slice(-2);

            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card glass-card-hover"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedUser(user)}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00FF87, #00D4FF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#0A0A0F',
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{user.name || 'Anonymous'}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{user.phone}</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(user._id); }}
                    style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.15)', borderRadius: 8, color: '#FF4D6D', padding: '6px 8px', cursor: 'pointer', display: 'flex' }}
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={18} color="rgba(255,255,255,0.25)" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* User side panel */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 55 }}
              onClick={() => setSelectedUser(null)}
            />
            <UserPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass-card"
              style={{ padding: 28, maxWidth: 340, width: '100%' }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Delete User?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
                This action is permanent and will remove all user data.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button
                  className="btn-danger"
                  style={{ flex: 1, height: 48, borderRadius: 12 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
