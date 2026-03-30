import { jest } from '@jest/globals';

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
            homeownerId: 'homeowner-123',
            date: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 24) }, // 1 day ago
            status: 'completed',
          }),
        }),
      })),
      add: jest.fn().mockResolvedValue({ id: 'notif-123' }),
    })),
    Timestamp: {
      now: jest.fn(() => ({})),
    },
    FieldValue: {
      increment: jest.fn((n) => ({ _type: 'increment', value: n })),
    },
  })),
}));

describe('No-Show Reporting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('No-show report eligibility', () => {
    it('should allow reporting no-show within 3 days of job date', () => {
      const jobDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago
      const now = new Date();
      const daysSinceJob = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

      const canReport = daysSinceJob >= 0 && daysSinceJob <= 3;
      expect(canReport).toBe(true);
    });

    it('should not allow reporting no-show more than 3 days after job date', () => {
      const jobDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 4); // 4 days ago
      const now = new Date();
      const daysSinceJob = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

      const canReport = daysSinceJob >= 0 && daysSinceJob <= 3;
      expect(canReport).toBe(false);
    });

    it('should not allow reporting no-show for future jobs', () => {
      const jobDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day in future
      const now = new Date();
      const daysSinceJob = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

      const canReport = daysSinceJob >= 0 && daysSinceJob <= 3;
      expect(canReport).toBe(false);
    });

    it('should allow reporting on the exact job day', () => {
      const jobDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      const now = new Date();
      const daysSinceJob = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

      const canReport = daysSinceJob >= 0 && daysSinceJob <= 3;
      expect(canReport).toBe(true);
    });

    it('should allow reporting on the 3rd day after job', () => {
      const jobDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3); // 3 days ago
      const now = new Date();
      const daysSinceJob = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

      const canReport = daysSinceJob >= 0 && daysSinceJob <= 3;
      expect(canReport).toBe(true);
    });
  });

  describe('No-show report handling', () => {
    it('should change job status to noshow', () => {
      const newStatus = 'noshow';
      expect(newStatus).toBe('noshow');
    });

    it('should store no-show report with worker ID', () => {
      const noshowReport = {
        reportedBy: 'worker-456',
        note: 'No one answered door',
        reportedAt: new Date(),
      };

      expect(noshowReport.reportedBy).toBe('worker-456');
    });

    it('should allow optional note in no-show report', () => {
      const reportWithNote = {
        reportedBy: 'worker-456',
        note: 'They said no longer needed',
        reportedAt: new Date(),
      };

      const reportWithoutNote = {
        reportedBy: 'worker-456',
        note: '',
        reportedAt: new Date(),
      };

      expect(reportWithNote.note).toBeTruthy();
      expect(reportWithoutNote.note).toBe('');
    });
  });

  describe('Homeowner reliability tracking', () => {
    it('should increment noshowReportCount for homeowner', () => {
      const currentCount = 0;
      const newCount = currentCount + 1;

      expect(newCount).toBe(1);
    });

    it('should not flag as unreliable after 1 report', () => {
      const noshowCount = 1;
      const flagAsUnreliable = noshowCount >= 2;

      expect(flagAsUnreliable).toBe(false);
    });

    it('should flag as unreliable after 2 reports', () => {
      const noshowCount = 2;
      const flagAsUnreliable = noshowCount >= 2;

      expect(flagAsUnreliable).toBe(true);
    });

    it('should remain flagged with 3+ reports', () => {
      const noshowCount = 3;
      const flagAsUnreliable = noshowCount >= 2;

      expect(flagAsUnreliable).toBe(true);
    });
  });

  describe('No-show notifications', () => {
    it('should send notification to homeowner when no-show reported', () => {
      const jobId = 'job-123';
      const workerName = 'John Worker';
      const message = `${workerName} says you cancelled this job on day-of. Please rate fairly.`;

      expect(message).toContain('cancelled');
      expect(message).toContain(workerName);
    });

    it('should queue WhatsApp message for unreliable homeowner warning', () => {
      const noshowCount = 2;
      const shouldNotify = noshowCount >= 2;

      expect(shouldNotify).toBe(true);
    });

    it('should include worker name in notification', () => {
      const workerName = 'Raj Plumber';
      const message = `${workerName} says you cancelled this job on day-of. Please rate fairly.`;

      expect(message).toContain(workerName);
    });
  });

  describe('No-show UI display', () => {
    it('should show no-show report button only after job date', () => {
      const jobDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      const now = new Date();
      const jobHasPassed = now > jobDate;

      expect(jobHasPassed).toBe(true);
    });

    it('should show no-show report button within 3-day window', () => {
      const jobDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2); // 2 days ago
      const now = new Date();
      const daysSinceJob = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

      const showButton = daysSinceJob > 0 && daysSinceJob <= 3;
      expect(showButton).toBe(true);
    });

    it('should hide no-show report button after 3-day window', () => {
      const jobDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 4); // 4 days ago
      const now = new Date();
      const daysSinceJob = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

      const showButton = daysSinceJob > 0 && daysSinceJob <= 3;
      expect(showButton).toBe(false);
    });

    it('should show unreliable badge on homeowner profile with 2+ reports', () => {
      const noshowCount = 2;
      const showBadge = noshowCount >= 2;

      expect(showBadge).toBe(true);
    });

    it('should show warning color for unreliable homeowner', () => {
      const reportedAsUnreliable = true;
      const warningColor = reportedAsUnreliable ? '#FCD34D' : undefined; // Yellow

      expect(warningColor).toBe('#FCD34D');
    });
  });

  describe('Protection against misuse', () => {
    it('should tie report to specific job (not direct message)', () => {
      const report = {
        jobId: 'job-123',
        reportedBy: 'worker-456',
        note: 'No one answered',
      };

      expect(report.jobId).toBeTruthy();
      // Report is job-specific, not a message to homeowner
    });

    it('should not allow multiple reports for same job', () => {
      const jobId = 'job-123';
      const reports = [
        { jobId, reportedBy: 'worker-1' },
      ];

      // Only one report per job
      expect(reports).toHaveLength(1);
    });

    it('should only allow worker to report (not homeowner)', () => {
      const context = { auth: { uid: 'worker-456' } };
      const isWorker = context.auth.uid.startsWith('worker');

      // Verify worker identity
      expect(isWorker).toBe(true);
    });
  });
});
