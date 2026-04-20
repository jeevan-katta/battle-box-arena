import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, BookOpen, User } from 'lucide-react';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/book', icon: Calendar, label: 'Book' },
  { path: '/bookings', icon: BookOpen, label: 'My Bookings' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" style={{ 
      height: 70, 
      background: 'rgba(7,7,11,0.85)', 
      backdropFilter: 'blur(30px)', 
      borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around'
    }}>
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path || (path === '/book' && location.pathname.startsWith('/book'));
        return (
          <Link
            key={path}
            to={path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => { try { navigator.vibrate?.(10); } catch {} }}
            style={{ textDecoration: 'none', position: 'relative' }}
          >
            <motion.div
              animate={isActive ? { y: -4 } : { y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <Icon 
                size={isActive ? 24 : 22} 
                className="nav-icon" 
                style={{ color: isActive ? '#E11D48' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s ease' }} 
              />
              <span className="nav-label" style={{ 
                fontSize: 10, 
                fontWeight: 700, 
                color: isActive ? '#E11D48' : 'rgba(255,255,255,0.7)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#E11D48',
                    boxShadow: '0 0 10px #E11D48'
                  }}
                />
              )}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}

// Page transition wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
