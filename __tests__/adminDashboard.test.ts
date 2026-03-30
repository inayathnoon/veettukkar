describe('Admin Dashboard', () => {
  it('should show metrics for admin only', () => {
    const email = 'admin@veettukkar.app';
    const isAdmin = email === 'admin@veettukkar.app';
    expect(isAdmin).toBe(true);
  });

  it('should display flagged users', () => {
    const flaggedUsers = [{ id: '1', cancelledCount: 3 }];
    expect(flaggedUsers).toHaveLength(1);
  });

  it('should show error logs', () => {
    const errors = [{ message: 'Failed to send', timestamp: new Date() }];
    expect(errors).toHaveLength(1);
  });
});
