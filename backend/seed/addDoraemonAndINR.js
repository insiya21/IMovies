const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Theater = require('../models/Theater');

const doraemonMetadata = {
  title: 'Stand by Me Doraemon (2014)',
  description: 'Doraemon, a cat-shaped robotic companion from the 22nd century, travels back in time to aid Nobita Nobi, an insecure young boy who struggles in school and life. Armed with marvelous secret gadgets from his 4D pocket, Doraemon strives to steer Nobita toward a joyful, prosperous future before departing.',
  posterUrl: 'https://upload.wikimedia.org/wikipedia/en/0/01/Stand_by_Me_Doraemon_official_poster.jpg',
  bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
  trailerUrl: 'https://www.youtube.com/watch?v=F3a37q5q1xU',
  genres: ['Animation', 'Comedy', 'Drama', 'Family', 'Sci-Fi'],
  duration: 95,
  rating: 7.4,
  language: 'Japanese',
  director: 'Ryûichi Yagi, Takashi Yamazaki',
  cast: ['Wasabi Mizuta', 'Megumi Ohara', 'Yumi Kakazu', 'Subaru Kimura', 'Tomokazu Seki'],
  releaseDate: new Date('2014-08-08'),
  isActive: true,
};

const formatDate = (daysOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const runMigration = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';

  try {
    console.log('[Migration] Connecting to MongoDB...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('[Migration] Connected successfully to database.');

    // 1. Verify text index on movies collection uses language_override: 'none'
    try {
      const indexes = await mongoose.connection.collection('movies').indexes();
      const textIndex = indexes.find((idx) => idx.name === 'title_text_description_text');
      if (textIndex && textIndex.language_override !== 'none') {
        console.log('[Migration] Updating text index to language_override: "none"...');
        await mongoose.connection.collection('movies').dropIndex('title_text_description_text');
        await mongoose.connection.collection('movies').createIndex(
          { title: 'text', description: 'text' },
          { name: 'title_text_description_text', language_override: 'none', default_language: 'english' }
        );
        console.log('[Migration] Text index updated.');
      }
    } catch (idxErr) {
      console.warn('[Migration] Text index note:', idxErr.message);
    }

    // 2. Update all existing Theaters to INR pricing
    const theaters = await Theater.find({});
    console.log(`[Migration] Found ${theaters.length} theaters. Updating pricing to INR...`);
    for (const theater of theaters) {
      let needsUpdate = false;
      if (!theater.balconySeatPrice || theater.balconySeatPrice < 100) {
        theater.balconySeatPrice = 350;
        needsUpdate = true;
      }
      if (!theater.middleSeatPrice || theater.middleSeatPrice < 100) {
        theater.middleSeatPrice = 250;
        needsUpdate = true;
      }
      if (!theater.lowerSeatPrice || theater.lowerSeatPrice < 100) {
        theater.lowerSeatPrice = 180;
        needsUpdate = true;
      }
      if (needsUpdate) {
        await theater.save();
        console.log(`[Migration] Updated theater "${theater.theatreName}" to INR prices.`);
      }
    }

    // 3. Update all existing Shows to INR ticket pricing
    const existingShows = await Show.find({});
    console.log(`[Migration] Found ${existingShows.length} shows. Updating ticket prices to INR...`);
    let updatedShowCount = 0;
    for (const show of existingShows) {
      let needsUpdate = false;
      const tp = show.ticketPrice || {};
      const newTp = { ...tp };

      if (!newTp.silver || newTp.silver < 100) {
        newTp.silver = 180;
        needsUpdate = true;
      }
      if (!newTp.gold || newTp.gold < 100) {
        newTp.gold = 250;
        needsUpdate = true;
      }
      if (!newTp.platinum || newTp.platinum < 100) {
        newTp.platinum = 350;
        needsUpdate = true;
      }

      if (needsUpdate) {
        show.ticketPrice = newTp;
        await show.save();
        updatedShowCount++;
      }
    }
    console.log(`[Migration] Updated ${updatedShowCount} shows to standard INR prices (₹180 / ₹250 / ₹350).`);

    // 4. Check / Insert Doraemon Movie (Idempotent - exactly one Doraemon movie)
    let doraemon = await Movie.findOne({
      $or: [
        { title: 'Stand by Me Doraemon (2014)' },
        { title: 'Stand by Me Doraemon' },
      ],
    });

    if (doraemon) {
      console.log(`[Migration] Doraemon movie already exists: "${doraemon.title}" (ID: ${doraemon._id})`);
    } else {
      doraemon = await Movie.create(doraemonMetadata);
      console.log(`[Migration] Successfully created movie: "${doraemon.title}" (ID: ${doraemon._id})`);
    }

    // 5. Ensure scheduled shows for Doraemon over the next 5 days
    const activeTheaters = await Theater.find({});
    const defaultTheater = activeTheaters.length > 0 ? activeTheaters[0] : null;

    const doraemonShows = await Show.find({ movie: doraemon._id });
    console.log(`[Migration] Doraemon currently has ${doraemonShows.length} scheduled shows.`);

    if (doraemonShows.length < 5) {
      console.log('[Migration] Scheduling 10 shows across the next 5 days for Doraemon in INR...');
      const timeslots = ['11:30', '16:00'];
      const screens = [
        { name: 'Screen 1 - IMAX Laser 3D', type: 'IMAX', silver: 220, gold: 300, platinum: 450 },
        { name: 'Screen 2 - Dolby Atmos Megaplex', type: 'Dolby Atmos', silver: 200, gold: 280, platinum: 400 },
      ];

      for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
        const showDate = formatDate(dayOffset);
        for (let tIdx = 0; tIdx < timeslots.length; tIdx++) {
          const showTime = timeslots[tIdx];
          const screen = screens[tIdx % screens.length];

          // Check if show already scheduled
          const existing = await Show.findOne({
            movie: doraemon._id,
            showDate,
            showTime,
          });

          if (!existing) {
            await Show.create({
              movie: doraemon._id,
              theater: defaultTheater ? defaultTheater._id : null,
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
              bookedSeats: [],
            });
          }
        }
      }
      const totalDoraemonShows = await Show.countDocuments({ movie: doraemon._id });
      console.log(`[Migration] Doraemon now has ${totalDoraemonShows} scheduled shows in INR.`);
    }

    console.log('[Migration] Complete! All requirements successfully satisfied.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Migration ERROR]:', error);
    process.exit(1);
  }
};

runMigration();
