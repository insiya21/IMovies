import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/movies/MovieCard';
import HeroBanner from '../components/movies/HeroBanner';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const filterParam = searchParams.get('filter') || '';

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync search input if query param changes
  useEffect(() => {
    if (initialSearch !== searchTerm) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  // Handle coming-soon filter from nav
  useEffect(() => {
    if (filterParam === 'coming-soon') {
      setSelectedGenre('Sci-Fi');
    }
  }, [filterParam]);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await moviesAPI.getGenres();
        if (res.data.data) {
          setGenres(res.data.data);
        }
      } catch (err) {
        console.warn('Could not fetch genres:', err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies based on search and genre
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedGenre !== 'All') params.genre = selectedGenre;

        const res = await moviesAPI.getAll(params);
        setMovies(res.data.data || []);
      } catch (err) {
        setError('Failed to load movies. Please make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchMovies();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedGenre]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const trendingMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div className="container py-3">
      {/* Featured Hero Banner */}
      {!searchTerm && selectedGenre === 'All' && trendingMovie && (
        <HeroBanner movie={trendingMovie} />
      )}

      {/* Discovery Section Header */}
      <div id="movies-section" className="pt-2 mb-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2.5 mb-2.5">
          <div>
            <h2
              className="fw-bold text-light mb-0 d-flex align-items-center gap-2 section-heading"
              style={{ fontSize: 'clamp(24px, 2.2vw, 30px)' }}
            >
              <i className="bi bi-film" style={{ color: 'var(--color-primary)' }}></i>
              <span>{filterParam === 'coming-soon' ? 'Coming Soon' : 'Now Showing'}</span>
            </h2>
            <div className="supporting-text mt-0.5">
              Explore available cinema screenings and reserve your seats
            </div>
          </div>

          {/* Title search */}
          <div style={{ maxWidth: '260px', width: '100%' }}>
            <div className="position-relative">
              <input
                type="text"
                className="cinema-input form-control form-control-sm pe-4"
                placeholder="Filter by title..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn position-absolute top-50 end-0 translate-middle-y text-secondary p-1 border-0"
                  style={{ right: '6px' }}
                  onClick={() => {
                    setSearchTerm('');
                    setSearchParams({});
                  }}
                  aria-label="Clear Search"
                >
                  <i className="bi bi-x-lg" style={{ fontSize: '0.75rem' }}></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clean Genre-Filter Row (wraps cleanly on mobile without horizontal page overflow) */}
        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
          <span className="text-secondary small me-1 fw-medium d-none d-sm-inline" style={{ fontSize: '0.8rem' }}>
            Genre:
          </span>
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-filter-btn ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Movie Grid: 4–6 per row on desktop, 2–3 on tablets, 1–2 on mobile */}
      {loading ? (
        <div className="text-center py-5 my-3">
          <div
            className="spinner-border"
            role="status"
            style={{ color: 'var(--color-primary)', width: '2rem', height: '2rem' }}
          >
            <span className="visually-hidden">Loading movies...</span>
          </div>
          <p className="text-secondary small mt-2">Loading screenings...</p>
        </div>
      ) : error ? (
        <div className="alert alert-dark p-3 text-center my-3 border-danger rounded-3">
          <i className="bi bi-exclamation-circle text-danger fs-4 d-block mb-1.5"></i>
          <h6 className="text-light mb-1">Unable to load movies</h6>
          <p className="text-secondary small mb-2">{error}</p>
          <button
            className="btn btn-cinema-primary btn-sm py-1 px-3"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : movies.length === 0 ? (
        <div
          className="text-center py-5 my-3 p-4 rounded-3 border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <i className="bi bi-film text-secondary fs-2 d-block mb-2"></i>
          <h6 className="text-light mb-1">No movies found</h6>
          <p className="text-secondary small mb-3">
            {searchTerm
              ? `No movies matched your search for "${searchTerm}".`
              : 'No movies are currently scheduled for this genre.'}
          </p>
          <button
            className="btn btn-cinema-outline btn-sm py-1 px-3"
            onClick={() => {
              setSearchTerm('');
              setSelectedGenre('All');
              setSearchParams({});
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="movie-cards-grid">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
