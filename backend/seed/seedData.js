const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Theater = require('../models/Theater');

const sampleMovies = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    duration: 166,
    rating: 8.7,
    language: 'English',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the profound moral, ethical, and global consequences of humanity’s greatest scientific breakthrough.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    genres: ['Drama', 'History', 'Biography'],
    duration: 180,
    rating: 8.9,
    language: 'English',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    duration: 140,
    rating: 8.7,
    language: 'English',
    director: 'Joaquim Dos Santos, Kemp Powers',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson'],
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    duration: 169,
    rating: 8.7,
    language: 'English',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    duration: 148,
    rating: 8.8,
    language: 'English',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
  },
  {
    title: 'Cyberpunk 2099: Neon Horizon',
    description: 'In a dystopian mega-city ruled by megacorporations and synthetic intelligence, an enhanced courier uncovers a clandestine digital weapon that could reshape human consciousness forever.',
    posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=LembwKDo1Dc',
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    duration: 135,
    rating: 8.4,
    language: 'English',
    director: 'Elena Vance',
    cast: ['Keanu Reeves', 'Ana de Armas', 'Idris Elba'],
  },
];

// Helper to format dates YYYY-MM-DD
const formatDate = (daysOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';

  try {
    console.log(`[Seed] Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected successfully.');

    // Clear existing collections
    await Booking.deleteMany({});
    await Show.deleteMany({});
    await Theater.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // Seed Theaters
    const sampleTheaters = [
      {
        theatreName: 'PVR Grand Heritage - IMAX Laser',
        theatreId: 'TH-PVR01',
        location: 'Downtown Central, Sector 4',
        screenType: 'IMAX',
        balconySeatPrice: 28,
        middleSeatPrice: 20,
        lowerSeatPrice: 14,
        totalSeats: 60,
      },
      {
        theatreName: 'Cinepolis Dolby Atmos Megaplex',
        theatreId: 'TH-CIN02',
        location: 'Westside Promenade Mall',
        screenType: 'Dolby Atmos',
        balconySeatPrice: 25,
        middleSeatPrice: 18,
        lowerSeatPrice: 12,
        totalSeats: 60,
      },
      {
        theatreName: 'INOX Luxe VIP Cinema',
        theatreId: 'TH-INX03',
        location: 'Uptown Financial Hub',
        screenType: 'VIP',
        balconySeatPrice: 30,
        middleSeatPrice: 22,
        lowerSeatPrice: 15,
        totalSeats: 60,
      },
    ];
    const createdTheaters = await Theater.insertMany(sampleTheaters);
    console.log(`[Seed] Created ${createdTheaters.length} cinema theaters.`);

    // Create Admin and Regular User
    const adminUser = await User.create({
      name: 'IMovies Administrator',
      email: 'admin@imovies.com',
      password: 'admin123',
      role: 'admin',
    });

    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@imovies.com',
      password: 'user123',
      role: 'user',
    });

    console.log(`[Seed] Created users:`);
    console.log(` - Admin: admin@imovies.com (password: admin123)`);
    console.log(` - User:  user@imovies.com  (password: user123)`);

    // Insert sample movies
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seed] Inserted ${createdMovies.length} movies.`);

    // Generate shows for next 5 days
    const screenTypes = [
      { name: 'Screen 1 - IMAX Laser 3D', type: 'IMAX', silver: 14, gold: 20, platinum: 28 },
      { name: 'Screen 2 - Dolby Cinema Atmos', type: 'VIP', silver: 12, gold: 18, platinum: 25 },
      { name: 'Screen 3 - 4DX Dynamic Experience', type: '4DX', silver: 15, gold: 22, platinum: 30 },
      { name: 'Screen 4 - Digital Cinema Standard', type: 'Standard', silver: 10, gold: 14, platinum: 20 },
    ];

    const timeSlots = ['11:00', '14:30', '18:00', '21:15'];
    const showDocs = [];

    for (const movie of createdMovies) {
      for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
        const showDate = formatDate(dayOffset);
        // Pick 2 screens and times per day for each movie
        for (let i = 0; i < 2; i++) {
          const screen = screenTypes[(dayOffset + i) % screenTypes.length];
          const showTime = timeSlots[(dayOffset * 2 + i) % timeSlots.length];

          // Preset a couple of booked seats for realism
          const sampleBookedSeats = dayOffset === 0 ? ['B4', 'B5', 'C6', 'C7'] : [];

          showDocs.push({
            movie: movie._id,
            theater: createdTheaters[i % createdTheaters.length]._id,
            screenName: screen.name,
            screenType: screen.type,
            showDate,
            showTime,
            ticketPrice: {
              silver: screen.silver,
              gold: screen.gold,
              platinum: screen.platinum,
            },
            totalSeats: 60,
            bookedSeats: sampleBookedSeats,
          });
        }
      }
    }

    const createdShows = await Show.insertMany(showDocs);
    console.log(`[Seed] Created ${createdShows.length} scheduled shows.`);

    // Seed one demo booking for the regular user
    if (createdShows.length > 0) {
      const demoShow = createdShows[0];
      await Booking.create({
        bookingRef: 'IM-DEMO01',
        user: regularUser._id,
        show: demoShow._id,
        movie: demoShow.movie,
        seats: ['B4', 'B5'],
        seatDetails: [
          { seatNumber: 'B4', tier: 'silver', price: demoShow.ticketPrice.silver },
          { seatNumber: 'B5', tier: 'silver', price: demoShow.ticketPrice.silver },
        ],
        subtotal: demoShow.ticketPrice.silver * 2,
        convenienceFee: 2.5,
        totalAmount: demoShow.ticketPrice.silver * 2 + 2.5,
        paymentStatus: 'completed',
        paymentMethod: 'Demo Card',
      });
      console.log('[Seed] Created demo booking (IM-DEMO01).');
    }

    console.log('\n[Seed Success] IMovies database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
