# SkillWallet Demo Video Walkthrough Guide (3–5 Minutes)

This document provides a structured recording script, timeline, and presentation checklist for the **Demo Video** required on **Page 26** of the official SkillWallet IMovies Capstone PDF.

---

## 1. Video Specifications

- **Target Duration**: 3 to 5 minutes
- **Recommended Resolution**: 1080p (1920x1080) or 720p (1280x720)
- **Audio**: Clear microphone voiceover explaining the features
- **Hosting Options**: Loom, YouTube (Unlisted), Google Drive (Public Link), or MP4 file submission
- **Primary Objective**: Demonstrate that all 19 SkillWallet tasks, required user journeys, admin capabilities, and safety controls operate seamlessly.

---

## 2. Timed Presentation Script & Walkthrough

### Part 1: Project Introduction & Architecture (0:00 – 0:35)
- **Action**: Open the browser on `http://localhost:5173/` or your production Vercel URL.
- **Voiceover**: 
  > *"Hello, this is my final capstone submission for IMovies — a modern full-stack MERN cinema ticket booking platform. The frontend is built with React 18, Vite, and Bootstrap 5, communicating with an Express.js and Node.js REST API, backed by MongoDB Atlas. The application is architected using the MVC pattern and deployed on Vercel and Render."*

### Part 2: Movie Discovery & Search (0:35 – 1:10)
- **Action**: 
  1. Highlight the Hero Spotlight banner and click **"Watch Trailer"** to show the embedded YouTube modal.
  2. Type a title in the search box (e.g. *"Dune"* or *"Oppenheimer"*).
  3. Click genre pills (*Action*, *Sci-Fi*, *Drama*) showing dynamic filtering and responsive compact cards.
- **Voiceover**: 
  > *"On the home discovery page, visitors can preview trending movies with trailer previews. The catalog supports real-time text search and dynamic genre pills that wrap cleanly across devices. Each movie card displays 2:3 aspect-ratio posters, IMDb-style rating badges, and runtime."*

### Part 3: Showtimes & Interactive Seat Selection (1:10 – 2:00)
- **Action**:
  1. Click on a movie to open the Movie Details page (`/movie/:id`).
  2. Switch between calendar date tabs (*Today*, *Tomorrow*).
  3. Click a screening format (*IMAX Laser 3D* at *18:00*).
  4. On the seat layout page, point out the curved screen banner.
  5. Select 2 or 3 seats across different tiers (Silver, Gold, Platinum).
- **Voiceover**:
  > *"Selecting a movie reveals synopsis, cast, and screening schedules grouped by format technologies such as IMAX and Dolby Atmos. The interactive seating chart simulates a 60-seat auditorium facing a curved screen. It enforces tiered pricing: Silver front rows, Gold middle rows, and Platinum VIP recliners, dynamically calculating the order total with maximum 8-ticket limit enforcement."*

### Part 4: Checkout, Simulated Payment & Digital Ticket (2:00 – 2:45)
- **Action**:
  1. Click **"Proceed to Payment"** to launch the Demo Payment Modal.
  2. Enter simulated test card credentials and click **"Pay Now"**.
  3. On confirmation, display the perforated Digital Ticket (`DigitalTicket.jsx`).
  4. Show the unique Reference Code (`IM-XXXXXX`), barcode, and print button.
- **Voiceover**:
  > *"When the patron confirms the reservation, a simulated sandbox payment gateway processes the order. Our backend performs an atomic conditional update using MongoDB's $nin operator to prevent race conditions or duplicate seat bookings. Once confirmed, an aesthetic digital ticket is issued with a unique reference code, barcode, and one-click print capability."*

### Part 5: User History & Booking Cancellation (2:45 – 3:30)
- **Action**:
  1. Navigate to **"My Bookings"** (`/my-bookings` or `/orders`).
  2. Show the active reservation card.
  3. Click the **"Cancel"** button and confirm cancellation in the modal.
  4. Show that the status badge updates to **"Cancelled"** in red and seats are released.
- **Voiceover**:
  > *"In the My Bookings portal, patrons can inspect ticket history. We also implemented a safe ticket cancellation workflow: clicking cancel invokes our backend endpoint which verifies ownership, marks the booking as cancelled, and atomically pulls the reserved seats back into availability for other patrons."*

### Part 6: Administrator Management Portal (3:30 – 4:30)
- **Action**:
  1. Switch to the Admin account via the user menu $\rightarrow$ **Admin Dashboard** (`/admin`).
  2. Highlight the 4 KPI metric cards (Total Movies, Active Shows, Total Bookings, Demo Revenue).
  3. Click **"Theaters"** tab to show the cinema theater locations table.
  4. Click **"Add Theater"** to show the modal form (satisfying PDF page 21/25).
  5. Click **"Schedule Show"** and show that the admin can select the newly created theater location.
  6. Click **"Reservations"** to show the customer oversight table.
- **Voiceover**:
  > *"Finally, administrative users access the protected Cinema Management portal. Admins can audit live KPI metrics, manage movie listings, and configure cinema theaters and screen formats via our dedicated Add Theater module. Shows can be scheduled directly linked to theaters with custom pricing tiers, and all customer bookings are monitored in real time."*

### Part 7: Conclusion & Wrap-Up (4:30 – 4:50)
- **Voiceover**:
  > *"This concludes the demonstration of IMovies. All 19 SkillWallet tasks, REST endpoints, database schemas, and client views have been implemented and verified. Thank you!"*

---

## 3. Pre-Recording Checklist

- [ ] Backend server running on `http://localhost:5001`.
- [ ] Frontend Vite server running on `http://localhost:5173`.
- [ ] Database seeded with sample movies, shows, and theaters (`npm run seed`).
- [ ] Both demo accounts verified: `admin@imovies.com` / `admin123` and `user@imovies.com` / `user123`.
- [ ] Browser window sized to 1280px or 1440px wide with audio levels tested.
