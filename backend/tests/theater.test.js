const Theater = require('../models/Theater');
const {
  getTheaters,
  getTheaterById,
  createTheater,
  deleteTheater,
} = require('../controllers/theaterController');

describe('Theater Management Unit Tests (SkillWallet Add Theater Requirement)', () => {
  let mockRes;
  let mockNext;

  beforeEach(() => {
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

  it('should list all active theaters', async () => {
    const mockTheaters = [
      { _id: 'th1', theatreName: 'PVR Grand IMAX', location: 'Downtown', screenType: 'IMAX' },
      { _id: 'th2', theatreName: 'Cinepolis VIP', location: 'Uptown', screenType: 'VIP' },
    ];

    jest.spyOn(Theater, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockTheaters),
    });

    await getTheaters({}, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.responseData.success).toBe(true);
    expect(mockRes.responseData.count).toBe(2);
    expect(mockRes.responseData.data[0].theatreName).toBe('PVR Grand IMAX');
  });

  it('should create a new theater with pricing tiers', async () => {
    const mockReq = {
      body: {
        theatreName: 'INOX Laser Dome',
        location: 'City Center Mall',
        screenType: 'Dolby Atmos',
        balconySeatPrice: 28,
        middleSeatPrice: 20,
        lowerSeatPrice: 14,
        totalSeats: 60,
      },
    };

    const createdDoc = {
      _id: 'th_created_123',
      theatreId: 'TH-INX01',
      ...mockReq.body,
    };

    jest.spyOn(Theater, 'create').mockResolvedValue(createdDoc);

    await createTheater(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(201);
    expect(mockRes.responseData.success).toBe(true);
    expect(mockRes.responseData.data.theatreName).toBe('INOX Laser Dome');
    expect(mockRes.responseData.data.balconySeatPrice).toBe(28);
  });

  it('should reject theater creation when name or location is missing', async () => {
    const mockReq = {
      body: {
        theatreName: '',
        location: '',
      },
    };

    await createTheater(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.responseData.success).toBe(false);
    expect(mockRes.responseData.message).toContain('Please provide both theater name and location');
  });

  it('should delete a theater', async () => {
    const mockReq = { params: { id: 'th1' } };
    jest.spyOn(Theater, 'findByIdAndDelete').mockResolvedValue({ _id: 'th1' });

    await deleteTheater(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.responseData.success).toBe(true);
    expect(mockRes.responseData.message).toContain('Theater deleted successfully');
  });
});
