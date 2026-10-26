const Theater = require('../models/Theater');

// @desc    Get all theaters
// @route   GET /api/theaters
// @access  Public
const getTheaters = async (req, res, next) => {
  try {
    const theaters = await Theater.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: theaters.length,
      data: theaters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theater by ID
// @route   GET /api/theaters/:id
// @access  Public
const getTheaterById = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }
    res.status(200).json({
      success: true,
      data: theater,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new theater
// @route   POST /api/theaters
// @access  Private / Admin
const createTheater = async (req, res, next) => {
  try {
    const {
      theatreName,
      location,
      screenType,
      balconySeatPrice,
      middleSeatPrice,
      lowerSeatPrice,
      totalSeats,
    } = req.body;

    if (!theatreName || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both theater name and location',
      });
    }

    const theater = await Theater.create({
      theatreName: theatreName.trim(),
      location: location.trim(),
      screenType: screenType || 'Standard',
      balconySeatPrice: Number(balconySeatPrice) || 350,
      middleSeatPrice: Number(middleSeatPrice) || 250,
      lowerSeatPrice: Number(lowerSeatPrice) || 180,
      totalSeats: Number(totalSeats) || 60,
    });

    res.status(201).json({
      success: true,
      message: 'Theater added successfully',
      data: theater,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing theater
// @route   PUT /api/theaters/:id
// @access  Private / Admin
const updateTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theater updated successfully',
      data: theater,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a theater
// @route   DELETE /api/theaters/:id
// @access  Private / Admin
const deleteTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theater deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
};
