import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navSearch, setNavSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg cinema-navbar sticky-top">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Brand Logo - Links to Admin Dashboard if admin, else Home */}
        <Link className="navbar-brand brand-logo py-0" to={isAdmin ? '/admin' : '/'}>
          <i className="bi bi-film"></i>
          <span>IMovies</span>
          {isAdmin && (
            <span
              className="badge ms-1.5"
              style={{
                backgroundColor: 'rgba(255, 53, 72, 0.15)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(255, 53, 72, 0.35)',
                fontSize: '0.62rem',
                letterSpacing: '0.04em',
              }}
            >
              ADMIN
            </span>
          )}
        </Link>

        {/* Hamburger Menu — only visible on smaller screens (< 992px) */}
        <button
          className="navbar-toggler d-lg-none border-0 text-light p-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#cinemaNavbarContent"
          aria-controls="cinemaNavbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-2 text-light"></i>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="cinemaNavbarContent">
          {/* Main Desktop Links: Role-separated */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-1">
            {isAdmin ? (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) => `nav-link px-2.5 ${isActive ? 'active' : ''}`}
                  >
                    <i className="bi bi-speedometer2 me-1 text-danger"></i>
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin?tab=movies"
                    className={({ isActive }) =>
                      `nav-link px-2.5 ${location.search.includes('tab=movies') ? 'active' : ''}`
                    }
                  >
                    Movies
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin?tab=shows"
                    className={({ isActive }) =>
                      `nav-link px-2.5 ${location.search.includes('tab=shows') ? 'active' : ''}`
                    }
                  >
                    Shows
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin?tab=theaters"
                    className={({ isActive }) =>
                      `nav-link px-2.5 ${location.search.includes('tab=theaters') ? 'active' : ''}`
                    }
                  >
                    Theaters
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin?tab=bookings"
                    className={({ isActive }) =>
                      `nav-link px-2.5 ${location.search.includes('tab=bookings') ? 'active' : ''}`
                    }
                  >
                    Bookings
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin?tab=users"
                    className={({ isActive }) =>
                      `nav-link px-2.5 ${location.search.includes('tab=users') ? 'active' : ''}`
                    }
                  >
                    Users
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/?preview=true"
                    className="nav-link px-2.5 text-secondary"
                    title="View public cinema showcase"
                  >
                    <i className="bi bi-eye me-1"></i>
                    View Site
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `nav-link px-2.5 ${isActive && !location.search ? 'active' : ''}`
                    }
                  >
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/#movies"
                    className={({ isActive }) =>
                      `nav-link px-2.5 ${isActive && location.hash === '#movies' ? 'active' : ''}`
                    }
                    onClick={(e) => {
                      if (location.pathname === '/') {
                        e.preventDefault();
                        document.getElementById('movies-section')?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate('/#movies');
                      }
                    }}
                  >
                    Movies
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/?filter=coming-soon"
                    className={({ isActive }) =>
                      `nav-link px-2.5 ${location.search.includes('coming-soon') ? 'active' : ''}`
                    }
                  >
                    Coming Soon
                  </NavLink>
                </li>
                {isAuthenticated && !isAdmin && (
                  <li className="nav-item">
                    <NavLink
                      to="/my-bookings"
                      className={({ isActive }) => `nav-link px-2.5 ${isActive ? 'active' : ''}`}
                    >
                      <i className="bi bi-ticket-perforated me-1 text-warning"></i>
                      My Bookings
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </ul>

          {/* Search Field on Desktop & Mobile */}
          <form className="d-flex align-items-center me-lg-3 my-2 my-lg-0" onSubmit={handleSearchSubmit}>
            <div className="position-relative">
              <input
                className="nav-search-input pe-4"
                type="search"
                placeholder="Search movies..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
              />
              <button
                type="submit"
                className="btn position-absolute top-50 end-0 translate-middle-y text-secondary p-1 border-0"
                style={{ right: '6px' }}
                aria-label="Submit Search"
              >
                <i className="bi bi-search" style={{ fontSize: '0.75rem' }}></i>
              </button>
            </div>
          </form>

          {/* Authentication Actions */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-cinema-outline dropdown-toggle d-flex align-items-center gap-2 py-1 px-2.5 rounded-pill"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ fontSize: '0.82rem' }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: '24px',
                      height: '24px',
                      fontSize: '0.72rem',
                      backgroundColor: 'var(--color-primary)',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="d-none d-sm-inline fw-medium text-truncate" style={{ maxWidth: '110px' }}>
                    {user?.name}
                  </span>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg mt-2 border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                >
                  <li className="px-3 py-2 border-bottom" style={{ borderColor: 'var(--border-subtle) !important' }}>
                    <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>Signed in as</div>
                    <div className="fw-semibold text-truncate small text-light">{user?.email}</div>
                    <span className="badge bg-secondary bg-opacity-50 mt-1" style={{ fontSize: '0.65rem' }}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </li>
                  {isAdmin ? (
                    <>
                      <li>
                        <Link className="dropdown-item py-1.5 small text-light" to="/admin">
                          <i className="bi bi-speedometer2 me-2 text-danger"></i> Admin Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-1.5 small text-secondary" to="/admin?tab=movies">
                          <i className="bi bi-film me-2"></i> Manage Movies
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-1.5 small text-secondary" to="/admin?tab=shows">
                          <i className="bi bi-calendar-event me-2"></i> Manage Shows
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-1.5 small text-secondary" to="/admin?tab=bookings">
                          <i className="bi bi-ticket-detailed me-2"></i> Manage Bookings
                        </Link>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link className="dropdown-item py-1.5 small" to="/my-bookings">
                        <i className="bi bi-ticket-perforated me-2 text-warning"></i> My Bookings
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" style={{ borderColor: 'var(--border-subtle)' }} /></li>
                  <li>
                    <button className="dropdown-item py-1.5 small text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Log Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-cinema-outline btn-sm-compact">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-cinema-primary btn-sm-compact">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
