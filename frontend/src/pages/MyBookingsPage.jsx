import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import DigitalTicket from '../components/booking/DigitalTicket';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

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

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    setActionMessage(null);
    try {
      await bookingsAPI.cancel(cancelModalBooking._id);
      setActionMessage({
        type: 'success',
        text: `Booking ${cancelModalBooking.bookingRef} has been cancelled and your seats were released.`,
      });
      setCancelModalBooking(null);
      await fetchBookings();
    } catch (err) {
      setActionMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to cancel booking. Please try again.',
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-3.5">
        <h4 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-ticket-perforated" style={{ color: 'var(--color-primary)' }}></i>
          <span>My Bookings & Tickets</span>
        </h4>
        <p className="text-secondary small mb-0">Access, view, or manage your cinema reservations</p>
      </div>

      {actionMessage && (
        <div className={`alert alert-${actionMessage.type} alert-dismissible fade show mb-3`} role="alert">
          <i className={`bi ${actionMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {actionMessage.text}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setActionMessage(null)}></button>
        </div>
      )}

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
                        {booking.paymentStatus === 'cancelled' ? (
                          <span
                            className="badge mb-1.5 d-inline-flex align-items-center gap-1"
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              fontSize: '0.72rem',
                            }}
                          >
                            <i className="bi bi-x-circle"></i> Cancelled
                          </span>
                        ) : (
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
                        )}
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

                    <div className="d-flex align-items-center gap-2">
                      {booking.paymentStatus !== 'cancelled' && (
                        <button
                          className="btn btn-outline-danger btn-sm py-1 px-2.5 d-flex align-items-center gap-1"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => setCancelModalBooking(booking)}
                        >
                          <i className="bi bi-x-circle"></i>
                          <span>Cancel</span>
                        </button>
                      )}
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
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(8, 13, 19, 0.88)', zIndex: 1090 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content shadow-lg border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="modal-header py-2.5 px-3 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                <h6 className="modal-title text-danger fw-bold mb-0 d-flex align-items-center gap-1.5">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>Confirm Ticket Cancellation</span>
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  disabled={cancelling}
                  onClick={() => setCancelModalBooking(null)}
                ></button>
              </div>
              <div className="modal-body p-3.5">
                <p className="text-light mb-2">
                  Are you sure you want to cancel your reservation for{' '}
                  <strong>{cancelModalBooking.movie?.title || 'this movie'}</strong>?
                </p>
                <div
                  className="p-2.5 rounded-2 mb-3 border small"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="text-secondary mb-1">
                    Booking Reference:{' '}
                    <span className="text-warning fw-mono">{cancelModalBooking.bookingRef}</span>
                  </div>
                  <div className="text-secondary mb-1">
                    Seats to be released:{' '}
                    <span className="text-light fw-bold">{cancelModalBooking.seats?.join(', ')}</span>
                  </div>
                  <div className="text-secondary">
                    Total Refund Amount:{' '}
                    <span className="text-success fw-bold">${cancelModalBooking.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-secondary small">
                  Once cancelled, these seats will be immediately released back into real-time availability for other patrons.
                </div>
              </div>
              <div className="modal-footer py-2 px-3 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  className="btn btn-cinema-outline btn-sm px-3"
                  disabled={cancelling}
                  onClick={() => setCancelModalBooking(null)}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-3 d-flex align-items-center gap-1.5"
                  disabled={cancelling}
                  onClick={handleConfirmCancel}
                >
                  {cancelling ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle-fill"></i>
                      <span>Yes, Cancel Booking</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
