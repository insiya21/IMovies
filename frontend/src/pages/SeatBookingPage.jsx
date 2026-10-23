import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatLayout from '../components/booking/SeatLayout';

const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Demo card form states
  const [cardName, setCardName] = useState(user?.name || 'John Doe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  const fetchShowData = async () => {
    try {
      const res = await showsAPI.getById(showId);
      setShow(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load show seat layout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showId) {
      fetchShowData();
    }
  }, [showId]);

  // Calculate pricing breakdown
  const calculatePricing = () => {
    if (!show) return { seatDetails: [], subtotal: 0, convenienceFee: 2.5, total: 0 };

    const prices = show.ticketPrice || { silver: 10, gold: 15, platinum: 22 };
    let subtotal = 0;

    const seatDetails = selectedSeats.map((seat) => {
      const row = seat.charAt(0).toUpperCase();
      let tier = 'gold';
      if (['A', 'B'].includes(row)) tier = 'silver';
      else if (['C', 'D'].includes(row)) tier = 'gold';
      else tier = 'platinum';

      const price = prices[tier] || 15;
      subtotal += price;

      return { seatNumber: seat, tier, price };
    });

    const convenienceFee = selectedSeats.length > 0 ? 2.5 : 0;
    const total = subtotal + convenienceFee;

    return { seatDetails, subtotal, convenienceFee, total };
  };

  const { seatDetails, subtotal, convenienceFee, total } = calculatePricing();

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/booking/${showId}` } } });
      return;
    }
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to proceed.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setError(null);

    try {
      const payload = {
        showId: show._id,
        seats: selectedSeats,
        seatDetails,
        paymentMethod: 'Demo Card',
      };

      const res = await bookingsAPI.create(payload);
      const createdBooking = res.data.data;

      setShowPaymentModal(false);
      navigate(`/booking-confirmation/${createdBooking.bookingRef || createdBooking._id}`, {
        state: { booking: createdBooking },
      });
    } catch (err) {
      // Concurrency conflict check (HTTP 409)
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message || 'Seat conflict: One or more seats were already taken.');
        // Refresh show data to display newly booked seats
        await fetchShowData();
        // Remove conflicted seats from selection
        const conflicted = err.response.data.conflictedSeats || [];
        setSelectedSeats((prev) => prev.filter((s) => !conflicted.includes(s)));
      } else {
        setError(err.response?.data?.message || 'Booking failed. Please try again.');
      }
      setShowPaymentModal(false);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div
          className="spinner-border"
          role="status"
          style={{ color: 'var(--color-primary)', width: '2.5rem', height: '2.5rem' }}
        >
          <span className="visually-hidden">Loading seating chart...</span>
        </div>
        <p className="text-secondary small mt-2">Loading interactive seating chart...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-dark border-danger text-light p-4 rounded-3">
          <h5 className="fw-bold">Show Not Found</h5>
          <p className="text-secondary small">{error || 'Unable to find this screening.'}</p>
          <Link to="/" className="btn btn-cinema-primary btn-sm mt-2">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const movie = show.movie || {};

  return (
    <div className="container py-3">
      {/* Breadcrumb Navigation */}
      <div className="mb-2.5">
        <Link
          to={`/movie/${movie._id}`}
          className="text-secondary text-decoration-none small d-inline-flex align-items-center gap-1 hover-light"
        >
          <i className="bi bi-arrow-left"></i>
          <span>Back to Movie Details</span>
        </Link>
      </div>

      {/* Show Overview Header Banner */}
      <div
        className="card p-3 mb-3.5 rounded-3 border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="row g-3 align-items-center">
          <div className="col-auto">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="rounded-2 shadow-sm"
              style={{ width: '55px', height: '80px', objectFit: 'cover' }}
            />
          </div>
          <div className="col">
            <h5 className="fw-bold text-light mb-1" style={{ fontSize: '1.05rem' }}>
              {movie.title}
            </h5>
            <div className="d-flex flex-wrap gap-2 text-secondary small align-items-center" style={{ fontSize: '0.8rem' }}>
              <span>
                <i className="bi bi-camera-reels me-1" style={{ color: 'var(--color-primary)' }}></i>
                {show.screenName}
              </span>
              <span>•</span>
              <span
                className="badge"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-main)',
                  fontSize: '0.72rem',
                }}
              >
                {show.screenType}
              </span>
              <span>•</span>
              <span>
                <i className="bi bi-calendar3 me-1"></i>
                {show.showDate}
              </span>
              <span>•</span>
              <span className="text-light fw-semibold">
                <i className="bi bi-clock me-1 text-danger"></i>
                {show.showTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3 py-2 small" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Booking Alert:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Main Layout Split: Seat Map & Order Summary */}
      <div className="row g-3">
        <div className="col-lg-8">
          <SeatLayout
            bookedSeats={show.bookedSeats || []}
            selectedSeats={selectedSeats}
            onSeatToggle={setSelectedSeats}
            ticketPrice={show.ticketPrice}
            maxSeats={8}
          />
        </div>

        {/* Order Summary Drawer */}
        <div className="col-lg-4">
          <div
            className="card p-3 rounded-3 border sticky-top shadow-sm"
            style={{
              top: '80px',
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <h6
              className="fw-bold text-light mb-2.5 pb-2 border-bottom d-flex align-items-center gap-1.5"
              style={{ borderColor: 'var(--border-subtle) !important', fontSize: '0.95rem' }}
            >
              <i className="bi bi-receipt" style={{ color: 'var(--color-primary)' }}></i>
              <span>Booking Summary</span>
            </h6>

            {/* Selected Seats List */}
            <div className="mb-3">
              <div className="text-secondary small d-flex justify-content-between">
                <span>Selected Seats</span>
                <span className="fw-semibold text-light">{selectedSeats.length} / 8</span>
              </div>
              {selectedSeats.length === 0 ? (
                <div className="text-secondary fst-italic small mt-1" style={{ fontSize: '0.8rem' }}>
                  Tap any available seat on the chart
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-1.5 mt-2">
                  {seatDetails.map((s) => (
                    <span
                      key={s.seatNumber}
                      className="badge d-inline-flex align-items-center gap-1"
                      style={{
                        backgroundColor: 'rgba(255, 53, 72, 0.12)',
                        border: '1px solid rgba(255, 53, 72, 0.3)',
                        color: 'var(--text-main)',
                        fontSize: '0.75rem',
                        padding: '0.22rem 0.5rem',
                      }}
                    >
                      <strong>{s.seatNumber}</strong> (${s.price})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div
              className="border-top pt-2.5 mb-3"
              style={{ borderColor: 'var(--border-subtle) !important', fontSize: '0.85rem' }}
            >
              <div className="d-flex justify-content-between text-secondary mb-1.5">
                <span>Tickets Subtotal</span>
                <span className="text-light">${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary mb-1.5">
                <span>Booking Fee</span>
                <span className="text-light">${convenienceFee.toFixed(2)}</span>
              </div>
              <div
                className="d-flex justify-content-between fw-bold text-light pt-2 border-top mt-2"
                style={{ borderColor: 'var(--border-subtle) !important', fontSize: '1rem' }}
              >
                <span>Total Amount</span>
                <span style={{ color: 'var(--color-primary)' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              className="btn btn-cinema-primary w-100 py-2 fw-semibold gap-1.5"
              disabled={selectedSeats.length === 0}
              onClick={handleCheckoutClick}
            >
              <i className="bi bi-credit-card-2-front"></i>
              <span>{isAuthenticated ? 'Proceed to Demo Checkout' : 'Login to Reserve Seats'}</span>
            </button>

            <div className="text-secondary text-center small mt-2.5" style={{ fontSize: '0.72rem' }}>
              <i className="bi bi-shield-check text-success me-1"></i>
              Sandbox Simulation — No real payment required
            </div>
          </div>
        </div>
      </div>

      {/* Demo Payment Modal */}
      {showPaymentModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(8, 13, 19, 0.85)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-light shadow-lg"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="modal-header py-2.5 px-3 border-secondary" style={{ borderColor: 'var(--border-subtle) !important' }}>
                <h6 className="modal-title fw-bold d-flex align-items-center gap-1.5 mb-0">
                  <i className="bi bi-credit-card" style={{ color: 'var(--color-primary)' }}></i>
                  <span>Demo Checkout Confirmation</span>
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={bookingLoading}
                ></button>
              </div>

              <form onSubmit={handleConfirmPayment}>
                <div className="modal-body p-3">
                  {/* Summary Box */}
                  <div
                    className="p-2.5 rounded-2 mb-3"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div className="d-flex justify-content-between text-secondary mb-1">
                      <span>Film:</span>
                      <strong className="text-light">{movie.title}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-secondary mb-1">
                      <span>Seats:</span>
                      <strong style={{ color: 'var(--color-gold)' }}>{selectedSeats.join(', ')}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-secondary">
                      <span>Total Amount:</span>
                      <strong className="text-success fs-6">${total.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small text-secondary mb-1">Name on Ticket</label>
                    <input
                      type="text"
                      className="form-control cinema-input form-control-sm"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small text-secondary mb-1">Card Number (Demo Sandbox)</label>
                    <div className="input-group input-group-sm">
                      <span
                        className="input-group-text border-0 text-secondary"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      >
                        <i className="bi bi-credit-card-fill"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary mb-1">Expiry</label>
                      <input
                        type="text"
                        className="form-control cinema-input form-control-sm"
                        defaultValue="12/28"
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary mb-1">CVV</label>
                      <input
                        type="password"
                        className="form-control cinema-input form-control-sm"
                        defaultValue="888"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>

                  <div
                    className="p-2 rounded-2 text-secondary small"
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      fontSize: '0.76rem',
                    }}
                  >
                    <i className="bi bi-info-circle me-1 text-info"></i>
                    Simulated payment gateway. No real transaction will occur.
                  </div>
                </div>

                <div className="modal-footer py-2 px-3 border-secondary" style={{ borderColor: 'var(--border-subtle) !important' }}>
                  <button
                    type="button"
                    className="btn btn-cinema-outline btn-sm"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={bookingLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-cinema-primary btn-sm px-3"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                        Issuing Ticket...
                      </>
                    ) : (
                      `Confirm & Pay $${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatBookingPage;
