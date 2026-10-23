import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { moviesAPI, showsAPI } from '../services/api';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to generate next 5 dates
  const getNextDays = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      dates.push({ iso, dayName, dayNumber, month });
    }
    return dates;
  };

  const datesList = getNextDays();

  // Set default selected date to today
  useEffect(() => {
    if (datesList.length > 0 && !selectedDate) {
      setSelectedDate(datesList[0].iso);
    }
  }, []);

  // Fetch movie data and showtimes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [movieRes, showsRes] = await Promise.all([
          moviesAPI.getById(id),
          showsAPI.getByMovie(id, selectedDate || undefined),
        ]);
        setMovie(movieRes.data.data);
        setShows(showsRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load movie information.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, selectedDate]);

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div
          className="spinner-border"
          role="status"
          style={{ color: 'var(--color-primary)', width: '2.5rem', height: '2.5rem' }}
        >
          <span className="visually-hidden">Loading movie details...</span>
        </div>
        <p className="text-secondary small mt-2">Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-dark border-danger text-light p-4 rounded-3">
          <h5 className="fw-bold">Movie Not Found</h5>
          <p className="text-secondary small">{error || 'The requested movie could not be located.'}</p>
          <Link to="/" className="btn btn-cinema-primary btn-sm mt-2">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  // Group shows by screen format
  const showsByScreen = shows.reduce((acc, show) => {
    const key = `${show.screenName} (${show.screenType})`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(show);
    return acc;
  }, {});

  return (
    <div>
      {/* Movie Details Backdrop Header */}
      <div
        className="position-relative py-4 mb-4"
        style={{
          backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        <div
          className="position-absolute inset-0 w-100 h-100"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,13,19,0.88) 0%, rgba(8,13,19,0.98) 100%)',
          }}
        ></div>

        <div className="container position-relative py-3" style={{ zIndex: 2 }}>
          {/* Breadcrumb link */}
          <div className="mb-3">
            <Link to="/" className="text-secondary text-decoration-none small d-inline-flex align-items-center gap-1 hover-light">
              <i className="bi bi-arrow-left"></i>
              <span>Back to Discovery</span>
            </Link>
          </div>

          <div className="row g-4 align-items-center">
            {/* Poster column */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="img-fluid rounded-3 shadow border"
                style={{
                  maxHeight: '380px',
                  width: '100%',
                  objectFit: 'cover',
                  borderColor: 'var(--border-subtle)',
                }}
              />
            </div>

            {/* Synopsis Column */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge-rating">
                  <i className="bi bi-star-fill"></i>
                  <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'} / 10</span>
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                  }}
                >
                  <i className="bi bi-clock me-1"></i> {formatDuration(movie.duration)}
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                  }}
                >
                  {movie.language || 'English'}
                </span>
              </div>

              <h1
                className="fw-extrabold text-white mb-2"
                style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)', letterSpacing: '-0.02em' }}
              >
                {movie.title}
              </h1>

              <div className="d-flex flex-wrap gap-1.5 mb-3">
                {movie.genres?.map((genre, idx) => (
                  <span key={idx} className="badge-genre">
                    {genre}
                  </span>
                ))}
              </div>

              <p
                className="text-muted-cinema small mb-3"
                style={{ maxWidth: '640px', lineHeight: '1.6' }}
              >
                {movie.description}
              </p>

              {/* Cast & Director */}
              <div
                className="row g-2 text-secondary small border-top pt-3"
                style={{ borderColor: 'var(--border-subtle) !important', maxWidth: '640px' }}
              >
                {movie.director && (
                  <div className="col-sm-6">
                    <span className="text-light fw-semibold">Director: </span>
                    <span className="text-secondary">{movie.director}</span>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="col-sm-6">
                    <span className="text-light fw-semibold">Cast: </span>
                    <span className="text-secondary">{movie.cast.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Booking Section */}
      <div className="container pb-5">
        <div className="mb-3">
          <h5 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-calendar-event" style={{ color: 'var(--color-primary)' }}></i>
            <span>Select Date & Showtime</span>
          </h5>
          <p className="text-secondary small mb-0">Choose a convenient date and screen to pick your seats</p>
        </div>

        {/* Date Selector Tabs */}
        <div className="d-flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {datesList.map((d) => (
            <button
              key={d.iso}
              className={`btn text-center px-3 py-2 rounded-2 border transition-all ${
                selectedDate === d.iso
                  ? 'btn-cinema-primary shadow-sm'
                  : 'btn-dark text-secondary'
              }`}
              style={{
                minWidth: '95px',
                backgroundColor: selectedDate === d.iso ? 'var(--color-primary)' : 'var(--bg-card)',
                borderColor: selectedDate === d.iso ? 'var(--color-primary)' : 'var(--border-subtle)',
              }}
              onClick={() => setSelectedDate(d.iso)}
            >
              <div className="small fw-medium opacity-80" style={{ fontSize: '0.72rem' }}>
                {d.dayName}
              </div>
              <div className="fw-bold" style={{ fontSize: '0.98rem' }}>
                {d.dayNumber} {d.month}
              </div>
            </button>
          ))}
        </div>

        {/* Showtimes List */}
        {shows.length === 0 ? (
          <div
            className="card p-4 text-center my-3 rounded-3 border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <i className="bi bi-clock-history text-secondary fs-3 mb-2"></i>
            <h6 className="text-light mb-1">No showtimes available for this date</h6>
            <p className="text-secondary small mb-0">
              Please choose another date or check back later for newly scheduled screenings.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {Object.entries(showsByScreen).map(([screenTitle, screenShows]) => (
              <div
                key={screenTitle}
                className="card p-3 rounded-3 border"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
              >
                <div
                  className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2.5 pb-2 border-bottom gap-2"
                  style={{ borderColor: 'var(--border-subtle) !important' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: 'rgba(255, 53, 72, 0.12)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      <i className="bi bi-camera-reels" style={{ fontSize: '0.85rem' }}></i>
                    </span>
                    <h6 className="text-light fw-bold mb-0" style={{ fontSize: '0.95rem' }}>
                      {screenTitle}
                    </h6>
                  </div>

                  <div className="d-flex gap-2 text-secondary small" style={{ fontSize: '0.78rem' }}>
                    <span>Silver: <strong className="text-light">${screenShows[0]?.ticketPrice?.silver}</strong></span>
                    <span>•</span>
                    <span>Gold: <strong className="text-light">${screenShows[0]?.ticketPrice?.gold}</strong></span>
                    <span>•</span>
                    <span>VIP: <strong className="text-light">${screenShows[0]?.ticketPrice?.platinum}</strong></span>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2.5 pt-1">
                  {screenShows.map((show) => {
                    const bookedCount = show.bookedSeats?.length || 0;
                    const totalCount = show.totalSeats || 60;
                    const availableCount = totalCount - bookedCount;
                    const isSoldOut = availableCount <= 0;

                    return (
                      <button
                        key={show._id}
                        className={`btn p-2.5 rounded-2 text-start border transition-all ${
                          isSoldOut
                            ? 'btn-dark opacity-40 cursor-not-allowed'
                            : 'btn-dark text-light'
                        }`}
                        style={{
                          minWidth: '120px',
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: isSoldOut ? 'var(--border-subtle)' : 'var(--border-subtle)',
                        }}
                        disabled={isSoldOut}
                        onClick={() => navigate(`/booking/${show._id}`)}
                      >
                        <div
                          className="fw-bold mb-0.5"
                          style={{
                            color: isSoldOut ? 'var(--text-muted)' : 'var(--color-primary)',
                            fontSize: '0.95rem',
                          }}
                        >
                          {show.showTime}
                        </div>
                        <div className="small text-secondary" style={{ fontSize: '0.72rem' }}>
                          {isSoldOut ? (
                            <span className="text-danger fw-semibold">Sold Out</span>
                          ) : (
                            <span>{availableCount} seats left</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;
