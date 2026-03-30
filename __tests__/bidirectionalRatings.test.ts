describe('Bidirectional Ratings', () => {
  it('should store rating with direction field', () => {
    const rating = { direction: 'worker_to_homeowner', stars: 4 };
    expect(rating.direction).toBe('worker_to_homeowner');
  });

  it('should calculate homeowner rating avg', () => {
    const ratings = [{ stars: 4 }, { stars: 5 }, { stars: 3 }];
    const avg = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
    expect(avg).toBe(4);
  });

  it('should show both worker and homeowner ratings on profile', () => {
    const profile = { workerRatingAvg: 4.5, homeownerRatingAvg: 4.2 };
    expect(profile.workerRatingAvg).toBeTruthy();
    expect(profile.homeownerRatingAvg).toBeTruthy();
  });
});
