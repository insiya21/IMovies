import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import DigitalTicket from '../components/booking/DigitalTicket';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingsAPI.getMyBookings();
        setBookings(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your booking history.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="container py-4">
      <div className="mb-3.5">
        <h4 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-ticket-perforated" style={{ color: 'var(--color-primary)' }}></i>
          <span>My Bookings & Tickets</span>
        </h4>
        <p className="text-secondary small mb-0">Access and view all your cinema reservations</p>
      </div>

      {loading ? (
        <div className="text-center py-5 my-4">
          <div
            className="spinner-border"
            role="status"
            style={{ color: 'var(--color-primary)', width: '2.5rem', height: '2.5rem' }}
          >
            <span className="visually-hidden">Loading bookings...</span>
          </div>
          <p className="text-secondary small mt-2">Retrieving tickets...</p>
        </div>
      ) : error ? (
        <div className="alert alert-dark border-danger text-light p-4 text-center rounded-3">
          <h6>Error Loading History</h6>
          <p className="text-secondary small mb-0">{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div
          className="card p-5 text-center my-4 rounded-3 border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <i className="bi bi-ticket-perforated text-secondary fs-1 mb-2"></i>
          <h5 className="text-light mb-1">No bookings found</h5>
          <p className="text-secondary small mb-3">You haven't reserved tickets for any screenings yet.</p>
          <div>
            <Link to="/" className="btn btn-cinema-primary btn-sm px-3.5 py-1.5">
              Browse Movies & Book Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map((booking) => {
            const movie = booking.movie || {};
            const show = booking.show || {};

            return (
              <div key={booking._id} className="col-lg-6">
                <div
                  className="card p-3 h-100 d-flex flex-column justify-content-between rounded-3 border shadow-sm"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                >
                  <div>
                    {/* Header info */}
                    <div className="d-flex justify-content-between align-items-start mb-2.5">
                      <div>
                        <span
                          className="badge mb-1.5 d-inline-flex align-items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--color-success)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontSize: '0.72rem',
                          }}
                        >
                          <i className="bi bi-check-circle"></i> Confirmed
                        </span>
                        <h6 className="text-light fw-bold mb-0.5" style={{ fontSize: '1rem' }}>
                          {movie.title || 'Movie'}
                        </h6>
                        <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>
                          <i className="bi bi-camera-reels me-1"></i> {show.screenName || 'Cinema Screen'}
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>Ref ID</div>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(255, 200, 61, 0.12)',
                            color: 'var(--color-gold)',
                            border: '1px solid rgba(255, 200, 61, 0.3)',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                          }}
                        >
                          {booking.bookingRef}
                        </span>
                      </div>
                    </div>

                    {/* Movie Poster & Screening Info */}
                    <div
                      className="d-flex gap-2.5 align-items-center p-2.5 rounded-2 mb-2.5 border"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="rounded"
                        style={{ width: '48px', height: '68px', objectFit: 'cover' }}
                      />
                      <div className="small" style={{ fontSize: '0.8rem' }}>
                        <div className="text-light fw-medium mb-0.5">
                          <i className="bi bi-calendar-event me-1 text-danger"></i> {show.showDate} at {show.showTime}
                        </div>
                        <div className="text-secondary mb-0.5">
                          <span className="badge bg-secondary me-1.5" style={{ fontSize: '0.68rem' }}>
                            {show.screenType || 'Standard'}
                          </span>
                          {booking.seats?.length} {booking.seats?.length === 1 ? 'Seat' : 'Seats'}
                        </div>
                        <div className="fw-semibold" style={{ color: 'var(--color-gold)' }}>
                          Seats: {booking.seats?.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div
                    className="pt-2 border-top d-flex justify-content-between align-items-center"
                    style={{ borderColor: 'var(--border-subtle) !important' }}
                  >
                    <div>
                      <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>Total Paid</div>
                      <div className="fw-bold text-light" style={{ fontSize: '0.98rem' }}>
                        ${booking.totalAmount?.toFixed(2)}
                      </div>
                    </div>

                    <button
                      className="btn btn-cinema-outline btn-sm py-1 px-2.5 d-flex align-items-center gap-1.5"
                      style={{ fontSize: '0.82rem' }}
                      onClick={() => setSelectedTicket(booking)}
                    >
                      <i className="bi bi-qr-code"></i>
                      <span>View Ticket</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(8, 13, 19, 0.88)', zIndex: 1080 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 pb-0 justify-content-end">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedTicket(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <DigitalTicket booking={selectedTicket} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
