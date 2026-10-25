# Roles and Responsibilities (RBAC) Architecture

This document defines the user personas, Role-Based Access Control (RBAC) permissions matrix, and technical security implementation for the **IMovies** platform.

---

## 1. User Personas

The system recognizes three distinct operational personas:

### 1.1 Guest (Unauthenticated Visitor)
- An anonymous visitor browsing the cinema portal without an active session.
- Capable of discovering movies, watching video trailers, exploring screening schedules, and previewing the interactive seat chart.
- Blocked from completing reservations, viewing ticket histories, or accessing administrative controls.

### 1.2 Customer (Authenticated User)
- A registered patron with verified credentials who holds a valid JSON Web Token (JWT) with `role: 'user'`.
- Permitted to reserve up to 8 seats per booking, execute sandbox payments, obtain digital tickets with unique reference IDs, and view personal booking records under "My Bookings".
- Denied access to administrative oversight or catalog modification routes.

### 1.3 Administrator
- An authorized staff member or cinema manager holding a valid JWT with `role: 'admin'`.
- Inherits all customer browsing and ticket capabilities.
- Granted privileged access to the `/admin` portal for catalog curation (Add/Edit/Delete movies), screening schedule creation, live customer reservation auditing, and revenue analytics.

---

## 2. Role-Based Permissions Matrix

| Functional Capability | Guest | Customer (`user`) | Administrator (`admin`) | Guarding Layer |
|---|:---:|:---:|:---:|---|
| **Browse Movie Catalog** | ✅ Allowed | ✅ Allowed | ✅ Allowed | Public Endpoint (`GET /api/movies`) |
| **Search by Title & Filter Genres** | ✅ Allowed | ✅ Allowed | ✅ Allowed | Public Endpoint (`GET /api/movies`) |
| **View Movie Details & Cast** | ✅ Allowed | ✅ Allowed | ✅ Allowed | Public Endpoint (`GET /api/movies/:id`) |
| **Watch Trailer Video Modal** | ✅ Allowed | ✅ Allowed | ✅ Allowed | Client Component (`HeroBanner` / `MovieDetailsPage`) |
| **View Showtimes by Date** | ✅ Allowed | ✅ Allowed | ✅ Allowed | Public Endpoint (`GET /api/shows/movie/:id`) |
| **Preview Seat Availability Chart** | ✅ Allowed | ✅ Allowed | ✅ Allowed | Public Endpoint (`GET /api/shows/:id`) |
| **Reserve Seats & Checkout** | ❌ Blocked | ✅ Allowed | ✅ Allowed | `protect` Middleware (`POST /api/bookings`) |
| **Receive Digital Cinema Ticket** | ❌ Blocked | ✅ Allowed | ✅ Allowed | `protect` Middleware (`GET /api/bookings/:id`) |
| **Access "My Bookings" History** | ❌ Blocked | ✅ Allowed | ✅ Allowed | `ProtectedRoute` + `protect` (`GET /api/bookings/my-bookings`) |
| **Access Admin Dashboard (`/admin`)** | ❌ Blocked | ❌ Blocked | ✅ Allowed | `AdminRoute` + `adminOnly` Middleware |
| **Add New Movie to Catalog** | ❌ Blocked | ❌ Blocked | ✅ Allowed | `adminOnly` Middleware (`POST /api/movies`) |
| **Edit Existing Movie** | ❌ Blocked | ❌ Blocked | ✅ Allowed | `adminOnly` Middleware (`PUT /api/movies/:id`) |
| **Delete Movie & Cascade Shows** | ❌ Blocked | ❌ Blocked | ✅ Allowed | `adminOnly` Middleware (`DELETE /api/movies/:id`) |
| **Schedule New Showtime** | ❌ Blocked | ❌ Blocked | ✅ Allowed | `adminOnly` Middleware (`POST /api/shows`) |
| **Delete Scheduled Showtime** | ❌ Blocked | ❌ Blocked | ✅ Allowed | `adminOnly` Middleware (`DELETE /api/shows/:id`) |
| **View All Customer Bookings** | ❌ Blocked | ❌ Blocked | ✅ Allowed | `adminOnly` Middleware (`GET /api/bookings`) |
| **View Summary Revenue Metrics** | ❌ Blocked | ❌ Blocked | ✅ Allowed | `adminOnly` Middleware (`GET /api/bookings/stats`) |

---

## 3. Technical RBAC Implementation

### 3.1 Data Model Specification (`backend/models/User.js`)
Role definitions are strictly constrained at the schema level using Mongoose enumerations:

```javascript
role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user',
}
```

### 3.2 Token Generation & Claims (`backend/controllers/authController.js`)
Upon successful login or registration, the server issues a signed JWT containing the user ID and assigned role claim:

```javascript
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};
```

### 3.3 Backend Route Interception (`backend/middleware/authMiddleware.js`)
Two composable middlewares enforce role security on incoming REST calls:

1. **`protect` Middleware**:
   - Extracts the HTTP `Authorization: Bearer <token>` header.
   - Decodes and verifies the token signature against `JWT_SECRET`.
   - Fetches the user record from the database and attaches it to `req.user`.
   - Returns HTTP 401 Unauthorized if missing, expired, or tampered with.

2. **`adminOnly` Middleware**:
   - Executes after `protect`.
   - Inspects `req.user.role === 'admin'`.
   - Returns HTTP 403 Forbidden with an explicit access rejection message if the user lacks administrative clearance.

```javascript
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required',
    });
  }
};
```

### 3.4 Frontend Route Guards (`frontend/src/components/common/`)
The client UI reinforces RBAC at the routing level before network requests are dispatched:

1. **`ProtectedRoute.jsx`**:
   - Intercepts routes requiring authentication (`/my-bookings`, `/booking/seats/:showId`).
   - Checks `isAuthenticated` from `AuthContext`.
   - Renders child route if logged in; redirects to `/login` with return state if unauthenticated.

2. **`AdminRoute.jsx`**:
   - Protects the `/admin` path.
   - Validates both `isAuthenticated` and `isAdmin` (`user.role === 'admin'`).
   - Redirects unauthorized users to the home page (`/`).

---

## 4. Default Seeded Demonstration Credentials

For testing and grading convenience, default accounts are populated via `backend/seed/seedData.js`:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Administrator** | `admin@imovies.com` | `admin123` | Full administrative control, catalog CRUD, scheduling, metrics, and customer reservations oversight |
| **Customer** | `user@imovies.com` | `user123` | Standard customer ticket booking, seat reservation, order review, and personal booking history |
