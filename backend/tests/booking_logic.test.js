const Show = require('../models/Show');
const { createBooking } = require('../controllers/bookingController');

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
});
