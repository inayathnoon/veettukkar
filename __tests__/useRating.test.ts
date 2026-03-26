import { renderHook, act } from '@testing-library/react-native';
import { useRating } from '../hooks/useRating';
import * as firebase from '../lib/firebase';

jest.mock('../lib/firebase', () => {
  const mockRatingRef = { set: jest.fn() };
  const mockJobRef = { update: jest.fn() };
  const mockRatingsQuery = {
    where: jest.fn(),
    limit: jest.fn(),
    get: jest.fn(),
  };
  mockRatingsQuery.where.mockReturnValue(mockRatingsQuery);
  mockRatingsQuery.limit.mockReturnValue(mockRatingsQuery);

  return {
    auth: jest.fn(() => ({
      currentUser: { uid: 'homeowner-uid' },
    })),
    firestore: Object.assign(jest.fn(), {
      Timestamp: { now: jest.fn(() => ({ toMillis: () => Date.now() })) },
    }),
    collections: {
      ratings: jest.fn(() => ({
        doc: jest.fn(() => mockRatingRef),
        where: jest.fn(() => mockRatingsQuery),
        ...mockRatingsQuery,
      })),
      jobs: jest.fn(() => ({
        doc: jest.fn(() => mockJobRef),
      })),
    },
  };
});

describe('useRating', () => {
  beforeEach(() => jest.clearAllMocks());

  it('initializes with clean state', () => {
    const { result } = renderHook(() => useRating());
    expect(result.current.state.submitting).toBe(false);
    expect(result.current.state.submitted).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it('submits a 5-star rating', async () => {
    const ratingsCol = (firebase.collections.ratings as jest.Mock)();
    ratingsCol.doc().set.mockResolvedValue(undefined);
    const jobsCol = (firebase.collections.jobs as jest.Mock)();
    jobsCol.doc().update.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRating());

    const submitResult = await act(async () => {
      return await result.current.submitRating('job-1', 'worker-uid', 5, 'Great work!');
    });

    expect(submitResult.success).toBe(true);
    expect(ratingsCol.doc().set).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: 'job-1',
        toUid: 'worker-uid',
        fromUid: 'homeowner-uid',
        stars: 5,
        comment: 'Great work!',
      })
    );
  });

  it('marks job as completed after rating', async () => {
    const ratingsCol = (firebase.collections.ratings as jest.Mock)();
    ratingsCol.doc().set.mockResolvedValue(undefined);
    const jobsCol = (firebase.collections.jobs as jest.Mock)();
    jobsCol.doc().update.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRating());

    await act(async () => {
      await result.current.submitRating('job-1', 'worker-uid', 4);
    });

    expect(jobsCol.doc().update).toHaveBeenCalledWith({ status: 'completed' });
  });

  it('omits empty comment', async () => {
    const ratingsCol = (firebase.collections.ratings as jest.Mock)();
    ratingsCol.doc().set.mockResolvedValue(undefined);
    const jobsCol = (firebase.collections.jobs as jest.Mock)();
    jobsCol.doc().update.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRating());

    await act(async () => {
      await result.current.submitRating('job-1', 'worker-uid', 3, '   ');
    });

    expect(ratingsCol.doc().set).toHaveBeenCalledWith(
      expect.objectContaining({ comment: undefined })
    );
  });

  it('handles submission error', async () => {
    const ratingsCol = (firebase.collections.ratings as jest.Mock)();
    ratingsCol.doc().set.mockRejectedValue(new Error('Write failed'));

    const { result } = renderHook(() => useRating());

    const submitResult = await act(async () => {
      return await result.current.submitRating('job-1', 'worker-uid', 5);
    });

    expect(submitResult.success).toBe(false);
    expect(submitResult.error).toContain('Write failed');
    expect(result.current.state.submitted).toBe(false);
  });

  it('checks if homeowner already rated a job', async () => {
    const ratingsCol = (firebase.collections.ratings as jest.Mock)();
    ratingsCol.get.mockResolvedValue({ empty: false });

    const { result } = renderHook(() => useRating());

    const rated = await act(async () => {
      return await result.current.hasRated('job-1');
    });

    expect(rated).toBe(true);
  });
});
