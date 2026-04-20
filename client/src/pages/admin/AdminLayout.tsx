import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Calendar, Activity, Users, LogOut, Menu, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores';
import { api } from '../../api/axios';

const navLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/admin/activities', icon: Activity, label: 'Activities' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { admin, logoutAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    api.post('/auth/logout').catch(() => {});
    toast.success('Admin logged out');
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 0' }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              <span style={{ color: '#00FF87' }}>Battle</span>
              <span style={{ color: '#fff' }}> Box</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              <Shield size={10} style={{ display: 'inline', marginRight: 3 }} />Admin Panel
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Admin info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#0A0A0F',
              flexShrink: 0,
            }}
          >
            {admin?.name?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{admin?.name || 'Admin'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{admin?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        {navLinks.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 12px',
              borderRadius: 12,
              marginBottom: 4,
              textDecoration: 'none',
              background: isActive ? 'rgba(0,212,255,0.12)' : 'transparent',
              color: isActive ? '#00D4FF' : 'rgba(255,255,255,0.5)',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.15s ease',
              border: isActive ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0 12px 12px' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '11px 12px',
            borderRadius: 12,
            border: '1px solid rgba(255,77,109,0.2)',
            background: 'rgba(255,77,109,0.06)',
            color: '#FF4D6D',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#0A0A0F' }}>
      {/* Desktop sidebar */}
      <div 
        id="desktop-sidebar" 
        style={{ 
          width: 260, 
          background: 'rgba(17,17,24,0.6)', 
          borderRight: '1px solid rgba(255,255,255,0.06)', 
          display: 'none',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        <Sidebar />
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 280, background: 'linear-gradient(180deg, #111118 0%, #0A0A0F 100%)', borderRight: '1px solid rgba(255,255,255,0.08)', zIndex: 101, boxShadow: '20px 0 50px rgba(0,0,0,0.5)' }}
            >
              <Sidebar onClose={() => setDrawerOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          minWidth: 0, // Prevent flex items from overflowing
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: 64,
            background: 'rgba(10,10,15,0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 16,
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <button
            id="mobile-menu-btn"
            onClick={() => setDrawerOpen(true)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer', color: '#fff', display: 'flex', padding: 8, transition: 'all 0.2s' }}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb / Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: 16 }}>B</div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BATTLE BOX ADMIN
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Status Badge */}
          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(0,255,135,0.08)',
              border: '1px solid rgba(0,255,135,0.2)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#00FF87',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}
          >
             <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF87', boxShadow: '0 0 8px #00FF87' }} />
             LIVE
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: '24px 20px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </div>

      {/* Global CSS for responsiveness overrides */}
      <style>{`
        @media (min-width: 1024px) {
          #desktop-sidebar { display: block !important; }
          #mobile-menu-btn { display: none !important; }
        }
        
        /* Smooth scrollbar for sidebar */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
