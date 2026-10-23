const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Movie = require('../models/Movie');

// Generate unique 8-character uppercase booking reference
const generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'IM-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

// @desc    Create a new booking with concurrency-safe atomic seat reservation
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { showId, seats, seatDetails, paymentMethod } = req.body;

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid showId and an array of at least one seat',
      });
    }

    if (seats.length > 8) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 8 tickets allowed per booking',
      });
    }

    // 1. Verify show exists
    const existingShow = await Show.findById(showId);
    if (!existingShow) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    // 2. ATOMIC SEAT RESERVATION:
    // Update the show ONLY if NONE of the requested seats are in bookedSeats.
    // This atomic query guarantees no race condition or duplicate booking under concurrent requests.
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: seats },
      },
      {
        $push: { bookedSeats: { $each: seats } },
      },
      { new: true }
    );

    if (!updatedShow) {
      // Find which requested seat was already reserved for a friendly error message
      const conflictedSeats = seats.filter((seat) =>
        existingShow.bookedSeats.includes(seat)
      );
      return res.status(409).json({
        success: false,
        message: `Seat ${conflictedSeats.join(', ')} is already booked. Please choose other seats.`,
        conflictedSeats,
      });
    }

    // 3. Compute price details
    const priceMap = {
      silver: existingShow.ticketPrice?.silver || 10,
      gold: existingShow.ticketPrice?.gold || 15,
      platinum: existingShow.ticketPrice?.platinum || 22,
    };

    let calculatedSubtotal = 0;
    const finalSeatDetails = seats.map((seat) => {
      const row = seat.charAt(0).toUpperCase();
      let tier = 'gold';
      if (['A', 'B'].includes(row)) tier = 'silver';
      else if (['C', 'D'].includes(row)) tier = 'gold';
      else tier = 'platinum';

      const price = priceMap[tier] || 15;
      calculatedSubtotal += price;

      return {
        seatNumber: seat,
        tier,
        price,
      };
    });

    const convenienceFee = 2.5;
    const grandTotal = Number((calculatedSubtotal + convenienceFee).toFixed(2));

    // 4. Generate guaranteed unique booking reference
    let bookingRef = generateBookingRef();
    let collision = await Booking.findOne({ bookingRef });
    while (collision) {
      bookingRef = generateBookingRef();
      collision = await Booking.findOne({ bookingRef });
    }

    // 5. Create Booking Document
    const booking = await Booking.create({
      bookingRef,
      user: req.user._id,
      show: showId,
      movie: existingShow.movie,
      seats,
      seatDetails: seatDetails && seatDetails.length ? seatDetails : finalSeatDetails,
      subtotal: calculatedSubtotal,
      convenienceFee,
      totalAmount: grandTotal,
      paymentStatus: 'completed',
      paymentMethod: paymentMethod || 'Demo Card',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title posterUrl duration rating')
      .populate('show', 'screenName screenType showDate showTime')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully! Enjoy the show.',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for the currently authenticated user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl bannerUrl duration rating genres')
      .populate('show', 'screenName screenType showDate showTime ticketPrice')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID or Reference Code
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by ObjectId or by bookingRef (e.g. IM-982132)
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { bookingRef: id.toUpperCase() };

    const booking = await Booking.findOne(query)
      .populate('movie')
      .populate('show')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Security check: Must be the user who booked or an admin
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this ticket',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private / Admin
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('movie', 'title posterUrl')
      .populate('show', 'screenName screenType showDate showTime')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin statistics summary
// @route   GET /api/bookings/stats
// @access  Private / Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalShows = await Show.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      data: {
        totalMovies,
        totalShows,
        totalBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  getAdminStats,
};
