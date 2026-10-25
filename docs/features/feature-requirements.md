# Functional Feature Requirements & Gap Analysis

This document provides a detailed functional specification of all features in the **IMovies** platform, evaluates them against the official **SkillWallet Capstone Requirements PDF**, and provides a traceability matrix.

---

## 1. Functional Specification of Core Modules

### 1.1 Movie Discovery, Title Search & Genre Filtering
- **Hero Spotlight**: Showcases featured trending movies with high-resolution backdrops, titles, runtimes, ratings, synopsis, and an embedded YouTube trailer modal.
- **Title Search**: Real-time client-side and server-side text filtering via regular expressions (`?search=query`).
- **Genre Filter Pills**: Dynamic genre chips fetched from the database (`GET /api/movies/genres`). Active pills highlight in coral red, wrapping cleanly on mobile screens without horizontal page overflow.
- **Responsive Cinema Cards**: Uniform 2:3 aspect ratio posters with rating overlays, runtimes, genre badges, and direct booking links.

### 1.2 Movie Details & Multi-Day Showtime Selector
- **Backdrop & Metadata**: Detailed page displaying movie backdrop, synopsis, director, cast members, runtime, and release date.
- **Calendar Date Picker**: Multi-day selector allowing customers to pick screenings for Today, Tomorrow, and upcoming dates.
- **Screen Format Grouping**: Screenings automatically grouped by projection format:
  - **IMAX Laser 3D**
  - **Dolby Cinema Atmos**
  - **4DX Dynamic**
  - **Digital Standard**

### 1.3 Theater & Auditorium Management (SkillWallet PDF Add Theater)
- **Theater Catalog**: Admins create and manage cinema complexes with name, location, screen formats, and tiered pricing.
- **Show Integration**: When scheduling a show, admins can select a configured theater to automatically inherit screen names, format types, and pricing tiers.
- **Dedicated Admin Tab**: Theaters tab in `AdminDashboardPage.jsx` with full CRUD support.

### 1.4 Interactive Seating Chart & Tiered Pricing
- **Auditorium Simulation**: Renders a 60-seat layout facing a curved cinema projection screen (*"Screen — Eyes This Way"*).
- **Seat States**:
  - *Available* (Selectable outline)
  - *Selected* (Active coral-red fill with ticket icon)
  - *Reserved / Booked* (Muted grey, disabled cursor, non-interactive)
- **Tiered Seating Zones**:
  - **Silver Tier** (Rows A–B): $10.00 base price
  - **Gold Tier** (Rows C–D): $15.00 base price
  - **Platinum VIP Tier** (Rows E–F): $22.00 base price
- **Order Constraints**: Enforces a strict maximum of **8 seats per booking transaction**.
- **Real-Time Summary**: Dynamically calculates seat counts, subtotal, convenience fee ($2.50), and grand total.

### 1.5 Concurrency-Safe Atomic Booking & Cancellation
- **Race Condition Prevention**: Employs atomic MongoDB conditional updates (`Show.findOneAndUpdate` matching `{ bookedSeats: { $nin: seats } }`).
- **Conflict Handling**: Returns **HTTP 409 Conflict** with an explicit list of conflicted seats if another user secures any requested seat first.
- **Safe Ticket Cancellation**: Authenticated users can cancel active tickets via `PUT /api/bookings/:id/cancel`. The backend verifies ownership, atomically releases the reserved seats back into availability using `$pull: { bookedSeats: { $in: booking.seats } }`, and sets `paymentStatus = 'cancelled'`.

### 1.6 Digital Ticket Generation & Printing
- **Perforated Ticket Layout**: Generates an aesthetic digital ticket featuring an alphanumeric reference code (`IM-XXXXXX`), movie title, auditorium, show date, showtime, and seat numbers.
- **Barcode & One-Click Print**: Includes a mock barcode graphic and a browser print button (`window.print()`) formatted for ticket printing or PDF export.

### 1.7 User Authentication & Role-Based Access Control
- **JWT Authentication**: Secure registration and login using JSON Web Tokens and `bcryptjs` password hashing.
- **Demo Fill Buttons**: Quick-fill buttons on the login page for instant Administrator and Customer testing.
- **My Bookings Portal**: Protected user page displaying chronological booking history with status badges, cancel buttons, and modal ticket viewers.

### 1.8 API Rate Limiting & Protection
- **Sliding Window Protection**: Zero-dependency in-memory rate limiter protecting `/api/auth/login`, `/api/auth/register`, and `/api/bookings` from brute-force attempts and denial-of-service spikes.

---

## 2. SkillWallet Feature Verification Checklist

| # | Feature Mentioned | Implementation Status | Evidence from Code | Notes & Technical Delivery |
|---|---|:---:|---|---|
| **1** | **JWT Authentication** | **Implemented** | `backend/middleware/authMiddleware.js`, `backend/controllers/authController.js`, `frontend/src/context/AuthContext.jsx` | 7-day signed tokens with bcrypt password encryption. |
| **2** | **Movie Filtering & Search** | **Implemented** | `backend/controllers/movieController.js`, `frontend/src/pages/HomePage.jsx` | Real-time title search and dynamic genre pills. |
| **3** | **Booking Management** | **Implemented** | `backend/controllers/bookingController.js`, `frontend/src/pages/MyBookingsPage.jsx`, `AdminDashboardPage.jsx` | Complete reservation tracking, digital tickets, and admin oversight. |
| **4** | **Seat Availability Tracking** | **Implemented** | `backend/models/Show.js` (`bookedSeats`), `SeatBookingPage.jsx`, `SeatLayout.jsx` | Real-time visual seating map with atomic double-booking prevention. |
| **5** | **Payment Processing** | **Simulated Sandbox Gateway** | `frontend/src/pages/SeatBookingPage.jsx` (Demo Payment Modal), `backend/models/Booking.js` | High-fidelity checkout modal simulation as instructed. No live credit card gateway is connected. |
| **6** | **Booking Cancellation** | **Implemented** | `backend/controllers/bookingController.js#cancelBooking`, `bookingRoutes.js`, `MyBookingsPage.jsx` | Endpoint `PUT /api/bookings/:id/cancel` atomically releases seats back to the show and updates status. |
| **7** | **Theater Management (Add Theater)** | **Implemented** | `backend/models/Theater.js`, `theaterController.js`, `theaterRoutes.js`, `AdminDashboardPage.jsx` | Dedicated `Theater` collection, CRUD endpoints, and "Add Theater" admin modal satisfying PDF page 21 & 25. |
| **8** | **Admin Management** | **Implemented** | `backend/middleware/authMiddleware.js#adminOnly`, `frontend/src/pages/AdminDashboardPage.jsx` | Metric counters, movie CRUD, showtime scheduler, theater manager, and reservations table. |
| **9** | **Rate Limiting** | **Implemented** | `backend/middleware/rateLimitMiddleware.js`, `backend/server.js` | Throttling applied on auth and booking endpoints with standard HTTP 429 and retry headers. |
| **10** | **Database Indexing** | **Implemented** | `Movie.js` (text index on title/description), `Show.js` (compound on movie/showDate), `Booking.js` (compound on user/createdAt and unique on bookingRef), `User.js` (unique on email). | Fully implemented across all Mongoose models. |
| **11** | **Route Aliases** | **Implemented** | `frontend/src/App.jsx` | Routes `/products`, `/movies`, `/orders`, `/order`, `/dashboard` aliased to match PDF routing instructions. |

---

## 3. Explicit Notes on Optional / Unimplemented Concepts in PDF

1. **Payment Gateways (Razorpay/Stripe/PayPal)**:
   - *Status*: **Simulated Sandbox Modal**. The prompt explicitly requested: *"Do not integrate real payments; use a demo booking flow."* The project implements a modal credit card form that simulates the user transaction experience without triggering real monetary charges.
2. **Automated Email/SMS Notifications**:
   - *Status*: **Omitted (Client-side Digital Ticket provided)**. Confirmation is rendered visually via the printable Digital Ticket with barcode. Transactional email/SMS services (Nodemailer/Twilio) were omitted to avoid requiring third-party credentials.
3. **WebSockets / Socket.io**:
   - *Status*: **Marked as Optional in PDF (Pages 3, 5)**. Concurrency is handled robustly through atomic MongoDB conditional filters (`$nin`), ensuring race conditions are resolved reliably at the database level.

---

## 4. Feature Traceability Matrix

| Feature | Frontend Page / Component | Backend Route | Controller Method | Database Model |
|---|---|---|---|---|
| **Movie Catalog** | `HomePage.jsx` / `MovieCard.jsx` | `GET /api/movies` | `movieController.getMovies` | `Movie.js` |
| **Movie Search & Filter** | `HomePage.jsx` | `GET /api/movies?search=&genre=` | `movieController.getMovies` | `Movie.js` (Text Index) |
| **Movie Details** | `MovieDetailsPage.jsx` | `GET /api/movies/:id` | `movieController.getMovieById` | `Movie.js` |
| **Showtime Schedules** | `MovieDetailsPage.jsx` | `GET /api/shows/movie/:id` | `showController.getShowsByMovie` | `Show.js` (Compound Index) |
| **Seat Map & Availability** | `SeatBookingPage.jsx` / `SeatLayout.jsx` | `GET /api/shows/:id` | `showController.getShowById` | `Show.js` (`bookedSeats`) |
| **Atomic Ticket Reservation** | `SeatBookingPage.jsx` | `POST /api/bookings` | `bookingController.createBooking` | `Booking.js` & `Show.js` |
| **Booking Cancellation** | `MyBookingsPage.jsx` | `PUT /api/bookings/:id/cancel` | `bookingController.cancelBooking` | `Booking.js` & `Show.js` |
| **Theater Management** | `AdminDashboardPage.jsx` | `GET/POST/DELETE /api/theaters` | `theaterController.*` | `Theater.js` |
| **Digital Ticket Viewer** | `BookingConfirmationPage.jsx` / `DigitalTicket.jsx` | `GET /api/bookings/:id` | `bookingController.getBookingById` | `Booking.js` |
| **User Booking History** | `MyBookingsPage.jsx` | `GET /api/bookings/my-bookings` | `bookingController.getMyBookings` | `Booking.js` |
| **User Registration** | `RegisterPage.jsx` | `POST /api/auth/register` | `authController.registerUser` | `User.js` (Bcrypt hook) |
| **User Login** | `LoginPage.jsx` | `POST /api/auth/login` | `authController.loginUser` | `User.js` (Bcrypt match) |
| **Admin Metrics & Revenue** | `AdminDashboardPage.jsx` | `GET /api/bookings/stats` | `bookingController.getAdminStats` | `Booking.js` (`$group`) |
| **Admin Movie Management** | `AdminDashboardPage.jsx` | `POST/PUT/DELETE /api/movies` | `movieController.*` | `Movie.js` & `Show.js` |
| **Admin Show Scheduling** | `AdminDashboardPage.jsx` | `POST/DELETE /api/shows` | `showController.*` | `Show.js` |
| **Admin Booking Audit** | `AdminDashboardPage.jsx` | `GET /api/bookings` | `bookingController.getAllBookings` | `Booking.js` |
