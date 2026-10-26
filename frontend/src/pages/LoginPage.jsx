import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { login, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect immediately based on role
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      // Role-based post-login redirection: Admins go straight to the Admin Dashboard
      if (res.data?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(res.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  const bannerMessage = location.state?.message;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5 col-xl-4">
          <div
            className="card p-4 rounded-3 border shadow-lg"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="text-center mb-3.5">
              <div className="brand-logo fs-3 mb-1 justify-content-center">
                <i className="bi bi-film"></i>
                <span>IMovies</span>
              </div>
              <h5 className="fw-bold text-light mb-1">Welcome Back</h5>
              <p className="text-secondary small mb-0">Sign in to book tickets and manage reservations</p>
            </div>

            {bannerMessage && !error && (
              <div
                className="alert py-2 px-3 small mb-3 rounded-2 d-flex align-items-center gap-2 border"
                style={{
                  backgroundColor: 'rgba(255, 200, 61, 0.12)',
                  borderColor: 'rgba(255, 200, 61, 0.3)',
                  color: 'var(--color-gold)',
                }}
              >
                <i className="bi bi-info-circle-fill fs-6 flex-shrink-0"></i>
                <span>{bannerMessage}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2 px-3 alert-dismissible fade show small mb-3" role="alert">
                <i className="bi bi-exclamation-circle-fill me-1.5"></i>
                {error}
                <button type="button" className="btn-close py-2" onClick={() => setError(null)}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-2.5">
                <label className="form-label small text-secondary mb-1">Email Address</label>
                <div className="input-group input-group-sm">
                  <span
                    className="input-group-text border-0 text-secondary"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control cinema-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3.5">
                <label className="form-label small text-secondary mb-1">Password</label>
                <div className="input-group input-group-sm">
                  <span
                    className="input-group-text border-0 text-secondary"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control cinema-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-cinema-primary w-100 py-2 fw-semibold mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div
              className="p-2.5 rounded-2 border mb-3"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="text-secondary small fw-medium mb-1.5" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Demo Fill:
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning w-50 py-1"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => handleQuickLogin('admin@imovies.com', 'admin123')}
                >
                  <i className="bi bi-shield-lock me-1"></i> Admin Demo
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info w-50 py-1"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => handleQuickLogin('user@imovies.com', 'user123')}
                >
                  <i className="bi bi-person me-1"></i> User Demo
                </button>
              </div>
            </div>

            <div className="text-center text-secondary small" style={{ fontSize: '0.8rem' }}>
              Don't have an account yet?{' '}
              <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: 'var(--color-primary)' }}>
                Register now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
