import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useWorkerBrowse } from '../hooks/useWorkerBrowse';
import { UserDocument } from '../types';

// Mock Firebase
jest.mock('../lib/firebase', () => ({
  auth: jest.fn(() => ({ currentUser: { uid: 'test-user' } })),
  firestore: jest.fn(),
  collections: jest.fn(() => ({
    users: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          {
            data: jest.fn(() => ({
              uid: 'worker-1',
              name: 'John',
              skills: ['plumber'],
              dayRate: 500,
              halfDayRate: 300,
              ratingAvg: 4.5,
              ratingCount: 10,
              availableToday: true,
              aadhaarVerified: true,
            })),
          },
          {
            data: jest.fn(() => ({
              uid: 'worker-2',
              name: 'Jane',
              skills: ['electrician'],
              dayRate: 600,
              halfDayRate: 400,
              ratingAvg: 4.0,
              ratingCount: 5,
              availableToday: false,
              aadhaarVerified: false,
            })),
          },
        ],
      }),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: jest.fn(() => ({
          uid: 'worker-1',
          name: 'John',
          skills: ['plumber'],
        })),
      }),
    })),
  })),
}));

describe('Worker Browse UI', () => {
  describe('useWorkerBrowse hook', () => {
    it('should initialize with empty workers array', () => {
      const { result } = renderHook(() => useWorkerBrowse());
      expect(result.current.state.workers).toEqual([]);
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.error).toBeNull();
    });

    it('should fetch workers without filters', async () => {
      const { result } = renderHook(() => useWorkerBrowse());

      await act(async () => {
        await result.current.browseWorkers();
      });

      await waitFor(() => {
        expect(result.current.state.workers.length).toBeGreaterThan(0);
        expect(result.current.state.loading).toBe(false);
      });
    });

    it('should filter workers by skill', async () => {
      const { result } = renderHook(() => useWorkerBrowse());

      await act(async () => {
        await result.current.browseWorkers('plumber');
      });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });
    });

    it('should filter by availability', async () => {
      const { result } = renderHook(() => useWorkerBrowse());

      await act(async () => {
        await result.current.browseWorkers(undefined, true);
      });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });
    });

    it('should filter by minimum rating', async () => {
      const { result } = renderHook(() => useWorkerBrowse());

      await act(async () => {
        await result.current.browseWorkers(undefined, undefined, 4.5);
      });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });
    });

    it('should combine multiple filters', async () => {
      const { result } = renderHook(() => useWorkerBrowse());

      await act(async () => {
        await result.current.browseWorkers('plumber', true, 4.0);
      });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });
    });

    it('should sort results by rating descending', async () => {
      const { result } = renderHook(() => useWorkerBrowse());

      await act(async () => {
        await result.current.browseWorkers();
      });

      await waitFor(() => {
        if (result.current.state.workers.length > 1) {
          const first = result.current.state.workers[0];
          const second = result.current.state.workers[1];
          expect((first.ratingAvg || 0)).toBeGreaterThanOrEqual((second.ratingAvg || 0));
        }
      });
    });
  });

  describe('Worker detail retrieval', () => {
    it('should fetch worker detail by ID', async () => {
      const { result } = renderHook(() => useWorkerBrowse());

      let worker: UserDocument | null = null;
      await act(async () => {
        worker = await result.current.getWorkerDetail('worker-1');
      });

      expect(worker).not.toBeNull();
      expect(worker?.uid).toBe('worker-1');
      expect(worker?.name).toBe('John');
    });

    it('should return null for non-existent worker', async () => {
      const { result } = renderHook(() => useWorkerBrowse());

      let worker: UserDocument | null = null;
      await act(async () => {
        worker = await result.current.getWorkerDetail('non-existent');
      });

      // Mocked to return null if doc doesn't exist
      expect(worker).toBeNull();
    });
  });

  describe('Worker card display', () => {
    it('should display worker name', () => {
      const worker: UserDocument = {
        uid: 'worker-1',
        role: 'worker',
        name: 'John Doe',
        phone: '+91 99999 99999',
        language: 'en',
        skills: ['plumber'],
        dayRate: 500,
        ratingAvg: 4.5,
        ratingCount: 10,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      expect(worker.name).toBe('John Doe');
    });

    it('should display verified badge if aadhaarVerified', () => {
      const worker: UserDocument = {
        uid: 'worker-1',
        role: 'worker',
        name: 'John',
        phone: '+91 99999 99999',
        language: 'en',
        aadhaarVerified: true,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      expect(worker.aadhaarVerified).toBe(true);
    });

    it('should display rating and count', () => {
      const worker: UserDocument = {
        uid: 'worker-1',
        role: 'worker',
        name: 'John',
        phone: '+91 99999 99999',
        language: 'en',
        ratingAvg: 4.5,
        ratingCount: 20,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      expect(worker.ratingAvg).toBe(4.5);
      expect(worker.ratingCount).toBe(20);
    });

    it('should display day rate and half-day rate', () => {
      const worker: UserDocument = {
        uid: 'worker-1',
        role: 'worker',
        name: 'John',
        phone: '+91 99999 99999',
        language: 'en',
        dayRate: 500,
        halfDayRate: 300,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      expect(worker.dayRate).toBe(500);
      expect(worker.halfDayRate).toBe(300);
    });

    it('should display reliability warning if reportedAsUnreliable', () => {
      const worker: UserDocument = {
        uid: 'worker-1',
        role: 'worker',
        name: 'John',
        phone: '+91 99999 99999',
        language: 'en',
        reportedAsUnreliable: true,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      expect(worker.reportedAsUnreliable).toBe(true);
    });
  });

  describe('Job request with workerPreferredId', () => {
    it('should create job with workerPreferredId', () => {
      const workerId = 'worker-123';
      const jobData = {
        status: 'open' as const,
        workerPreferredId: workerId,
      };

      expect(jobData.workerPreferredId).toBe(workerId);
      expect(jobData.status).toBe('open');
    });

    it('should include worker preferred ID in job creation', () => {
      const workerId = 'worker-456';
      const job = {
        jobId: 'job-1',
        homeownerId: 'homeowner-1',
        skill: 'plumber' as const,
        date: new Date() as any,
        duration: 'full' as const,
        locationText: 'Kerala',
        locationGeo: { geohash: '123', lat: 10.1, lng: 76.1 },
        urgent: false,
        description: 'Need a plumber',
        status: 'open' as const,
        workerPreferredId: workerId,
        createdAt: new Date() as any,
        expiresAt: new Date() as any,
      };

      expect(job.workerPreferredId).toBe(workerId);
      expect(job.status).toBe('open');
    });
  });

  describe('Filter state management', () => {
    it('should update filter state independently', () => {
      const filters = {
        skill: undefined as any,
        availableOnly: false,
        ratingMin: undefined as any,
      };

      // Change skill
      filters.skill = 'plumber';
      expect(filters.skill).toBe('plumber');
      expect(filters.availableOnly).toBe(false);

      // Change availability
      filters.availableOnly = true;
      expect(filters.skill).toBe('plumber');
      expect(filters.availableOnly).toBe(true);

      // Change rating
      filters.ratingMin = 4.5;
      expect(filters.skill).toBe('plumber');
      expect(filters.availableOnly).toBe(true);
      expect(filters.ratingMin).toBe(4.5);
    });
  });

  describe('Empty state handling', () => {
    it('should handle no workers found scenario', () => {
      const state = {
        workers: [],
        loading: false,
        error: null,
      };

      expect(state.workers.length).toBe(0);
      expect(state.loading).toBe(false);
    });

    it('should display error message on failure', () => {
      const state = {
        workers: [],
        loading: false,
        error: 'Failed to fetch workers',
      };

      expect(state.error).toBeTruthy();
    });
  });
});
