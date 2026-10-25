# User Flow & Interaction Lifecycle

This document maps the user journeys, state transitions, authentication gates, and operational flows across the **IMovies** platform for guests, registered customers, and administrators.

---

## 1. Comprehensive User Journey Flowchart

```mermaid
flowchart TD
    Start([User Visits IMovies]) --> LandingPage[Home Page / Landing Page]

    %% Discovery
    LandingPage --> BrowseCatalog[Browse Movie Cards & Hero Spotlight]
    BrowseCatalog --> SearchFilter{Search or Filter?}
    SearchFilter -->|Filter by Genre| UpdatePills[Click Genre Pill e.g. Action, Sci-Fi]
    SearchFilter -->|Search by Title| SearchInput[Type in Title Filter Field]
    SearchFilter -->|None| SelectMovie[Click Movie Poster / 'Book' Button]
    UpdatePills --> SelectMovie
    SearchInput --> SelectMovie

    %% Movie Details
    SelectMovie --> MovieDetails[Movie Details Page /movie/:id]
    MovieDetails --> WatchTrailer{Watch Trailer?}
    WatchTrailer -->|Yes| TrailerModal[Watch YouTube Modal Preview]
    WatchTrailer -->|No| SelectDate[Choose Screening Date: Today / Tomorrow / Upcoming]
    TrailerModal --> SelectDate
    SelectDate --> SelectFormat[Select Screen Format & Showtime e.g. IMAX 14:30]

    %% Auth Check on Seat Booking
    SelectFormat --> SeatBookingPage[Interactive Seat Selection Page /booking/seats/:showId]
    SeatBookingPage --> InteractiveSeats[Select 1 to 8 Available Seats]
    InteractiveSeats --> CheckAuth{Is User Authenticated?}

    %% Unauthenticated Path
    CheckAuth -->|No| PromptAuth[Click 'Sign In to Reserve Seats']
    PromptAuth --> LoginPage[Login Page /login]
    LoginPage --> RegisterChoice{Have an Account?}
    RegisterChoice -->|No| RegisterPage[Register Page /register]
    RegisterPage -->|Submit Valid Data| AutoLogin[Account Created & JWT Stored]
    RegisterChoice -->|Yes| SubmitLogin[Enter Credentials / Use Demo Account]
    SubmitLogin --> AutoLogin
    AutoLogin --> ReturnToBooking[Redirect back to /booking/seats/:showId]
    ReturnToBooking --> InteractiveSeats

    %% Authenticated Path
    CheckAuth -->|Yes| ReviewOrder[Review Order Summary & Tier Pricing Breakdown]
    ReviewOrder --> ClickProceed[Click 'Proceed to Payment']
    ClickProceed --> DemoPaymentModal[Open Simulated Payment Gateway Modal]
    DemoPaymentModal --> FillCardDetails[Enter Simulated Card & CVV]
    FillCardDetails --> SubmitPayment[Click 'Pay Now']

    %% Concurrency & Booking
    SubmitPayment --> APICall[POST /api/bookings with Atomic Filter]
    APICall --> ConcurrencyCheck{Seat Still Available?}
    ConcurrencyCheck -->|No - 409 Conflict| ErrorToast[Display Conflict Toast: 'Seat already booked']
    ErrorToast --> RefreshSeatMap[Seat Map Refreshed, Pick Alternative Seat]
    RefreshSeatMap --> InteractiveSeats
    ConcurrencyCheck -->|Yes - 201 Created| TicketConfirmation[Redirect to /booking/confirmation/:id]

    %% Ticket & History
    TicketConfirmation --> ViewDigitalTicket[View Digital Ticket with Reference Code & Barcode]
    ViewDigitalTicket --> PrintOption[One-Click Print / Save PDF]
    ViewDigitalTicket --> MyBookings[Navigate to My Bookings Page]
    MyBookings --> BookingList[View History of All Reserved Screenings]

    %% Admin Path
    LoginPage --> RoleCheck{User Role?}
    RoleCheck -->|Admin| AdminPortal[Admin Dashboard /admin]
    AdminPortal --> AdminTabs{Admin Action}
    AdminTabs -->|Metrics| ViewStats[View Movies, Shows, Bookings, Revenue Counters]
    AdminTabs -->|Manage Movies| MovieCRUD[Add Movie Modal / Edit / Delete]
    AdminTabs -->|Manage Shows| ShowCRUD[Schedule New Showtime Modal / Delete]
    AdminTabs -->|Reservations| AllBookingsTable[Inspect All Customer Reservations]
```

---

## 2. Persona-Specific Interaction Flows

### 2.1 Guest (Unauthenticated Visitor) Flow
1. **Landing & Exploration**:
   - Lands on `HomePage.jsx` (`/`).
   - Views the Hero Spotlight showcasing trending movies with synopsis and duration.
   - Filters the movie grid using compact genre chips (All, Action, Sci-Fi, Drama) or title search.
2. **Movie Inspection**:
   - Clicks on a movie card to open `MovieDetailsPage.jsx` (`/movie/:id`).
   - Reviews cast, director, synopsis, and rating.
   - Clicks **Watch Trailer** to launch the embedded YouTube modal preview.
3. **Showtime Selection**:
   - Selects a target calendar date (Today, Tomorrow, or subsequent dates).
   - Reviews available screen formats (**IMAX Laser 3D**, **Dolby Cinema Atmos**, **4DX**, **Digital Standard**) and clicks a time slot.
4. **Authentication Gate**:
   - On the interactive seat layout (`SeatBookingPage.jsx`), guest can explore available seats.
   - When attempting to book, the interface prompts the guest to **Sign In** or **Register**.
   - After authenticating, the user is redirected back to complete the booking.

---

### 2.2 Customer (Authenticated User) Booking Lifecycle
1. **Interactive Seating Chart**:
   - Views the cinema projection screen banner.
   - Interactive seats color-coded by state:
     - **Available** (Dark slate blue outline)
     - **Selected** (Active coral-red highlight)
     - **Booked** (Dark muted grey, non-clickable)
   - Visual tiers:
     - **Silver Tier** (Rows A–B): $10.00
     - **Gold Tier** (Rows C–D): $15.00
     - **Platinum VIP Tier** (Rows E–F): $22.00
2. **Order Summary Calculation**:
   - Dynamic real-time calculation of subtotal based on selected tiers.
   - Enforces a maximum limit of **8 seats per transaction**.
   - Standard administrative convenience fee added ($2.50).
3. **Simulated Payment Sandbox**:
   - Clicking **"Proceed to Payment"** opens the demo payment modal.
   - User inputs test card details (no actual monetary charge).
   - Displays sandbox badge: *"Simulated payment gateway. No real transaction will occur."*
4. **Atomic Booking & Digital Ticket Issuance**:
   - Submits `POST /api/bookings`.
   - On success (HTTP 201), redirects to `BookingConfirmationPage.jsx`.
   - Renders `DigitalTicket.jsx` featuring:
     - Unique alphanumeric Reference ID (`IM-XXXXXX`).
     - Movie title, auditorium, screening date, and time.
     - Booked seat numbers and total amount paid.
     - Simulated barcode and one-click print function.
5. **Booking History**:
   - User can navigate to `MyBookingsPage.jsx` (`/my-bookings`) at any time to inspect past tickets and reopen digital ticket modals.

---

### 2.3 Administrator Management Flow
1. **Admin Access**:
   - Authenticated users with `role: 'admin'` access `AdminDashboardPage.jsx` (`/admin`).
   - Unauthenticated or regular users are blocked by `AdminRoute.jsx` and redirected to `/`.
2. **Key Performance Indicators (KPIs)**:
   - Real-time stat cards displaying Total Movies, Active Shows, Total Bookings, and Total Demo Revenue.
3. **Movie Catalog Management**:
   - **Add Movie**: Launches modal to enter title, description, poster URL, banner URL, trailer URL, genres, duration, rating, director, and cast.
   - **Edit Movie**: Updates existing movie metadata in place.
   - **Delete Movie**: Deletes movie from catalog and cleans up associated show schedules.
4. **Showtime Scheduling**:
   - Selects movie from dropdown.
   - Selects screen type (`Standard`, `IMAX`, `4DX`, `VIP`) and enters auditorium name.
   - Configures show date (`YYYY-MM-DD`), show time (`HH:MM`), and custom tiered ticket prices (`silver`, `gold`, `platinum`).
   - Schedules the screening to immediately appear in customer discovery.
5. **Reservations Oversight**:
   - Monitors a live table of all customer bookings displaying reference codes, movie titles, customer names, seat numbers, total amounts, and booking timestamps.
