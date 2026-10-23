const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  getAdminStats,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/', protect, adminOnly, getAllBookings);
router.get('/:id', protect, getBookingById);

module.exports = router;
