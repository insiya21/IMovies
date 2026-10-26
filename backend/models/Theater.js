const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema(
  {
    theatreName: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      maxlength: [120, 'Theatre name cannot exceed 120 characters'],
    },
    theatreId: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX', '4DX', 'VIP', 'Dolby Atmos'],
      default: 'Standard',
    },
    balconySeatPrice: {
      type: Number,
      default: 350,
      min: 0,
    },
    middleSeatPrice: {
      type: Number,
      default: 250,
      min: 0,
    },
    lowerSeatPrice: {
      type: Number,
      default: 180,
      min: 0,
    },
    balconySeats: {
      type: Object,
      default: { total: 20, booked: [] },
    },
    middleSeats: {
      type: Object,
      default: { total: 20, booked: [] },
    },
    lowerSeats: {
      type: Object,
      default: { total: 20, booked: [] },
    },
    totalSeats: {
      type: Number,
      default: 60,
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

// Virtual for alias name
theaterSchema.virtual('name').get(function () {
  return this.theatreName;
});

// Auto-generate theatreId if not provided
theaterSchema.pre('save', function (next) {
  if (!this.theatreId) {
    this.theatreId = 'TH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

const Theater = mongoose.model('Theater', theaterSchema);

module.exports = Theater;
