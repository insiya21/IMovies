# SkillWallet Output Screenshots Guide & Checklist

This document details the exact requirements, target views, URLs, and capture procedures for all **9 required output screenshots** specified on **Page 25** of the official SkillWallet IMovies Capstone PDF.

---

## 1. Required Screenshots Checklist

| # | Required Screenshot Name (PDF Page 25) | Route / View | User Role | Description / Key Elements to Capture |
|---|---|---|---|---|
| **1** | **LandingPage:** | `http://localhost:5173/` | Guest / Any | Hero banner with movie spotlight, genre filter pills, and compact movie cards grid. |
| **2** | **Register page:** | `http://localhost:5173/register` | Guest | User registration form showing Name, Email, Password inputs, and Sign In link. |
| **3** | **Login page:** | `http://localhost:5173/login` | Guest | User login form showing Email, Password, Quick-fill Demo buttons (Admin/User), and Register link. |
| **4** | **Admin Dashboard:** | `http://localhost:5173/admin` | Administrator | Admin portal top bar, KPI metric cards (Total Movies, Shows, Theaters, Bookings, Revenue), and navigation tabs. |
| **5** | **Admin Add Movie:** | `http://localhost:5173/admin` (Click *"Add Movie"*) | Administrator | Modal form displaying Movie Title, Rating, Synopsis, Poster URL, Banner URL, Trailer URL, Genres, Duration, Cast. |
| **6** | **AddShow:** | `http://localhost:5173/admin` (Click *"Schedule Show"*) | Administrator | Modal form displaying Select Movie, Select Theater Location, Screen Name, Format, Date, Time, and Tier Pricing. |
| **7** | **Add Theater:** | `http://localhost:5173/admin` (Click *"Add Theater"*) | Administrator | Modal form displaying Theater Name, Location, Screen Format, Lower/Middle/Balcony Pricing, and Capacity. |
| **8** | **UserProducts:** | `http://localhost:5173/products` or `/movie/:id` | Guest / User | Movie Details view displaying backdrop banner, synopsis, cast, multi-day calendar tabs, format grouping, and showtimes. |
| **9** | **User Orders:** | `http://localhost:5173/orders` (or `/my-bookings`) | Customer | Customer booking history cards with Reference IDs, confirmed/cancelled badges, seat numbers, "View Ticket", and "Cancel" buttons. |

---

## 2. Step-by-Step Local Capture Instructions

To capture crisp, authentic screenshots for your project submission:

### Step 1: Start the Local Development Servers
In two separate terminal windows or split terminals:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
# Running on http://localhost:5001
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

### Step 2: Ensure Sample Data is Populated
If running on a fresh local database:
```bash
cd backend
npm run seed
```
> **Seeded Credentials**:
> - Admin: `admin@imovies.com` / `admin123`
> - User: `user@imovies.com` / `user123`

### Step 3: Capture High-Resolution Screenshots
Use a standard browser viewport width of **1280px or 1440px** for consistent presentation.

1. **`01_LandingPage.png`**:
   - Navigate to `http://localhost:5173/`.
   - Capture full desktop view showing the navigation bar, hero spotlight, genre pills, and the top rows of movie cards.
2. **`02_RegisterPage.png`**:
   - Navigate to `http://localhost:5173/register`.
   - Capture the centered registration card.
3. **`03_LoginPage.png`**:
   - Navigate to `http://localhost:5173/login`.
   - Capture the login card highlighting the Quick-fill Demo buttons.
4. **`04_AdminDashboard.png`**:
   - Log in using `admin@imovies.com` / `admin123` and navigate to `http://localhost:5173/admin`.
   - Capture the 4 KPI stat counters and the tab navigation.
5. **`05_AdminAddMovie.png`**:
   - On the Admin Dashboard, click the primary **"+ Add Movie"** button.
   - Capture the opened modal with sample movie fields filled.
6. **`06_AddShow.png`**:
   - Click the **"Schedule Show"** button.
   - Capture the opened modal displaying theater selection, date, time, and pricing tiers.
7. **`07_AddTheater.png`**:
   - Click the **"Add Theater"** button.
   - Capture the opened modal displaying theater name, location, screen formats, and tiered pricing.
8. **`08_UserProducts.png`**:
   - Click any movie from the home page (e.g. *Dune: Part Two*) to open `http://localhost:5173/movie/:id`.
   - Capture the movie backdrop, cast list, calendar date tabs, and showtime format buttons.
9. **`09_UserOrders.png`**:
   - Log in as `user@imovies.com` / `user123` and open `http://localhost:5173/orders`.
   - Capture the bookings list displaying confirmed status badges, reference IDs, and ticket action buttons.

---

## 3. Submission Organization

Save the 9 captured PNG files in a dedicated `docs/screenshots/` folder:
```
docs/screenshots/
├── 01_LandingPage.png
├── 02_RegisterPage.png
├── 03_LoginPage.png
├── 04_AdminDashboard.png
├── 05_AdminAddMovie.png
├── 06_AddShow.png
├── 07_AddTheater.png
├── 08_UserProducts.png
└── 09_UserOrders.png
```
These can then be embedded directly into your final capstone report document.
