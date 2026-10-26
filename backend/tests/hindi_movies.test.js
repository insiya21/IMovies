const Movie = require('../models/Movie');
const Show = require('../models/Show');
const { getMovies, getMovieById } = require('../controllers/movieController');
const { getShowsByMovie, getShowById } = require('../controllers/showController');

describe('Hindi Movies & Showtimes Integration Unit Tests', () => {
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

  it('should retrieve movie details with Hindi metadata and working trailer URL', async () => {
    const mockHindiMovie = {
      _id: '6adf6adfcdaaac9dd6e3ecf9',
      title: '3 Idiots',
      description: 'Two friends embark on a quest for a lost buddy who inspired them to think independently...',
      genres: ['Comedy', 'Drama'],
      duration: 170,
      rating: 8.4,
      language: 'Hindi',
      director: 'Rajkumar Hirani',
      cast: ['Aamir Khan', 'R. Madhavan', 'Sharman Joshi', 'Kareena Kapoor Khan'],
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=K0eDlFX9GMc',
      releaseDate: new Date('2009-12-25'),
    };

    jest.spyOn(Movie, 'findById').mockResolvedValue(mockHindiMovie);

    const mockReq = { params: { id: '6adf6adfcdaaac9dd6e3ecf9' } };
    await getMovieById(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.responseData.success).toBe(true);
    expect(mockRes.responseData.data.title).toBe('3 Idiots');
    expect(mockRes.responseData.data.language).toBe('Hindi');
    expect(mockRes.responseData.data.duration).toBe(170);
    expect(mockRes.responseData.data.trailerUrl).toBe('https://www.youtube.com/watch?v=K0eDlFX9GMc');
  });

  it('should populate theater information when fetching shows for a movie', async () => {
    const mockShows = [
      {
        _id: 'show101',
        movie: {
          _id: '6adf6adfcdaaac9dd6e3ecf9',
          title: '3 Idiots',
          duration: 170,
        },
        theater: {
          _id: 'th1',
          theatreName: 'PVR Grand Heritage - IMAX Laser',
          location: 'Downtown Central, Sector 4',
          screenType: 'IMAX',
        },
        screenName: 'Screen 1 - IMAX Laser 3D',
        screenType: 'IMAX',
        showDate: '2026-10-26',
        showTime: '14:30',
        ticketPrice: { silver: 14, gold: 20, platinum: 28 },
        totalSeats: 60,
        bookedSeats: ['B4', 'B5'],
      },
    ];

    const sortMock = jest.fn().mockResolvedValue(mockShows);
    const populateTheaterMock = jest.fn().mockReturnValue({ sort: sortMock });
    const populateMovieMock = jest.fn().mockReturnValue({ populate: populateTheaterMock });

    jest.spyOn(Show, 'find').mockReturnValue({
      populate: populateMovieMock,
    });

    const mockReq = {
      params: { movieId: '6adf6adfcdaaac9dd6e3ecf9' },
      query: { date: '2026-10-26' },
    };

    await getShowsByMovie(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.responseData.success).toBe(true);
    expect(mockRes.responseData.data.length).toBe(1);
    expect(mockRes.responseData.data[0].theater.theatreName).toBe('PVR Grand Heritage - IMAX Laser');
    expect(mockRes.responseData.data[0].theater.location).toBe('Downtown Central, Sector 4');
  });

  it('should populate theater details when fetching a single show by ID', async () => {
    const mockShow = {
      _id: 'show101',
      movie: { title: 'Stree 2', duration: 147 },
      theater: {
        theatreName: 'Cinepolis Dolby Atmos Megaplex',
        location: 'Westside Promenade Mall',
      },
      showDate: '2026-10-26',
      showTime: '18:00',
    };

    const populateTheaterMock = jest.fn().mockResolvedValue(mockShow);
    const populateMovieMock = jest.fn().mockReturnValue({ populate: populateTheaterMock });

    jest.spyOn(Show, 'findById').mockReturnValue({
      populate: populateMovieMock,
    });

    const mockReq = { params: { id: 'show101' } };
    await getShowById(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.responseData.success).toBe(true);
    expect(mockRes.responseData.data.theater.theatreName).toBe('Cinepolis Dolby Atmos Megaplex');
  });

  it('should support searching movies by title or description', async () => {
    const mockFilteredMovies = [
      {
        _id: '6adf6ae0cdaaac9dd6e3ed27',
        title: 'Zindagi Na Milegi Dobara',
        language: 'Hindi',
        genres: ['Adventure', 'Comedy', 'Drama'],
      },
    ];

    jest.spyOn(Movie, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockFilteredMovies),
    });

    const mockReq = {
      query: { search: 'Zindagi' },
    };

    await getMovies(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.responseData.count).toBe(1);
    expect(mockRes.responseData.data[0].title).toBe('Zindagi Na Milegi Dobara');
  });

  it('should naturally interleave Hindi and English movies in the default catalog listing', async () => {
    const mockUnsortedCatalog = [
      { _id: 'm1', title: 'Oppenheimer', language: 'English' },
      { _id: 'm2', title: 'Inception', language: 'English' },
      { _id: 'm3', title: 'Interstellar', language: 'English' },
      { _id: 'm4', title: '3 Idiots', language: 'Hindi' },
      { _id: 'm5', title: 'Stree 2', language: 'Hindi' },
      { _id: 'm6', title: 'Stand by Me Doraemon (2014)', language: 'Japanese' },
    ];

    jest.spyOn(Movie, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockUnsortedCatalog),
    });

    const mockReq = { query: {} };
    await getMovies(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.responseData.count).toBe(6);
    // English movie 1, Hindi movie 1, English movie 2, Hindi movie 2, English movie 3, Japanese movie
    expect(mockRes.responseData.data[0].language).toBe('English');
    expect(mockRes.responseData.data[1].language).toBe('Hindi');
    expect(mockRes.responseData.data[2].language).toBe('English');
    expect(mockRes.responseData.data[3].language).toBe('Hindi');
    expect(mockRes.responseData.data[4].language).toBe('English');
    expect(mockRes.responseData.data[5].language).toBe('Japanese');
  });

  it('should filter movies by language when requested', async () => {
    const mockHindiList = [
      { _id: 'm4', title: '3 Idiots', language: 'Hindi' },
      { _id: 'm5', title: 'Stree 2', language: 'Hindi' },
    ];

    const findSpy = jest.spyOn(Movie, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockHindiList),
    });

    const mockReq = { query: { language: 'Hindi' } };
    await getMovies(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.responseData.count).toBe(2);
    expect(findSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isActive: true,
        language: { $regex: '^Hindi$', $options: 'i' },
      })
    );
  });
});
