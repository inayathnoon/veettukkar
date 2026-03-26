import { renderHook, act } from '@testing-library/react-native';
import { useJobs } from '../hooks/useJobs';
import * as firebase from '../lib/firebase';

jest.mock('../lib/geohash', () => ({
  geohashForLocation: jest.fn(() => 'testgeohash123'),
}));

jest.mock('../lib/firebase', () => {
  const mockJobRef = {
    id: 'generated-job-id',
    set: jest.fn(),
    get: jest.fn(),
  };
  const mockCollectionRef = {
    doc: jest.fn(() => mockJobRef),
    where: jest.fn(),
    orderBy: jest.fn(),
    get: jest.fn(),
  };
  // Chain where/orderBy back to the collection
  mockCollectionRef.where.mockReturnValue(mockCollectionRef);
  mockCollectionRef.orderBy.mockReturnValue(mockCollectionRef);

  return {
    auth: jest.fn(() => ({
      currentUser: { uid: 'homeowner-uid' },
    })),
    firestore: Object.assign(jest.fn(), {
      Timestamp: {
        now: jest.fn(() => ({ toMillis: () => Date.now() })),
        fromDate: jest.fn((d: Date) => ({ toDate: () => d })),
      },
    }),
    collections: {
      jobs: jest.fn(() => mockCollectionRef),
    },
  };
});

describe('useJobs', () => {
  const jobsCollection = () => (firebase.collections.jobs as jest.Mock)();

  beforeEach(() => {
    jest.clearAllMocks();
    const col = jobsCollection();
    col.where.mockReturnValue(col);
    col.orderBy.mockReturnValue(col);
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useJobs());
    expect(result.current.jobsState.jobs).toEqual([]);
    expect(result.current.jobsState.loading).toBe(false);
    expect(result.current.posting).toBe(false);
  });

  it('loads homeowner jobs', async () => {
    const mockJobs = [
      { jobId: 'job-1', skill: 'plumber', status: 'open', homeownerId: 'homeowner-uid' },
      { jobId: 'job-2', skill: 'painter', status: 'confirmed', homeownerId: 'homeowner-uid' },
    ];
    jobsCollection().get.mockResolvedValue({
      docs: mockJobs.map((j) => ({ data: () => j })),
    });

    const { result } = renderHook(() => useJobs());

    await act(async () => {
      await result.current.loadMyJobs();
    });

    expect(result.current.jobsState.jobs).toHaveLength(2);
    expect(result.current.jobsState.jobs[0].skill).toBe('plumber');
  });

  it('posts a new job', async () => {
    const col = jobsCollection();
    col.doc().set.mockResolvedValue(undefined);

    const { result } = renderHook(() => useJobs());

    const postResult = await act(async () => {
      return await result.current.postJob({
        skill: 'electrician',
        date: new Date('2026-04-01'),
        duration: 'full',
        locationText: 'Kakkanad, Ernakulam',
        locationLat: 10.0159,
        locationLng: 76.3419,
        description: 'Wiring work',
        urgent: false,
      });
    });

    expect(postResult.success).toBe(true);
    expect(col.doc().set).toHaveBeenCalledWith(
      expect.objectContaining({
        skill: 'electrician',
        duration: 'full',
        urgent: false,
        status: 'open',
      })
    );
  });

  it('marks urgent jobs correctly', async () => {
    const col = jobsCollection();
    col.doc().set.mockResolvedValue(undefined);

    const { result } = renderHook(() => useJobs());

    await act(async () => {
      await result.current.postJob({
        skill: 'cleaner',
        date: new Date('2026-04-01'),
        duration: 'half',
        locationText: 'Thrippunithura',
        locationLat: 9.9476,
        locationLng: 76.3494,
        description: '',
        urgent: true,
      });
    });

    expect(col.doc().set).toHaveBeenCalledWith(
      expect.objectContaining({ urgent: true, duration: 'half' })
    );
  });

  it('handles post error', async () => {
    const col = jobsCollection();
    col.doc().set.mockRejectedValue(new Error('Firestore unavailable'));

    const { result } = renderHook(() => useJobs());

    const postResult = await act(async () => {
      return await result.current.postJob({
        skill: 'painter',
        date: new Date(),
        duration: 'full',
        locationText: 'Test',
        locationLat: 9.9,
        locationLng: 76.2,
        description: '',
        urgent: false,
      });
    });

    expect(postResult.success).toBe(false);
    expect(postResult.error).toContain('Firestore unavailable');
  });

  it('gets a single job by id', async () => {
    const mockJob = { jobId: 'job-1', skill: 'plumber', status: 'open' };
    jobsCollection().doc().get.mockResolvedValue({
      exists: true,
      data: () => mockJob,
    });

    const { result } = renderHook(() => useJobs());

    const job = await act(async () => {
      return await result.current.getJob('job-1');
    });

    expect(job?.skill).toBe('plumber');
  });
});
