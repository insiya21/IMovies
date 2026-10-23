import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="mt-auto border-top py-4"
      style={{
        backgroundColor: 'var(--bg-main)',
        borderColor: 'var(--border-subtle) !important',
      }}
    >
      <div className="container">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4 col-md-6">
            <Link className="brand-logo text-decoration-none mb-2.5 d-inline-block" to="/">
              <i className="bi bi-film"></i>
              <span>IMovies</span>
            </Link>
            <p className="text-secondary small mb-3" style={{ maxWidth: '320px', lineHeight: '1.55' }}>
              Movie Ticket Booking Made Simple. Experience seamless seat reservations,
              high-definition sound formats (IMAX & Dolby Atmos), and instant digital tickets.
            </p>
            <div className="d-flex gap-2.5 text-secondary">
              <a href="#facebook" className="text-secondary hover-light" aria-label="Facebook">
                <i className="bi bi-facebook fs-6"></i>
              </a>
              <a href="#twitter" className="text-secondary hover-light" aria-label="Twitter">
                <i className="bi bi-twitter-x fs-6"></i>
              </a>
              <a href="#instagram" className="text-secondary hover-light" aria-label="Instagram">
                <i className="bi bi-instagram fs-6"></i>
              </a>
              <a href="#youtube" className="text-secondary hover-light" aria-label="YouTube">
                <i className="bi bi-youtube fs-6"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-light fw-bold mb-2.5 text-uppercase small" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
              Explore
            </h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-1.5" style={{ fontSize: '0.82rem' }}>
              <li>
                <Link to="/" className="text-secondary text-decoration-none hover-light">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/?filter=coming-soon" className="text-secondary text-decoration-none hover-light">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-secondary text-decoration-none hover-light">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-secondary text-decoration-none hover-light">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-light fw-bold mb-2.5 text-uppercase small" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
              Formats
            </h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-1.5" style={{ fontSize: '0.82rem' }}>
              <li><span className="badge bg-secondary me-1" style={{ fontSize: '0.65rem' }}>3D</span> IMAX Laser</li>
              <li><span className="badge bg-danger me-1" style={{ fontSize: '0.65rem' }}>ATMOS</span> Dolby Cinema</li>
              <li><span className="badge bg-info text-dark me-1" style={{ fontSize: '0.65rem' }}>4DX</span> Motion Seats</li>
              <li><span className="badge bg-light text-dark me-1" style={{ fontSize: '0.65rem' }}>VIP</span> Luxury Lounge</li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-light fw-bold mb-2.5 text-uppercase small" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
              Sandbox Demo
            </h6>
            <p className="text-secondary small mb-2" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
              This cinema portal operates in sandbox demo mode. No payment card will be charged.
            </p>
            <div
              className="p-2 rounded-2 border text-secondary small"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
                fontSize: '0.75rem',
              }}
            >
              <i className="bi bi-shield-check text-success me-1"></i>
              Pre-seeded Admin & User demo credentials available on the Sign In page.
            </div>
          </div>
        </div>

        <div
          className="border-top mt-3.5 pt-3 d-flex flex-column flex-sm-row justify-content-between align-items-center text-secondary"
          style={{ borderColor: 'var(--border-subtle) !important', fontSize: '0.78rem' }}
        >
          <div>© {new Date().getFullYear()} IMovies Cinema Platform. All rights reserved.</div>
          <div className="mt-1 mt-sm-0">Crafted with React, Bootstrap, Node.js & MongoDB</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
