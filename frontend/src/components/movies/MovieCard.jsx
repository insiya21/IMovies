import React from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_POSTERS = {
  'dune: part two': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  'oppenheimer': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
  'spider-man: across the spider-verse': 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
  'interstellar': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
  'inception': 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80',
  'cyberpunk 2099: neon horizon': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
};

// Clean SVG fallback poster if network image fails
const DEFAULT_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450' width='300' height='450'%3E%3Crect width='100%25' height='100%25' fill='%23111820'/%3E%3Crect x='8' y='8' width='284' height='434' rx='10' fill='%23101820' stroke='%231E2633' stroke-width='2'/%3E%3Ccircle cx='150' cy='185' r='40' fill='%23FF3548' fill-opacity='0.15' stroke='%23FF3548' stroke-width='2'/%3E%3Cpath d='M142 168 L168 185 L142 202 Z' fill='%23FF3548'/%3E%3Ctext x='150' y='260' fill='%23F5F7FA' font-family='sans-serif' font-size='16' font-weight='bold' text-anchor='middle'%3EIMOVIES%3C/text%3E%3Ctext x='150' y='285' fill='%23A6B0BE' font-family='sans-serif' font-size='12' text-anchor='middle'%3ECinema Screening%3C/text%3E%3C/svg%3E";

const MovieCard = ({ movie }) => {
  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const titleKey = movie.title?.toLowerCase() || '';
  const initialPoster = movie.posterUrl || FALLBACK_POSTERS[titleKey] || DEFAULT_POSTER;

  return (
    <div className="cinema-card">
      {/* Consistent 2:3 Aspect Ratio Poster */}
      <div className="cinema-poster-wrapper">
        <img
          src={initialPoster}
          alt={movie.title}
          className="cinema-poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            if (FALLBACK_POSTERS[titleKey] && e.target.src !== FALLBACK_POSTERS[titleKey]) {
              e.target.src = FALLBACK_POSTERS[titleKey];
            } else {
              e.target.src = DEFAULT_POSTER;
            }
          }}
        />

        {/* Rating Badge Top-Left Overlay */}
        <div className="position-absolute top-0 start-0 m-2">
          <span className="badge-rating" style={{ fontSize: '12px', padding: '2px 6px' }}>
            <i className="bi bi-star-fill"></i>
            <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
          </span>
        </div>

        {/* Duration Badge Bottom-Right Overlay */}
        {movie.duration && (
          <div className="position-absolute bottom-0 end-0 m-2">
            <span className="badge-duration" style={{ fontSize: '11.5px', padding: '2px 6px' }}>
              <i className="bi bi-clock"></i>
              <span>{formatDuration(movie.duration)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Body with strictly aligned rows */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        {/* Movie Title with Graceful Truncation (16px) */}
        <h3
          className="movie-card-title text-light mb-1"
          title={movie.title}
        >
          {movie.title}
        </h3>

        {/* Genre Row (13px) */}
        <div className="movie-card-genres mb-2.5">
          {movie.genres?.slice(0, 2).map((genre, idx) => (
            <span key={idx} className="badge-genre-tag">
              {genre}
            </span>
          ))}
          {movie.genres?.length > 2 && (
            <span className="genre-more-tag">
              +{movie.genres.length - 2}
            </span>
          )}
        </div>

        {/* Booking Button (14px) pinned to bottom */}
        <div className="mt-auto pt-2 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
          <Link
            to={`/movie/${movie._id}`}
            className="btn btn-cinema-primary movie-card-btn w-100"
          >
            <i className="bi bi-ticket-perforated me-1"></i>
            <span>Book Tickets</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
