const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @desc    Get all movies with optional search, genre filtering, and language mixing
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, sort } = req.query;
    let query = { isActive: true };

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(`^${genre.trim()}$`, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $regex: `^${language.trim()}$`, $options: 'i' };
    }

    let movies;
    if (sort === 'rating') {
      movies = await Movie.find(query).sort({ rating: -1 });
    } else if (sort === 'title') {
      movies = await Movie.find(query).sort({ title: 1 });
    } else if (sort === 'releaseDate') {
      movies = await Movie.find(query).sort({ releaseDate: -1 });
    } else {
      // Natural mixed order: fetch active movies sorted by newest release
      // When no explicit language filter is selected, proportionally blend languages
      // (Hindi, English, Japanese, etc.) throughout the catalog
      const fetched = await Movie.find(query).sort({ releaseDate: -1, rating: -1 });
      if (!language || language === 'All') {
        const groups = {};
        fetched.forEach((m) => {
          const lang = (m.language || 'English').trim();
          const normalized = lang.toLowerCase().includes('hindi')
            ? 'Hindi'
            : lang.toLowerCase().includes('english')
            ? 'English'
            : lang;
          if (!groups[normalized]) groups[normalized] = [];
          groups[normalized].push(m);
        });

        const languages = Object.keys(groups);
        if (languages.length > 1) {
          const totalCount = fetched.length;
          const result = new Array(totalCount);
          const occupied = new Set();

          // Distribute each language proportionally across the catalog
          languages.forEach((lang) => {
            const list = groups[lang];
            const step = totalCount / list.length;
            list.forEach((movie, idx) => {
              let targetIdx = Math.floor(idx * step);
              while (occupied.has(targetIdx) && targetIdx < totalCount) {
                targetIdx++;
              }
              if (targetIdx >= totalCount) {
                targetIdx = 0;
                while (occupied.has(targetIdx)) {
                  targetIdx++;
                }
              }
              result[targetIdx] = movie;
              occupied.add(targetIdx);
            });
          });

          movies = result.filter(Boolean);
        } else {
          movies = fetched;
        }
      } else {
        movies = fetched;
      }
    }

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private / Admin
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      posterUrl,
      bannerUrl,
      trailerUrl,
      genres,
      duration,
      rating,
      language,
      director,
      cast,
      releaseDate,
    } = req.body;

    if (!title || !description || !posterUrl || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, posterUrl, and duration',
      });
    }

    const movie = await Movie.create({
      title,
      description,
      posterUrl,
      bannerUrl: bannerUrl || posterUrl,
      trailerUrl: trailerUrl || '',
      genres: Array.isArray(genres) ? genres : (genres ? genres.split(',').map((g) => g.trim()) : ['Action']),
      duration: Number(duration),
      rating: rating ? Number(rating) : 8.0,
      language: language || 'English',
      director: director || 'Director',
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map((c) => c.trim()) : []),
      releaseDate: releaseDate || Date.now(),
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie details
// @route   PUT /api/movies/:id
// @access  Private / Admin
const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Process genres and cast if sent as comma-separated string
    const updateData = { ...req.body };
    if (typeof updateData.genres === 'string') {
      updateData.genres = updateData.genres.split(',').map((g) => g.trim());
    }
    if (typeof updateData.cast === 'string') {
      updateData.cast = updateData.cast.split(',').map((c) => c.trim());
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private / Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Delete associated shows
    await Show.deleteMany({ movie: req.params.id });
    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Movie and associated shows deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct genres
// @route   GET /api/movies/genres
// @access  Public
const getDistinctGenres = async (req, res, next) => {
  try {
    const genres = await Movie.distinct('genres');
    res.status(200).json({
      success: true,
      data: ['All', ...genres],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getDistinctGenres,
};
