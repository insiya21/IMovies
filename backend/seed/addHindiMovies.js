const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Theater = require('../models/Theater');

const hindiMovies = [
  {
    title: '3 Idiots',
    description: 'Two friends embark on a quest for a lost buddy who inspired them to think independently, revisiting their college days at an elite engineering institute and recalling memories of an unorthodox friend who challenged systemic conventions.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=K0eDlFX9GMc',
    genres: ['Comedy', 'Drama'],
    duration: 170,
    rating: 8.4,
    language: 'Hindi',
    director: 'Rajkumar Hirani',
    cast: ['Aamir Khan', 'R. Madhavan', 'Sharman Joshi', 'Kareena Kapoor Khan', 'Boman Irani'],
    releaseDate: new Date('2009-12-25'),
  },
  {
    title: 'Stree 2',
    description: 'The quiet town of Chanderi faces a new demonic menace known as Sarkata, a headless entity abducting progressive women. Vicky, his loyal friends, and the eccentric Jana must reunite with the enigmatic Stree to confront the dark forces and protect their town.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=iZWz4hNFyMU',
    genres: ['Comedy', 'Horror'],
    duration: 147,
    rating: 7.6,
    language: 'Hindi',
    director: 'Amar Kaushik',
    cast: ['Shraddha Kapoor', 'Rajkummar Rao', 'Pankaj Tripathi', 'Aparshakti Khurana', 'Abhishek Banerjee'],
    releaseDate: new Date('2024-08-15'),
  },
  {
    title: 'Bhool Bhulaiyaa 3',
    description: 'Ruhaan, popular as the fraudulent ghostbuster Rooh Baba, is hired to investigate a haunting in a grand ancestral palace in Raktaghat. He finds himself in perilous comedy and dread when two terrifying spirits both assert they are the genuine spirit of Manjulika.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e4/Bhool_Bhulaiyaa_3_poster.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=n79m6h_dWaE',
    genres: ['Comedy', 'Horror'],
    duration: 158,
    rating: 6.8,
    language: 'Hindi',
    director: 'Anees Bazmee',
    cast: ['Kartik Aaryan', 'Vidya Balan', 'Madhuri Dixit', 'Triptii Dimri', 'Rajpal Yadav'],
    releaseDate: new Date('2024-11-01'),
  },
  {
    title: 'Zindagi Na Milegi Dobara',
    description: 'Three longtime childhood friends reunite for an unforgettable bachelor road trip across Spain. Each chooses an exhilarating adventure sport to face their deepest fears, transforming their outlook on life, friendships, and what it truly means to live without regrets.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/17/Zindagi_Na_Milegi_Dobara.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=FJrpcDgC3zU',
    genres: ['Adventure', 'Comedy', 'Drama'],
    duration: 155,
    rating: 8.2,
    language: 'Hindi',
    director: 'Zoya Akhtar',
    cast: ['Hrithik Roshan', 'Farhan Akhtar', 'Abhay Deol', 'Katrina Kaif', 'Kalki Koechlin'],
    releaseDate: new Date('2011-07-15'),
  },
  {
    title: '12th Fail',
    description: 'Inspired by the extraordinary true story of IPS officer Manoj Kumar Sharma, who overcomes intense rural poverty and academic setbacks to reboot his life in Mukherjee Nagar, striving against all odds to conquer India’s most rigorous competitive exam, the UPSC.',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f2/12th_Fail_poster.jpeg',
    bannerUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=KjbtuqENvVE',
    genres: ['Biography', 'Drama'],
    duration: 147,
    rating: 8.9,
    language: 'Hindi',
    director: 'Vidhu Vinod Chopra',
    cast: ['Vikrant Massey', 'Medha Shankr', 'Anant V Joshi', 'Anshumaan Pushkar', 'Priyanshu Chatterjee'],
    releaseDate: new Date('2023-10-27'),
  },
];

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

const formatDate = (daysOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const addHindiMoviesAndShows = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';

  try {
    console.log(`[AddHindiMovies] Connecting to MongoDB...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('[AddHindiMovies] Connected successfully.');

    // Ensure the text index uses language_override: 'none' so that movies with language: 'Hindi' can be indexed
    try {
      const existingIndexes = await mongoose.connection.collection('movies').indexes();
      const textIndex = existingIndexes.find((idx) => idx.name === 'title_text_description_text');
      if (textIndex && textIndex.language_override !== 'none') {
        console.log('[AddHindiMovies] Updating text index to language_override: "none"...');
        await mongoose.connection.collection('movies').dropIndex('title_text_description_text');
        await mongoose.connection.collection('movies').createIndex(
          { title: 'text', description: 'text' },
          { name: 'title_text_description_text', language_override: 'none', default_language: 'english' }
        );
        console.log('[AddHindiMovies] Text index updated.');
      }
    } catch (idxErr) {
      console.warn('[AddHindiMovies] Index check note:', idxErr.message);
    }

    // Ensure theaters exist
    let theaters = await Theater.find({});
    if (theaters.length === 0) {
      console.log('[AddHindiMovies] No theaters found. Inserting default theaters...');
      theaters = await Theater.insertMany(sampleTheaters);
    }
    console.log(`[AddHindiMovies] Found ${theaters.length} cinema theaters.`);

    const screenTypes = [
      { name: 'Screen 1 - IMAX Laser 3D', type: 'IMAX', silver: 14, gold: 20, platinum: 28 },
      { name: 'Screen 2 - Dolby Cinema Atmos', type: 'VIP', silver: 12, gold: 18, platinum: 25 },
      { name: 'Screen 3 - 4DX Dynamic Experience', type: '4DX', silver: 15, gold: 22, platinum: 30 },
      { name: 'Screen 4 - Digital Cinema Standard', type: 'Standard', silver: 10, gold: 14, platinum: 20 },
    ];
    const timeSlots = ['11:00', '14:30', '18:00', '21:15'];

    let addedMoviesCount = 0;
    let totalNewShowsCount = 0;

    for (const movieData of hindiMovies) {
      // Check if movie already exists
      let existingMovie = await Movie.findOne({ title: movieData.title });
      let movieDoc = existingMovie;

      if (!existingMovie) {
        movieDoc = await Movie.create(movieData);
        addedMoviesCount++;
        console.log(`[AddHindiMovies] + Added movie: "${movieDoc.title}" (${movieDoc._id})`);
      } else {
        console.log(`[AddHindiMovies] = Movie already exists: "${movieDoc.title}" (${movieDoc._id})`);
      }

      // Check upcoming shows for this movie
      const today = formatDate(0);
      const existingShows = await Show.find({
        movie: movieDoc._id,
        showDate: { $gte: today },
      });

      if (existingShows.length === 0) {
        const newShows = [];
        for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
          const showDate = formatDate(dayOffset);
          for (let i = 0; i < 2; i++) {
            const screen = screenTypes[(dayOffset + i) % screenTypes.length];
            const showTime = timeSlots[(dayOffset * 2 + i) % timeSlots.length];
            const theater = theaters[i % theaters.length];

            newShows.push({
              movie: movieDoc._id,
              theater: theater._id,
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
              bookedSeats: dayOffset === 0 ? ['B4', 'B5'] : [],
            });
          }
        }
        const createdShows = await Show.insertMany(newShows);
        totalNewShowsCount += createdShows.length;
        console.log(`  -> Scheduled ${createdShows.length} upcoming shows for "${movieDoc.title}".`);
      } else {
        console.log(`  -> "${movieDoc.title}" already has ${existingShows.length} upcoming scheduled shows.`);
      }
    }

    console.log(`\n[AddHindiMovies Summary]`);
    console.log(` - New Movies Added: ${addedMoviesCount}`);
    console.log(` - New Shows Scheduled: ${totalNewShowsCount}`);
    console.log(`All 5 Hindi movies and scheduled shows are ready!`);
    process.exit(0);
  } catch (error) {
    console.error('[AddHindiMovies Error]:', error.message);
    process.exit(1);
  }
};

addHindiMoviesAndShows();
