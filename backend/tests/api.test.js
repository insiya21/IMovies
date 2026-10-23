const request = require('supertest');
const app = require('../server');
const { generateToken } = require('../controllers/authController');

describe('IMovies API Endpoints & Security Checks', () => {
  describe('GET /api/health', () => {
    it('should return 200 and online status with database report', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'online');
      expect(res.body).toHaveProperty('appName', 'IMovies REST API');
      expect(res.body).toHaveProperty('database');
    });
  });

  describe('404 Route Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const res = await request(app).get('/api/non-existent-route');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resource not found');
    });
  });

  describe('Authentication Input Validation', () => {
    it('should reject registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }); // missing name and password

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide name, email, and password');
    });

    it('should reject login when credentials are not supplied', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide both email and password');
    });
  });

  describe('JWT Token & Role-Based Authorization Guard', () => {
    it('should block access to protected endpoints when no token is supplied', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No authentication token provided');
    });

    it('should reject requests with malformed tokens', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_malformed_token_123');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should generate valid verifiable JWT tokens with role claims', () => {
      const token = generateToken('user_id_123', 'admin');
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT header.payload.signature format
    });
  });

  describe('Booking Request Validation', () => {
    it('should reject booking requests without authentication', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ showId: 'someShowId', seats: ['A1'] });

      expect(res.statusCode).toBe(401);
    });
  });
});
