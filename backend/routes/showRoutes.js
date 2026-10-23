const express = require('express');
const router = express.Router();
const {
  getShowsByMovie,
  getShowById,
  getAllShows,
  createShow,
  deleteShow,
} = require('../controllers/showController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/movie/:movieId', getShowsByMovie);

router.route('/')
  .get(protect, adminOnly, getAllShows)
  .post(protect, adminOnly, createShow);

router.route('/:id')
  .get(getShowById)
  .delete(protect, adminOnly, deleteShow);

module.exports = router;
