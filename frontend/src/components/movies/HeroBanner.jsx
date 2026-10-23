import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HeroBanner = ({ movie }) => {
  const [showTrailer, setShowTrailer] = useState(false);

  if (!movie) return null;

  const bgImage = movie.bannerUrl || movie.posterUrl;

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  const embedUrl = getEmbedUrl(movie.trailerUrl);

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <>
      <div
        className="hero-spotlight mb-3.5 shadow-sm"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          {/* Compact Metadata Row: Rating, Duration, Genres */}
          <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
            <span
              className="badge text-uppercase"
              style={{
                backgroundColor: 'rgba(255, 53, 72, 0.15)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(255, 53, 72, 0.3)',
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              Featured
            </span>

            <span className="badge-rating">
              <i className="bi bi-star-fill"></i>
              <span>{movie.rating ? movie.rating.toFixed(1) : '8.8'}</span>
            </span>

            <span className="text-secondary small d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-clock"></i>
              <span>{formatDuration(movie.duration) || `${movie.duration}m`}</span>
            </span>

            {/* Inline Genres */}
            <div className="d-flex flex-wrap gap-1">
              {movie.genres?.slice(0, 3).map((genre, idx) => (
                <span key={idx} className="badge-genre">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Balanced Desktop Hero Title (~48px) */}
          <h1 className="hero-title">
            {movie.title}
          </h1>

          {/* Readable 2-line Synopsis (~15px) */}
          <p className="hero-synopsis">
            {movie.description}
          </p>

          {/* Aligned Action Buttons */}
          <div className="d-flex flex-wrap gap-2.5 pt-1">
            <Link
              to={`/movie/${movie._id}`}
              className="btn btn-cinema-primary gap-1.5"
            >
              <i className="bi bi-ticket-perforated"></i>
              <span>Book Tickets</span>
            </Link>

            {embedUrl && (
              <button
                type="button"
                className="btn btn-cinema-outline gap-1.5"
                onClick={() => setShowTrailer(true)}
              >
                <i className="bi bi-play-circle text-danger"></i>
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(8, 13, 19, 0.88)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content shadow-lg border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div
                className="modal-header py-2 px-3 border-bottom"
                style={{ borderColor: 'var(--border-subtle) !important' }}
              >
                <h6 className="modal-title text-light fw-bold mb-0" style={{ fontSize: '0.92rem' }}>
                  {movie.title} — Official Trailer
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
                    src={`${embedUrl}?autoplay=1`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroBanner;
