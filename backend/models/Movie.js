const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    bannerUrl: {
      type: String,
      trim: true,
    },
    trailerUrl: {
      type: String,
      trim: true,
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      default: ['Action'],
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    rating: {
      type: Number,
      default: 8.0,
      min: [0, 'Rating cannot be less than 0'],
      max: [10, 'Rating cannot exceed 10'],
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    director: {
      type: String,
      trim: true,
    },
    cast: {
      type: [String],
      default: [],
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization (language_override: 'none' prevents collision with the movie's language field)
movieSchema.index(
  { title: 'text', description: 'text' },
  { language_override: 'none' }
);

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
