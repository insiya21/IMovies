# Entity-Relationship (ER) Diagram & Data Architecture

This document describes the complete database design, entity schemas, relationships, cardinalities, constraints, and indexing strategy for the **IMovies** cinema ticket booking application.

All entity definitions and relationships are strictly derived from the implemented Mongoose models in `backend/models/`.

---

## 1. Visual Entity-Relationship Diagram

### 1.1 Traditional Chen-Style Vector Diagram (SkillWallet Style)

In alignment with the SkillWallet reference project architecture, the system employs the **traditional Chen ER notation**:
- **Entities**: Rendered as **rectangles** (User, Movie, Theater, Show, Booking).
- **Attributes**: Rendered as **ovals / ellipses** connected directly to their parent entity (with primary key attributes underlined).
- **Relationships**: Rendered as **diamond shapes** located between related entities.
- **Cardinalities**: Explicitly annotated with `1` and `N` tags.
- **Palette**: Clean white background, soft red/pink entity & relationship shapes, and light blue connecting lines matching the reference diagram.

The high-resolution vector SVG is generated and ready for direct insertion into project reports:
- **Output File**: [`docs/architecture/er-diagram.svg`](file:///Users/insiya/Projects/IMovies/docs/architecture/er-diagram.svg)
- **Format**: Scalable Vector Graphics (SVG, 1600 × 1260 px, High DPI)

![IMovies Chen-Style Entity-Relationship Diagram](er-diagram.svg)

---

### 1.2 Chen-Style Relationship Flowchart

The following diagram illustrates the Chen-style entity rectangles, relationship diamonds, and attribute ovals:

```mermaid
flowchart TD
    classDef entity fill:#FFE4E6,stroke:#E11D48,stroke-width:2.5px,color:#9F1239,font-weight:bold;
    classDef relation fill:#FDA4AF,stroke:#BE123C,stroke-width:2px,color:#881337,font-weight:bold;
    classDef attr fill:#FFF1F2,stroke:#FB7185,stroke-width:1.5px,color:#1E293B;
    classDef pkAttr fill:#FFF1F2,stroke:#E11D48,stroke-width:2px,color:#9F1239,font-weight:bold;

    %% Entities (Rectangles)
    USER["USER"]:::entity
    MOVIE["MOVIE"]:::entity
    THEATER["THEATER"]:::entity
    SHOW["SHOW"]:::entity
    BOOKING["BOOKING"]:::entity

    %% Relationships (Diamonds)
    R_PLACES{"places"}:::relation
    R_SCHEDULES{"schedules"}:::relation
    R_HOSTS{"hosts"}:::relation
    R_RESERVES{"reserves"}:::relation
    R_FEATURED{"featured in"}:::relation

    %% Cardinality Connections (1:N)
    USER ---|1| R_PLACES ---|N| BOOKING
    MOVIE ---|1| R_SCHEDULES ---|N| SHOW
    THEATER ---|1| R_HOSTS ---|N| SHOW
    SHOW ---|1| R_RESERVES ---|N| BOOKING
    MOVIE ---|1| R_FEATURED ---|N| BOOKING

    %% Key Attributes (Ovals)
    U_ID(["_id (PK)"]):::pkAttr --- USER
    U_NAME(["name"]):::attr --- USER
    U_EMAIL(["email (UK)"]):::attr --- USER
    U_ROLE(["role (admin)"]):::attr --- USER

    M_ID(["_id (PK)"]):::pkAttr --- MOVIE
    M_TITLE(["title"]):::attr --- MOVIE
    M_GENRES(["genres"]):::attr --- MOVIE
    M_DURATION(["duration"]):::attr --- MOVIE

    T_ID(["_id (PK)"]):::pkAttr --- THEATER
    T_NAME(["theatreName"]):::attr --- THEATER
    T_LOC(["location"]):::attr --- THEATER
    T_SCREEN(["screenType"]):::attr --- THEATER

    S_ID(["_id (PK)"]):::pkAttr --- SHOW
    S_DATE(["showDate"]):::attr --- SHOW
    S_TIME(["showTime"]):::attr --- SHOW
    S_SEATS(["bookedSeats"]):::attr --- SHOW

    B_ID(["_id (PK)"]):::pkAttr --- BOOKING
    B_REF(["bookingRef (UK)"]):::attr --- BOOKING
    B_SEATS(["seats"]):::attr --- BOOKING
    B_AMOUNT(["totalAmount"]):::attr --- BOOKING
    B_STATUS(["paymentStatus"]):::attr --- BOOKING
```

---

### 1.3 Relational Schema Diagram (Crow's Foot View)

For developers and database administrators requiring full attribute types and foreign key links:

```mermaid
erDiagram
    USER ||--o{ BOOKING : "places (1:N)"
    MOVIE ||--o{ SHOW : "schedules (1:N)"
    THEATER ||--o{ SHOW : "hosts (1:N)"
    SHOW ||--o{ BOOKING : "reserves (1:N)"
    MOVIE ||--o{ BOOKING : "featured_in (1:N)"

    USER {
        ObjectId _id PK "Internal unique identifier"
        string name "Full user name, max 60 chars"
        string email "Unique login email address"
        string password "Bcrypt hashed password (select: false)"
        string role "Authorization role: user | admin"
        date createdAt "Audit timestamp"
        date updatedAt "Audit timestamp"
    }

    MOVIE {
        ObjectId _id PK "Internal unique identifier"
        string title "Movie title, max 150 chars"
        string description "Detailed movie synopsis"
        string posterUrl "Poster image URL (2:3 aspect ratio)"
        string bannerUrl "Optional hero backdrop banner URL"
        string trailerUrl "Optional YouTube embed URL"
        string_array genres "Array of genre labels, default ['Action']"
        number duration "Runtime duration in minutes"
        number rating "Rating score (0 to 10), default 8.0"
        string language "Audio language, default 'English'"
        string director "Optional director name"
        string_array cast "Array of principal cast actors"
        date releaseDate "Theatrical release date"
        boolean isActive "Catalog display toggle, default true"
        date createdAt "Audit timestamp"
        date updatedAt "Audit timestamp"
    }

    THEATER {
        ObjectId _id PK "Internal unique identifier"
        string theatreName "Theatre / cinema hall name, max 120 chars"
        string theatreId "Unique theater code e.g. TH-XXXXXX"
        string location "City / venue address"
        string screenType "Format: Standard | IMAX | 4DX | VIP | Dolby Atmos"
        number balconySeatPrice "Balcony VIP tier seat price ($), default 22"
        number middleSeatPrice "Middle Gold tier seat price ($), default 15"
        number lowerSeatPrice "Lower Silver tier seat price ($), default 10"
        object balconySeats "Balcony allocation { total: 20, booked: [] }"
        object middleSeats "Middle allocation { total: 20, booked: [] }"
        object lowerSeats "Lower allocation { total: 20, booked: [] }"
        number totalSeats "Auditorium capacity, default 60"
        boolean isActive "Operational status toggle, default true"
        date createdAt "Audit timestamp"
        date updatedAt "Audit timestamp"
    }

    SHOW {
        ObjectId _id PK "Internal unique identifier"
        ObjectId movie FK "Ref: Movie (_id), Required"
        ObjectId theater FK "Ref: Theater (_id), Optional"
        string screenName "Auditorium name, default 'Screen 1 - Dolby Atmos'"
        string screenType "Format: Standard | IMAX | 4DX | VIP | Dolby Atmos"
        string showDate "Screening date (YYYY-MM-DD)"
        string showTime "Screening start time (HH:MM)"
        object ticketPrice "Pricing tiers: silver ($10), gold ($15), platinum ($22)"
        number totalSeats "Auditorium capacity, default 60"
        string_array bookedSeats "Array of booked seat codes e.g. ['A1', 'C4']"
        date createdAt "Audit timestamp"
        date updatedAt "Audit timestamp"
    }

    BOOKING {
        ObjectId _id PK "Internal unique identifier"
        string bookingRef "Unique reference code e.g. 'IM-K9X2B1'"
        ObjectId user FK "Ref: User (_id), Required"
        ObjectId show FK "Ref: Show (_id), Required"
        ObjectId movie FK "Ref: Movie (_id), Required"
        string_array seats "Array of reserved seat codes e.g. ['A1', 'A2']"
        object_array seatDetails "Array of { seatNumber, tier, price }"
        number subtotal "Sum of seat ticket prices"
        number convenienceFee "Fixed administrative fee, default 2.50"
        number totalAmount "Final total: subtotal + convenienceFee"
        string paymentStatus "Status: completed | pending | cancelled"
        string paymentMethod "Payment instrument, default 'Demo Card'"
        date createdAt "Audit timestamp"
        date updatedAt "Audit timestamp"
    }
```

---

## 2. Entity Relationships & Cardinalities

1. **User — Booking (`places`, 1:N)**:
   - One `User` can place zero or many `Booking` records over time.
   - Each `Booking` references exactly one `User` via the mandatory foreign key `booking.user`.
   - **Admin Representation**: Administrators are represented directly within the `User` entity via the `role` attribute (`role: 'admin'`). There is **no separate Admin entity**; administrators authenticate through the same pipeline and gain administrative privileges via role verification middleware (`adminOnly`).

2. **Movie — Show (`schedules`, 1:N)**:
   - One `Movie` can have zero or many scheduled screening sessions (`SHOW` records) across different dates, times, and auditoriums.
   - Each `Show` references its scheduled movie via the mandatory foreign key `show.movie`.

3. **Theater — Show (`hosts`, 1:N)**:
   - One `Theater` venue can host zero or many scheduled movie screening sessions.
   - Each `Show` optionally references the physical venue via the foreign key `show.theater`, inheriting venue amenities, screen format, and base tier pricing.

4. **Show — Booking (`reserves`, 1:N)**:
   - One scheduled screening (`Show`) can receive zero or many customer `Booking` records.
   - Each `Booking` explicitly references the reserved screening session via `booking.show`.
   - **Embedded Seat State**: Real-time seat availability is tracked directly on the `Show` document inside `bookedSeats: [String]`. This allows lock-free atomic conditional reservation (`Show.findOneAndUpdate` matching `{ bookedSeats: { $nin: seats } }`) and atomic seat release upon cancellation (`Show.findByIdAndUpdate` with `{ $pull: { bookedSeats: { $in: booking.seats } } }`).

5. **Movie — Booking (`featured in`, 1:N)**:
   - One `Movie` is referenced by zero or many `Booking` records.
   - In addition to the indirect link via `Show`, `Booking` maintains a direct foreign key `booking.movie`. This denormalization enables fast order history queries, receipt rendering, and revenue aggregation without requiring multi-hop population joins.

---

## 3. Structural Design Principles & Schema Integrity

1. **No Redundant Separate Entities**:
   - **Admin**: Modeled as `role = 'admin'` inside the `User` schema.
   - **Seats**: Stored as an array of seat identifier strings (`bookedSeats: [String]`) inside `Show` and seat breakdown items (`seatDetails: [{ seatNumber, tier, price }]`) inside `Booking`. There is **no separate Seat collection**.
   - **Payments**: Modeled as embedded attributes inside `Booking` (`paymentStatus`, `paymentMethod`, `subtotal`, `convenienceFee`, `totalAmount`). There is **no separate Payment collection**.
   - **Reviews**: Not implemented in the data layer; there is **no Review collection**.
2. **Deterministic Querying**: Show dates are stored as ISO calendar strings (`YYYY-MM-DD`) and times as 24-hour strings (`HH:MM`) to eliminate timezone ambiguity during scheduling.

---

## 4. Detailed Schema Definitions

### 4.1 User Entity (`backend/models/User.js`)
Stores registered customer and administrator accounts.

| Field | Type | Required | Constraints / Defaults | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | Primary Key (PK) | MongoDB internal document identifier |
| `name` | `String` | Yes | Max 60 chars, trimmed | Full legal or display name |
| `email` | `String` | Yes | Unique, trimmed, lowercase, regex-validated | Account login email address |
| `password` | `String` | Yes | Min 6 chars, `select: false` | Bcrypt-hashed password (cost factor 10) |
| `role` | `String` | No | Enum: `['user', 'admin']`, default `'user'` | Role claim for access control |
| `createdAt` | `Date` | Auto | Mongoose Timestamp | Account creation timestamp |
| `updatedAt` | `Date` | Auto | Mongoose Timestamp | Last profile update timestamp |

**Model Hooks & Methods**:
- `pre('save')`: Hashes `password` using `bcrypt.genSalt(10)` whenever modified.
- `matchPassword(enteredPassword)`: Compares candidate plaintext password with stored bcrypt hash using `bcrypt.compare`.
- `toJSON()`: Strips the `password` field from serialized JSON output to protect credentials.

---

### 4.2 Movie Entity (`backend/models/Movie.js`)
Contains movie catalog metadata, media URLs, runtime, and categorization.

| Field | Type | Required | Constraints / Defaults | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | Primary Key (PK) | MongoDB internal document identifier |
| `title` | `String` | Yes | Max 150 chars, trimmed | Movie title |
| `description` | `String` | Yes | Trimmed | Detailed movie synopsis |
| `posterUrl` | `String` | Yes | Trimmed URL | Portrait poster image (2:3 aspect ratio) |
| `bannerUrl` | `String` | No | Trimmed URL | Wide hero spotlight banner image |
| `trailerUrl` | `String` | No | Trimmed URL | YouTube video or trailer URL |
| `genres` | `[String]` | Yes | Default `['Action']` | Array of genre tags (e.g. Action, Sci-Fi) |
| `duration` | `Number` | Yes | Min: 1 minute | Runtime in minutes |
| `rating` | `Number` | No | Min: 0, Max: 10, default `8.0` | Critic / audience rating score |
| `language` | `String` | No | Default `'English'`, trimmed | Audio language |
| `director` | `String` | No | Trimmed | Director name |
| `cast` | `[String]` | No | Default `[]` | Array of principal cast members |
| `releaseDate` | `Date` | No | Default `Date.now` | Theatrical release date |
| `isActive` | `Boolean` | No | Default `true` | Soft toggle for catalog display |
| `createdAt` | `Date` | Auto | Mongoose Timestamp | Audit timestamp |
| `updatedAt` | `Date` | Auto | Mongoose Timestamp | Audit timestamp |

---

### 4.3 Theater Entity (`backend/models/Theater.js` & `theatreModel.js`)
Represents physical cinema complexes, locations, projection screen formats, and tier pricing. Fulfills the SkillWallet Task 1 / Capstone Theater requirement.

| Field | Type | Required | Constraints / Defaults | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | Primary Key (PK) | MongoDB internal document identifier |
| `theatreName` | `String` | Yes | Max 120 chars, trimmed | Name of the theater / cinema hall |
| `theatreId` | `String` | No | Auto-generated `TH-XXXXXX` | Human-readable theater identifier |
| `location` | `String` | Yes | Trimmed | City, mall, or street address |
| `screenType` | `String` | No | Enum: `['Standard', 'IMAX', '4DX', 'VIP', 'Dolby Atmos']`, default `'Standard'` | Projection format technology |
| `balconySeatPrice` | `Number` | No | Default `22`, min 0 | Balcony / Platinum VIP seat price ($) |
| `middleSeatPrice` | `Number` | No | Default `15`, min 0 | Middle / Gold seat price ($) |
| `lowerSeatPrice` | `Number` | No | Default `10`, min 0 | Lower / Silver seat price ($) |
| `balconySeats` | `Object` | No | Default `{ total: 20, booked: [] }` | Seat allocation metadata |
| `middleSeats` | `Object` | No | Default `{ total: 20, booked: [] }` | Seat allocation metadata |
| `lowerSeats` | `Object` | No | Default `{ total: 20, booked: [] }` | Seat allocation metadata |
| `totalSeats` | `Number` | No | Default `60` | Total seating capacity |
| `isActive` | `Boolean` | No | Default `true` | Operational status toggle |
| `createdAt` | `Date` | Auto | Mongoose Timestamp | Audit timestamp |
| `updatedAt` | `Date` | Auto | Mongoose Timestamp | Audit timestamp |

---

### 4.4 Show Entity (`backend/models/Show.js`)
Represents an individual scheduled movie screening in an auditorium at a specific date and time, optionally linked to a `Theater`.

| Field | Type | Required | Constraints / Defaults | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | Primary Key (PK) | MongoDB internal document identifier |
| `movie` | `ObjectId` | Yes | Ref: `'Movie'` (FK) | Foreign key reference to scheduled movie |
| `theater` | `ObjectId` | No | Ref: `'Theater'` (FK) | Optional foreign key to hosting theater |
| `screenName` | `String` | Yes | Default `'Screen 1 - Dolby Atmos'` | Name/label of auditorium/screen |
| `screenType` | `String` | No | Enum: `['Standard', 'IMAX', '4DX', 'VIP', 'Dolby Atmos']` | Projection format technology |
| `showDate` | `String` | Yes | Format `YYYY-MM-DD` | Calendar screening date |
| `showTime` | `String` | Yes | Format `HH:MM` | Screening start time (24-hour format) |
| `ticketPrice` | `Object` | Yes | Tiered pricing object | `{ silver: 10, gold: 15, platinum: 22 }` |
| `totalSeats` | `Number` | No | Default `60` | Total seating capacity of the auditorium |
| `bookedSeats` | `[String]` | No | Default `[]` | Array of occupied seat identifiers (e.g. `["A1", "C4"]`) |
| `createdAt` | `Date` | Auto | Mongoose Timestamp | Audit timestamp |
| `updatedAt` | `Date` | Auto | Mongoose Timestamp | Audit timestamp |

---

### 4.5 Booking Entity (`backend/models/Booking.js`)
Represents a customer ticket reservation, seat allocations, price breakdown, and digital ticket reference. Supports cancellation with automatic seat release.

| Field | Type | Required | Constraints / Defaults | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | Primary Key (PK) | MongoDB internal document identifier |
| `bookingRef` | `String` | Yes | Unique, uppercase, trimmed | Alphanumeric reservation code (e.g. `IM-K8X3F1`) |
| `user` | `ObjectId` | Yes | Ref: `'User'` (FK) | Foreign key to the user who placed booking |
| `show` | `ObjectId` | Yes | Ref: `'Show'` (FK) | Foreign key to the reserved screening |
| `movie` | `ObjectId` | Yes | Ref: `'Movie'` (FK) | Foreign key to the movie for direct lookup |
| `seats` | `[String]` | Yes | Array, min length 1 | Array of reserved seat codes |
| `seatDetails` | `[Object]` | No | Array of `{ seatNumber, tier, price }` | Breakdown of each seat, tier, and price |
| `subtotal` | `Number` | Yes | Calculated | Sum of individual seat prices |
| `convenienceFee` | `Number` | No | Default `2.50` | Fixed administrative convenience fee |
| `totalAmount` | `Number` | Yes | Min: 0 | Final grand total (`subtotal + convenienceFee`) |
| `paymentStatus` | `String` | No | Enum: `['completed', 'pending', 'cancelled']`, default `'completed'` | Payment lifecycle state |
| `paymentMethod` | `String` | No | Default `'Demo Card'` | Payment instrument identifier |
| `createdAt` | `Date` | Auto | Mongoose Timestamp | Audit timestamp |
| `updatedAt` | `Date` | Auto | Mongoose Timestamp | Audit timestamp |

---

## 5. Database Indexes & Query Optimization

To guarantee sub-millisecond query performance and enforce uniqueness constraints, the following indexes are actively configured:

1. **User Index**:
   - `email`: Single-field unique index (`{ unique: true }`) enabling $O(1)$ lookup during authentication and preventing duplicate registrations.
2. **Movie Index**:
   - `{ title: 'text', description: 'text' }`: Compound text index supporting full-text search across movie titles and synopses.
3. **Show Index**:
   - `{ movie: 1, showDate: 1 }`: Compound index optimizing show schedule retrieval by movie ID and calendar date.
4. **Booking Indexes**:
   - `bookingRef`: Unique index (`{ unique: true }`) for instant ticket lookup by alphanumeric reference code.
   - `{ user: 1, createdAt: -1 }`: Compound index for chronological "My Bookings" customer queries.
5. **Theater Index**:
   - Indexed by primary key `_id` with active status filtering `{ isActive: true }`.
