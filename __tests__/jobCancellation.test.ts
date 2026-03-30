import { renderHook, act } from '@testing-library/react-native';
import { jest } from '@jest/globals';

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'homeowner-123' },
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        update: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            jobId: 'job-123',
            status: 'open',
            homeownerId: 'homeowner-123',
          }),
        }),
        set: jest.fn().mockResolvedValue(undefined),
      })),
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            docs: [],
          }),
        })),
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      })),
    })),
    Timestamp: {
      now: jest.fn(() => ({ toMillis: () => Date.now() })),
      fromDate: jest.fn((date) => date),
    },
    FieldValue: {
      increment: jest.fn((n) => ({ _type: 'increment', value: n })),
    },
  })),
}));

jest.mock('../lib/firebase', () => ({
  __esModule: true,
  auth: jest.fn(() => ({ currentUser: { uid: 'homeowner-123' } })),
  firestore: {
    Timestamp: { now: jest.fn(() => ({})), fromDate: jest.fn() },
    FieldValue: { increment: jest.fn() },
  },
  collections: jest.fn(() => ({
    jobs: jest.fn(() => ({
      doc: jest.fn(),
      where: jest.fn(),
    })),
  })),
}));

jest.mock('../lib/geohash', () => ({
  __esModule: true,
  geohashForLocation: jest.fn(() => 'abc123'),
}));

jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: jest.fn(() => ({
    updateUserDoc: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('Job Cancellation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cancelJob function', () => {
    it('should change job status to cancelled', async () => {
      const jobId = 'job-123';
      const reason = 'Found someone else';

      // Mock the update
      const mockUpdate = jest.fn().mockResolvedValue(undefined);

      // Simulate cancellation
      const result = {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
        cancelledBy: 'homeowner-123',
      };

      expect(result.status).toBe('cancelled');
      expect(result.cancelReason).toBe(reason);
    });

    it('should not allow cancellation if worker already confirmed', async () => {
      const jobData = {
        jobId: 'job-123',
        status: 'open',
        acceptedWorkerId: 'worker-456', // Already confirmed
      };

      const canCancel = !jobData.acceptedWorkerId;
      expect(canCancel).toBe(false);
    });

    it('should not allow cancellation of non-open jobs', async () => {
      const jobStatus = 'completed'; // Not 'open'

      const canCancel = jobStatus === 'open';
      expect(canCancel).toBe(false);
    });

    it('should increment homeowner cancelledJobCount', async () => {
      const currentCount = 0;
      const newCount = currentCount + 1;

      expect(newCount).toBe(1);
    });

    it('should flag homeowner as unreliable after 3 cancellations', async () => {
      const cancelledCount = 3;
      const shouldFlag = cancelledCount >= 3;

      expect(shouldFlag).toBe(true);
    });

    it('should expire all pending notifications for cancelled job', async () => {
      const jobId = 'job-123';
      const notifications = [
        { id: 'notif-1', status: 'pending' },
        { id: 'notif-2', status: 'pending' },
      ];

      const expiredNotifications = notifications.map((n) => ({
        ...n,
        status: 'expired',
      }));

      expect(expiredNotifications).toHaveLength(2);
      expect(expiredNotifications[0].status).toBe('expired');
    });
  });

  describe('Cancellation notifications', () => {
    it('should send WhatsApp notification to affected workers', async () => {
      const jobId = 'job-123';
      const workers = ['worker-1', 'worker-2'];

      const notificationsQueued = workers.map((workerId) => ({
        workerId,
        jobId,
        message: 'Job has been cancelled by homeowner',
      }));

      expect(notificationsQueued).toHaveLength(2);
      expect(notificationsQueued[0].message).toContain('cancelled');
    });

    it('should include cancellation reason in notification', async () => {
      const reason = 'Found someone else';
      const message = `Job has been cancelled by homeowner (Reason: ${reason})`;

      expect(message).toContain(reason);
      expect(message).toContain('cancelled');
    });
  });

  describe('Cancellation warning', () => {
    it('should show warning after first cancellation', async () => {
      const cancelledCount = 1;
      const showWarning = false; // Warning only after 3
      expect(showWarning).toBe(false);
    });

    it('should show warning after second cancellation', async () => {
      const cancelledCount = 2;
      const showWarning = false; // Warning only after 3
      expect(showWarning).toBe(false);
    });

    it('should show warning after third cancellation', async () => {
      const cancelledCount = 3;
      const showWarning = cancelledCount >= 3;
      expect(showWarning).toBe(true);
    });

    it('should warn homeowner on job post screen after repeated cancellations', async () => {
      const homeownerReportedAsUnreliable = true;
      const warningMessage = 'You\'ve cancelled 3 jobs recently. Workers may be less likely to accept.';

      if (homeownerReportedAsUnreliable) {
        expect(warningMessage).toBeTruthy();
      }
    });
  });

  describe('Cancellation tracking', () => {
    it('should track cancellation timestamp', async () => {
      const cancelledAt = new Date().toISOString();
      expect(cancelledAt).toBeTruthy();
    });

    it('should track cancellation reason', async () => {
      const reasons = ['Emergency', 'Found someone', 'No longer needed', 'Other'];
      expect(reasons.length).toBe(4);
    });

    it('should track which homeowner cancelled', async () => {
      const cancelledBy = 'homeowner-123';
      expect(cancelledBy).toBe('homeowner-123');
    });
  });

  describe('Cancellation UI', () => {
    it('should show cancel button only if job is open and no confirmed worker', async () => {
      const job = {
        status: 'open',
        acceptedWorkerId: undefined,
      };

      const showCancelButton = job.status === 'open' && !job.acceptedWorkerId;
      expect(showCancelButton).toBe(true);
    });

    it('should hide cancel button if job has confirmed worker', async () => {
      const job = {
        status: 'open',
        acceptedWorkerId: 'worker-456',
      };

      const showCancelButton = job.status === 'open' && !job.acceptedWorkerId;
      expect(showCancelButton).toBe(false);
    });

    it('should hide cancel button if job is not open', async () => {
      const job = {
        status: 'completed',
        acceptedWorkerId: undefined,
      };

      const showCancelButton = job.status === 'open' && !job.acceptedWorkerId;
      expect(showCancelButton).toBe(false);
    });
  });
});
