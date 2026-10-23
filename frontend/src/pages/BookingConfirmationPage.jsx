import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import DigitalTicket from '../components/booking/DigitalTicket';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If not passed via state, fetch from API
    if (!booking && id) {
      const fetchBooking = async () => {
        try {
          const res = await bookingsAPI.getById(id);
          setBooking(res.data.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Could not load your booking confirmation.');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div
          className="spinner-border"
          role="status"
          style={{ color: 'var(--color-primary)', width: '2.5rem', height: '2.5rem' }}
        >
          <span className="visually-hidden">Loading confirmation...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-dark border-danger text-light p-4 rounded-3">
          <h5>Booking Not Found</h5>
          <p className="text-secondary small">{error || 'Unable to locate ticket record.'}</p>
          <Link to="/" className="btn btn-cinema-primary btn-sm mt-2">
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="text-center mx-auto mb-3" style={{ maxWidth: '520px' }}>
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center text-success mb-2"
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <i className="bi bi-check-circle fs-3"></i>
        </div>
        <h4 className="fw-bold text-light mb-1">Booking Confirmed!</h4>
        <p className="text-secondary small mb-0">
          Your cinema seats have been reserved successfully. Here is your digital ticket.
        </p>
      </div>

      {/* Stylized Cinema Ticket Component */}
      <DigitalTicket booking={booking} />

      {/* Action Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-2.5 mt-3.5 d-print-none">
        <Link to="/my-bookings" className="btn btn-cinema-outline btn-sm px-3 py-1.5">
          <i className="bi bi-ticket-perforated me-1 text-warning"></i>
          View My Bookings
        </Link>
        <Link to="/" className="btn btn-cinema-primary btn-sm px-3 py-1.5">
          <i className="bi bi-film me-1"></i>
          Browse More Movies
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
