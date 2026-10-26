import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moviesAPI, showsAPI, bookingsAPI, theatersAPI, authAPI } from '../services/api';
import { formatINR } from '../utils/currency';

const AdminDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'movies';
  const [activeTab, setActiveTab] = useState(initialTab); // 'movies' | 'shows' | 'theaters' | 'bookings' | 'users'
  const [stats, setStats] = useState({ totalMovies: 0, totalShows: 0, totalBookings: 0, totalRevenue: 0, totalUsers: 0, totalTheaters: 0, movieStats: [] });
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Sync tab with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['movies', 'shows', 'theaters', 'bookings', 'users'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Theater Modal State (SkillWallet PDF Add Theater Requirement)
  const [showTheaterModal, setShowTheaterModal] = useState(false);
  const [theaterForm, setTheaterForm] = useState({
    theatreName: '',
    location: '',
    screenType: 'Standard',
    balconySeatPrice: 350,
    middleSeatPrice: 250,
    lowerSeatPrice: 180,
    totalSeats: 60,
  });

  // Movie Modal State
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    genres: 'Action, Sci-Fi',
    duration: 120,
    rating: 8.5,
    language: 'English',
    director: '',
    cast: '',
  });

  // Show Modal State
  const [showShowModal, setShowShowModal] = useState(false);
  const [showForm, setShowForm] = useState({
    movieId: '',
    theaterId: '',
    screenName: 'Screen 1 - IMAX Laser 3D',
    screenType: 'IMAX',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '18:00',
    silverPrice: 180,
    goldPrice: 250,
    platinumPrice: 350,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, showsRes, bookingsRes, theatersRes, usersRes] = await Promise.all([
        bookingsAPI.getStats(),
        moviesAPI.getAll({}),
        showsAPI.getAll(),
        bookingsAPI.getAll(),
        theatersAPI.getAll(),
        authAPI.getUsers().catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data.data || { totalMovies: 0, totalShows: 0, totalBookings: 0, totalRevenue: 0 });
      setMovies(moviesRes.data.data || []);
      setShows(showsRes.data.data || []);
      setBookings(bookingsRes.data.data || []);
      setTheaters(theatersRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Movie Form Handlers
  const handleOpenAddMovie = () => {
    setEditingMovie(null);
    setMovieForm({
      title: '',
      description: '',
      posterUrl: '',
      bannerUrl: '',
      trailerUrl: '',
      genres: 'Action, Sci-Fi',
      duration: 120,
      rating: 8.5,
      language: 'English',
      director: '',
      cast: '',
    });
    setShowMovieModal(true);
  };

  const handleOpenEditMovie = (movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl || movie.posterUrl,
      trailerUrl: movie.trailerUrl || '',
      genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres,
      duration: movie.duration,
      rating: movie.rating || 8.0,
      language: movie.language || 'English',
      director: movie.director || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
    });
    setShowMovieModal(true);
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingMovie) {
        await moviesAPI.update(editingMovie._id, movieForm);
        setMessage({ type: 'success', text: `Movie "${movieForm.title}" updated successfully.` });
      } else {
        await moviesAPI.create(movieForm);
        setMessage({ type: 'success', text: `Movie "${movieForm.title}" added successfully.` });
      }
      setShowMovieModal(false);
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to save movie.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMovie = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also remove its scheduled shows.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await moviesAPI.delete(id);
      setMessage({ type: 'success', text: `Movie "${title}" deleted successfully.` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to delete movie.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Show Scheduling Handlers
  const handleOpenAddShow = () => {
    if (movies.length === 0) {
      alert('Please add at least one movie first before scheduling shows.');
      return;
    }
    setShowForm({
      movieId: movies[0]._id,
      screenName: 'Screen 1 - IMAX Laser 3D',
      screenType: 'IMAX',
      showDate: new Date().toISOString().split('T')[0],
      showTime: '18:00',
      silverPrice: 180,
      goldPrice: 250,
      platinumPrice: 350,
    });
    setShowShowModal(true);
  };

  const handleSaveShow = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        movieId: showForm.movieId,
        screenName: showForm.screenName,
        screenType: showForm.screenType,
        showDate: showForm.showDate,
        showTime: showForm.showTime,
        ticketPrice: {
          silver: Number(showForm.silverPrice),
          gold: Number(showForm.goldPrice),
          platinum: Number(showForm.platinumPrice),
        },
      };
      await showsAPI.create(payload);
      setMessage({ type: 'success', text: 'New showtime scheduled successfully!' });
      setShowShowModal(false);
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to schedule show.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showtime?')) return;
    setActionLoading(true);
    try {
      await showsAPI.delete(id);
      setMessage({ type: 'success', text: 'Showtime deleted successfully.' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to delete show.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Theater Form Handlers (SkillWallet PDF Add Theater Requirement)
  const handleOpenAddTheater = () => {
    setTheaterForm({
      theatreName: '',
      location: '',
      screenType: 'Standard',
      balconySeatPrice: 350,
      middleSeatPrice: 250,
      lowerSeatPrice: 180,
      totalSeats: 60,
    });
    setShowTheaterModal(true);
  };

  const handleSaveTheater = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await theatersAPI.create(theaterForm);
      setMessage({ type: 'success', text: `Theater "${theaterForm.theatreName}" created successfully.` });
      setShowTheaterModal(false);
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to add theater.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTheater = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete theater "${name}"?`)) return;
    setActionLoading(true);
    try {
      await theatersAPI.delete(id);
      setMessage({ type: 'success', text: 'Theater removed successfully.' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to delete theater.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3.5">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255, 53, 72, 0.15)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(255, 53, 72, 0.3)',
                fontSize: '0.7rem',
                fontWeight: '700',
              }}
            >
              ADMIN PORTAL
            </span>
            <h4 className="fw-bold text-light mb-0">Cinema Management</h4>
          </div>
          <p className="text-secondary small mb-0">
            Control movie listings, theaters, schedule showtimes, and monitor customer ticket sales
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-cinema-primary btn-sm px-3" onClick={handleOpenAddMovie}>
            <i className="bi bi-plus-lg me-1"></i> Add Movie
          </button>
          <button className="btn btn-cinema-outline btn-sm px-3" onClick={handleOpenAddTheater}>
            <i className="bi bi-buildings me-1"></i> Add Theater
          </button>
          <button className="btn btn-cinema-outline btn-sm px-3" onClick={handleOpenAddShow}>
            <i className="bi bi-calendar-plus me-1"></i> Schedule Show
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div className={`alert alert-${message.type} alert-dismissible fade show py-2 px-3 small mb-3`} role="alert">
          {message.text}
          <button type="button" className="btn-close py-2" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="row g-2.5 mb-4">
        <div className="col-sm-6 col-lg-2">
          <div
            className="card p-3 rounded-3 border h-100"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-secondary small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                  Movies
                </div>
                <div className="fs-4 fw-bold text-light mt-0.5">{stats.totalMovies || movies.length}</div>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(255, 53, 72, 0.12)',
                  color: 'var(--color-primary)',
                }}
              >
                <i className="bi bi-film"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div
            className="card p-3 rounded-3 border h-100"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-secondary small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                  Shows
                </div>
                <div className="fs-4 fw-bold text-light mt-0.5">{stats.totalShows || shows.length}</div>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: 'var(--color-cyan)',
                }}
              >
                <i className="bi bi-calendar-check"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div
            className="card p-3 rounded-3 border h-100"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-secondary small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                  Theaters
                </div>
                <div className="fs-4 fw-bold text-light mt-0.5">{stats.totalTheaters || theaters.length}</div>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  color: '#c084fc',
                }}
              >
                <i className="bi bi-buildings"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div
            className="card p-3 rounded-3 border h-100"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-secondary small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                  Bookings
                </div>
                <div className="fs-4 fw-bold text-light mt-0.5">{stats.totalBookings || bookings.length}</div>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(255, 200, 61, 0.12)',
                  color: 'var(--color-gold)',
                }}
              >
                <i className="bi bi-ticket-perforated"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div
            className="card p-3 rounded-3 border h-100"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-secondary small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                  Users
                </div>
                <div className="fs-4 fw-bold text-light mt-0.5">{stats.totalUsers || users.length}</div>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  color: '#4ade80',
                }}
              >
                <i className="bi bi-people"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div
            className="card p-3 rounded-3 border h-100"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-secondary small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                  Revenue (INR)
                </div>
                <div className="fs-5 fw-bold text-success mt-0.5 text-truncate" title={formatINR(stats.totalRevenue)}>
                  {formatINR(stats.totalRevenue)}
                </div>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--color-success)',
                }}
              >
                <i className="bi bi-cash-stack"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className="d-flex flex-wrap gap-2 mb-3 pb-2 border-bottom"
        style={{ borderColor: 'var(--border-subtle) !important' }}
      >
        <button
          className={`btn btn-sm px-3 py-1.5 rounded-2 ${
            activeTab === 'movies' ? 'btn-cinema-primary' : 'btn-dark text-secondary'
          }`}
          style={{
            backgroundColor: activeTab === 'movies' ? 'var(--color-primary)' : 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
          onClick={() => handleTabChange('movies')}
        >
          <i className="bi bi-film me-1.5"></i> Movies ({movies.length})
        </button>

        <button
          className={`btn btn-sm px-3 py-1.5 rounded-2 ${
            activeTab === 'shows' ? 'btn-cinema-primary' : 'btn-dark text-secondary'
          }`}
          style={{
            backgroundColor: activeTab === 'shows' ? 'var(--color-primary)' : 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
          onClick={() => handleTabChange('shows')}
        >
          <i className="bi bi-calendar-event me-1.5"></i> Scheduled Shows ({shows.length})
        </button>

        <button
          className={`btn btn-sm px-3 py-1.5 rounded-2 ${
            activeTab === 'theaters' ? 'btn-cinema-primary' : 'btn-dark text-secondary'
          }`}
          style={{
            backgroundColor: activeTab === 'theaters' ? 'var(--color-primary)' : 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
          onClick={() => handleTabChange('theaters')}
        >
          <i className="bi bi-buildings me-1.5"></i> Theaters ({theaters.length})
        </button>

        <button
          className={`btn btn-sm px-3 py-1.5 rounded-2 ${
            activeTab === 'bookings' ? 'btn-cinema-primary' : 'btn-dark text-secondary'
          }`}
          style={{
            backgroundColor: activeTab === 'bookings' ? 'var(--color-primary)' : 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
          onClick={() => handleTabChange('bookings')}
        >
          <i className="bi bi-receipt me-1.5"></i> Reservations ({bookings.length})
        </button>

        <button
          className={`btn btn-sm px-3 py-1.5 rounded-2 ${
            activeTab === 'users' ? 'btn-cinema-primary' : 'btn-dark text-secondary'
          }`}
          style={{
            backgroundColor: activeTab === 'users' ? 'var(--color-primary)' : 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
          onClick={() => handleTabChange('users')}
        >
          <i className="bi bi-people me-1.5"></i> Registered Users ({users.length})
        </button>
      </div>

      {/* Tab 1: Movies */}
      {activeTab === 'movies' && (
        <div
          className="card overflow-hidden rounded-3 border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Poster</th>
                  <th>Movie Title</th>
                  <th>Genres</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded"
                        referrerPolicy="no-referrer"
                        style={{ width: '38px', height: '52px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div className="fw-semibold text-light">{m.title}</div>
                      <div className="text-secondary small text-truncate" style={{ maxWidth: '280px', fontSize: '0.78rem' }}>
                        {m.description}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {m.genres?.map((g, i) => (
                          <span
                            key={i}
                            className="badge"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: 'var(--text-muted)',
                              fontSize: '0.7rem',
                            }}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="small text-secondary">{m.duration} mins</td>
                    <td>
                      <span className="badge-rating small py-0.5 px-1.5">
                        <i className="bi bi-star-fill text-warning"></i> {m.rating}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-light me-1.5 py-0.5 px-2"
                        onClick={() => handleOpenEditMovie(m)}
                        title="Edit Movie"
                      >
                        <i className="bi bi-pencil" style={{ fontSize: '0.75rem' }}></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger py-0.5 px-2"
                        onClick={() => handleDeleteMovie(m._id, m.title)}
                        title="Delete Movie"
                      >
                        <i className="bi bi-trash" style={{ fontSize: '0.75rem' }}></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Shows */}
      {activeTab === 'shows' && (
        <div
          className="card overflow-hidden rounded-3 border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Screen & Format</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Pricing</th>
                  <th>Seats Booked</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => (
                  <tr key={s._id}>
                    <td className="fw-semibold text-light">{s.movie?.title || 'Unknown'}</td>
                    <td>
                      <div className="small text-light">{s.screenName}</div>
                      <span className="badge bg-secondary opacity-75" style={{ fontSize: '0.65rem' }}>
                        {s.screenType}
                      </span>
                    </td>
                    <td className="small text-secondary">{s.showDate}</td>
                    <td className="fw-semibold" style={{ color: 'var(--color-primary)' }}>
                      {s.showTime}
                    </td>
                    <td className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                      S: {formatINR(s.ticketPrice?.silver, false)} | G: {formatINR(s.ticketPrice?.gold, false)} | VIP: {formatINR(s.ticketPrice?.platinum, false)}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'rgba(255, 200, 61, 0.1)',
                          color: 'var(--color-gold)',
                          border: '1px solid rgba(255, 200, 61, 0.3)',
                          fontSize: '0.75rem',
                        }}
                      >
                        {s.bookedSeats?.length || 0} / {s.totalSeats || 60}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger py-0.5 px-2"
                        onClick={() => handleDeleteShow(s._id)}
                        title="Delete Showtime"
                      >
                        <i className="bi bi-trash" style={{ fontSize: '0.75rem' }}></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Bookings & Revenue Analysis */}
      {activeTab === 'bookings' && (
        <div className="d-flex flex-column gap-3">
          {/* Movie-Wise Performance & Statistics */}
          {stats.movieStats && stats.movieStats.length > 0 && (
            <div
              className="card overflow-hidden rounded-3 border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div
                className="p-3 border-bottom d-flex justify-content-between align-items-center"
                style={{ borderColor: 'var(--border-subtle) !important' }}
              >
                <h6 className="text-light fw-bold mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-bar-chart-line" style={{ color: 'var(--color-primary)' }}></i>
                  Movie-Wise Performance & Revenue
                </h6>
                <span className="badge bg-dark border text-secondary" style={{ fontSize: '0.7rem' }}>
                  {stats.movieStats.length} Movies Booked
                </span>
              </div>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>Poster</th>
                      <th>Movie Title</th>
                      <th className="text-center">Total Bookings</th>
                      <th className="text-center">Tickets Sold</th>
                      <th className="text-end">Revenue (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.movieStats.map((ms) => (
                      <tr key={ms._id}>
                        <td>
                          <img
                            src={ms.posterUrl}
                            alt={ms.title}
                            className="rounded"
                            referrerPolicy="no-referrer"
                            style={{ width: '28px', height: '38px', objectFit: 'cover' }}
                          />
                        </td>
                        <td className="fw-semibold text-light small">{ms.title}</td>
                        <td className="text-center small text-secondary">{ms.totalBookings}</td>
                        <td className="text-center">
                          <span className="badge bg-secondary" style={{ fontSize: '0.72rem' }}>
                            {ms.totalTickets} seats
                          </span>
                        </td>
                        <td className="text-end fw-bold text-success small">{formatINR(ms.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All Bookings Table */}
          <div
            className="card overflow-hidden rounded-3 border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Screen & Slot</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(255, 200, 61, 0.15)',
                            color: 'var(--color-gold)',
                            border: '1px solid rgba(255, 200, 61, 0.3)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {b.bookingRef}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-light small">{b.user?.name || 'Customer'}</div>
                        <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                          {b.user?.email}
                        </div>
                      </td>
                      <td className="text-light small">{b.movie?.title}</td>
                      <td>
                        <div className="small text-light">{b.show?.screenName}</div>
                        <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                          {b.show?.showDate} @ {b.show?.showTime}
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(255, 53, 72, 0.12)',
                            color: 'var(--text-main)',
                            border: '1px solid rgba(255, 53, 72, 0.3)',
                          }}
                        >
                          {b.seats?.join(', ')}
                        </span>
                      </td>
                      <td className="fw-bold text-success small">{formatINR(b.totalAmount)}</td>
                      <td>
                        <span
                          className={`badge ${
                            b.paymentStatus === 'completed'
                              ? 'bg-success'
                              : b.paymentStatus === 'cancelled'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          }`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {b.paymentStatus || 'completed'}
                        </span>
                      </td>
                      <td className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Theaters (SkillWallet PDF Add Theater Requirement) */}
      {activeTab === 'theaters' && (
        <div
          className="card overflow-hidden rounded-3 border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          {theaters.length === 0 ? (
            <div className="p-5 text-center">
              <i className="bi bi-buildings text-secondary fs-1 mb-2"></i>
              <h6 className="text-light mb-1">No Theaters Configured</h6>
              <p className="text-secondary small mb-3">Add cinema locations to organize screens and pricing tiers.</p>
              <button className="btn btn-cinema-primary btn-sm px-3" onClick={handleOpenAddTheater}>
                <i className="bi bi-plus-lg me-1"></i> Add First Theater
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Theater Name</th>
                    <th>Location</th>
                    <th>Screen Format</th>
                    <th>Seat Pricing Tiers</th>
                    <th>Capacity</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {theaters.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <div className="fw-semibold text-light small d-flex align-items-center gap-2">
                          <i className="bi bi-buildings" style={{ color: 'var(--color-primary)' }}></i>
                          <span>{t.theatreName}</span>
                        </div>
                        <div className="text-secondary small font-monospace" style={{ fontSize: '0.72rem' }}>
                          ID: {t.theatreId || t._id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="small text-light">
                        <i className="bi bi-geo-alt me-1 text-danger"></i>
                        {t.location}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: 'var(--color-cyan)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {t.screenType || 'Standard'}
                        </span>
                      </td>
                      <td>
                        <div className="small d-flex flex-wrap gap-1">
                          <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                            Lower: {formatINR(t.lowerSeatPrice || 180, false)}
                          </span>
                          <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                            Middle: {formatINR(t.middleSeatPrice || 250, false)}
                          </span>
                          <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                            Balcony: {formatINR(t.balconySeatPrice || 350, false)}
                          </span>
                        </div>
                      </td>
                      <td className="small text-secondary">{t.totalSeats || 60} Seats</td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-danger btn-sm p-1 px-2"
                          title="Delete Theater"
                          onClick={() => handleDeleteTheater(t._id, t.theatreName)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Users Management */}
      {activeTab === 'users' && (
        <div
          className="card overflow-hidden rounded-3 border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          {users.length === 0 ? (
            <div className="p-5 text-center">
              <i className="bi bi-people text-secondary fs-1 mb-2"></i>
              <h6 className="text-light mb-1">No Users Found</h6>
              <p className="text-secondary small mb-0">Registered customer accounts will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>User ID</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor:
                                u.role === 'admin' ? 'rgba(255, 53, 72, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: u.role === 'admin' ? 'var(--color-primary)' : 'var(--color-cyan)',
                              fontSize: '0.8rem',
                            }}
                          >
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-light small">{u.name}</span>
                            {u.role === 'admin' && (
                              <span className="badge bg-danger ms-2" style={{ fontSize: '0.65rem' }}>
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="small text-secondary">{u.email}</td>
                      <td>
                        <span
                          className={`badge ${u.role === 'admin' ? 'bg-danger text-light' : 'bg-secondary'}`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="small font-monospace text-secondary" style={{ fontSize: '0.72rem' }}>
                        {u._id}
                      </td>
                      <td className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showMovieModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(8, 13, 19, 0.85)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content text-light shadow-lg"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="modal-header py-2.5 px-3 border-secondary" style={{ borderColor: 'var(--border-subtle) !important' }}>
                <h6 className="modal-title fw-bold mb-0">
                  {editingMovie ? 'Edit Movie Details' : 'Add New Movie to Cinema'}
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowMovieModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveMovie}>
                <div className="modal-body p-3">
                  <div className="row g-2.5">
                    <div className="col-md-8">
                      <label className="form-label small text-secondary mb-1">Movie Title</label>
                      <input
                        type="text"
                        className="form-control cinema-input form-control-sm"
                        value={movieForm.title}
                        onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Rating (0 - 10)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="form-control cinema-input form-control-sm"
                        value={movieForm.rating}
                        onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-secondary mb-1">Synopsis</label>
                      <textarea
                        rows="2.5"
                        className="form-control cinema-input form-control-sm"
                        value={movieForm.description}
                        onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Poster URL (Portrait)</label>
                      <input
                        type="url"
                        className="form-control cinema-input form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={movieForm.posterUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Banner URL (Landscape)</label>
                      <input
                        type="url"
                        className="form-control cinema-input form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={movieForm.bannerUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, bannerUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Trailer URL (YouTube)</label>
                      <input
                        type="text"
                        className="form-control cinema-input form-control-sm"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={movieForm.trailerUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Genres (comma separated)</label>
                      <input
                        type="text"
                        className="form-control cinema-input form-control-sm"
                        placeholder="Action, Sci-Fi, Thriller"
                        value={movieForm.genres}
                        onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        className="form-control cinema-input form-control-sm"
                        value={movieForm.duration}
                        onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Language</label>
                      <input
                        type="text"
                        className="form-control cinema-input form-control-sm"
                        value={movieForm.language}
                        onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Director</label>
                      <input
                        type="text"
                        className="form-control cinema-input form-control-sm"
                        value={movieForm.director}
                        onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer py-2 px-3 border-secondary" style={{ borderColor: 'var(--border-subtle) !important' }}>
                  <button type="button" className="btn btn-cinema-outline btn-sm" onClick={() => setShowMovieModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema-primary btn-sm px-3" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : editingMovie ? 'Update Movie' : 'Create Movie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Show Modal */}
      {showShowModal && (
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
                <h6 className="modal-title fw-bold mb-0 d-flex align-items-center gap-1.5">
                  <i className="bi bi-calendar-plus" style={{ color: 'var(--color-primary)' }}></i>
                  <span>Schedule Showtime</span>
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveShow}>
                <div className="modal-body p-3">
                  <div className="mb-2.5">
                    <label className="form-label small text-secondary mb-1">Select Movie</label>
                    <select
                      className="form-select cinema-input form-control-sm"
                      value={showForm.movieId}
                      onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                      required
                    >
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small text-secondary mb-1">Select Theater Location (Optional)</label>
                    <select
                      className="form-select cinema-input form-control-sm"
                      value={showForm.theaterId || ''}
                      onChange={(e) => {
                        const tId = e.target.value;
                        const t = theaters.find((th) => th._id === tId);
                        if (t) {
                          setShowForm({
                            ...showForm,
                            theaterId: tId,
                            screenName: `${t.theatreName} - Screen 1`,
                            screenType: t.screenType || 'Standard',
                            silverPrice: t.lowerSeatPrice || 180,
                            goldPrice: t.middleSeatPrice || 250,
                            platinumPrice: t.balconySeatPrice || 350,
                          });
                        } else {
                          setShowForm({ ...showForm, theaterId: '' });
                        }
                      }}
                    >
                      <option value="">-- Custom Screen / Pick Theater --</option>
                      {theaters.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.theatreName} ({t.location}) - {t.screenType}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-2.5">
                    <div className="col-7">
                      <label className="form-label small text-secondary mb-1">Screen Name</label>
                      <input
                        type="text"
                        className="form-control cinema-input form-control-sm"
                        value={showForm.screenName}
                        onChange={(e) => setShowForm({ ...showForm, screenName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-5">
                      <label className="form-label small text-secondary mb-1">Format</label>
                      <select
                        className="form-select cinema-input form-control-sm"
                        value={showForm.screenType}
                        onChange={(e) => setShowForm({ ...showForm, screenType: e.target.value })}
                      >
                        <option value="Standard">Standard</option>
                        <option value="IMAX">IMAX</option>
                        <option value="4DX">4DX</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-2.5">
                    <div className="col-6">
                      <label className="form-label small text-secondary mb-1">Date (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        className="form-control cinema-input form-control-sm"
                        value={showForm.showDate}
                        onChange={(e) => setShowForm({ ...showForm, showDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary mb-1">Time (HH:MM)</label>
                      <input
                        type="time"
                        className="form-control cinema-input form-control-sm"
                        value={showForm.showTime}
                        onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div
                    className="border-top pt-2.5 mb-1"
                    style={{ borderColor: 'var(--border-subtle) !important' }}
                  >
                    <label className="form-label small text-secondary fw-semibold mb-1.5">
                      Seat Tier Pricing (₹ INR)
                    </label>
                    <div className="row g-2">
                      <div className="col-4">
                        <label className="form-label small text-secondary mb-0.5" style={{ fontSize: '0.72rem' }}>
                          Silver
                        </label>
                        <input
                          type="number"
                          className="form-control cinema-input form-control-sm"
                          value={showForm.silverPrice}
                          onChange={(e) => setShowForm({ ...showForm, silverPrice: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small text-secondary mb-0.5" style={{ fontSize: '0.72rem' }}>
                          Gold
                        </label>
                        <input
                          type="number"
                          className="form-control cinema-input form-control-sm"
                          value={showForm.goldPrice}
                          onChange={(e) => setShowForm({ ...showForm, goldPrice: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small text-secondary mb-0.5" style={{ fontSize: '0.72rem' }}>
                          VIP
                        </label>
                        <input
                          type="number"
                          className="form-control cinema-input form-control-sm"
                          value={showForm.platinumPrice}
                          onChange={(e) => setShowForm({ ...showForm, platinumPrice: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer py-2 px-3 border-secondary" style={{ borderColor: 'var(--border-subtle) !important' }}>
                  <button type="button" className="btn btn-cinema-outline btn-sm" onClick={() => setShowShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema-primary btn-sm px-3" disabled={actionLoading}>
                    {actionLoading ? 'Scheduling...' : 'Confirm Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Theater Modal (SkillWallet PDF Add Theater Requirement) */}
      {showTheaterModal && (
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
                <h6 className="modal-title fw-bold mb-0 d-flex align-items-center gap-1.5">
                  <i className="bi bi-buildings" style={{ color: 'var(--color-primary)' }}></i>
                  <span>Add Theater / Cinema Location</span>
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowTheaterModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveTheater}>
                <div className="modal-body p-3">
                  <div className="mb-2.5">
                    <label className="form-label small text-secondary mb-1">Theater Name</label>
                    <input
                      type="text"
                      className="form-control cinema-input form-control-sm"
                      placeholder="e.g. Grand PVR Heritage IMAX"
                      value={theaterForm.theatreName}
                      onChange={(e) => setTheaterForm({ ...theaterForm, theatreName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2.5">
                    <div className="col-7">
                      <label className="form-label small text-secondary mb-1">Location / City Area</label>
                      <input
                        type="text"
                        className="form-control cinema-input form-control-sm"
                        placeholder="e.g. Downtown Central Mall"
                        value={theaterForm.location}
                        onChange={(e) => setTheaterForm({ ...theaterForm, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-5">
                      <label className="form-label small text-secondary mb-1">Screen Format</label>
                      <select
                        className="form-select cinema-input form-control-sm"
                        value={theaterForm.screenType}
                        onChange={(e) => setTheaterForm({ ...theaterForm, screenType: e.target.value })}
                      >
                        <option value="Standard">Standard</option>
                        <option value="IMAX">IMAX</option>
                        <option value="Dolby Atmos">Dolby Atmos</option>
                        <option value="4DX">4DX</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                  </div>

                  <div
                    className="border-top pt-2.5 mb-2.5"
                    style={{ borderColor: 'var(--border-subtle) !important' }}
                  >
                    <label className="form-label small text-secondary fw-semibold mb-1.5">
                      Tier Pricing Configuration (₹ INR)
                    </label>
                    <div className="row g-2">
                      <div className="col-4">
                        <label className="form-label small text-secondary mb-0.5" style={{ fontSize: '0.72rem' }}>
                          Lower Tier (₹)
                        </label>
                        <input
                          type="number"
                          className="form-control cinema-input form-control-sm"
                          value={theaterForm.lowerSeatPrice}
                          onChange={(e) => setTheaterForm({ ...theaterForm, lowerSeatPrice: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small text-secondary mb-0.5" style={{ fontSize: '0.72rem' }}>
                          Middle Tier (₹)
                        </label>
                        <input
                          type="number"
                          className="form-control cinema-input form-control-sm"
                          value={theaterForm.middleSeatPrice}
                          onChange={(e) => setTheaterForm({ ...theaterForm, middleSeatPrice: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small text-secondary mb-0.5" style={{ fontSize: '0.72rem' }}>
                          Balcony / VIP (₹)
                        </label>
                        <input
                          type="number"
                          className="form-control cinema-input form-control-sm"
                          value={theaterForm.balconySeatPrice}
                          onChange={(e) => setTheaterForm({ ...theaterForm, balconySeatPrice: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-secondary mb-1">Total Auditorium Capacity</label>
                    <input
                      type="number"
                      className="form-control cinema-input form-control-sm"
                      value={theaterForm.totalSeats}
                      onChange={(e) => setTheaterForm({ ...theaterForm, totalSeats: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer py-2 px-3 border-secondary" style={{ borderColor: 'var(--border-subtle) !important' }}>
                  <button type="button" className="btn btn-cinema-outline btn-sm" onClick={() => setShowTheaterModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema-primary btn-sm px-3" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Add Theater'}
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

export default AdminDashboardPage;
