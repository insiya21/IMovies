# IMovies — Movie Ticket Booking Made Simple 🎬

A modern, full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) cinema ticket booking web application designed with a sleek cinema dark aesthetic, real-time seat availability tracking, atomic duplicate-booking prevention, role-based authorization, and an administrative management dashboard.

---

## 🌟 Key Features

1. **Movie Discovery & Trending Carousel**:
   - High-definition hero spotlight banner showcasing trending films with trailer previews.
   - Real-time search by movie title and interactive genre filtering pills (Action, Sci-Fi, Drama, etc.).
   - Movie cards with IMDb-style rating badges, runtime, and genre tags.

2. **Movie Details & Showtimes**:
   - Movie backdrop banner, synopsis, director, cast members, and runtime.
   - Multi-day calendar selector (Today, Tomorrow, and upcoming days).
   - Grouped screenings by screen formats: **IMAX Laser 3D**, **Dolby Cinema Atmos**, **4DX Dynamic**, and **Digital Standard**.

3. **Interactive Cinema Seating Chart**:
   - Curved projection screen ("Screen — Eyes This Way").
   - Tiered seating zones with distinct pricing:
     - **Silver** (Front rows)
     - **Gold** (Middle rows)
     - **VIP / Platinum** (Premium back recliners)
   - Real-time visual feedback: Available, Selected, Reserved/Booked.
   - Dynamic order summary calculation (subtotal, convenience fee, and grand total).
   - Maximum limit enforcement (up to 8 seats per booking).

4. **Concurrency-Safe Atomic Booking**:
   - Eliminates race conditions using atomic MongoDB conditional filters (`$nin` on `bookedSeats` with `$push`), preventing duplicate seat bookings if two users attempt to reserve the same seat simultaneously.

5. **Instant Digital Cinema Ticket**:
   - Perforated cinema ticket component with unique alphanumeric Booking Reference ID (`IM-XXXXXX`).
   - Mockup barcode, auditorium name, show date, show time, and booked seat numbers.
   - One-click print/save functionality.

6. **User Account & Booking History**:
   - "My Bookings" page listing all past and upcoming tickets with confirmation badges.
   - Modal viewer to re-open and print digital tickets at any time.

7. **Admin Management Dashboard**:
   - Real-time metric cards: Total Movies, Active Shows, Total Bookings, and Demo Revenue.
   - **Movie Management**: Add new movies, edit descriptions/posters/genres/ratings, and delete movies with confirmation.
   - **Showtimes Management**: Schedule new screenings for any movie, configure dates, times, screen types, and pricing tiers.
   - **Reservations Oversight**: Live table monitoring all customer bookings with seat allocations.

8. **Secure Authentication & Role-Based Access**:
   - User registration and login using JWT (JSON Web Tokens) stored in `localStorage` and sent via Axios request interceptors.
   - Passwords securely hashed with `bcryptjs`.
   - Route guards (`ProtectedRoute` for authenticated users, `AdminRoute` for administrators).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js (Vite), Bootstrap 5, Bootstrap Icons, Axios, React Router v6 |
| **Styling** | Bootstrap 5 + Custom Cinema Dark Theme CSS Variables |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB & Mongoose ODM |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Testing** | Jest, Supertest |

---

## 📂 Project Directory Structure

```
IMovies/
├── backend/
│   ├── config/
│   │   └── db.js                 # Safe MongoDB connection handler with fallback
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile (/me)
│   │   ├── movieController.js    # Movie CRUD, search, genre filtering
│   │   ├── showController.js     # Show scheduling, movie-showtimes, seat status
│   │   └── bookingController.js  # Booking creation, atomic seat validation, history
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization (adminOnly)
│   │   └── errorMiddleware.js    # Centralized error handler and 404 handler
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt password hashing
│   │   ├── Movie.js              # Movie schema with genre indexing
│   │   ├── Show.js               # Show schema with tiered pricing & booked seats
│   │   └── Booking.js            # Booking schema with unique bookingRef
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── movieRoutes.js        # /api/movies
│   │   ├── showRoutes.js         # /api/shows
│   │   └── bookingRoutes.js      # /api/bookings
│   ├── seed/
│   │   └── seedData.js           # Database seeder (movies, shows, demo accounts)
│   ├── tests/
│   │   ├── api.test.js           # Health, 404, validation & JWT guard tests
│   │   └── booking_logic.test.js # Duplicate seat conflict & concurrency test
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express application entrypoint
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, ProtectedRoute, AdminRoute
│   │   │   ├── movies/           # MovieCard, HeroBanner
│   │   │   └── booking/          # SeatLayout, DigitalTicket
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & JWT token management
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── MovieDetailsPage.jsx
│   │   │   ├── SeatBookingPage.jsx
│   │   │   ├── BookingConfirmationPage.jsx
│   │   │   ├── MyBookingsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT request interceptor
│   │   ├── styles/
│   │   │   └── custom.css        # Cinema Dark Theme CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json                  # Root convenience scripts
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; developed on Node `v26.8.1`)
- **MongoDB** running locally on port `27017` or a MongoDB Atlas URI

### 2. Environment Variables Configuration

Copy `.env.example` to `.env` in both `backend` and `frontend`:

```bash
# In backend/
cp backend/.env.example backend/.env

# In frontend/
cp frontend/.env.example frontend/.env
```

Default `backend/.env` values:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/imovies
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Default `frontend/.env` values:
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 4. Seed the Database

Populate initial movies (Dune 2, Oppenheimer, Spider-Man, Interstellar, etc.), scheduled showtimes for the next 5 days, and default demo accounts:

```bash
cd backend && npm run seed
```

> **Seeder Output:**
> - Admin Account: `admin@imovies.com` / `admin123`
> - User Account: `user@imovies.com` / `user123`
> - 6 Featured Movies
> - 60 Scheduled Screenings

### 5. Start the Application

You can start both servers independently:

**Start Backend Server:**
```bash
cd backend
npm run dev
# Server will start on http://localhost:5001
```

**Start Frontend Development Server:**
```bash
cd frontend
npm run dev
# Frontend will start on http://localhost:5173
```

Alternatively, from the project root:
```bash
npm run dev:backend   # Starts backend with live reload
npm run start:frontend # Starts frontend Vite server
```

Open your browser at **http://localhost:5173** to use the application.

---

## 🔐 Demo Credentials

Quick-fill demo buttons are provided directly on the **Sign In** page for convenience:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Administrator** | `admin@imovies.com` | `admin123` | Full access: Add/Edit/Delete movies, schedule showtimes, view all bookings, access Admin Dashboard |
| **Customer / User** | `user@imovies.com` | `user123` | Browse movies, select seats, complete demo bookings, view ticket history in My Bookings |

---

## 🧪 Automated Testing

A test suite built with **Jest** and **Supertest** verifies API health, 404 handling, input validation, JWT token security, role protection, and **atomic duplicate seat booking prevention**:

```bash
cd backend
npm test
```

### Verified Test Cases:
- `GET /api/health`: Confirms online status and database status reporting.
- `404 Handler`: Verifies unknown routes return a standardized JSON error.
- `Auth Validation`: Rejects registration and login with missing fields.
- `JWT Authorization`: Verifies protected routes reject requests without a Bearer token or with malformed tokens.
- `Concurrency / Seat Conflict`: Tests atomic conditional seat reservation, ensuring that if any requested seat is already booked, the system returns **HTTP 409 Conflict** with the conflicted seat list.
- `Ticket Limit`: Enforces maximum 8 seats limit per booking.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login with email and password, returns JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |

### Movies (`/api/movies`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/movies` | Public | List movies (supports `?search=` and `?genre=` query params) |
| `GET` | `/api/movies/genres` | Public | List all distinct movie genres |
| `GET` | `/api/movies/:id` | Public | Get single movie details by ID |
| `POST` | `/api/movies` | Admin | Create a new movie |
| `PUT` | `/api/movies/:id` | Admin | Update existing movie |
| `DELETE`| `/api/movies/:id` | Admin | Delete movie and its scheduled shows |

### Shows & Schedules (`/api/shows`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/shows/movie/:movieId` | Public | Get scheduled shows for a movie (supports `?date=YYYY-MM-DD`) |
| `GET` | `/api/shows/:id` | Public | Get single show details and booked seats array |
| `GET` | `/api/shows` | Admin | Get all scheduled shows across all movies |
| `POST` | `/api/shows` | Admin | Schedule a new show |
| `DELETE`| `/api/shows/:id` | Admin | Delete a scheduled show |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Private | Create a booking with atomic duplicate seat prevention |
| `GET` | `/api/bookings/my-bookings` | Private | Get booking history for authenticated user |
| `GET` | `/api/bookings/:id` | Private | Get single booking confirmation / digital ticket |
| `GET` | `/api/bookings` | Admin | View all customer reservations |
| `GET` | `/api/bookings/stats` | Admin | Get summary statistics (movies, shows, bookings, revenue) |

---

## 🚀 Production Build & Deployment Guidelines

1. **Frontend Production Build**:
   ```bash
   cd frontend
   npm run build
   ```
   The compiled static files are generated in `frontend/dist/`.

2. **Serve in Production**:
   You can serve the static frontend bundle from your Express backend using `express.static` or host the frontend on Vercel / Netlify and the backend on Render / Railway / AWS.

3. **Security Checklist for Production**:
   - Change `JWT_SECRET` in `backend/.env` to a strong random 256-bit secret.
   - Configure a managed MongoDB cluster URI (e.g. MongoDB Atlas) in `MONGODB_URI`.
   - Set `NODE_ENV=production`.
   - Update `CLIENT_URL` in `backend/.env` to the domain of your frontend.

---

## 📄 License
ISC License — Created for the IMovies Cinema Booking Platform.
