import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, MapPin, Phone,
  Trophy, Users, Clock, ArrowDown, ShieldCheck,
  MessageCircle, User, Camera, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserLogin } from '../api/queries';
import { useAuthStore } from '../stores';

const SPORTS = [
  {
    name: "BADMINTON",
    image: "/assets/badminton.png",
    desc: "Elite indoor courts built for speed. Professional lighting and tournament-grade surfaces for the ultimate smash.",
    accent: "#E11D48"
  },
  {
    name: "SNOOKER",
    image: "/assets/snooker.png",
    desc: "Experience precision on full-size professional tables. A sophisticated atmosphere for the perfect break.",
    accent: "#F59E0B"
  },
  {
    name: "PICKLEBALL",
    image: "/assets/pickleball.png",
    desc: "Join the revolution on our modern courts. Fast-paced, high-energy gaming for all skill levels.",
    accent: "#FACC15"
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { mutate: login, isPending } = useUserLogin();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }

    login(`+91${phone.replace(/\D/g, '')}`, {
      onSuccess: (data) => {
        setUser(data.user, data.token);
        toast.success(`Welcome, ${name || data.user.name || 'Champion'}! 🏟️`);
        navigate('/home');
      },
      onError: (err: any) => {
        console.error('Login error:', err);
        const msg = err.response?.data?.message || 'Access denied. Please check your connection.';
        toast.error(msg);
      },
    });
  };

  return (
    <div style={{ background: '#07070B', color: '#fff', overflowX: 'hidden', fontFamily: '"Outfit", "Inter", sans-serif' }}>

      {/* 0. STICKY HEADER */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          zIndex: 1000,
          padding: '0 5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          background: scrolled ? 'rgba(7, 7, 11, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/assets/logo.jpg" alt="Logo" style={{ height: 40, borderRadius: 8 }} />
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>BATTLE BOX</span>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <div style={{ display: 'none', gap: 24 }} className="desktop-links">
            <a href="#activities" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>ARENAS</a>
            <a href="#contact" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>LOCATION</a>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              background: '#E11D48',
              color: '#000',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(225, 29, 72,0.2)'
            }}
          >
            BOOK NOW
          </button>
        </div>
      </motion.nav>

      {/* 1. HERO SECTION WITH DIRECT LOGIN */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px 60px', /* Reduced padding */
        textAlign: 'center',
        backgroundImage: 'linear-gradient(to bottom, transparent, #07070B), url(/assets/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Cinematic dark overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(7,7,11,0.2) 0%, #07070B 100%)'
        }} />

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1200 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px 80px', alignItems: 'center', textAlign: 'left' }}>

            {/* Title Section */}
            <div style={{ paddingRight: 40, marginTop: -40 }}>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ fontSize: 'clamp(56px, 10vw, 100px)', fontWeight: 950, letterSpacing: '-0.06em', lineHeight: 0.8, marginBottom: 24, textTransform: 'uppercase' }}
              >
                PLAY LIKE <br /> A <span className="gradient-text">PRO.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', fontWeight: 500, lineHeight: 1.4, maxWidth: 500 }}
              >
                Elite Facilities for Badminton, Snooker, and Pickleball in the heart of the city.
              </motion.p>
            </div>

            {/* DIRECT LOGIN CARD */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 80, damping: 20 }}
              style={{
                padding: '48px',
                borderRadius: 40,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(40px)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)',
                position: 'relative'
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.04em', color: '#fff' }}>Welcome back.</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 36, fontSize: 16, fontWeight: 500 }}>Enter your phone number to continue.</p>
              </motion.div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: phone.replace(/\D/g, '').length === 10 ? '#E11D48' : 'rgba(255,255,255,0.3)', transition: 'color 0.3s' }}>
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      height: 68, 
                      background: 'rgba(255,255,255,0.03)', 
                      border: phone.replace(/\D/g, '').length === 10 ? '1px solid #E11D48' : '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: 22, 
                      padding: '0 24px 0 60px', 
                      color: '#fff', 
                      fontSize: 17, 
                      outline: 'none', 
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      if (phone.replace(/\D/g, '').length !== 10) e.target.style.borderColor = '#E11D48';
                      e.target.style.background = 'rgba(225, 29, 72, 0.05)';
                    }}
                    onBlur={(e) => {
                      if (phone.replace(/\D/g, '').length !== 10) e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.target.style.background = 'rgba(255,255,255,0.03)';
                    }}
                  />
                </div>

                <AnimatePresence>
                  {phone.replace(/\D/g, '').length === 10 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: 10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', transition: 'color 0.3s' }}>
                          <User size={20} />
                        </div>
                        <input
                          type="text"
                          placeholder="Full Name (Optional)"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          style={{ 
                            width: '100%', 
                            height: 68, 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: 22, 
                            padding: '0 24px 0 60px', 
                            color: '#fff', 
                            fontSize: 17, 
                            outline: 'none', 
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontFamily: 'inherit'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#E11D48';
                            e.target.style.background = 'rgba(225, 29, 72, 0.05)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.target.style.background = 'rgba(255,255,255,0.03)';
                          }}
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isPending}
                        style={{
                          height: 68,
                          background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                          color: '#fff',
                          fontWeight: 800,
                          borderRadius: 22,
                          border: 'none',
                          fontSize: 18,
                          cursor: 'pointer',
                          letterSpacing: '0.05em',
                          boxShadow: '0 20px 40px rgba(225, 29, 72, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 12,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,255,255,0.1), transparent)', opacity: 0.5 }} />
                        {isPending ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                              <Zap size={20} fill="#fff" />
                            </motion.div>
                            SECURE LOGIN...
                          </span>
                        ) : (
                          <>
                            <span>GO TO ARENA</span>
                            <ChevronRight size={20} />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="#E11D48" /> 
                  <span style={{ fontWeight: 500 }}>Verified access</span>
                </div>
                <a 
                  href="/admin/login" 
                  style={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    textDecoration: 'none', 
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                    padding: '4px 12px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  Admin Portal
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: 40, color: 'rgba(255,255,255,0.1)' }}
        >
          <ArrowDown size={32} />
        </motion.div>
      </section>

      {/* 2. STATS BAR - High Density */}
      <section style={{
        padding: '100px 5%',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: '#07070B'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 64 }}>
          {[
            { icon: Trophy, label: "PROFESSIONAL", val: "Elite Standards" },
            { icon: Users, label: "COMMUNITY", val: "Pro Athletes" },
            { icon: Clock, label: "TIMINGS", val: "6 AM — 12 AM" },
            { icon: ShieldCheck, label: "SECURITY", val: "CCTV & Support" }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: '#E11D48', marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                  {Icon && <Icon size={36} />}
                </div>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{item.val}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ACTIVITIES / SPORTS - Sleek Grid */}
      <section id="activities" style={{ padding: '160px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 100 }}>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              style={{ fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: 950, marginBottom: 24, lineHeight: 1, letterSpacing: '-0.04em' }}
            >
              CHAMPION <br /><span style={{ color: '#E11D48' }}>FACILITIES.</span>
            </motion.h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 22, lineHeight: 1.5, fontWeight: 500, maxWidth: 600, margin: '0 auto' }}>Experience the peak of indoor sports in our world-class arena.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 40 }}>
            {SPORTS.map((sport, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -16 }}
                style={{
                  borderRadius: 48,
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: 400, overflow: 'hidden', position: 'relative' }}>
                  <img src={sport.image} alt={sport.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #07070B 0%, transparent 60%)' }} />
                </div>
                <div style={{ padding: 48, paddingTop: 10 }}>
                  <div style={{ fontSize: 32, fontWeight: 950, marginBottom: 16, color: '#fff', letterSpacing: '-0.04em' }}>{sport.name}</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 40, fontSize: 17, fontWeight: 500 }}>{sport.desc}</p>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      padding: '16px 32px',
                      borderRadius: 18,
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                  >
                    RESERVE SLOT <ChevronRight size={14} color="#E11D48" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTACT & LOCATION - Rounded Glass Icons */}
      <section id="contact" style={{
        padding: '160px 5%',
        background: 'linear-gradient(to bottom, #07070B, rgba(225, 29, 72,0.04))',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 100, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 64, fontWeight: 950, marginBottom: 56, letterSpacing: '-0.04em' }}>CONNECT <br /> & <span style={{ color: '#E11D48' }}>PLAY.</span></h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 24 }}>
              <a href="https://maps.app.goo.gl/8RB9SEySWBeAcJ4SA" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 32, padding: 32, textAlign: 'center' }}>
                  <MapPin size={40} color="#E11D48" style={{ marginBottom: 16 }} />
                  <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>NAVIGATE</div>
                </motion.div>
              </a>

              <a href="https://www.instagram.com/battleboxarena?igsh=ODNidmpldGF0Z2ds" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 32, padding: 32, textAlign: 'center' }}>
                  <Camera size={40} color="#FF007A" style={{ marginBottom: 16 }} />
                  <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>SOCIAL</div>
                </motion.div>
              </a>

              <a href="https://wa.me/919389292717" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(225, 29, 72,0.05)', border: '1px solid rgba(225, 29, 72,0.2)', borderRadius: 32, padding: 32, textAlign: 'center' }}>
                  <MessageCircle size={40} color="#E11D48" style={{ marginBottom: 16 }} />
                  <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(225, 29, 72,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>WHATSAPP</div>
                </motion.div>
              </a>
            </div>

            <div style={{ marginTop: 48, padding: '0 10px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>CONTACT NUMBERS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>+91 93892 92717</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>+91 93904 49037</div>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              height: 560,
              borderRadius: 64,
              background: 'url(/assets/snooker.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              boxShadow: '0 60px 120px rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #07070B 5%, rgba(7,7,11,0.2) 60%, transparent 100%)', borderRadius: 64 }} />
            <div style={{ position: 'absolute', bottom: 64, left: 64 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#F59E0B', letterSpacing: '0.2em', marginBottom: 12, textTransform: 'uppercase' }}>CHAMPIONSHIP SNOOKER</div>
              <div style={{ fontSize: 48, fontWeight: 950, lineHeight: 1, letterSpacing: '-0.04em' }}>PRECISION AND <br /> LUXURY COMBINED.</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer style={{ padding: '120px 5%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <img src="/assets/logo.jpg" alt="Logo" style={{ width: 100, marginBottom: 40, borderRadius: 16, opacity: 0.5 }} />
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 15, fontWeight: 500, letterSpacing: '0.02em' }}>© 2026 Battle Box Arena. All Rights Reserved.</div>

        <div style={{ marginTop: 32, display: 'flex', gap: 32, justifyContent: 'center' }}>
          <a href="/admin/login" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 13, textDecoration: 'none', fontWeight: 750, letterSpacing: '0.1em' }}>ADMIN PORTAL</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 13, textDecoration: 'none', fontWeight: 750, letterSpacing: '0.1em' }}>TERMS of SERVICE</a>
        </div>
      </footer>

      <style>{`
        .gradient-text {
          background: linear-gradient(to right, #E11D48, #FACC15);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
        }
      `}</style>
    </div>
  );
}
