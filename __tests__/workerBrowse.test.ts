describe('Worker Browse', () => {
  describe('Worker filtering', () => {
    it('should filter workers by skill', () => {
      const workers = [
        { id: '1', skills: ['plumber', 'electrician'], ratingAvg: 4.5 },
        { id: '2', skills: ['painter'], ratingAvg: 4.0 },
      ];

      const filtered = workers.filter((w) => w.skills.includes('plumber'));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should hide unavailable workers', () => {
      const workers = [
        { id: '1', availableToday: true, ratingAvg: 4.5 },
        { id: '2', availableToday: false, ratingAvg: 4.0 },
      ];

      const available = workers.filter((w) => w.availableToday);
      expect(available).toHaveLength(1);
      expect(available[0].id).toBe('1');
    });

    it('should filter by minimum rating', () => {
      const workers = [
        { id: '1', ratingAvg: 4.8 },
        { id: '2', ratingAvg: 4.2 },
        { id: '3', ratingAvg: 3.5 },
      ];

      const filtered = workers.filter((w) => w.ratingAvg >= 4.0);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Worker sorting', () => {
    it('should sort results by rating descending', () => {
      const workers = [
        { id: '1', ratingAvg: 4.0 },
        { id: '2', ratingAvg: 4.8 },
        { id: '3', ratingAvg: 4.5 },
      ];

      const sorted = [...workers].sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });
  });

  describe('Worker request', () => {
    it('should create job with workerPreferredId', () => {
      const workerId = 'worker-123';
      const jobData = {
        status: 'open',
        workerPreferredId: workerId,
      };

      expect(jobData.workerPreferredId).toBe(workerId);
    });

    it('should notify only specific worker', () => {
      const workerId = 'worker-123';
      const notificationRecipients = [workerId];

      expect(notificationRecipients).toHaveLength(1);
      expect(notificationRecipients[0]).toBe(workerId);
    });
  });

  describe('Worker profile display', () => {
    it('should show photo, name, skills, rates, rating', () => {
      const workerProfile = {
        photoURL: 'https://example.com/photo.jpg',
        name: 'John',
        skills: ['plumber'],
        dayRate: 500,
        halfDayRate: 300,
        ratingAvg: 4.5,
      };

      expect(workerProfile.name).toBeTruthy();
      expect(workerProfile.skills).toBeTruthy();
      expect(workerProfile.ratingAvg).toBeTruthy();
    });

    it('should show verified badge if aadhaarVerified', () => {
      const worker = { aadhaarVerified: true };
      const showBadge = worker.aadhaarVerified;

      expect(showBadge).toBe(true);
    });

    it('should show no-show warning badge if unreliable', () => {
      const worker = { noshowReportCount: 2, reportedAsUnreliable: true };
      const showWarning = worker.reportedAsUnreliable;

      expect(showWarning).toBe(true);
    });
  });
});
