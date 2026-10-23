import React from 'react';

const SeatLayout = ({
  bookedSeats = [],
  selectedSeats = [],
  onSeatToggle,
  ticketPrice = { silver: 10, gold: 15, platinum: 22 },
  maxSeats = 8,
}) => {
  // Define row configurations: row letter, tier, number of seats
  const rows = [
    { label: 'A', tier: 'silver', seats: 10 },
    { label: 'B', tier: 'silver', seats: 10 },
    { label: 'C', tier: 'gold', seats: 10 },
    { label: 'D', tier: 'gold', seats: 10 },
    { label: 'E', tier: 'platinum', seats: 10 },
    { label: 'F', tier: 'platinum', seats: 10 },
  ];

  const handleSeatClick = (seatCode) => {
    if (bookedSeats.includes(seatCode)) return;

    if (selectedSeats.includes(seatCode)) {
      onSeatToggle(selectedSeats.filter((s) => s !== seatCode));
    } else {
      if (selectedSeats.length >= maxSeats) {
        alert(`You can select a maximum of ${maxSeats} seats per booking.`);
        return;
      }
      onSeatToggle([...selectedSeats, seatCode]);
    }
  };

  return (
    <div className="seat-map-wrapper shadow-sm">
      {/* Cinema Screen Curve Projection */}
      <div className="cinema-screen-container">
        <div className="cinema-screen-curve"></div>
        <div className="screen-label">
          <i className="bi bi-display me-1"></i> Screen (Eyes This Way)
        </div>
      </div>

      {/* Seat Rows Grid */}
      <div className="d-flex flex-column align-items-center mb-4">
        {rows.map((row) => (
          <div key={row.label} className="seat-row">
            <span className="seat-row-label">{row.label}</span>

            {Array.from({ length: row.seats }, (_, idx) => {
              const seatNum = idx + 1;
              const seatCode = `${row.label}${seatNum}`;
              const isBooked = bookedSeats.includes(seatCode);
              const isSelected = selectedSeats.includes(seatCode);

              // Add aisle space after seat 5
              const isAisle = seatNum === 5;

              return (
                <React.Fragment key={seatCode}>
                  <button
                    type="button"
                    title={
                      isBooked
                        ? `Seat ${seatCode} (Reserved)`
                        : `Seat ${seatCode} (${row.tier.toUpperCase()} - $${ticketPrice[row.tier] || 15})`
                    }
                    className={`seat-item seat-${row.tier} ${
                      isBooked ? 'booked' : ''
                    } ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSeatClick(seatCode)}
                    disabled={isBooked}
                    aria-label={`Seat ${seatCode}`}
                  >
                    {isSelected ? (
                      <i className="bi bi-check" style={{ fontSize: '13px' }}></i>
                    ) : (
                      seatNum
                    )}
                  </button>
                  {isAisle && <div className="seat-aisle"></div>}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend & Seat Tiers */}
      <div
        className="border-top pt-3 mt-2"
        style={{ borderColor: 'var(--border-subtle) !important' }}
      >
        <div className="row g-2 text-center text-secondary" style={{ fontSize: '0.78rem' }}>
          <div className="col-4 col-sm-2 d-flex align-items-center justify-content-center gap-1.5">
            <span className="seat-item seat-silver" style={{ width: '18px', height: '18px', fontSize: '0.6rem' }}></span>
            <span>Silver (${ticketPrice.silver || 10})</span>
          </div>
          <div className="col-4 col-sm-2 d-flex align-items-center justify-content-center gap-1.5">
            <span className="seat-item seat-gold" style={{ width: '18px', height: '18px', fontSize: '0.6rem' }}></span>
            <span>Gold (${ticketPrice.gold || 15})</span>
          </div>
          <div className="col-4 col-sm-2 d-flex align-items-center justify-content-center gap-1.5">
            <span className="seat-item seat-vip" style={{ width: '18px', height: '18px', fontSize: '0.6rem' }}></span>
            <span>VIP (${ticketPrice.platinum || 22})</span>
          </div>
          <div className="col-4 col-sm-2 d-flex align-items-center justify-content-center gap-1.5">
            <span className="seat-item selected" style={{ width: '18px', height: '18px', fontSize: '0.6rem' }}>
              <i className="bi bi-check"></i>
            </span>
            <span className="fw-semibold text-light">Selected</span>
          </div>
          <div className="col-4 col-sm-2 d-flex align-items-center justify-content-center gap-1.5">
            <span className="seat-item booked" style={{ width: '18px', height: '18px', fontSize: '0.6rem' }}></span>
            <span>Reserved</span>
          </div>
          <div className="col-4 col-sm-2 d-flex align-items-center justify-content-center gap-1.5">
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
              }}
            >
              Max {maxSeats}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
