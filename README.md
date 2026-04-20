# Battle Box Arena 🏟️

> **Premium Sports Booking Platform — Book. Play. Dominate.**

A full-stack, mobile-first web application for booking sports courts (badminton, snooker, pickleball) with a dark arena theme, neon accents, and a seamless payment flow.

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS v4 + Framer Motion |
| Backend | Node.js + Express + TypeScript (MVC) |
| Database | MongoDB + Mongoose |
| Auth | Phone-only JWT (users), Email+Password JWT (admin) |
| Payment | Razorpay (mock mode included) |
| State | React Query (server) + Zustand (client) |
| Icons | Lucide React |
| Charts | Recharts |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env  # edit MONGODB_URI and JWT_SECRET
npm run seed          # seed DB with demo data
npm run dev           # starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev           # starts on http://localhost:5173
```

---

## Environment Variables

### Backend (`server/.env`)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/battlebox
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret
ADMIN_EMAIL=admin@battlebox.com
ADMIN_PASSWORD=Admin@123
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder
```

---

## Demo Credentials

| Role | Credential |
|---|---|
| Admin | admin@battlebox.com / Admin@123 |
| Demo User | +919876543210 |

---

## API Reference

### Auth
- `POST /api/auth/user/login` — Phone login (creates user if not exists)
- `POST /api/auth/admin/login` — Email+password admin login
- `POST /api/auth/logout` — Clear cookies

### Activities
- `GET /api/activities` — List all active sports
- `GET /api/activities/:id` — Get single activity
- `GET /api/activities/:id/slots?date=YYYY-MM-DD` — Get slot availability

### Bookings
- `GET /api/bookings/my` — User's bookings (auth required)
- `POST /api/bookings` — Create booking (auth required)
- `POST /api/bookings/:id/cancel` — Cancel booking

### Payments
- `POST /api/payments/create-order` — Create Razorpay order
- `POST /api/payments/verify` — Verify payment signature

### Admin
- `GET /api/admin/dashboard` — Analytics & KPIs
- `GET /api/admin/bookings` — All bookings with filters
- `POST /api/admin/bookings/:id/cancel` — Admin cancel
- `GET /api/admin/activities` — List activities
- `POST /api/admin/activities` — Create activity
- `PUT /api/admin/activities/:id` — Update activity
- `DELETE /api/admin/activities/:id` — Delete activity
- `GET /api/admin/users` — List users
- `GET /api/admin/users/:id/bookings` — User booking history
- `DELETE /api/admin/users/:id` — Delete user

---

## Features

### User
- 📱 Mobile-first PWA with bottom navigation
- 🔐 Phone-only login (no OTP)
- 🏸 Browse sports with animated cards
- 📅 3-step booking flow (court → date+time → pay)
- ⚡ Real-time slot availability
- 💰 Peak pricing (1.5× for 6–9 PM)
- 🔒 Consecutive-slot selection with price calculator
- ✅ Success burst animation + confetti
- 📋 My Bookings (Upcoming / Completed / Cancelled tabs)
- ❌ Cancel booking with policy modal
- 👤 Profile with editable name

### Admin
- 📊 Dashboard with KPI cards + Recharts area/pie charts
- 📋 Filterable bookings table
- 🏅 Activities CRUD with modal + color picker
- 👥 User management + slide-in booking history panel
- 📱 Mobile drawer navigation

### Backend
- 🔒 JWT auth (httpOnly cookies + Bearer token)
- 🔄 In-memory slot locking (5-min TTL) for double-booking prevention
- ⏰ Cron job: auto-expire pending bookings after 5 minutes
- 💳 Razorpay integration with mock fallback
- 🛡️ Rate limiting (100 req/15min)
- 📈 MongoDB aggregation for dashboard analytics

---

## Seed Data
The seed script creates:
- **3 activities**: Badminton (4 courts, ₹300/hr), Snooker (3 tables, ₹200/hr), Pickleball (2 courts, ₹250/hr)
- **5 demo users** with booking history
- **90 bookings** across 30 days (mix of confirmed, cancelled, expired)
- **Admin account**: admin@battlebox.com / Admin@123
