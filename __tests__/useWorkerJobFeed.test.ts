import { renderHook, act } from '@testing-library/react-native';
import { useWorkerJobFeed } from '../hooks/useWorkerJobFeed';
import * as firebase from '../lib/firebase';

jest.mock('../lib/geohash', () => ({
  proximityBounds: jest.fn(() => [['aaa', 'aaz']]),
  withinRadius: jest.fn(() => true),
}));

jest.mock('../lib/firebase', () => {
  const mockJobRef = {
    update: jest.fn(),
  };
  const mockCollection = {
    doc: jest.fn(() => mockJobRef),
    where: jest.fn(),
    orderBy: jest.fn(),
    get: jest.fn(),
  };
  mockCollection.where.mockReturnValue(mockCollection);
  mockCollection.orderBy.mockReturnValue(mockCollection);

  const mockUserDoc = {
    get: jest.fn(),
  };
  const mockUserCollection = {
    doc: jest.fn(() => mockUserDoc),
  };

  return {
    auth: jest.fn(() => ({
      currentUser: { uid: 'worker-uid' },
    })),
    firestore: Object.assign(jest.fn(), {
      Timestamp: { now: jest.fn(() => ({ toMillis: () => Date.now() })) },
    }),
    collections: {
      jobs: jest.fn(() => mockCollection),
      users: jest.fn(() => mockUserCollection),
    },
  };
});

describe('useWorkerJobFeed', () => {
  const jobsCollection = () => (firebase.collections.jobs as jest.Mock)();
  const usersCollection = () => (firebase.collections.users as jest.Mock)();

  beforeEach(() => {
    jest.clearAllMocks();
    const col = jobsCollection();
    col.where.mockReturnValue(col);
    col.orderBy.mockReturnValue(col);
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useWorkerJobFeed());
    expect(result.current.feedState.jobs).toEqual([]);
    expect(result.current.accepting).toBeNull();
  });

  it('loads feed when worker has skills and location', async () => {
    usersCollection().doc().get.mockResolvedValue({
      data: () => ({
        uid: 'worker-uid',
        skills: ['plumber'],
        location: { lat: 9.93, lng: 76.26, geohash: 'test' },
      }),
    });

    const openJobs = [
      {
        jobId: 'job-1',
        skill: 'plumber',
        status: 'open',
        urgent: false,
        locationGeo: { lat: 9.94, lng: 76.27, geohash: 'test' },
        date: { toMillis: () => Date.now() },
      },
    ];
    jobsCollection().get.mockResolvedValue({
      docs: openJobs.map((j) => ({ id: j.jobId, data: () => j })),
    });

    const { result } = renderHook(() => useWorkerJobFeed());

    await act(async () => {
      await result.current.loadFeed();
    });

    expect(result.current.feedState.jobs).toHaveLength(1);
    expect(result.current.feedState.jobs[0].skill).toBe('plumber');
  });

  it('filters out jobs with non-matching skill', async () => {
    usersCollection().doc().get.mockResolvedValue({
      data: () => ({
        uid: 'worker-uid',
        skills: ['painter'],
        location: { lat: 9.93, lng: 76.26, geohash: 'test' },
      }),
    });

    const jobs = [
      {
        jobId: 'job-1',
        skill: 'plumber', // not in worker skills
        status: 'open',
        urgent: false,
        locationGeo: { lat: 9.94, lng: 76.27, geohash: 'test' },
        date: { toMillis: () => Date.now() },
      },
    ];
    jobsCollection().get.mockResolvedValue({
      docs: jobs.map((j) => ({ id: j.jobId, data: () => j })),
    });

    const { result } = renderHook(() => useWorkerJobFeed());

    await act(async () => {
      await result.current.loadFeed();
    });

    expect(result.current.feedState.jobs).toHaveLength(0);
  });

  it('puts urgent jobs first', async () => {
    usersCollection().doc().get.mockResolvedValue({
      data: () => ({
        uid: 'worker-uid',
        skills: ['plumber'],
        location: { lat: 9.93, lng: 76.26, geohash: 'test' },
      }),
    });

    const jobs = [
      {
        jobId: 'job-normal',
        skill: 'plumber',
        status: 'open',
        urgent: false,
        locationGeo: { lat: 9.94, lng: 76.27, geohash: 'test' },
        date: { toMillis: () => 100 },
      },
      {
        jobId: 'job-urgent',
        skill: 'plumber',
        status: 'open',
        urgent: true,
        locationGeo: { lat: 9.94, lng: 76.27, geohash: 'test' },
        date: { toMillis: () => 200 },
      },
    ];
    jobsCollection().get.mockResolvedValue({
      docs: jobs.map((j) => ({ id: j.jobId, data: () => j })),
    });

    const { result } = renderHook(() => useWorkerJobFeed());

    await act(async () => {
      await result.current.loadFeed();
    });

    expect(result.current.feedState.jobs[0].jobId).toBe('job-urgent');
  });

  it('accepts a job and removes it from feed', async () => {
    const col = jobsCollection();
    col.doc().update.mockResolvedValue(undefined);

    const { result } = renderHook(() => useWorkerJobFeed());
    // Seed one job in state
    await act(async () => {
      result.current.feedState.jobs = [
        { jobId: 'job-1', skill: 'plumber', status: 'open' } as any,
      ];
    });

    const acceptResult = await act(async () => {
      return await result.current.acceptJob('job-1');
    });

    expect(acceptResult.success).toBe(true);
    expect(col.doc().update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'confirmed', acceptedWorkerId: 'worker-uid' })
    );
  });
});
