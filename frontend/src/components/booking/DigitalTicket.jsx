import React from 'react';
import { formatINR } from '../../utils/currency';

const DigitalTicket = ({ booking }) => {
  if (!booking) return null;

  const movie = booking.movie || {};
  const show = booking.show || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cinema-ticket-card p-4 p-md-4 my-3">
      {/* Visual Perforated Ticket Notches */}
      <div className="ticket-notch-left"></div>
      <div className="ticket-notch-right"></div>

      {/* Ticket Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <span
            className="badge text-uppercase mb-1.5"
            style={{
              backgroundColor: 'rgba(255, 53, 72, 0.15)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(255, 53, 72, 0.3)',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.2rem 0.55rem',
            }}
          >
            Confirmed Ticket
          </span>
          <h4 className="text-white fw-bold mb-0.5" style={{ fontSize: '1.25rem' }}>
            {movie.title || 'Movie Title'}
          </h4>
          <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem' }}>
            {movie.genres?.join(' • ') || 'Feature Film'} • {movie.duration || 120} mins
          </p>
        </div>
        <div className="text-end">
          <div className="text-secondary small text-uppercase" style={{ fontSize: '0.7rem' }}>
            Booking Ref
          </div>
          <div
            className="fw-bold tracking-wider"
            style={{ color: 'var(--color-gold)', fontFamily: 'monospace', fontSize: '1.15rem' }}
          >
            {booking.bookingRef}
          </div>
        </div>
      </div>

      {/* Key Info Grid */}
      <div
        className="row g-2 p-2.5 rounded-2 mb-3 border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-subtle)',
          fontSize: '0.82rem',
        }}
      >
        <div className="col-6 col-md-3">
          <div className="text-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>Date</div>
          <div className="text-light fw-semibold">{show.showDate || 'Today'}</div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>Time</div>
          <div className="fw-bold" style={{ color: 'var(--color-primary)' }}>
            {show.showTime || '18:00'}
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>Auditorium</div>
          <div className="text-light fw-semibold text-truncate">{show.screenName || 'Screen 1'}</div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>Format</div>
          <span
            className="badge"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-main)',
              fontSize: '0.7rem',
            }}
          >
            {show.screenType || 'Standard'}
          </span>
        </div>
      </div>

      {/* Seats Highlight */}
      <div className="mb-3">
        <div className="text-secondary small text-uppercase mb-1.5" style={{ fontSize: '0.72rem' }}>
          Reserved Seats
        </div>
        <div className="d-flex flex-wrap gap-1.5">
          {booking.seats?.map((seat) => (
            <span
              key={seat}
              className="badge d-inline-flex align-items-center gap-1"
              style={{
                backgroundColor: 'rgba(255, 53, 72, 0.12)',
                border: '1px solid rgba(255, 53, 72, 0.35)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                padding: '0.3rem 0.65rem',
              }}
            >
              <i className="bi bi-ticket-perforated" style={{ color: 'var(--color-primary)' }}></i>
              <span>{seat}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Perforated Divider */}
      <div className="ticket-divider-perforated"></div>

      {/* Ticket Footer / Stub */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2.5">
        <div>
          <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>Total Paid</div>
          <div className="fs-5 fw-bold text-light">{formatINR(booking.totalAmount)}</div>
          <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
            Paid via {booking.paymentMethod || 'Demo Card'}
          </div>
        </div>

        {/* Barcode Mockup */}
        <div className="text-center text-sm-end">
          <div className="barcode-mockup mb-1" style={{ width: '150px' }}></div>
          <span className="text-secondary text-monospace small" style={{ fontSize: '0.72rem' }}>
            {booking.bookingRef}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div
        className="mt-3 pt-2.5 border-top d-flex gap-2 justify-content-end d-print-none"
        style={{ borderColor: 'var(--border-subtle) !important' }}
      >
        <button className="btn btn-cinema-outline btn-sm py-1 px-3" onClick={handlePrint}>
          <i className="bi bi-printer me-1"></i> Print Ticket
        </button>
      </div>
    </div>
  );
};

export default DigitalTicket;
