# IMovies — Cinema Ticket Booking Platform 🎬

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952b3?logo=bootstrap)](https://getbootstrap.com/)
[![Tests](https://img.shields.io/badge/Tests-11%20Passed%20(100%25)-success)](backend/tests/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A modern, full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) cinema ticket reservation and theater management platform. Designed with a sleek dark cinema aesthetic, real-time seat availability tracking, atomic duplicate-booking prevention, automated seat release on cancellation, in-memory sliding-window rate limiting, and an administrative management dashboard.

---

## 📑 Table of Contents
1. [Project Overview & Objectives](#project-overview--objectives)
2. [Key Features & Business Modules](#key-features--business-modules)
3. [Technology Stack](#technology-stack)
4. [System Architecture & Data Models](#system-architecture--data-models)
5. [Project Directory Structure](#project-directory-structure)
6. [Local Installation & Setup](#local-installation--setup)
7. [Environment Variables Configuration](#environment-variables-configuration)
8. [Running the Application](#running-the-application)
9. [Pre-Seeded Demo Credentials](#pre-seeded-demo-credentials)
10. [REST API Reference](#rest-api-reference)
11. [Concurrency Control & Ticket Cancellation](#concurrency-control--ticket-cancellation)
12. [Security, Authentication & Rate Limiting](#security-authentication--rate-limiting)
13. [Automated Testing & Quality Assurance](#automated-testing--quality-assurance)
14. [Documentation & Deliverables Directory](#documentation--deliverables-directory)
15. [Production Deployment Topology](#production-deployment-topology)
16. [License](#license)

---

## 🌟 Project Overview & Objectives

**IMovies** solves the core challenges of modern movie ticketing:
- **Zero Double-Bookings**: Guarantees database-level atomic conditional updates (`$nin` on `bookedSeats` with `$push`), eliminating race conditions when multiple users attempt to reserve the same seat simultaneously.
- **Safe Ticket Cancellation**: Provides authenticated seat cancellation (`PUT /api/bookings/:id/cancel`) that verifies ownership, maintains idempotency, and atomically releases reserved seats back into availability using MongoDB's `$pull` with `$in`.
- **Auditorium Simulation**: Simulates a 60-seat auditorium facing a curved cinema screen with tiered pricing (Silver, Gold, Platinum VIP) and maximum 8-ticket order limits.
- **Instant Digital Tickets**: Issues perforated cinema tickets with unique alphanumeric Reference IDs (`IM-XXXXXX`), simulated barcodes, and one-click browser printing (`window.print()`).
- **Comprehensive Administration**: Equips cinema managers with real-time KPI metrics, movie catalog management, multi-tier theater configuration, and screening schedule dispatchers.

---

## 🚀 Key Features & Business Modules

### 1. Customer Discovery & Search
- **Hero Spotlight Banner**: Showcases trending featured films with movie metadata and an embedded YouTube trailer modal.
- **Dynamic Search & Filtering**: Real-time title search and responsive genre pills (*Action, Sci-Fi, Drama, Animation, etc.*) wrapping cleanly across viewports.
- **Movie Cards**: Compact 2:3 aspect-ratio posters with IMDb-style rating badges, runtimes, and direct booking triggers.

### 2. Movie Details & Showtime Selection
- **Rich Synopsis & Metadata**: Director, cast list, audio language, runtime, and high-resolution backdrop art.
- **Multi-Day Calendar Picker**: Date tabs (*Today, Tomorrow, and upcoming dates*) to browse scheduled screenings.
- **Format Grouping**: Screenings organized by projection format: **IMAX Laser 3D**, **Dolby Cinema Atmos**, **4DX Dynamic**, and **Digital Standard**.

### 3. Interactive Seating Chart & Checkout
- **Cinema Layout**: 60-seat layout featuring Silver (front rows), Gold (middle rows), and Platinum VIP (premium back recliners).
- **Seat States**: Real-time visual distinction for *Available*, *Selected*, and *Reserved / Booked* seats.
- **Dynamic Pricing**: Instant order calculation detailing ticket subtotal, convenience fee ($2.50), and grand total.
- **Demo Checkout**: Sandbox payment modal accepting simulated test cards without real financial processing.

### 4. Digital Tickets & Order History
- **Perforated Ticket View**: Clean ticket card displaying Reference ID, auditorium, date, time, seat list, and barcode.
- **Self-Service Cancellation**: Registered users can cancel active tickets from **My Bookings**, releasing seats back to other patrons.
- **Browser Print**: Optimized CSS print layout for saving digital PDF tickets or physical printing.

### 5. Administration & Cinema Management
- **Live KPI Counters**: Instant metrics for Total Movies, Active Shows, Total Bookings, and Demo Revenue.
- **Movie Catalog Manager**: Add, edit, or remove catalog titles with genres, media URLs, and runtime.
- **Theater Management**: Create cinema venues with custom screen types, capacity, and default tiered pricing.
- **Showtimes Scheduler**: Schedule screenings linked directly to movies and theaters across dates and times.
- **Reservations Oversight**: Live administrative table auditing all customer bookings.

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **React 18.3** | Component-driven Single Page Application |
| **Bundler & Tooling** | **Vite 6.0** | Ultra-fast HMR and optimized production bundling |
| **UI Styling** | **Bootstrap 5.3 + Custom CSS** | Cinema dark theme palette (`#080D13`, `#FF3548`, `#FFC83D`) |
| **Icons** | **Bootstrap Icons 1.11** | Comprehensive vector iconography |
| **Client Routing** | **React Router DOM 6.28** | Declarative client routes with Protected and Admin guards |
| **HTTP Client** | **Axios 1.7** | Centralized API client with automated JWT request interceptors |
| **Runtime Environment** | **Node.js (v18+)** | Asynchronous server-side JavaScript execution |
| **Web Framework** | **Express.js 4.21** | RESTful routing, controllers, and middleware pipeline |
| **Database** | **MongoDB (Atlas)** | Document-oriented NoSQL database for flexible JSON schemas |
| **ODM Layer** | **Mongoose 8.9** | Schemas, validations, casting, indexes, and pre-save hooks |
| **Authentication** | **JWT (jsonwebtoken 9.0)** | Stateless bearer token authentication |
| **Password Security** | **bcryptjs 2.4** | Adaptive salt-hashed password encryption (work factor 10) |
| **Traffic Protection** | **Custom Rate Limiter** | In-memory sliding-window request throttling (`rateLimitMiddleware.js`) |
| **Testing Framework** | **Jest 29.7 & Supertest 7.0**| Unit testing for concurrency, seat conflicts, models, and limits |

---

## 🏛 System Architecture & Data Models

The platform implements a decoupled **Three-Tier Model-View-Controller (MVC)** software architecture:

1. **Presentation Tier (Client)**: React SPA deployed on **Vercel** communicating via HTTPS/JSON REST calls.
2. **Application Tier (Backend)**: Node.js Express REST API hosted on **Render** enforcing authentication, validation, rate limiting, and business logic.
3. **Data Tier (Database)**: Cloud-hosted **MongoDB Atlas** cluster with TLS transport security, connection pooling, and compound indexes.

```
[ User Browser ] <---> [ Vercel CDN (React SPA) ]
                                | (HTTPS / Bearer JWT)
                                v
                     [ Render (Express REST API) ]
                                | (Mongoose ODM / TLS)
                                v
                     [ MongoDB Atlas Database ]
```

### Main Data Models
The database consists of 5 normalized Mongoose models:
- **`User`** (`backend/models/User.js`): Customer and administrator credentials, password hashes, and authorization role (`role: 'user' | 'admin'`). Admin is modeled as a role claim, avoiding redundant entities.
- **`Movie`** (`backend/models/Movie.js`): Catalog metadata, media URLs, genres array, runtime, ratings, and compound text search indexes.
- **`Theater`** (`backend/models/Theater.js`): Physical cinema complexes, locations, screen formats, auditorium capacities, and default seat tier pricing.
- **`Show`** (`backend/models/Show.js`): Scheduled screenings linking movies and theaters with date (`YYYY-MM-DD`), time (`HH:MM`), tiered pricing, total seats, and `bookedSeats` string array.
- **`Booking`** (`backend/models/Booking.js`): Ticket reservations with unique reference code (`IM-XXXXXX`), user link, show link, movie link, seat arrays, pricing breakdown, and payment status (`completed | cancelled`).

> 📐 **Complete ER Diagram**: A traditional Peter Chen-style Entity-Relationship diagram has been generated in vector format:
> - **View Diagram**: [`docs/architecture/er-diagram.svg`](docs/architecture/er-diagram.svg)
> - **Documentation & Specifications**: [`docs/architecture/er-diagram.md`](docs/architecture/er-diagram.md)

---

## 📂 Project Directory Structure

```
IMovies/
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB connection handler with retry fallback
│   ├── controllers/
│   │   ├── authController.js          # Registration, login, profile (/me)
│   │   ├── movieController.js         # Movie CRUD, title search, genre filtering
│   │   ├── showController.js          # Show scheduling, movie showtimes, seat status
│   │   ├── theaterController.js       # Theater venue CRUD & capacity management
│   │   └── bookingController.js       # Atomic seat booking, cancellation, user history
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification & role guard (adminOnly)
│   │   ├── errorMiddleware.js         # Centralized 404 & 500 error handlers
│   │   └── rateLimitMiddleware.js     # Sliding-window rate limiter (auth, bookings, global)
│   ├── models/
│   │   ├── User.js                    # User schema with bcrypt pre-save hashing
│   │   ├── Movie.js                   # Movie schema with full-text search index
│   │   ├── Show.js                    # Show schema with tiered pricing & bookedSeats array
│   │   ├── Theater.js                 # Theater schema (theatreModel.js alias included)
│   │   └── Booking.js                 # Booking schema with unique alphanumeric bookingRef
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth
│   │   ├── movieRoutes.js             # /api/movies
│   │   ├── showRoutes.js              # /api/shows
│   │   ├── theaterRoutes.js           # /api/theaters (/api/theatres alias included)
│   │   └── bookingRoutes.js           # /api/bookings (includes /:id/cancel)
│   ├── seed/
│   │   └── seedData.js                # Database seeder (movies, shows, theaters, demo accounts)
│   ├── tests/
│   │   ├── booking_logic.test.js      # Unit tests: concurrency, 409 conflict, cancel, rate limit
│   │   └── theater.test.js            # Unit tests: theater listing, creation, deletion
│   ├── .env.example                   # Backend environment template
│   ├── package.json
│   └── server.js                      # Express server entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                # Navbar, Footer, ProtectedRoute, AdminRoute
│   │   │   ├── movies/                # MovieCard, HeroBanner
│   │   │   └── booking/               # SeatLayout, DigitalTicket
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global authentication state & token persistence
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # Discovery, search, and genre filtering
│   │   │   ├── MovieDetailsPage.jsx   # Details, calendar tabs, and format showtimes
│   │   │   ├── SeatBookingPage.jsx    # Interactive seat chart & checkout modal
│   │   │   ├── BookingConfirmationPage.jsx # Digital ticket view & browser print
│   │   │   ├── MyBookingsPage.jsx     # Booking history & self-service cancellation
│   │   │   ├── LoginPage.jsx          # Sign-in with 1-click demo buttons
│   │   │   ├── RegisterPage.jsx       # Account registration form
│   │   │   └── AdminDashboardPage.jsx # Analytics, movie manager, show scheduler, theaters
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance with Bearer JWT interceptor
│   │   ├── styles/
│   │   │   └── custom.css             # Cinema dark theme design tokens
│   │   ├── App.jsx                    # Route dispatcher with route aliases
│   │   └── main.jsx
│   ├── .env.example                   # Frontend environment template
│   ├── package.json
│   └── vite.config.js
├── docs/                              # Complete Supporting Documentation Suite
│   ├── architecture/                  # ER diagram, MVC pattern, technical architecture, user flow
│   ├── backend/                       # Backend architecture & controller breakdown
│   ├── frontend/                      # Frontend architecture & component hierarchy
│   ├── features/                      # Detailed feature specifications & gap analysis
│   ├── capstone-report/               # 19-Task Final Project Report (SkillWallet)
│   ├── screenshots/                   # 9 High-resolution output screenshots & capture guide
│   └── demo-video/                    # 3-5 minute presentation script & recording checklist
├── package.json                       # Root convenience scripts
└── README.md
```

---

## ⚡ Local Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/imovies`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/imovies.git
cd IMovies
```

### 2. Install Dependencies
Install dependencies for both backend and frontend:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

---

## ⚙️ Environment Variables Configuration

Copy the example configuration files to `.env` in both folders:

```bash
# In backend/
cp backend/.env.example backend/.env

# In frontend/
cp frontend/.env.example frontend/.env
```

### Default `backend/.env` Settings:
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5001` | Local port for Express API |
| `NODE_ENV` | `development` | Node execution environment |
| `MONGODB_URI` | `mongodb://localhost:27017/imovies` | MongoDB connection URI (local or Atlas) |
| `JWT_SECRET` | `your_jwt_secret_key_change_in_production` | Key for signing stateless JSON Web Tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiration period |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS client origin |

### Default `frontend/.env` Settings:
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5001/api` | Base REST endpoint for the backend API |

---

## 🏃 Running the Application

### 1. Seed Sample Data (Recommended)
Populate the database with sample movies, cinema theaters, upcoming scheduled shows, and demo accounts:
```bash
cd backend && npm run seed
```
> **Seeder Output**: 6 Featured Movies, 3 Cinema Theaters, 60 Scheduled Screenings, 1 Demo Booking, and 2 Demo Accounts.

### 2. Start Both Services
Run the backend and frontend in separate terminals:

**Terminal 1 — Backend REST API:**
```bash
cd backend
npm run dev
# Server running at http://localhost:5001
# Health endpoint: http://localhost:5001/api/health
```

**Terminal 2 — Frontend Client:**
```bash
cd frontend
npm run dev
# Client running at http://localhost:5173
```

Alternatively, launch both from the project root:
```bash
npm run dev:backend     # Starts backend with live reload
npm run start:frontend  # Starts frontend Vite dev server
```

Open your browser at **http://localhost:5173** to use the application.

---

## 🔐 Pre-Seeded Demo Credentials

Pre-seeded accounts are provided for instant testing, complete with **1-click Quick-Fill buttons** on the Sign In page:

| Role | Email Address | Password | Privileges & Access |
|---|---|---|---|
| **Administrator** | `admin@imovies.com` | `admin123` | Full access: Add/edit/delete movies, schedule showtimes, manage theaters, audit all customer bookings, access Admin Dashboard (`/admin`). |
| **Customer / User** | `user@imovies.com` | `user123` | Browse catalog, select tiered seats, checkout in demo mode, view digital tickets, cancel tickets in My Bookings (`/my-bookings`). |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public (Rate-limited) | Register a new user account |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticate user & return signed JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |

### Movies (`/api/movies`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/movies` | Public | List movies (supports `?search=` and `?genre=` filters) |
| `GET` | `/api/movies/genres` | Public | Retrieve distinct list of all active movie genres |
| `GET` | `/api/movies/:id` | Public | Retrieve detailed movie record by ID |
| `POST` | `/api/movies` | Admin | Create a new movie entry |
| `PUT` | `/api/movies/:id` | Admin | Update movie metadata |
| `DELETE`| `/api/movies/:id` | Admin | Delete movie and cascade-delete its scheduled shows |

### Shows & Schedules (`/api/shows`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/shows/movie/:movieId` | Public | Retrieve scheduled screenings for a movie (`?date=YYYY-MM-DD`) |
| `GET` | `/api/shows/:id` | Public | Retrieve single show details, ticket pricing, and booked seats |
| `GET` | `/api/shows` | Admin | Retrieve all scheduled shows across all movies |
| `POST` | `/api/shows` | Admin | Schedule a new showtime (optionally linked to a Theater) |
| `DELETE`| `/api/shows/:id` | Admin | Remove a scheduled show |

### Theaters (`/api/theaters` & `/api/theatres`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/theaters` | Public | List all active cinema theater complexes |
| `GET` | `/api/theaters/:id` | Public | Retrieve single theater details by ID |
| `POST` | `/api/theaters` | Admin | Create a new theater with screen formats and tier pricing |
| `PUT` | `/api/theaters/:id` | Admin | Update theater details |
| `DELETE`| `/api/theaters/:id` | Admin | Delete a theater record |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Private (Rate-limited) | Create a ticket booking with atomic concurrency protection |
| `GET` | `/api/bookings/my-bookings` | Private | Retrieve chronological booking history for authenticated user |
| `GET` | `/api/bookings/:id` | Private | Retrieve single booking confirmation / digital ticket |
| `PUT` | `/api/bookings/:id/cancel` | Private | Cancel booking and atomically release reserved seats |
| `GET` | `/api/bookings` | Admin | Retrieve all customer reservations across the platform |
| `GET` | `/api/bookings/stats` | Admin | Compute live KPI metrics (movies, shows, bookings, revenue) |

---

## 🔒 Concurrency Control & Ticket Cancellation

### 1. Atomic Reservation (Eliminating Double-Bookings)
Traditional read-then-write booking logic is vulnerable to race conditions where two patrons book the same seat simultaneously. IMovies solves this with a **single lock-free conditional update**:

```javascript
// Atomically reserve seats ONLY if none of requested seats exist in bookedSeats
const updatedShow = await Show.findOneAndUpdate(
  {
    _id: showId,
    bookedSeats: { $nin: seats }, // CONDITIONAL FILTER: none of requested seats exist
  },
  {
    $push: { bookedSeats: { $each: seats } }, // ATOMIC PUSH: add all seats
  },
  { new: true }
);

if (!updatedShow) {
  return res.status(409).json({
    success: false,
    message: 'Seat already booked. Please choose other seats.',
  });
}
```

### 2. Atomic Seat Release on Cancellation
When an authenticated patron or administrator cancels an active booking:
1. **Ownership Guard**: Confirms `req.user._id === booking.user` or `req.user.role === 'admin'`.
2. **Idempotency Check**: Rejects re-cancellation of already cancelled reservations (`HTTP 400`).
3. **Atomic Pull Operator**: Uses MongoDB's `$pull` with `$in` to remove the booked seats from the show:
   ```javascript
   await Show.findByIdAndUpdate(booking.show, {
     $pull: { bookedSeats: { $in: booking.seats } },
   });
   booking.paymentStatus = 'cancelled';
   await booking.save();
   ```

---

## 🛡 Security, Authentication & Rate Limiting

1. **Stateless JWT Tokens**: Tokens signed with cryptographically random secrets, stored in client `localStorage`, and validated on protected endpoints.
2. **Password Hashing**: Passwords encrypted using `bcryptjs` (salt rounds: 10) and automatically stripped from JSON serialization via Mongoose's `toJSON()` transform.
3. **Role-Based Access Control**:
   - `protect`: Verifies token signature and attaches user context (`req.user`).
   - `adminOnly`: Restricts administrative routes to users with `role: 'admin'`.
4. **API Rate Limiting** (`backend/middleware/rateLimitMiddleware.js`):
   - `/api/auth/login` & `/api/auth/register`: Throttled to 20 attempts per 15 minutes to prevent brute-force attacks.
   - `/api/bookings`: Throttled to 30 requests per 15 minutes to prevent automated ticket hoarding.
   - Global `/api`: General abuse limiter allowing 250 requests per 15 minutes.
   - Returns **HTTP 429 Too Many Requests** with standard `Retry-After` headers when exceeded.

---

## 🧪 Automated Testing & Quality Assurance

The backend test suite is written in **Jest** and verifies core business constraints, concurrency guards, and edge cases:

```bash
cd backend
npm test
```

### Verified Test Results (11 Passed, 0 Failed, 100% Pass Rate):
```text
PASS tests/booking_logic.test.js
  Seat Booking Concurrency & Duplicate Prevention Unit Test
    ✓ should return 409 Conflict when seats are already booked
    ✓ should reject booking when seat limit exceeds 8 seats
    Booking Cancellation & Seat Release
      ✓ should successfully cancel a booking and release seats back to the show
      ✓ regression: should use valid $in operator and avoid MongoServerError: unknown top level operator: $each
      ✓ should block a user from cancelling another user booking
      ✓ should reject cancelling an already cancelled booking
    Rate Limiter Middleware
      ✓ should allow requests within limit and throttle when limit exceeded

PASS tests/theater.test.js
  Theater Management Unit Tests (SkillWallet Add Theater Requirement)
    ✓ should list all active theaters
    ✓ should create a new theater with pricing tiers
    ✓ should reject theater creation when name or location is missing
    ✓ should delete a theater

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
```

### Production Build Health:
```bash
cd frontend && npm run build
# vite v6.4.5 built in ~570ms with 0 compilation or syntax errors
```

---

## 📚 Documentation & Deliverables Directory

All comprehensive academic and technical deliverables required by the **SkillWallet Capstone Specification** are maintained in the [`docs/`](docs/) directory:

| Deliverable Name | File Link | Description |
|---|---|---|
| **Capstone Final Report** | [`docs/capstone-report/FINAL_PROJECT_REPORT.md`](docs/capstone-report/FINAL_PROJECT_REPORT.md) | Official 19-task comprehensive capstone project submission report. |
| **Traditional Chen ER Diagram** | [`docs/architecture/er-diagram.md`](docs/architecture/er-diagram.md) | Full entity specifications, relationships, cardinalities, and schema tables. |
| **Vector ER Diagram Asset** | [`docs/architecture/er-diagram.svg`](docs/architecture/er-diagram.svg) | High-resolution Chen-style vector diagram (rectangles, diamonds, ovals). |
| **Technical Architecture** | [`docs/architecture/technical-architecture.md`](docs/architecture/technical-architecture.md) | Three-tier cloud topology, sequence diagrams, and environment isolation. |
| **User Flow Diagrams** | [`docs/architecture/user-flow.md`](docs/architecture/user-flow.md) | Mermaid state and sequence diagrams for customer and admin journeys. |
| **MVC Pattern Explanation** | [`docs/architecture/mvc-pattern.md`](docs/architecture/mvc-pattern.md) | In-depth breakdown of Model-View-Controller separation in the MERN stack. |
| **Roles & Responsibilities** | [`docs/architecture/roles-and-responsibilities.md`](docs/architecture/roles-and-responsibilities.md) | RBAC matrix for Guest, Customer, and Administrator roles. |
| **Backend Architecture** | [`docs/backend/backend-explanation.md`](docs/backend/backend-explanation.md) | Express pipeline, controllers, rate limiting, and database indexes. |
| **Frontend Architecture** | [`docs/frontend/frontend-explanation.md`](docs/frontend/frontend-explanation.md) | React component hierarchy, state management, and design tokens. |
| **Feature Requirements** | [`docs/features/feature-requirements.md`](docs/features/feature-requirements.md) | Functional specifications and traceability matrix. |
| **Output Screenshots Guide** | [`docs/screenshots/SCREENSHOT_CHECKLIST.md`](docs/screenshots/SCREENSHOT_CHECKLIST.md) | Capture checklist and specifications for the 9 required screens. |
| **Output Screenshots Folder** | [`docs/screenshots/`](docs/screenshots/) | Directory containing all 9 captured high-resolution PNG screens. |
| **Demo Video Walkthrough Guide** | [`docs/demo-video/DEMO_VIDEO_GUIDE.md`](docs/demo-video/DEMO_VIDEO_GUIDE.md) | 3–5 minute timed presentation script, walkthrough flow, and checklist. |

---

## 🌐 Production Deployment Topology

The application is deployed across cloud infrastructure:
- **Frontend SPA**: Hosted on **Vercel** with global edge CDN distribution and automatic SSL.
- **Backend API**: Hosted as a web service on **Render** running Node.js in production mode (`NODE_ENV=production`).
- **Database Cluster**: Hosted on **MongoDB Atlas** utilizing a managed multi-node replica set with TLS encryption.

---

## 📄 License
This project is licensed under the **ISC License**. Developed for the IMovies Cinema Booking Platform.
