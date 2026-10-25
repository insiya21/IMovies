# SkillWallet Capstone Final Project Report
## IMovies — Movie Ticket Booking Made Simple 🎬

> **Official Template Note**: This document compiles the complete, verified technical and functional deliverables required by the SkillWallet Capstone PDF (19 Tasks). If your institution or mentor provides a specific `.docx` cover page or institutional template, all sections below correspond directly to the required capstone submission criteria.

---

## 1. Executive Summary & Project Overview

**IMovies** is a full-stack cinema ticket reservation and theater management platform developed using the **MERN** technology stack (MongoDB, Express.js, React.js, Node.js). The system bridges patrons seeking seamless movie discovery and reservation with cinema administrators overseeing multiple theaters, screening schedules, and customer sales.

### Core Metrics:
- **Project Type**: Full-Stack Web Application (MERN)
- **Epics**: 6 Epics
- **Tasks**: 19 Stories & Tasks
- **Deployment Topology**:
  - Frontend: Deployed on **Vercel** Edge Network
  - Backend: RESTful API Web Service on **Render**
  - Database: Multi-node Replica Set on **MongoDB Atlas**
- **Authentication**: Stateless JSON Web Tokens (JWT) with `bcryptjs` password encryption
- **Safety / Concurrency**: Database-level atomic conditional reservation eliminating duplicate seat bookings

---

## 2. Technology Stack & Environment Specifications

| Layer | Technologies Used | Version / Configuration |
|---|---|---|
| **Frontend Framework** | React.js (Vite bundler) | React `^18.3`, Vite `^6.0` |
| **Styling & UI** | Bootstrap 5, Bootstrap Icons, Custom CSS Variables | Bootstrap `^5.3`, Bootstrap Icons `^1.11` |
| **Client Routing** | React Router DOM | `^6.28` (Declarative Protected & Admin Routes) |
| **HTTP Client** | Axios | `^1.7` (Request interceptors for JWT injection) |
| **Server Framework** | Node.js, Express.js | Express `^4.21`, Node `v18+` |
| **Database & ODM** | MongoDB, Mongoose ODM | Mongoose `^8.9`, MongoDB Atlas |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` | JWT `^9.0`, Bcrypt `^2.4` |
| **Security & Utilities** | CORS, Dotenv, In-Memory Sliding Window Rate Limiter | Custom middleware (`rateLimitMiddleware.js`) |
| **Automated Testing** | Jest, Supertest | Jest `^29.7`, Supertest `^7.0` |

---

## 3. System Architecture & Design Patterns

### 3.1 Model-View-Controller (MVC) Pattern
The backend strictly adheres to the MVC pattern:
- **Model** (`backend/models/`): `User.js`, `Movie.js`, `Theater.js`, `Show.js`, `Booking.js`.
- **View** (`frontend/src/`): Single Page Application built in React consuming REST endpoints.
- **Controller** (`backend/controllers/`): `authController.js`, `movieController.js`, `theaterController.js`, `showController.js`, `bookingController.js`.
- **Router & Middleware** (`backend/routes/`, `backend/middleware/`): Route dispatchers with JWT guard (`protect`), role guard (`adminOnly`), rate limiting, and centralized error handling.

### 3.2 Entity-Relationship (ER) Architecture
The database models 5 interconnected entities:
- **User**: Authentication credentials, role claims (`'user'` or `'admin'`).
- **Movie**: Catalog metadata, genres, duration, media URLs, full-text search index.
- **Theater**: Physical cinema complexes, locations, screen formats, and default pricing tiers.
- **Show**: Scheduled screenings linking a `Movie` and optional `Theater` to a calendar date, time, and seat availability array.
- **Booking**: Customer reservations linking `User`, `Show`, `Movie`, seat allocations, unique reference IDs (`IM-XXXXXX`), and payment status (`completed` or `cancelled`).

### 3.3 Roles and Responsibilities (RBAC)
- **Guest**: Browse movie catalog, filter by genre, search titles, watch trailers, inspect showtimes, preview seating chart.
- **Customer (`user`)**: All guest capabilities + select up to 8 seats, checkout via sandbox payment modal, obtain digital ticket with barcode, view booking history, and cancel active tickets.
- **Administrator (`admin`)**: All customer capabilities + access `/admin` portal, audit real-time KPI metrics, manage movie listings (CRUD), configure theaters/screenings, and audit all customer reservations.

---

## 4. Key Functional Modules & Technical Delivery

1. **Movie Discovery & Search**:
   - High-definition hero spotlight banner with trailer modal.
   - Real-time text search and wrap-enabled genre filter pills.
   - Compact 2:3 aspect-ratio movie cards.
2. **Theater & Auditorium Management**:
   - Dedicated `Theater` collection (`name`, `location`, `screenType`, `pricing`).
   - "Add Theater" administration modal in `AdminDashboardPage.jsx`.
   - Show scheduling linked to theaters for automated screen format and price inheritance.
3. **Interactive Seating Chart**:
   - 60-seat auditorium layout with curved screen graphic.
   - Tiered seat pricing: Silver (Rows A–B, $10), Gold (Rows C–D, $15), Platinum VIP (Rows E–F, $22).
   - Real-time state management: Available, Selected, and Reserved/Booked.
4. **Concurrency-Safe Atomic Booking**:
   - Atomic conditional update: `Show.findOneAndUpdate({ _id: showId, bookedSeats: { $nin: seats } }, { $push: { bookedSeats: { $each: seats } } })`.
   - Eliminates race conditions without table locks; returns HTTP 409 Conflict upon duplicate seat attempts.
5. **Safe Booking Cancellation**:
   - Protected endpoint `PUT /api/bookings/:id/cancel`.
   - Validates ownership, atomically releases seats via `$pull: { bookedSeats: { $in: booking.seats } }`, and sets `paymentStatus = 'cancelled'`.
   - UI cancellation button with confirmation modal in `MyBookingsPage.jsx`.
6. **Digital Ticket Generator**:
   - Perforated ticket component with unique alphanumeric Reference ID (`IM-XXXXXX`), barcode graphic, and one-click browser print (`window.print()`).
7. **API Rate Limiting**:
   - Dedicated sliding window throttlers protecting `/api/auth/login`, `/api/auth/register`, and `/api/bookings` returning HTTP 429 and retry headers.
8. **Route Aliasing**:
   - Clean route aliases supporting `/products`, `/movies`, `/orders`, `/order`, `/dashboard`.

---

## 5. Verification & Test Execution Results

### Automated Unit & Integration Tests:
- `backend/tests/booking_logic.test.js` — **6 Tests Passed (100%)**:
  - `✓ should return 409 Conflict when seats are already booked`
  - `✓ should reject booking when seat limit exceeds 8 seats`
  - `✓ should successfully cancel a booking and release seats back to the show`
  - `✓ should block a user from cancelling another user booking`
  - `✓ should reject cancelling an already cancelled booking`
  - `✓ should allow requests within limit and throttle when limit exceeded`
- `backend/tests/theater.test.js` — **4 Tests Passed (100%)**:
  - `✓ should list all active theaters`
  - `✓ should create a new theater with pricing tiers`
  - `✓ should reject theater creation when name or location is missing`
  - `✓ should delete a theater`

### Frontend Production Build:
- Bundler: Vite v6.4.5
- Output: `frontend/dist/`
- Build Duration: 553ms
- Result: **0 compilation or syntax errors**

---

## 6. Execution & Setup Instructions

### 1. Prerequisites
- Node.js v18 or higher
- MongoDB instance (local or MongoDB Atlas connection string)

### 2. Environment Variables Configuration
In `backend/.env`:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/imovies
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

In `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Install & Seed
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Seed sample movies, theaters, shows, and default demo accounts
cd ../backend && npm run seed
```

### 4. Start Development Servers
```bash
# Terminal 1 (Backend on http://localhost:5001):
cd backend && npm run dev

# Terminal 2 (Frontend on http://localhost:5173):
cd frontend && npm run dev
```

---

## 7. Deliverables & Demonstration References

- **Documentation Suite**: Located in [`docs/`](file:///Users/insiya/Projects/IMovies/docs/):
  - Architecture: `er-diagram.md`, `technical-architecture.md`, `user-flow.md`, `mvc-pattern.md`, `roles-and-responsibilities.md`
  - Backend: `backend-explanation.md`
  - Frontend: `frontend-explanation.md`
  - Features: `feature-requirements.md`
  - Screenshots Guide: `docs/screenshots/SCREENSHOT_CHECKLIST.md`
  - Demo Video Script: `docs/demo-video/DEMO_VIDEO_GUIDE.md`
- **Output Screenshots:** Available in `docs/screenshots/`.
- **Demo Video Guide:** Available in `docs/demo-video/DEMO_VIDEO_GUIDE.md`.
