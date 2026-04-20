import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Bell, Moon, LogOut, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useThemeStore } from '../stores';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.phone?.slice(-2) || '??';

  const handleSave = async () => {
    setSaving(true);
    try {
      // Optimistically update
      if (user) setUser({ ...user, name }, localStorage.getItem('bba_token') || '');
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    api.post('/auth/logout').catch(() => {});
    toast.success('Logged out. See you in the arena!');
    navigate('/login');
  };

  return (
    <div>
      <Header />
      <BottomNav />
      <div className="page-content" style={{ padding: '64px 16px 80px', maxWidth: 640, margin: '0 auto' }}>
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '40px 0 20px', marginBottom: 28 }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 32,
              background: 'linear-gradient(135deg, #E11D48 0%, #FACC15 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
              color: '#07070B',
              margin: '0 auto 20px',
              boxShadow: '0 20px 40px rgba(225, 29, 72, 0.3)',
              border: '4px solid rgba(255,255,255,0.1)',
              transform: 'rotate(-5deg)'
            }}
          >
            {initials}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: '#fff' }}>{name || 'Arena Player'}</h2>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            background: 'rgba(255,255,255,0.04)', 
            padding: '4px 12px', 
            borderRadius: 100, 
            marginTop: 8,
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <Phone size={12} color="#E11D48" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600 }}>{user?.phone}</span>
          </div>
        </motion.div>

        {/* Edit profile card */}
        <motion.div
          className="glass-card"
          style={{ padding: 32, marginBottom: 20, borderRadius: 32 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(225, 29, 72, 0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                <User size={16} color="#E11D48" />
              </div>
              Personal Details
            </h3>
            {!editing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(true)}
                style={{
                  background: 'rgba(225, 29, 72, 0.05)',
                  border: '1px solid rgba(225, 29, 72, 0.2)',
                  borderRadius: 12,
                  color: '#E11D48',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Edit2 size={13} /> Edit
              </motion.button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setEditing(false); setName(user?.name || ''); }}
                  style={{ background: 'rgba(255,77,109,0.05)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: 10, color: '#FF4D6D', fontSize: 13, fontWeight: 700, padding: '8px 12px', cursor: 'pointer' }}
                >
                  <X size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                  style={{ background: '#E11D48', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 12px', cursor: 'pointer' }}
                >
                  <Check size={16} />
                </motion.button>
              </div>
            )}
          </div>

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Full Identity</label>
            {editing ? (
              <input
                className="arena-input"
                style={{ 
                  height: 60, 
                  borderRadius: 16, 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#fff'
                }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. John Doe"
              />
            ) : (
              <div style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: name ? '#fff' : 'rgba(255,255,255,0.4)',
                padding: '4px 0'
              }}>
                {name || 'No Name Set'}
              </div>
            )}
          </div>

          {/* Phone (readonly) */}
          <div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Primary Number</label>
            <div style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              color: 'rgba(255,255,255,0.7)',
              background: 'rgba(255,255,255,0.02)',
              padding: '16px 20px',
              borderRadius: 16,
              border: '1px dashed rgba(255,255,255,0.15)'
            }}>
              {user?.phone}
            </div>
          </div>
        </motion.div>

        {/* Settings card */}
        <motion.div
          className="glass-card"
          style={{ padding: 32, marginBottom: 24, borderRadius: 32 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>App Settings</h3>

          {[
            {
              icon: Bell,
              label: 'Smart Notifications',
              desc: 'Booking status & live updates',
              value: notifications,
              toggle: () => setNotifications(!notifications),
            },
            {
              icon: Moon,
              label: 'Midnight Mode',
              desc: 'Optimized for high-contrast viewing',
              value: isDark,
              toggle: () => {
                toggleTheme();
                toast(isDark ? 'Light mode activated! ☀️' : 'Dark mode restored! 🌙', {
                  icon: isDark ? '☀️' : '🌙',
                });
              },
            },
          ].map(({ icon: Icon, label, desc, value, toggle }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color="rgba(255,255,255,0.6)" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{desc}</div>
                </div>
              </div>
              <button
                onClick={toggle}
                style={{
                  width: 52,
                  height: 28,
                  borderRadius: 100,
                  background: value ? '#E11D48' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  flexShrink: 0,
                  boxShadow: value ? '0 0 15px rgba(225, 29, 72, 0.4)' : 'none'
                }}
              >
                <motion.div
                  animate={{ x: value ? 26 : 4 }}
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 0,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="btn-danger"
          style={{ 
            width: '100%', 
            height: 64, 
            borderRadius: 20, 
            fontSize: 16, 
            fontWeight: 800,
            border: '1px solid rgba(255,77,109,0.2)',
            background: 'rgba(255,77,109,0.05)',
            color: '#FF4D6D',
            letterSpacing: '0.05em'
          }}
          onClick={handleLogout}
        >
          <LogOut size={20} /> TERMINATE SESSION
        </motion.button>
      </div>
    </div>
  );
}
