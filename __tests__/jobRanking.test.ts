/**
 * Tests for worker ranking logic used in onJobCreated Cloud Function.
 * Ranking is extracted here as a pure function for testability.
 */

interface WorkerCandidate {
  uid: string;
  dist: number;
  availableToday: boolean;
  aadhaarVerified: boolean;
  ratingAvg: number;
}

// Mirrors the sort in functions/src/jobs/index.ts
function rankWorkers(candidates: WorkerCandidate[]): WorkerCandidate[] {
  return [...candidates].sort((a, b) => {
    if ((b.availableToday ? 1 : 0) !== (a.availableToday ? 1 : 0))
      return (b.availableToday ? 1 : 0) - (a.availableToday ? 1 : 0);
    if ((b.aadhaarVerified ? 1 : 0) !== (a.aadhaarVerified ? 1 : 0))
      return (b.aadhaarVerified ? 1 : 0) - (a.aadhaarVerified ? 1 : 0);
    if (b.ratingAvg !== a.ratingAvg) return b.ratingAvg - a.ratingAvg;
    return a.dist - b.dist;
  });
}

describe('rankWorkers', () => {
  it('prefers availableToday workers over unavailable regardless of rating', () => {
    const workers: WorkerCandidate[] = [
      { uid: 'a', dist: 1, availableToday: false, aadhaarVerified: true, ratingAvg: 4.9 },
      { uid: 'b', dist: 5, availableToday: true, aadhaarVerified: false, ratingAvg: 3.0 },
    ];
    expect(rankWorkers(workers)[0].uid).toBe('b');
  });

  it('prefers aadhaar verified when availableToday is equal', () => {
    const workers: WorkerCandidate[] = [
      { uid: 'a', dist: 1, availableToday: true, aadhaarVerified: false, ratingAvg: 5.0 },
      { uid: 'b', dist: 3, availableToday: true, aadhaarVerified: true, ratingAvg: 4.0 },
    ];
    expect(rankWorkers(workers)[0].uid).toBe('b');
  });

  it('prefers higher ratingAvg when availability and verification are equal', () => {
    const workers: WorkerCandidate[] = [
      { uid: 'a', dist: 1, availableToday: true, aadhaarVerified: true, ratingAvg: 3.5 },
      { uid: 'b', dist: 2, availableToday: true, aadhaarVerified: true, ratingAvg: 4.8 },
    ];
    expect(rankWorkers(workers)[0].uid).toBe('b');
  });

  it('prefers closer distance when all else is equal', () => {
    const workers: WorkerCandidate[] = [
      { uid: 'a', dist: 8, availableToday: true, aadhaarVerified: true, ratingAvg: 4.0 },
      { uid: 'b', dist: 2, availableToday: true, aadhaarVerified: true, ratingAvg: 4.0 },
    ];
    expect(rankWorkers(workers)[0].uid).toBe('b');
  });

  it('does not modify the original array', () => {
    const workers: WorkerCandidate[] = [
      { uid: 'a', dist: 1, availableToday: false, aadhaarVerified: false, ratingAvg: 0 },
      { uid: 'b', dist: 2, availableToday: true, aadhaarVerified: false, ratingAvg: 0 },
    ];
    const original = [...workers];
    rankWorkers(workers);
    expect(workers).toEqual(original);
  });

  it('returns empty array for no candidates', () => {
    expect(rankWorkers([])).toEqual([]);
  });
});
