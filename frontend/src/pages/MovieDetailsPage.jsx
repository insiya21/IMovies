import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { moviesAPI, showsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

const FALLBACK_POSTERS = {
  'dune: part two': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  'oppenheimer': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
  'spider-man: across the spider-verse': 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
  'interstellar': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
  'inception': 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80',
  'cyberpunk 2099: neon horizon': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
  '3 idiots': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
  'stree 2': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  'bhool bhulaiyaa 3': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  'zindagi na milegi dobara': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  '12th fail': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
  'stand by me doraemon': 'https://upload.wikimedia.org/wikipedia/en/0/01/Stand_by_Me_Doraemon_official_poster.jpg',
  'stand by me doraemon (2014)': 'https://upload.wikimedia.org/wikipedia/en/0/01/Stand_by_Me_Doraemon_official_poster.jpg',
};

const DEFAULT_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450' width='300' height='450'%3E%3Crect width='100%25' height='100%25' fill='%23111820'/%3E%3Crect x='8' y='8' width='284' height='434' rx='10' fill='%23101820' stroke='%231E2633' stroke-width='2'/%3E%3Ccircle cx='150' cy='185' r='40' fill='%23FF3548' fill-opacity='0.15' stroke='%23FF3548' stroke-width='2'/%3E%3Cpath d='M142 168 L168 185 L142 202 Z' fill='%23FF3548'/%3E%3Ctext x='150' y='260' fill='%23F5F7FA' font-family='sans-serif' font-size='16' font-weight='bold' text-anchor='middle'%3EIMOVIES%3C/text%3E%3Ctext x='150' y='285' fill='%23A6B0BE' font-family='sans-serif' font-size='12' text-anchor='middle'%3ECinema Screening%3C/text%3E%3C/svg%3E";

const DEFAULT_BACKDROP =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  // Protected showtime selection handler: Guests must sign in before proceeding to booking
  const handleShowtimeClick = (show) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: `/booking/${show._id}` },
          message: 'Please sign in to book your tickets.',
        },
      });
      return;
    }
    if (user?.role === 'admin') {
      alert('Administrators manage screenings through the Admin Dashboard. Customer ticket booking is restricted to customer accounts.');
      return;
    }
    navigate(`/booking/${show._id}`);
  };

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

  // Handle Escape key to dismiss trailer modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showTrailer) {
        setShowTrailer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTrailer]);

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatReleaseDate = (dateVal) => {
    if (!dateVal) return null;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return null;
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    return url;
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
      <div className="container py-5 text-center my-5">
        <div
          className="card p-4 mx-auto rounded-3 border"
          style={{
            maxWidth: '520px',
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="mb-3">
            <span
              className="rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: 'rgba(255, 53, 72, 0.12)',
                color: 'var(--color-primary)',
              }}
            >
              <i className="bi bi-film fs-3"></i>
            </span>
          </div>
          <h4 className="fw-bold text-light mb-1">Movie Not Found</h4>
          <p className="text-secondary small mb-3">
            {error || 'The requested movie could not be located or may have been removed.'}
          </p>
          <div>
            <Link to="/" className="btn btn-cinema-primary btn-sm px-3 py-1.5">
              <i className="bi bi-arrow-left me-1.5"></i>
              <span>Back to Movies</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const titleKey = movie.title?.toLowerCase() || '';
  const fallbackPoster =
    FALLBACK_POSTERS[titleKey] ||
    (titleKey.includes('doraemon') ? FALLBACK_POSTERS['stand by me doraemon'] : null);
  const initialPoster = movie.posterUrl || fallbackPoster || DEFAULT_POSTER;
  const initialBackdrop = movie.bannerUrl || movie.posterUrl || DEFAULT_BACKDROP;
  const formattedReleaseDate = formatReleaseDate(movie.releaseDate);
  const embedUrl = getEmbedUrl(movie.trailerUrl);

  // Group shows by screen/auditorium and theater
  const showsByScreen = shows.reduce((acc, show) => {
    const theaterName = show.theater?.theatreName || 'IMovies Cinema';
    const screenKey = `${show.screenName} (${show.screenType})`;
    const fullKey = `${theaterName} — ${screenKey}`;
    if (!acc[fullKey]) {
      acc[fullKey] = {
        theaterName,
        theaterLocation: show.theater?.location || 'Downtown Megaplex',
        screenName: show.screenName,
        screenType: show.screenType,
        ticketPrice: show.ticketPrice,
        shows: [],
      };
    }
    acc[fullKey].shows.push(show);
    return acc;
  }, {});

  return (
    <div style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Movie Details Backdrop Header — Seamlessly anchored beneath navbar with zero light gaps */}
      <div
        className="movie-details-hero py-4 mb-4"
        style={{
          backgroundImage: `url(${initialBackdrop})`,
        }}
      >
        <div className="movie-details-hero-overlay"></div>

        <div className="container position-relative py-3" style={{ zIndex: 2 }}>
          {/* Breadcrumb link */}
          <div className="mb-3">
            <Link
              to="/"
              className="text-secondary text-decoration-none small d-inline-flex align-items-center gap-1 hover-light"
            >
              <i className="bi bi-arrow-left"></i>
              <span>Back to Discovery</span>
            </Link>
          </div>

          <div className="row g-4 align-items-center">
            {/* Poster column */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={initialPoster}
                alt={movie.title}
                className="img-fluid rounded-3 shadow border"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null;
                  if (fallbackPoster && e.target.src !== fallbackPoster) {
                    e.target.src = fallbackPoster;
                  } else {
                    e.target.src = DEFAULT_POSTER;
                  }
                }}
                style={{
                  maxHeight: '380px',
                  width: '100%',
                  objectFit: 'cover',
                  borderColor: 'var(--border-subtle)',
                }}
              />
            </div>

            {/* Synopsis & Movie Details Column */}
            <div className="col-md-8 col-lg-9">
              {/* Badges: Rating, Duration, Release Date, Language */}
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge-rating">
                  <i className="bi bi-star-fill"></i>
                  <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'} / 10</span>
                </span>

                {movie.duration && (
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
                )}

                {formattedReleaseDate && (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <i className="bi bi-calendar3 me-1"></i> {formattedReleaseDate}
                  </span>
                )}

                <span
                  className="badge"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                  }}
                >
                  <i className="bi bi-translate me-1"></i> {movie.language || 'Hindi / English'}
                </span>
              </div>

              {/* Movie Title */}
              <h1
                className="fw-extrabold text-white mb-2"
                style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)', letterSpacing: '-0.02em' }}
              >
                {movie.title}
              </h1>

              {/* Genre Badges */}
              <div className="d-flex flex-wrap gap-1.5 mb-3">
                {movie.genres?.map((genre, idx) => (
                  <span key={idx} className="badge-genre">
                    {genre}
                  </span>
                ))}
              </div>

              {/* Full Description / Synopsis */}
              <p
                className="text-muted-cinema small mb-3"
                style={{ maxWidth: '680px', lineHeight: '1.65' }}
              >
                {movie.description}
              </p>

              {/* Cast & Director */}
              <div
                className="row g-2 text-secondary small border-top pt-3 mb-3.5"
                style={{ borderColor: 'var(--border-subtle) !important', maxWidth: '680px' }}
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

              {/* Hero Action Buttons: Book Tickets & Watch Trailer */}
              <div className="d-flex flex-wrap align-items-center gap-2 pt-1">
                <a
                  href="#showtimes"
                  className="btn btn-cinema-primary btn-sm px-3.5 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('showtimes');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <i className="bi bi-ticket-perforated"></i>
                  <span>Book Tickets</span>
                </a>

                {movie.trailerUrl && (
                  <button
                    type="button"
                    className="btn btn-cinema-outline btn-sm px-3.5 py-2 d-inline-flex align-items-center gap-2"
                    onClick={() => setShowTrailer(true)}
                  >
                    <i className="bi bi-play-circle text-danger fs-6"></i>
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Booking Section */}
      <div className="container pb-5" id="showtimes">
        <div className="mb-3">
          <h5 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-calendar-event" style={{ color: 'var(--color-primary)' }}></i>
            <span>Select Date & Showtime</span>
          </h5>
          <p className="text-secondary small mb-0">Choose a convenient date, theater screen, and showtime to pick your seats</p>
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
            {Object.entries(showsByScreen).map(([groupTitle, groupData]) => (
              <div
                key={groupTitle}
                className="card p-3 rounded-3 border"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
              >
                {/* Screen & Theater Info Header */}
                <div
                  className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2.5 pb-2 border-bottom gap-2"
                  style={{ borderColor: 'var(--border-subtle) !important' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'rgba(255, 53, 72, 0.12)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      <i className="bi bi-camera-reels" style={{ fontSize: '0.9rem' }}></i>
                    </span>
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h6 className="text-light fw-bold mb-0" style={{ fontSize: '0.95rem' }}>
                          {groupData.theaterName} — {groupData.screenName}
                        </h6>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(255, 53, 72, 0.15)',
                            color: 'var(--color-primary)',
                            border: '1px solid rgba(255, 53, 72, 0.3)',
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                          }}
                        >
                          {groupData.screenType}
                        </span>
                      </div>
                      {groupData.theaterLocation && (
                        <div className="text-secondary small d-flex align-items-center gap-1 mt-0.5" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-geo-alt"></i>
                          <span>{groupData.theaterLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tier Pricing Breakdown in INR */}
                  <div className="d-flex gap-2 text-secondary small align-self-start align-self-md-center" style={{ fontSize: '0.78rem' }}>
                    <span>Silver: <strong className="text-light">{formatINR(groupData.ticketPrice?.silver ?? 180, false)}</strong></span>
                    <span>•</span>
                    <span>Gold: <strong className="text-light">{formatINR(groupData.ticketPrice?.gold ?? 250, false)}</strong></span>
                    <span>•</span>
                    <span>VIP: <strong className="text-light">{formatINR(groupData.ticketPrice?.platinum ?? 350, false)}</strong></span>
                  </div>
                </div>

                {/* Showtimes Buttons */}
                <div className="d-flex flex-wrap gap-2.5 pt-1">
                  {groupData.shows.map((show) => {
                    const bookedCount = show.bookedSeats?.length || 0;
                    const totalCount = show.totalSeats || 60;
                    const availableCount = totalCount - bookedCount;
                    const isSoldOut = availableCount <= 0;

                    return (
                      <button
                        key={show._id}
                        type="button"
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
                        onClick={() => handleShowtimeClick(show)}
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

      {/* Trailer Modal */}
      {showTrailer && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(8, 13, 19, 0.90)', zIndex: 1060 }}
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content shadow-lg border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div
                className="modal-header py-2.5 px-3 border-bottom"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <h6 className="modal-title text-light fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.95rem' }}>
                  <i className="bi bi-play-circle-fill text-danger"></i>
                  <span>{movie.title} — Official Trailer</span>
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setShowTrailer(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9">
                  <iframe
                    src={embedUrl}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <div
                className="modal-footer py-2 px-3 border-top d-flex justify-content-between align-items-center"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-cinema-outline d-inline-flex align-items-center gap-1.5"
                  >
                    <i className="bi bi-box-arrow-up-right"></i>
                    <span>Open on YouTube</span>
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowTrailer(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailsPage;
