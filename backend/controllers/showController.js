const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');

// @desc    Get shows for a specific movie, optionally filtered by date (YYYY-MM-DD)
// @route   GET /api/shows/movie/:movieId
// @access  Public
const getShowsByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;

    const query = { movie: movieId };
    if (date) {
      query.showDate = date;
    }

    const shows = await Show.find(query)
      .populate('movie', 'title duration rating posterUrl')
      .populate('theater', 'theatreName location screenType')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show details including seat status
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theater');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    res.status(200).json({
      success: true,
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shows across all movies (for Admin Dashboard)
// @route   GET /api/shows
// @access  Private / Admin
const getAllShows = async (req, res, next) => {
  try {
    const shows = await Show.find({})
      .populate('movie', 'title posterUrl duration rating')
      .sort({ showDate: -1, showTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new show for a movie
// @route   POST /api/shows
// @access  Private / Admin
const createShow = async (req, res, next) => {
  try {
    const {
      movieId,
      theaterId,
      screenName,
      screenType,
      showDate,
      showTime,
      ticketPrice,
      totalSeats,
    } = req.body;

    if (!movieId || !showDate || !showTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movieId, showDate, and showTime',
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const show = await Show.create({
      movie: movieId,
      theater: theaterId || null,
      screenName: screenName || 'Screen 1 - Dolby Atmos',
      screenType: screenType || 'Standard',
      showDate,
      showTime,
      ticketPrice: ticketPrice || { silver: 180, gold: 250, platinum: 350 },
      totalSeats: totalSeats || 60,
      bookedSeats: [],
    });

    const populatedShow = await Show.findById(show._id).populate('movie').populate('theater');

    res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      data: populatedShow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a show
// @route   DELETE /api/shows/:id
// @access  Private / Admin
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    await Show.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShowsByMovie,
  getShowById,
  getAllShows,
  createShow,
  deleteShow,
};
