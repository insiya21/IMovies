const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
    },
    screenName: {
      type: String,
      required: [true, 'Screen/Auditorium name is required'],
      default: 'Screen 1 - Dolby Atmos',
    },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX', '4DX', 'VIP', 'Dolby Atmos'],
      default: 'Standard',
    },
    showDate: {
      type: String, // Stored as YYYY-MM-DD for deterministic querying across timezones
      required: [true, 'Show date is required (YYYY-MM-DD)'],
    },
    showTime: {
      type: String, // e.g. "14:30"
      required: [true, 'Show time is required (HH:MM)'],
    },
    ticketPrice: {
      silver: {
        type: Number,
        required: true,
        default: 180,
        min: 0,
      },
      gold: {
        type: Number,
        required: true,
        default: 250,
        min: 0,
      },
      platinum: {
        type: Number,
        required: true,
        default: 350,
        min: 0,
      },
    },
    totalSeats: {
      type: Number,
      default: 60,
    },
    bookedSeats: {
      type: [String], // Array of seat codes e.g. ["A1", "A2", "D5"]
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient show lookup by movie and date
showSchema.index({ movie: 1, showDate: 1 });

const Show = mongoose.model('Show', showSchema);

module.exports = Show;
