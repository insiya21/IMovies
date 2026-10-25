# Model-View-Controller (MVC) Architectural Pattern

This document provides a comprehensive explanation of how the **Model-View-Controller (MVC)** architectural pattern is implemented within the **IMovies** full-stack MERN application.

---

## 1. Architectural Overview

The MVC design pattern enforces a clean separation of concerns between data representation (**Model**), presentation logic (**View**), and request orchestration (**Controller**). In a decoupled MERN stack application, the traditional server-rendered View is replaced by a client-side Single Page Application (SPA), while Express and Mongoose serve as the Controller and Model tiers.

```mermaid
flowchart LR
    subgraph ViewLayer["View (React SPA Frontend)"]
        ReactViews["React Pages & Components<br>• HomePage.jsx<br>• SeatBookingPage.jsx<br>• AdminDashboardPage.jsx"]
        AxiosClient["Axios HTTP Service (api.js)<br>• Sends HTTP requests<br>• Renders JSON state into DOM"]
        ReactViews <--> AxiosClient
    end

    subgraph ControllerLayer["Controller & Routing (Express Backend)"]
        Routers["Express Routers (routes/)<br>• authRoutes.js<br>• movieRoutes.js<br>• showRoutes.js<br>• bookingRoutes.js"]
        Middleware["Middlewares (middleware/)<br>• authMiddleware (JWT)<br>• errorMiddleware (404/500)"]
        Controllers["Express Controllers (controllers/)<br>• authController.js<br>• movieController.js<br>• showController.js<br>• bookingController.js"]
        Routers --> Middleware --> Controllers
    end

    subgraph ModelLayer["Model (Mongoose ODM & Database)"]
        MongooseModels["Mongoose Schemas (models/)<br>• User.js<br>• Movie.js<br>• Show.js<br>• Booking.js"]
        MongoDB["MongoDB Atlas Database<br>• Collections & Indexes"]
        MongooseModels <--> MongoDB
    end

    AxiosClient -->|1. HTTP Request (GET/POST/PUT/DELETE)| Routers
    Controllers -->|2. Queries / Business Logic| MongooseModels
    MongooseModels -->|3. Query Results / Documents| Controllers
    Controllers -->|4. Standardized JSON Response| AxiosClient
```

---

## 2. Layer-by-Layer Breakdown

### 2.1 The Model Layer (`backend/models/`)
The Model layer represents the business data, entity relationships, validation rules, and database schema definitions. In IMovies, Mongoose acts as the Object Data Modeling (ODM) layer on top of MongoDB:

- **`User.js`**: Defines the user schema with email uniqueness, format regex, role enumeration (`['user', 'admin']`), and lifecycle hooks:
  - `pre('save')`: Automatically salts and hashes plaintext passwords using `bcryptjs`.
  - `matchPassword()`: Encapsulates credential comparison logic.
  - `toJSON()`: Strips the password hash before JSON serialization.
- **`Movie.js`**: Enforces required movie properties (title, duration, genres, poster URL) and configures full-text compound indexing on `{ title: 'text', description: 'text' }`.
- **`Show.js`**: Enforces relational integrity to `Movie` via `mongoose.Schema.Types.ObjectId`, manages tiered pricing, and tracks `bookedSeats` arrays.
- **`Booking.js`**: Manages customer reservations with references to `User`, `Show`, and `Movie`, calculating subtotals and assigning unique alphanumeric booking references.

---

### 2.2 The Controller Layer (`backend/controllers/`)
Controllers handle application business logic, incoming request validation, error propagation, and response formatting:

- **`authController.js`**:
  - `registerUser`: Validates user inputs, checks for duplicate emails, creates the `User` document, and signs a JWT.
  - `loginUser`: Verifies email and password using `matchPassword()`, returning the signed token upon validation.
  - `getCurrentUser`: Retrieves authenticated profile data from `req.user`.
- **`movieController.js`**:
  - `getMovies`: Parses query parameters for search terms and genre filters, executing filtered database queries.
  - `createMovie`, `updateMovie`, `deleteMovie`: Admin actions managing catalog persistence.
  - `getDistinctGenres`: Runs distinct aggregation for dynamic frontend filtering chips.
- **`showController.js`**:
  - `getShowsByMovie`: Retrieves scheduled showtimes grouped by movie and calendar date.
  - `createShow`, `deleteShow`: Administrative schedule orchestration.
- **`bookingController.js`**:
  - `createBooking`: Enforces atomic reservation via MongoDB conditional updates (`$nin` on `bookedSeats` and `$push`), computes tier pricing, and generates unique ticket references.
  - `getMyBookings`, `getBookingById`, `getAllBookings`, `getAdminStats`: Orchestrates reservation retrieval and aggregation metrics.

---

### 2.3 The Router & Middleware Layer (`backend/routes/` & `backend/middleware/`)
Acts as the entry dispatcher matching HTTP endpoints to controller logic:

- **Routing Dispatch**:
  - `authRoutes.js` mounts `/api/auth`
  - `movieRoutes.js` mounts `/api/movies`
  - `showRoutes.js` mounts `/api/shows`
  - `bookingRoutes.js` mounts `/api/bookings`
- **Cross-Cutting Middlewares**:
  - `authMiddleware.js`: Intercepts protected requests, verifies the Bearer JWT token, and attaches the authenticated user record to `req.user`.
  - `adminOnly`: Inspects `req.user.role === 'admin'`, returning HTTP 403 Forbidden if unauthorized.
  - `errorMiddleware.js`: Provides standardized 404 handler for unknown routes and centralized error handler converting runtime exceptions into consistent JSON error responses.

---

### 2.4 The View Layer (`frontend/src/`)
In the modern MERN architecture, the View layer runs inside the client browser as a React Single Page Application:

- **Reactive State Rendering**: Pages (`HomePage.jsx`, `MovieDetailsPage.jsx`, `SeatBookingPage.jsx`) consume data delivered by the Controller layer as JSON and dynamically construct the DOM.
- **Component Modularity**: UI widgets (`MovieCard.jsx`, `SeatLayout.jsx`, `DigitalTicket.jsx`) encapsulate visual presentation and micro-interactions.
- **Client Service Layer (`services/api.js`)**: Encapsulates all Axios HTTP calls, isolating network transport from visual component logic.
- **Global Context (`context/AuthContext.jsx`)**: Synchronizes authentication state (user profile and JWT token) across disparate View components.

---

## 3. End-to-End Request Lifecycle Example

The following sequence illustrates how a user request traverses the MVC layers during a movie search:

1. **User Input (View)**: The customer types `"Dune"` into the search bar on `HomePage.jsx`.
2. **HTTP Dispatch (View $\rightarrow$ Router)**: Axios issues `GET /api/movies?search=Dune`.
3. **Route Resolution (Router)**: `backend/routes/movieRoutes.js` matches `GET /` and routes the request to `movieController.getMovies`.
4. **Business Logic (Controller)**: `movieController.js` extracts `req.query.search`, constructs a regex/text search query `{ $or: [{ title: ... }, { description: ... }] }`.
5. **Data Access (Model)**: Mongoose executes the query against the `Movie` collection in MongoDB Atlas.
6. **Data Return (Model $\rightarrow$ Controller)**: MongoDB returns matching movie documents to the controller.
7. **Response Serialization (Controller $\rightarrow$ View)**: The controller responds with `res.status(200).json({ success: true, count: 1, data: [ ... ] })`.
8. **DOM Update (View)**: React updates the local component state, re-rendering the movie cards grid with the matched film.
