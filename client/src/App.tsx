import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, useThemeStore } from './stores';
import './index.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/Home'));
const SportSelectPage = lazy(() => import('./pages/SportSelect'));
const BookingPage = lazy(() => import('./pages/Booking'));
const MyBookingsPage = lazy(() => import('./pages/MyBookings'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const LandingPage = lazy(() => import('./pages/Landing'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Protected route for users
function UserProtected({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;
  return <>{children}</>;
}

// Protected route for admins
function AdminProtected({ children }: { children: React.ReactNode }) {
  const { admin } = useAuthStore();
  const location = useLocation();
  if (!admin) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

// Loading fallback
function PageLoader() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0A0F',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid rgba(0,255,135,0.2)',
            borderTopColor: '#00FF87',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading Arena...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const { isDark } = useThemeStore();

  return (
    <div className={isDark ? 'dark' : 'light'}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />

              {/* User routes */}
              <Route path="/home" element={<UserProtected><HomePage /></UserProtected>} />
              <Route path="/book" element={<UserProtected><SportSelectPage /></UserProtected>} />
              <Route path="/book/:id" element={<UserProtected><BookingPage /></UserProtected>} />
              <Route path="/bookings" element={<UserProtected><MyBookingsPage /></UserProtected>} />
              <Route path="/profile" element={<UserProtected><ProfilePage /></UserProtected>} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={<AdminProtected><AdminLayout /></AdminProtected>}
              >
                <Route index element={<AdminDashboard />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="activities" element={<AdminActivities />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0A0A0F', textAlign: 'center', padding: 24 }}>
                    <div style={{ fontSize: 72, marginBottom: 16 }}>🏟️</div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }} className="gradient-text">Out of Bounds!</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>This court doesn't exist.</p>
                    <a href="/home" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Back to Arena</a>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: isDark ? '#1A1A24' : '#fff',
              color: isDark ? '#fff' : '#0A0A0F',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#00FF87', secondary: '#0A0A0F' },
            },
            error: {
              iconTheme: { primary: '#FF4D6D', secondary: '#0A0A0F' },
            },
          }}
        />
      </QueryClientProvider>
    </div>
  );
}
