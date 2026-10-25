import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('imovies_token')) {
        localStorage.removeItem('imovies_token');
        localStorage.removeItem('imovies_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Movies Endpoints
export const moviesAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  getGenres: () => api.get('/movies/genres'),
  create: (movieData) => api.post('/movies', movieData),
  update: (id, movieData) => api.put(`/movies/${id}`, movieData),
  delete: (id) => api.delete(`/movies/${id}`),
};

// Shows Endpoints
export const showsAPI = {
  getByMovie: (movieId, date) => api.get(`/shows/movie/${movieId}`, { params: { date } }),
  getById: (id) => api.get(`/shows/${id}`),
  getAll: () => api.get('/shows'),
  create: (showData) => api.post('/shows', showData),
  delete: (id) => api.delete(`/shows/${id}`),
};

// Bookings Endpoints
export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getAll: () => api.get('/bookings'),
  getStats: () => api.get('/bookings/stats'),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

// Theaters Endpoints (SkillWallet PDF Add Theater Requirement)
export const theatersAPI = {
  getAll: () => api.get('/theaters'),
  getById: (id) => api.get(`/theaters/${id}`),
  create: (theaterData) => api.post('/theaters', theaterData),
  update: (id, theaterData) => api.put(`/theaters/${id}`, theaterData),
  delete: (id) => api.delete(`/theaters/${id}`),
};

export default api;
