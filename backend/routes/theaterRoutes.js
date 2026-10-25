const express = require('express');
const router = express.Router();
const {
  getTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
} = require('../controllers/theaterController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTheaters)
  .post(protect, adminOnly, createTheater);

router.route('/:id')
  .get(getTheaterById)
  .put(protect, adminOnly, updateTheater)
  .delete(protect, adminOnly, deleteTheater);

module.exports = router;
