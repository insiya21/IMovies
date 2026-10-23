import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const res = await register(name, email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

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
              <h5 className="fw-bold text-light mb-1">Create Account</h5>
              <p className="text-secondary small mb-0">Join IMovies to book seats & view showtimes</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 alert-dismissible fade show small mb-3" role="alert">
                <i className="bi bi-exclamation-circle-fill me-1.5"></i>
                {error}
                <button type="button" className="btn-close py-2" onClick={() => setError(null)}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-2.5">
                <label className="form-label small text-secondary mb-1">Full Name</label>
                <div className="input-group input-group-sm">
                  <span
                    className="input-group-text border-0 text-secondary"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control cinema-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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

              <div className="mb-2.5">
                <label className="form-label small text-secondary mb-1">Password (Min. 6 chars)</label>
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

              <div className="mb-3.5">
                <label className="form-label small text-secondary mb-1">Confirm Password</label>
                <div className="input-group input-group-sm">
                  <span
                    className="input-group-text border-0 text-secondary"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <i className="bi bi-shield-check"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control cinema-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center text-secondary small" style={{ fontSize: '0.8rem' }}>
              Already have an account?{' '}
              <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--color-primary)' }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
