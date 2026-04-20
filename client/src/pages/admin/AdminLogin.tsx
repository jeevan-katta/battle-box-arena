import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminLogin } from '../../api/queries';
import { useAuthStore } from '../../stores';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin } = useAuthStore();
  const { mutate: login, isPending } = useAdminLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      toast.error('Enter email and password');
      return;
    }
    login({ email, password }, {
      onSuccess: (data) => {
        setAdmin(data.admin, data.token);
        toast.success('Welcome, Admin! 🛡️');
        navigate('/admin');
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Invalid credentials');
      },
    });
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 36 }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))',
              border: '1px solid rgba(0,212,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Shield size={30} color="#00D4FF" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            Admin <span style={{ color: '#00D4FF' }}>Panel</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Battle Box Arena Management</p>
        </motion.div>

        <motion.div
          className="glass-card"
          style={{ padding: 28 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block' }}>Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input
                type="email"
                className="arena-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@battlebox.com"
                style={{ paddingLeft: 44 }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input
                type="password"
                className="arena-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: 44 }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', background: '#00D4FF', color: '#0A0A0F' }}
            onClick={handleLogin}
            disabled={isPending}
          >
            {isPending ? '⚡ Authenticating...' : '🛡️ Access Admin Panel'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none' }}>
              ← User Login
            </a>
          </div>
        </motion.div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          Demo: admin@battlebox.com / Admin@123
        </p>
      </div>
    </div>
  );
}
