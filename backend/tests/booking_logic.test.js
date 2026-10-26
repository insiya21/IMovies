const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { createBooking, cancelBooking } = require('../controllers/bookingController');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');

describe('Seat Booking Concurrency & Duplicate Prevention Unit Test', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      user: { _id: '507f1f77bcf86cd799439011', role: 'user' },
      body: {
        showId: '507f191e810c19729de860ea',
        seats: ['C3', 'C4'],
      },
    };

    mockRes = {
      statusCode: null,
      responseData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.responseData = data;
        return this;
      },
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 409 Conflict when seats are already booked', async () => {
    // Mock existing show with 'C3' already in bookedSeats
    jest.spyOn(Show, 'findById').mockResolvedValue({
      _id: '507f191e810c19729de860ea',
      movie: '507f191e810c19729de860eb',
      bookedSeats: ['C3'],
      ticketPrice: { silver: 10, gold: 15, platinum: 22 },
    });

    // findOneAndUpdate returns null because bookedSeats has $nin check that failed
    jest.spyOn(Show, 'findOneAndUpdate').mockResolvedValue(null);

    await createBooking(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(409);
    expect(mockRes.responseData.success).toBe(false);
    expect(mockRes.responseData.message).toContain('already booked');
    expect(mockRes.responseData.conflictedSeats).toContain('C3');
  });

  it('should reject booking when seat limit exceeds 8 seats', async () => {
    mockReq.body.seats = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'];

    await createBooking(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.responseData.success).toBe(false);
    expect(mockRes.responseData.message).toContain('Maximum 8 tickets allowed');
  });

  it('should block administrators from creating customer bookings', async () => {
    mockReq.user.role = 'admin';

    await createBooking(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(403);
    expect(mockRes.responseData.success).toBe(false);
    expect(mockRes.responseData.message).toContain('Administrators cannot create customer bookings');
  });

  describe('Booking Cancellation & Seat Release', () => {
    it('should successfully cancel a booking and release seats back to the show', async () => {
      const mockBooking = {
        _id: '507f1f77bcf86cd799439099',
        user: '507f1f77bcf86cd799439011',
        show: '507f191e810c19729de860ea',
        seats: ['C3', 'C4'],
        paymentStatus: 'completed',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);
      const pullSpy = jest.spyOn(Show, 'findByIdAndUpdate').mockResolvedValue({});

      const cancelReq = {
        params: { id: '507f1f77bcf86cd799439099' },
        user: { _id: '507f1f77bcf86cd799439011', role: 'user' },
      };

      await cancelBooking(cancelReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.responseData.success).toBe(true);
      expect(mockBooking.paymentStatus).toBe('cancelled');
      expect(mockBooking.save).toHaveBeenCalled();
      expect(pullSpy).toHaveBeenCalledWith('507f191e810c19729de860ea', {
        $pull: { bookedSeats: { $in: ['C3', 'C4'] } },
      });
    });

    it('regression: should use valid $in operator and avoid MongoServerError: unknown top level operator: $each', async () => {
      // In MongoDB, $pull takes a query condition where $in matches array values to pull.
      // Passing { $pull: { bookedSeats: { $each: [...] } } } causes MongoDB to throw:
      // "MongoServerError: unknown top level operator: $each"
      const mockBooking = {
        _id: '507f1f77bcf86cd799439099',
        user: '507f1f77bcf86cd799439011',
        show: '507f191e810c19729de860ea',
        seats: ['C3', 'C4'],
        paymentStatus: 'completed',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);

      // Simulate MongoDB server strict operator validation
      const mongoServerMock = jest.spyOn(Show, 'findByIdAndUpdate').mockImplementation((showId, updateQuery) => {
        if (updateQuery?.$pull?.bookedSeats?.$each !== undefined) {
          const mongoErr = new Error('unknown top level operator: $each');
          mongoErr.name = 'MongoServerError';
          mongoErr.code = 2;
          throw mongoErr;
        }
        return Promise.resolve({ _id: showId });
      });

      const cancelReq = {
        params: { id: '507f1f77bcf86cd799439099' },
        user: { _id: '507f1f77bcf86cd799439011', role: 'user' },
      };

      await cancelBooking(cancelReq, mockRes, mockNext);

      // Must succeed cleanly without throwing MongoDB unknown operator error
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.responseData.success).toBe(true);

      // Assert that $in was used and $each was NOT used
      const actualUpdateCall = mongoServerMock.mock.calls[0][1];
      expect(actualUpdateCall.$pull.bookedSeats.$each).toBeUndefined();
      expect(actualUpdateCall.$pull.bookedSeats.$in).toEqual(['C3', 'C4']);
    });

    it('should block a user from cancelling another user booking', async () => {
      const mockBooking = {
        _id: '507f1f77bcf86cd799439099',
        user: 'someone_else_id',
        show: '507f191e810c19729de860ea',
        seats: ['C3'],
        paymentStatus: 'completed',
      };

      jest.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);

      const cancelReq = {
        params: { id: '507f1f77bcf86cd799439099' },
        user: { _id: '507f1f77bcf86cd799439011', role: 'user' },
      };

      await cancelBooking(cancelReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(403);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Access denied');
    });

    it('should reject cancelling an already cancelled booking', async () => {
      const mockBooking = {
        _id: '507f1f77bcf86cd799439099',
        user: '507f1f77bcf86cd799439011',
        show: '507f191e810c19729de860ea',
        seats: ['C3'],
        paymentStatus: 'cancelled',
      };

      jest.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);

      const cancelReq = {
        params: { id: '507f1f77bcf86cd799439099' },
        user: { _id: '507f1f77bcf86cd799439011', role: 'user' },
      };

      await cancelBooking(cancelReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('already been cancelled');
    });
  });

  describe('Rate Limiter Middleware', () => {
    it('should allow requests within limit and throttle when limit exceeded', () => {
      const limiter = createRateLimiter({ windowMs: 60000, max: 2, message: 'Rate limit exceeded' });
      const req = { headers: {}, socket: { remoteAddress: '192.168.1.100' } };
      const res = {
        statusCode: null,
        headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        status(code) { this.statusCode = code; return this; },
        json(d) { this.data = d; return this; },
      };
      const next = jest.fn();

      // Temporarily override NODE_ENV to enable limiter logic in test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      limiter(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);

      limiter(req, res, next);
      expect(next).toHaveBeenCalledTimes(2);

      // Third request should be blocked (max is 2)
      limiter(req, res, next);
      expect(res.statusCode).toBe(429);
      expect(res.data.success).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
